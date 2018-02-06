


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

def database_loop(master_queue):
	# Connect to the database.
	connection = connectToDB()

	while True:
		# Get all the stuff in the queue.
		readings = []
		try:
			while True:
				reading = master_queue.get_nowait()
				readings.append(reading)
		except queue.Empty:
			pass

		# Process each reading.
		data_to_push = []
		for reading in readings:
			# Get the arduino's DB ID.
			device_id = get_arduino_dbid(connection, reading.getId())

			# Get the data from the arduino.
			json = reading.getData()

			# TODO: Check that the project name matches the one in the database.

			# Iterate over every sensor value.
			# TODO: Exclude the project name field in the json structure.
			for name, value in json:
				# Find the sensor ID.
				sensor_id = get_sensor_id(connection, device_id, name)
	
				data_to_push.append((sensor_id, reading.getTime(), value))

		# Send the readings in bulk.
		with connection.cursor() as cursor:
			command_template = "INSERT INTO energyhill.data (sensorId, dateTime, value) VALUES (%s, FROM_UNIXTIME(%s), %s)"
			for sensor, time, value in data_to_push:
				command = command_template % (str(sensor), str(time), str(value))
				cursor.execute(command)
				print(command)

			connection.commit()



# TODO: Document this
cached_arduino_ids = {}
def get_arduino_dbid(connection, id_string):
	if cached_arduino_ids[id_string]:
		return cached_arduino_ids[id_string]

	with connection.cursor(cursors.DictCursor) as cursor:
		command = "SELECT deviceId FROM energyhill.device WHERE hardwareId IS %s" % id_string
		cursor.execute(command)
		connection.commit()

		# fetchall will return an array of dictionaries.
		rows = cursor.fetchall()
		
		if len(rows) == 0:
			# Create a new entry for this board.
			command = "INSERT INTO energyhill.device (deviceId) VALUES (%s)" % id_string
			cursor.execute(command)
			connection.commit()

			# Try again.
			return get_arduino_dbid(connection, id_string)

		elif len(rows) == 1:
			arduino_id = cursor.fetchall()[0]["deviceId"]
			cached_arduino_ids[id_string] = arduino_id
			return arduino_id
		else:
			raise "Found multiple rows with hardwareId %s" % id_string
		


def connectToDB():
	try:
		with open('../config.json', 'r') as f:
			config = json.load(f)
	except ValueError as e:
		# Catch and re-raise with a better error message.
		raise type(e)('Error while parsing json file "../config.json": ' + e.message)

	connection = pymysql.connect(host=config['DB_URL'], user=config['DB_USERNAME'], password=config['DB_PASSWORD'], db=config['DB_NAME'])
	return connection



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



