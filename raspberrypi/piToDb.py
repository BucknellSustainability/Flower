


import pymysql
# To install pymysql:
# sudo apt-get install python3-pip
# sudo pip3 install pymysql
# That should fix it.


import json
from arduinoToPi import SensorReading



# master_queue is a queue of SensorReading objects.
def database_main(master_queue):
	while True:
		try:
			database_loop(master_queue)
		except Exception as e:
			print(e)

def get_all_readings(master_queue):
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
def process_reading(reading, connection):
	# Get the arduino's DB ID.
	device_id = get_arduino_dbid(connection, reading.getId())

	# Get the data from the arduino.
	json = reading.getData()

	# TODO: Check that the project name matches the one in the database.

	# Iterate over every sensor value.
	# TODO: Exclude the project name field in the json structure.
	for name, value in json:
		# Find the sensor ID.
		sensor_id = get_sensor_dbid(connection, device_id, name)

		return (sensor_id, reading.getTime(), value)

def do_sensor_insert(cursor, sensor_id, time, value):
	command_template = "INSERT INTO energyhill.data (sensorId, dateTime, value) VALUES (%s, FROM_UNIXTIME(%s), %s)"
	
	assert(isinstance(sensor_id, int))
	#assert(isinstance(time, DateTime)) # TODO: Fix this
	assert(isinstance(value, float))
	
	command = command_template % (str(sensor), str(time), str(value))
	do_sql(cursor, command)

def do_sql(cursor, command):
	print(command)
	cursor.execute(command)

# TODO: If there is an error at any point after get_all_readings(), 
# the data is lost!
def database_loop(master_queue):
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
				data_to_push.append(process_reading(connection, reading))

			# Send the readings in bulk.
			with connection.cursor() as cursor:
				for sensor, time, value in data_to_push:
					do_sensor_insert(cursor, sensor, time, value)

				connection.commit()
	finally:
		# Do cleanup if something goes wrong.
		connection.close()

def do_select_arduino(connection, cursor, id_string):
	# Defensive escape, shouldn't ever be an issue.
	id_string_escaped = cursor.escape(id_string)
	
	command = "SELECT deviceId FROM energyhill.device WHERE hardwareId IS %s" % id_string_escaped
	do_sql(cursor, command)
	connection.commit()
		
	# fetchall will return an array of dictionaries.
	rows = cursor.fetchall()
	return rows

def do_insert_arduino(connection, cursor, id_string):
	# Create a new entry for this board.
	command = "INSERT INTO energyhill.device (deviceId) VALUES (%s)" % id_string_escaped
	do_sql(cursor, command)
	connection.commit()

# TODO: Document this
cached_arduino_ids = {}
def get_arduino_dbid(connection, id_string):
	if cached_arduino_ids[id_string]:
		return cached_arduino_ids[id_string]

	with connection.cursor(cursors.DictCursor) as cursor:
		# fetchall will return an array of dictionaries.
		rows = do_select_arduino(connection, cursor, id_string) 
		
		if len(rows) == 0:
			do_insert_arduino(connection, cursor, id_string)
			
			# Try again.
			rows = do_select_arduino(connection, cursor, id_string)
			
			if len(rows) == 0:
				raise Exception("Unable to insert arduino into the database.")
		
		# We now have rows from the server. Check that we only found ONE entry!
		if len(rows) == 1:
			arduino_id = cursor.fetchall()[0]["deviceId"]
			cached_arduino_ids[id_string] = arduino_id
			return arduino_id
		else:
			raise Exception("Found multiple rows with hardwareId %s" % id_string)
		


def connectToDB():
	try:
		with open('../config.json', 'r') as f:
			config = json.load(f)
	except ValueError:
		# Catch and re-raise with a better error message.
		raise Exception('Error while parsing json file "../config.json"')

	connection = pymysql.connect(host=config['DB_URL'], user=config['DB_USERNAME'], password=config['DB_PASSWORD'], db=config['DB_NAME'])
	return connection


# Old server code.
def pushToDB(connection, number, sensor):
	"""connection is the I/O object with the database. number is the number to insert, sensor is the sensor ID number."""
	# Check that number and sensor are both integers, and not strings.
	# Normally this is avoided in python, but this check ensures that no funnybusiness
	# happens with the SQL command.
	assert(isinstance(number, float))
	assert(isinstance(sensor, int))
	with connection.cursor() as cursor:
			# Form the command.
			command = "INSERT INTO data (sensorId, value) VALUES (" + str(sensor) + ", " + str(number) + ");"
			cursor.execute(command)

			# Send the command.
			connection.commit()

			# Debugging
			print("sent: " + command)



