

# This is a hacky file to connect to the database and show that I can read data from it.
#
# Python3 was chosen to hammer out this proof-of-concept quickly. The next step is to read
# and parse input from dev/ttyUSB0, then insert that into the database.
#
# The actual language to use will not be python3; it'll probably be java.

import pymysql
# To install pymysql:
# sudo apt-get install python3-pip
# sudo pip3 install pymysql
# That should fix it.

import serial
# To install pyserial:
# sudo apt-get install python3-pip
# sudo pip3 install pyserial

from os import listdir
from os.path import isfile, join
import re

def connectToDB():
	connection = pymysql.connect(host="digitalgreens.cixglou4nxxh.us-east-1.rds.amazonaws.com", user="jvoves", password="digitalgreens", db="energyhill")
	return connection

def pollArduino(arduino):
	"""arduino is the serial I/O object with the arduino. This method returns a line read from the arduino."""
	# Get the next line of input from the arduino. It's in the form of a
	# binary string, with /r/n characters at the end.
	data = arduino.readline()
		
	# Chop off the last two characters (/r/n)
	data = data[0:-2];
	
	# Convert the string from binary to utf-8.
	data = data.decode("ascii")

def pushToDB(connection, number, sensor):
	"""connection is the I/O object with the database. number is the number to insert, sensor is the sensor ID number."""
	# Check that number and sensor are both integers, and not strings.
	# Normally this is avoided in python, but this check ensures that no funnybusiness
	# happens with the SQL command.
	assert(isinstance(number, int))
	assert(isinstance(sensor, int))
	with connection.cursor() as cursor:
			# Form the command.
			command = "INSERT INTO data (sensorId, value) VALUES (" + sensor + ", " + data + ");"
			cursor.execute(command)

			# Send the command.
			connection.commit()

			# Debugging
			print("sent: " + command)

def findSerialPort():
	"""Looks at the list of tty ports, and returns the first arduino tty it finds."""
	# TODO: Return an array of all arduino tty ports, to support multiple arduinos.
	
	# Set up the tty regex for arduinos. They connect as either ttyUSB* or ttyACM*
	pattern = re.compile("tty(USB|ACM).*")

	# Check every tty port available.
	ttyDirPath = "/dev"
	filesAndDirs = listdir(ttyDirPath)
	for tty in filesAndDirs:

		# Form the full path.
		ttyPath = join(ttyDirPath, tty)

		# Check that this is a file, not a directory. Just in case.
		if !isfile(ttyPath):
			continue
		
		# Check if this is an arduino tty port.
		if !pattern.match(tty):
			continue
		
		# Return the full path to the port.
		return ttyPath



def main():
	# Find the serial port for the arduino.
	serialPort = findSerialPort()

	# Open up the arduino. This assumes a baud rate of 115200.
	with serial.Serial(serialPort, 115200, timeout=5) as arduino:
		# Discard the first line of input, because the reading could start in the middle of a string.
		print("discarding: " + pollArduino(arduino))

		# Read from this arduino while it's available.
		while (arduino.is_open):
			# Read the data
			dataStr = pollArduino(arduino)

			# Convert the data into a number.
			data = float(dataStr)
			
			# Send the data to the database.
			pushToDB(connection, data, 1)

# Infinitely try to read from arduinos.
while (true):
	try:
		main()
	except:
		pass


