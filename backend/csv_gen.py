

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

import csv
import sys
import json
import os
import subprocess

# Ensure that we're running python3
if sys.version_info[0] < 3:
    raise Exeption("Must run the csv generator script using python 3.")

# This script will expect the following params:
# arg1: the sensor ID, OR a string of comma-separated sensor ID numbers.
# arg2: the filename for output (excluding file extensions).
# arg3: the start date (optional) in unixtime, in EST timezone.
# arg4: the end date (optional) in unixtime, in EST timezone.


def main():
    
    sensorIds = sys.argv[1]
    filename = sys.argv[2]
    startTime = None
    endTime = None

    if (len(sys.argv) > 3):
        startTime = int(sys.argv[3])
    
    if (len(sys.argv) > 4):
        endTime = int(sys.argv[4])
    
    # Convert sensorIds into an array.
    try:
        sensorIds = [ int(sensorIds) ]
    except:
        ids = []
        for sensor in sensorIds.split(','):
            ids.append(int(sensor.strip()))
        sensorIds = ids
    print(sensorIds)

    config = {
        "ids": sensorIds,
        "startTime": startTime,
        "endTime": endTime
    }

    # Delete any old, outdated output files.
    tryDelete(filename + ".csv")
    tryDelete(filename + ".zip")
    tryDelete(filename + ".csv.tmp")

    conn = connectToDB()
    try:
        with conn.cursor(pymysql.cursors.DictCursor) as cursor:
            with open(filename + ".csv.tmp", 'w') as out_file:
                out_stream = csv.writer(out_file)
                
                # Write the header.
                out_stream.writerow(["sensor", "value", "date"])

                # Get the names of the sensors.
                getNames(cursor, out_stream, config)

                # Get the data.
                getData(out_file, cursor, out_stream, config)

                out_file.flush()
    finally:
        if conn:
            conn.close()
        
        os.rename(filename + ".csv.tmp", filename + ".csv")
        
        # Compress the data.
        zipCsv(filename)
  
def tryDelete(filename):
    print("Checking for existing " + filename)
    if os.path.exists(filename):
        print("removing: " + filename)
        os.remove(filename)

def formatIds(idList):
    ret = ""
    for elem in idList[:-1]:
        ret += str(elem) + ","
    ret = ret + str(idList[-1])
    return ret

def getNames(cursor, out, config):
    command = "SELECT sensorId, name, displayName FROM energyhill.sensor WHERE sensorId IN ("
    command = command + formatIds(config["ids"])
    command = command + ")"
    print(command)
    cursor.execute(command)

    rows = cursor.fetchall()
    sensorNames = {}
    for row in rows:
        name = row["displayName"]
        if name == None:
            name = row["name"]

        sensorNames[row["sensorId"]] = name

    print(sensorNames)
    
    config["names"] = sensorNames

def getData(file_obj, cursor, out, config):
    biggest_id_value = None

    while True:
        command = "SELECT * FROM energyhill.data WHERE sensorId IN ("
        command = command + formatIds(config["ids"])
        command = command + ")"

        if biggest_id_value != None:
            command = command + " AND dataId > " + str(biggest_id_value)

        if config["startTime"]:
            command = command + " AND dateTime > FROM_UNIXTIME(" + str(config["startTime"]) + ")"
        
        if config["endTime"]:
            command = command + " AND dateTime < FROM_UNIXTIME(" + str(config["endTime"]) + ")"

        command = command + " ORDER BY dataId ASC"
        command = command + " LIMIT 500"

        print(command)
        cursor.execute(command)

        rows = cursor.fetchall()

        if len(rows) == 0:
            # We're done!
            print("No more data. Done.")
            return

        for row in rows:
            dataId = row["dataId"]
            if biggest_id_value == None or dataId > biggest_id_value:
                biggest_id_value = dataId

            sensorId = row["sensorId"]

            value = row["value"]
            time = row["dateTime"]
            name = config["names"][sensorId]
            out.writerow([name, value, time])

        # Flush to disk.
        file_obj.flush()

# The csv file will be huge, and a lot of it is just repeated strings. Zipping it
# is going to save a TON of space (%90 or more); we'll only be storing the actual datapoints.
def zipCsv(filename):
    print("Zipping...")
    child = subprocess.Popen(["zip", "-m", "-9", filename + ".zip", filename + ".csv"], stdout = subprocess.DEVNULL, stderr = subprocess.DEVNULL)
    child.wait()

def connectToDB():
    try:
        with open('../config.json', 'r') as f:
            config = json.load(f)
    except ValueError:
        # Catch and re-raise with a better error message.
        raise Exception('Error while parsing json file "../config.json" (current dir: ' + str(os.getcwd()) + ")")
    except:
        raise Exception('Error while opening json file "../config.json" (current dir: ' + str(os.getcwd()) + ")")
    
    try:
        connection = pymysql.connect(host=config['DB_URL'], user=config['DB_USERNAME'], password=config['DB_PASSWORD'], db=config['DB_NAME'])
    except:
        raise Exception("Error while connecting to the database.")
    
    if connection == None:
        raise Exception("Error while connecting to the database.")

    return connection

if __name__ == '__main__':
    main()
