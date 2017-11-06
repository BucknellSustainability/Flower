

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


connection = pymysql.connect(host="digitalgreens.cixglou4nxxh.us-east-1.rds.amazonaws.com", user="jvoves", password="digitalgreens", db="energyhill")

with connection.cursor() as cursor:
	cursor.execute("SELECT * FROM data;")
	data = cursor.fetchall()
	print(data)



