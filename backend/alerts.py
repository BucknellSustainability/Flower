#!/usr/bin/python

# pip install --client --upgrade mysqlclient
import MySQLdb
import json
import os
import subprocess

# local python file
import email 

def main():
    with open("../../config.json", 'r') as f:
        config = json.load(f)

    # Open database connection
    db = MySQLdb.connect(config["DB_URL"],
                         config["DB_USERNAME"],
                         config["DB_PASSWORD"],
                         config["DB_NAME"])

    # prepare a cursor object using cursor() method
    cursor = db.cursor()
    sql = "SELECT * FROM alerts WHERE handled != 1;"

    try:
        # Execute the SQL command
        cursor.execute(sql)
        # Fetch all the rows in a list of lists.
        unhandled = cursor.fetchall()
    except:
        print("Error: unable to fecth data")

    # updates each row that email was sent for
    if(unhandled is not ()):
        # sort alerts based on sensorId
        unhandled = [list(x) for x in unhandled]
        unhandled.sort(key=lambda x: x[3])  # sort on sensorId

        sensorIds = []
        alertMessages = []
        for x in unhandled:
            # add sensorIds only once
            if x[3] not in sensorIds:
                sensorIds.append(x[3])

        try:
            # Execute the SQL command to updated "handeled" value from 0 -> 1
            updateHandled = """UPDATE alerts SET handled = 1 WHERE alertId IN ({});""".format(
                ",".join([str(x[0]) for x in unhandled]))
            cursor.execute(updateHandled)
        except:
            print("Error: unable to update data")

        try:
            # Get info for each sensor
            getSensorInfo = """SELECT sensor.sensorId, sensor.name, sensor.units, p.projectId, p.name, s.siteId, s.name, sensor.alertMessage, sensor.alertEmail  FROM
                                    ((sensor inner join project as p on sensor.projectId = p.projectId) inner join site as s on p.siteId = s.siteId)
                                WHERE sensorId IN ({}) ORDER BY sensorId ASC;""".format(",".join([str(x) for x in sensorIds]))
            cursor.execute(getSensorInfo)
            sensorInfo = cursor.fetchall()
        except:
            print("Error: could not fetch sensor info")

        if(sensorInfo is not ()):
            prepareChartExport()
            # iterate through all sensors with alerts
            for i in range(len(sensorIds)):
                # get data for that sensor
                getSensorData = """SELECT * FROM datahourly WHERE sensorId = {} AND dateTime > (CURRENT_TIMESTAMP - INTERVAL 1 DAY);""".format(
                    str(sensorIds[i]))

                try:
                    # get aggregated data for sensor in sensorList
                    cursor.execute(getSensorData)
                    aggData = cursor.fetchall()
                except:
                    print("Error: no aggregated data to fetch")

                if(aggData is not ()):
                    # format data into json string
                    jsonData = getDataJSON(aggData, sensorInfo[i])
                    # create the chart image
                    chart = exportChart(jsonData)

                    body = "You are receiving this because of alert '{}' from Sensor: {} @ {}/{}".format(
                        sensorInfo[i][7], sensorInfo[i][1], sensorInfo[i][6], sensorInfo[i][4])
                    subject = "Warning: '{}' from Sensor: {} @ {}/{}  ".format(
                        sensorInfo[i][7], sensorInfo[i][1], sensorInfo[i][6], sensorInfo[i][4])
                    sendEmail('energyhill@bucknell.edu', sensorInfo[i][8], subject, body, [chart])

            # Commit Queries
            db.commit()
    # disconnect from server
    db.close()


"""
Formats and generates json string based on parameters from alerts/sensors
returns: JSON string used to build charts
"""


def getDataJSON(data, sensorInfo):
    sensorName = sensorInfo[1]
    projectName = sensorInfo[4]
    siteName = sensorInfo[6]
    units = sensorInfo[2]
    startDate = data[0][3].strftime('%B %d, %Y')
    endDate = data[-1][3].strftime('%B %d, %Y')

    # use labels for ever hour
    dates = ['"' + data[i]
             [3].strftime('%I:%M %p') + '"' for i in range(len(data))]
    values = [str(x[1]) for x in data]

    dataChartJSON = """
    {{
        "title": {{
            "text": "{} @ {}/{}"
        }},
        "xAxis": {{
            "categories": [{}],
            "title": {{
                "text": "{} - {}"
            }},
            "tickInterval": 6
        }},
        "yAxis": {{
            "title": {{
                "text": "Sensor Data ({})"
            }}
        }},
        "series": [
            {{
                "data": [{}],
                "fillOpacity": 0.5,
                "threshold": null,
                "name": "{}"
            }}
        ]
    }}""".format(sensorName, siteName, projectName, ','.join(dates), startDate, endDate, units, ','.join(values), sensorName)  # join values

    return dataChartJSON




"""
Installs highcharts-export-server if not already installed.
Returns 0 if successful, returns 1 if export server is not installed at the
expected path and could not be installed.
"""
eServerPath = "./node_modules/.bin/highcharts-export-server"
eServerName = "highcharts-export-server"


def prepareChartExport():
    if (not os.path.isfile(eServerPath)):
        try:
            if (0 != os.system("export ACCEPT_HIGHCHARTS_LICENSE=TRUE && npm install " + eServerName)):
                raise ImportError("Could not install chart export server")
        except ImportError:
            return 1
    return 0


"""
Generates a PNG image from a JSON Object
Assumes highcharts-export-server is present in the working directory
param chartJSON: A JSON string representing the chart being exported.
returns: A PNG MIMEImage object
"""


def exportChart(chartJSON):  # TODO: Handle errors
    # Write chartJSON into chart.json
    fp = open('chart.json', 'w')
    fp.write(chartJSON)
    fp.close()

    # Run export server to create chart.png file
    eServerCommand = ". $HOME/.bashrc && " + eServerPath + " -infile chart.json -outfile chart.png"
    subprocess.check_output(eServerCommand, shell=True)

    # Return chart.png image
    fp = open('chart.png', 'rb')  # Open in write binary mode
    chartImage = MIMEImage(fp.read())
    fp.close()
    return chartImage


if __name__ == "__main__":
    main()
