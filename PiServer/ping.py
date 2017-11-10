

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


connection = pymysql.connect(host="digitalgreens.cixglou4nxxh.us-east-1.rds.amazonaws.com", user="jvoves", password="digitalgreens", db="energyhill")

# TODO: Detect which tty port to use. Currently hardcoded for the arduino micro.
with serial.Serial("/dev/ttyUSB0", 115200, timeout=5) as arduino:
	data = arduino.readline()

	print("discarding: ")
	print(data)

	while (arduino.is_open):
		# Get the next line of input from the arduino. It's in the form of a
		# binary string, with /r/n characters at the end.
		data = arduino.readline()
		
		# Chop off the last two characters (/r/n)
		data = data[0:-2];
	
		# Convert the string from binary to utf-8.
		data = data.decode("ascii")

		# Push the data to the database.
		with connection.cursor() as cursor:
			# TODO: Avoid SQL injection.
			# TODO: Do more things than push a value.
			command = "INSERT INTO data (sensorId, value) VALUES (1, " + data + ");"
			print(command)
			cursor.execute(command)
	
			# Send the data to the server.
			connection.commit()

			# Print the data that we just sent.
			print("sent: " + data)



