

try:
	import pymysql
except:
	print("""
	To install pymysql:
	
	sudo apt-get install python3-pip
	sudo pip3 install pymysql
	
	This program will now hang until force-quit, to ensure you see this message.
	""")
	while True:
		pass


import json
from arduinoToPi import SensorReading, workers
import arduinoToPi
from piToArduino import send_file_to_arduino
import queue
import time
import datetime
import math
import sys
from threading import Thread
import subprocess
import os

# Ensure that we're running python3.
if sys.version_info[0] < 3:
	raise Exception("Must run the pi server using python 3. Check that you used the 'python3' command.")

# This is the time between checks for new code to download.
code_download_interval = datetime.timedelta(seconds=10)

# This is the maximum time a code download can take. After this, the downloading
# thread will be "killed" and the download will retry.
#
# * I say "killed" because python doesn't allow you to kill a thread. Every effort has been made
# to keep the downloading thread responsive to "requests" to kill it.
code_download_timeout = datetime.timedelta(minutes=5)

# This is the time between checks in the device and sensor tables.
cache_clear_interval = datetime.timedelta(hours=1)

caches_last_cleared = None
code_download_last_checked = None

# State variables for the downloading thread.
download_thread = None
download_thread_force_terminate = False
download_thread_start_time = None

# master_queue is a queue of SensorReading objects.
def database_main(master_queue):
	assert(isinstance(master_queue, queue.Queue))

	# Set up periodic cache clearing.
	global caches_last_cleared
	caches_last_cleared = datetime.datetime.now()
	clear_caches()

	# Set up periodic code-download checks.
	global code_download_last_checked
	code_download_last_checked = datetime.datetime.now()

	while True:
		try:
			database_loop(master_queue)

		except Exception as e:
			print(e)

def clear_caches():
	cached_sensor_ids = {}
	cached_device_ids = {}
	

def get_all_readings(master_queue):
	assert(isinstance(master_queue, queue.Queue))

	readings = []
	try:
		while True:
			reading = master_queue.get_nowait()
			readings.append(reading)
	except queue.Empty:
		pass
	return readings

# Takes in the full response of an arduino, and splits it into
# an entry for each sensor returned by the arduino.
#
# Returns each sensor's value in (sensor_id, time, value) tuples.
def process_reading(connection, reading):
	assert(isinstance(reading, SensorReading))
	
	# Get the arduino's DB ID.
	device_id = get_arduino_dbid(connection, reading.getId())

	# Get the data from the arduino.
	json_data = reading.getData()

	# TODO: Check that the project name matches the one in the database.

	# Iterate over every sensor value.
	# TODO: Exclude the project name field in the json structure.
	sensor_tuples = []
	for name, value in json_data.items():
		# Find the sensor ID.
		sensor_id = get_sensor_dbid(connection, device_id, name)
		sensor_tuples.append((sensor_id, reading.getTime(), value))
	
	return sensor_tuples

def do_sensor_data_insert(cursor, sensor_id, data_time, value):
	# Note: We insert into databuffer, and then aggregation scripts on the server
	# add it into the energyhill.data table.
	command_template = "INSERT INTO energyhill.databuffer (sensorId, dateTime, value) VALUES (%s, FROM_UNIXTIME(%s), %s)"
	
	# TODO: If isinstance(value, string), store it as a debug string in the database.
	assert(isinstance(sensor_id, int))
	assert(isinstance(data_time, datetime.datetime))

	# We don't support string values yet.
	if isinstance(value, str):
		print("Skipping string value '" + value + "'; string values not supported yet.")
		return	
	assert(isinstance(value, float) or isinstance(value, int))
	
	# Note: Python uses a floating-point time, but we need an integer time.
	unix_time = math.floor(time.mktime(data_time.timetuple()))

	command = command_template % (str(sensor_id), str(unix_time), str(value))
	do_sql(cursor, command)

def do_sql(cursor, command):
	assert(isinstance(command, str))
	print(command)
	cursor.execute(command)

# TODO: If there is an error at any point after get_all_readings(), 
# the data is lost!
def database_loop(master_queue):
	assert(isinstance(master_queue, queue.Queue))

	global caches_last_cleared
	global cache_clear_interval
	global code_download_last_checked
	global code_download_interval

	connection = None
	try:
		# Connect to the database.
		connection = connectToDB()

		while True:
			# Get all the stuff in the queue.
			readings = get_all_readings(master_queue)

			# Process each reading.
			data_to_push = []
			for reading in readings:
				sensors = process_reading(connection, reading)
				for sensor in sensors:
					data_to_push.append(sensor)

			# Send the readings in bulk.
			with connection.cursor() as cursor:
				for (sensor, time, value) in data_to_push:
					do_sensor_data_insert(cursor, sensor, time, value)

				connection.commit()
			
			# Check if it's time to invalidate the cache.
			if datetime.datetime.now() - caches_last_cleared > cache_clear_interval:
				caches_last_cleared = datetime.datetime.now()
				clear_caches()

			# Check if it's time to check for code downloads.
			if datetime.datetime.now() - code_download_last_checked > code_download_interval:
				code_download_last_checked = datetime.datetime.now()
				check_for_code_download(connection)
	finally:
		# Do cleanup if something goes wrong.
		connection.close()

def do_select_arduino(connection, cursor, id_string):
	assert(isinstance(id_string, str))

	# Defensive escape, shouldn't ever be an issue.
	id_string_escaped = connection.escape(id_string)
	
	command = "SELECT deviceId FROM energyhill.device WHERE hardwareId = %s" % id_string_escaped
	do_sql(cursor, command)
	connection.commit()
		
	# fetchall will return an array of dictionaries.
	rows = cursor.fetchall()
	return rows

def do_insert_arduino(connection, cursor, id_string):
	assert(isinstance(id_string, str))

	# Defensive escape, shouldn't ever be an issue.
	id_string_escaped = connection.escape(id_string)
	
	# Create a new entry for this board.
	command = "INSERT INTO energyhill.device (hardwareId) VALUES (%s)" % id_string_escaped
	do_sql(cursor, command)
	connection.commit()

# TODO: Document this
cached_arduino_ids = {}
def get_arduino_dbid(connection, id_string):
	assert(isinstance(id_string, str))

	if id_string in cached_arduino_ids:
		return cached_arduino_ids[id_string]

	with connection.cursor(pymysql.cursors.DictCursor) as cursor:
		rows = do_select_arduino(connection, cursor, id_string) 
		
		if len(rows) == 0:
			do_insert_arduino(connection, cursor, id_string)
			
			# Try again.
			rows = do_select_arduino(connection, cursor, id_string)
			
			if len(rows) == 0:
				raise Exception("Unable to insert arduino into the database: %s" % id_string)
		
		# We now have rows from the server. Check that we only found ONE entry!
		if len(rows) == 1:
			arduino_id = rows[0]["deviceId"]
			cached_arduino_ids[id_string] = arduino_id
			return arduino_id
		else:
			raise Exception("Found multiple rows with hardwareId %s" % id_string)

def do_select_sensor(connection, cursor, arduino_id, sensor_name):
	assert(isinstance(arduino_id, str) or isinstance(arduino_id, int))
	assert(isinstance(sensor_name, str))

	# Escape the user-provided sensor name.
	sensor_name_escaped = connection.escape(sensor_name)

	# Defensive coding.
	assert(isinstance(arduino_id, int))

	command = "SELECT sensorId FROM energyhill.sensor WHERE (deviceId, name) = (%s, %s)" % (str(arduino_id), sensor_name_escaped)
	do_sql(cursor, command)
	connection.commit()

	# fetchall will return an array of dictionaries.
	rows = cursor.fetchall()
	return rows

def do_insert_sensor(connection, cursor, arduino_id, sensor_name):
	assert(isinstance(arduino_id, str) or isinstance(arduino_id, int))
	assert(isinstance(sensor_name, str))

	# Escape the user-provided sensor name.
	sensor_name_escaped = connection.escape(sensor_name)

	# Defensive coding.
	assert(isinstance(arduino_id, int))

	command = "INSERT INTO energyhill.sensor (deviceId, name) VALUES (%s, %s)" % (str(arduino_id), sensor_name_escaped)
	do_sql(cursor, command)
	connection.commit()

cached_sensor_ids = {}
def get_sensor_dbid(connection, arduino_id, sensor_name):
	assert(isinstance(sensor_name, str))
	assert(isinstance(arduino_id, str) or isinstance(arduino_id, int)) 
	
	key_pair = (arduino_id, sensor_name)
	if key_pair in cached_sensor_ids:
		return cached_sensor_ids[key_pair]

	with connection.cursor(pymysql.cursors.DictCursor) as cursor:
		rows = do_select_sensor(connection, cursor, arduino_id, sensor_name)

		if len(rows) == 0:
			do_insert_sensor(connection, cursor, arduino_id, sensor_name)

			# Try again.
			rows = do_select_sensor(connection, cursor, arduino_id, sensor_name)

			if len(rows) == 0:
				raise Exception("Unable to insert sensor into the database: (%s, %s)" % (str(arduino_id), sensor_name))

		# We now have rows from the server. Check that we only found ONE entry!
		if len(rows) == 1:
			sensor_id = rows[0]["sensorId"]
			cached_sensor_ids[key_pair] = sensor_id
			return sensor_id
		else:
			raise Exception("Found multiple rows with (arduinoId, sensorName): (%s, %s)" % (str(arduino_id), sensor_name))

def clear_cache():
	cached_sensor_ids = {}
	cached_device_ids = {}

def connectToDB():
	try:
		with open('../config.json', 'r') as f:
			config = json.load(f)
	except ValueError:
		# Catch and re-raise with a better error message.
		raise Exception('Error while parsing json file "../config.json"')

	connection = pymysql.connect(host=config['DB_URL'], user=config['DB_USERNAME'], password=config['DB_PASSWORD'], db=config['DB_NAME'])
	return connection

def check_for_code_download(connection):
	print("Starting code download check...")

	global workers
	global download_thread
	global code_download_timeout
	global download_thread_start_time
	global download_thread_force_terminate

	# Check if there is already a download thread.
	if download_thread:
		# Check if it is alive.
		if not download_thread.is_alive():
			# Join it.
			print("Joining download thread...")
			download_thread.join()
		# Check if it has taken too long.
		elif datetime.datetime.now() - download_thread_start_time > code_download_timeout:
			# Have we already tried to kill the thread?
			if download_thread_force_terminate:
				# Give up.
				print("Download thread unresponsive. Ignoring...")
				download_thread = None
			else:
				# Try to kill the thread.
				print("Download thread took too long. Attempting to terminate...")
				download_thread_force_terminate = True
				return
		else:
			# Let it finish.
			print("Waiting for existing download thread to finish.")
			return
	
	print("Collecting hardware ids...")
	ports = arduinoToPi.get_open_ports()
	hardware_ids = []
	for port in ports:
		hardware_ids.append(port.getId())

	# Do we even need to check?
	if len(hardware_ids) == 0:
		print("Doesn't seem like there are connected devices.")
		return
	
	# Get the matching device Id's.
	print("Fetching device ids...")
	device_ids = []
	for hardware_id in hardware_ids:
		device_id = get_arduino_dbid(connection, hardware_id)
		device_ids.append(device_id)

	# Look for any downloads for these devices in the codeupload table.
	command = "SELECT * FROM energyhill.codeupload WHERE handled = 0 AND deviceId IN ("
	for i in range(0, len(device_ids) - 1):
		device = device_ids[i]
		command += str(device) + ", "
	command += str(device_ids[-1]) + ")"
	
	print("Fetching the codeupload table...")
	row = None
	with connection.cursor(pymysql.cursors.DictCursor) as cursor:
		do_sql(cursor, command)
		connection.commit()

		rows = cursor.fetchall()
		if rows and len(rows) >= 1:
			# Grab the first row.
			row = rows[0]
		else:
			# Nothing to download.
			print("No entries in the codeupload table.")
			return
	
	# Get the device id.
	device_id = row["deviceId"]

	# Figure out the corresponding hardware id.
	index = device_ids.index(device_id)
	hardware_id = hardware_ids[index]

	# Get the upload id.
	upload_id = row["uploadId"]

	# Spawn a new thread to do the downloading.
	download_thread = Thread(target=code_download_main, args=(device_id, hardware_id, upload_id))
	download_thread_start_time = datetime.datetime.now()
	download_thread.start()


def code_download_main(device_id, hardware_id, upload_id):
	assert(isinstance(device_id, int))
	assert(isinstance(hardware_id, str))
	assert(isinstance(upload_id, int))

	global download_thread_force_terminate

	# Start the process of reserving the arduino.
	arduinoToPi.reserved_arduino = (hardware_id, None)

	# Start downloading the code file.
	print("Starting download for device id: " + str(device_id) + " (" + hardware_id + ")")
	
	path_to_hex = "code_download_" + str(upload_id) + ".hex"

	curl = subprocess.Popen(["curl", "http://eg.bucknell.edu/energyhill/download-code?uploadid=" + str(upload_id),
			"-o", path_to_hex])
	curl.wait()	# TODO: Wait with a timeout, and monitor download_thread_force_terminate.

	print("Download for device id " + str(device_id) + " complete. Reserving port...")

	# Spin-loop until the arduino is reserved.
	while not download_thread_force_terminate:
		print("Reservation state: " + str(arduinoToPi.reserved_arduino))
		(_, usb_port) = arduinoToPi.reserved_arduino
		if usb_port:
			break
		time.sleep(1)
	
	if download_thread_force_terminate:
		arduinoToPi.reservedArduino = None
		return

	print("Port reserved for device id " + str(device_id) + ".")

	# Send the file to the arduino.
	(_, usb_port) = arduinoToPi.reserved_arduino
	try:
		send_file_to_arduino(path_to_hex, usb_port.getPath())
	except e:
		# TODO: Send error info.
		raise Exception("Error while sending file to arduino")
	finally:
		# TODO: Mark the code upload entry complete in the database.
		# TODO: Delete the file that was downloaded
		arduinoToPi.reserved_arduino = None

		# Delete the file that was downloaded.
		os.remove(path_to_hex)
	
	# Tell the DB that we're done.
	curl = subprocess.Popen(["curl", "http://eg.bucknell.edu/energyhill/log-success?uploadid=" + str(upload_id)
		+ "&deviceid=" + str(device_id)])
	curl.wait() # TODO: Wait with a timeout, and monitor download_thread_force_terminate.
	print("Code upload complete.")
