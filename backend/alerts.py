#!/usr/bin/python

# pip install --client --upgrade mysqlclient
import os
import subprocess

# local python file
from emailer import sendEmail
from db import *

AGGREGATION_SQL = '''INSERT INTO datahourly(sensorId, averageValue, sampleRate, dateTime)
			(select 
			        sensorId, 
				AVG(value) as value,  
				COUNT(VALUE) as samplePerHour, 
				FROM_UNIXTIME(FLOOR(UNIX_TIMESTAMP(NOW())/600)*600) as currTime
                            FROM data
			    WHERE data.dateTime > FROM_UNIXTIME(FLOOR(UNIX_TIMESTAMP(NOW())/600)*600) - INTERVAL 10 MINUTE
			    GROUP BY sensorId)'''

UNHANDLED = 0
HANDLED = 1

def main():
    # do initial aggregation
    aggregate()
    
    # get all of the unhandled alerts from the aggregation
    unhandled_alerts = get_unhandled_alerts()

    # for each unhandled alert, send email to correct user with picture of vis, then mark handled
    for alert in unhandled_alerts:
        send_alert_email(alert['sensorId'], alert['alertId'])
        mark_handled(alert['alertId'])

def send_alert_email(sensor_id, alert_id):
    # prepareChartExport()
    
    # get all the information for a sensor
    sensor_info_sql = 'SELECT * FROM sensor WHERE sensorId = {}'.format(sensor_id)
    sensor_info = Db.exec_query(sensor_info_sql)[0]

    # get data for that sensor
    sensor_agg_data_sql = 'SELECT * FROM datahourly WHERE sensorId = {} AND dateTime > (CURRENT_TIMESTAMP - INTERVAL 1 DAY);'.format(sensor_id)
    sensor_agg_data = Db.exec_query(sensor_agg_data_sql)

    # if we have the info and data, we are good to go
    if sensor_info is not [] and sensor_agg_data is not []:
        # format data into json string
        jsonData = getDataJSON(sensor_info, sensor_agg_data)

        # create the chart image
        #chart = exportChart(jsonData)

        owner_emails = get_owners_emails(sensor_id)

        alert_val = Db.exec_query('SELECT alertVal FROM alerts WHERE alertId = %s', (alert_id,))[0]['alertVal']

        body = """Manager of this sensor,
The sensor is outside of the bounds {} to {} {}! The current value is {}. These messages will recur until you change the bounds, turn off alerts, or fix the issue. You are receiving this alert because you are in charge of this sensor. Sorry for the spam, but it is necessary.
Best,
Energy Hill Robot""".format(
            sensor_info['alertMinVal'],
            sensor_info['alertMaxVal'],
            sensor_info['units'],
            alert_val
            
        )
        subject = "Warning: the sensor '{}' has gone {} its {} bound!".format(
            sensor_info['name'],
            'above' if alert_val >= sensor_info['alertMaxVal'] else 'below',
            'upper' if alert_val >= sensor_info['alertMaxVal'] else 'lower'
        )
        #sendEmail('energyhill@bucknell.edu', owner_emails, subject, body, [chart])
        sendEmail('energyhill@bucknell.edu', owner_emails, subject, body, [])

def get_owners_emails(sensor_id):
    # get device id for sensor
    device_id_result = Db.exec_query('SELECT deviceId FROM sensor WHERE sensorId = %s', (sensor_id,))
    if device_id_result is [] or device_id_result[0]['deviceId'] == None:
        # this only happens when sensor doesn't have associated device (device was deleted)
        # shouldn't happen too often, but just in case, use admins' emails
        admin_emails = [admin['email'] for admin in Db.exec_query('SELECT email FROM user WHERE isAdmin = 1')]
        return admin_emails

    # there is guarenteed to be exactly one element in list at this point
    device_id = device_id_result[0]['deviceId']

    # get project id for device
    project_id_result = Db.exec_query('SELECT projectId FROM device WHERE deviceId = %s', (device_id,))
    if project_id_result is [] or project_id_result[0]['projectId'] == None:
        # this only happens when a device doesn't have a project (when it hasn't been claimed yet)
        # shouldn't happen too often, but just in case, use admins' emails
        admin_emails = [admin['email'] for admin in Db.exec_query('SELECT email FROM user WHERE isAdmin = 1')]
        return admin_emails

    # there is guarenteed to be exactly one element in list at this point
    project_id = project_id_result[0]['projectId']

    # get owners ids for project
    user_id_result = Db.exec_query('SELECT userId FROM owners WHERE projectId = %s', (project_id,))
    if user_id_result is []:
        # this only happens when there are no owners for a project (everyone left a project)
        # shouldn't happen too often, but just in case, use admins' emails
        admin_emails = [admin['email'] for admin in Db.exec_query('SELECT email FROM user WHERE isAdmin = 1')]
        return admin_emails

    owner_ids = tuple([owner['userId'] for owner in user_id_result])

    # get emails of owners (we assume that all users are in table and have valid emails)
    owner_emails_sql = 'SELECT email FROM user WHERE userId IN ({})'.format(
        ','.join(['%s']*len(owner_ids))
    )
    owner_emails_result = Db.exec_query(owner_emails_sql, owner_ids)
    owner_emails = [result['email'] for result in owner_emails_result]

    return owner_emails

def mark_handled(alert_id):
    handle_alert_sql = 'UPDATE alerts SET handled = {} WHERE alertId = {}'.format(
        HANDLED,
        alert_id   
    )
    Db.exec_query(handle_alert_sql)
    
def aggregate():
    try:
        # do aggregation first
        Db.exec_query(AGGREGATION_SQL)
    except Exception as e:
        print('Unable to aggreate data')
        print(e)

def get_unhandled_alerts():
    try:
        get_unhandled_sql = "SELECT * FROM alerts WHERE handled = {}".format(UNHANDLED)
        return Db.exec_query(get_unhandled_sql)
    except Exception as e:
        print('Unable to get unhandled alerts')
        print(e)


"""
Formats and generates json string based on parameters from alerts/sensors
returns: JSON string used to build charts
"""
def getDataJSON(info, data):
    sensorName = info['name']
    units = info['units']
    startDate = data[0]['dateTime'].strftime('%B %d, %Y')
    endDate = data[-1]['dateTime'].strftime('%B %d, %Y')

    # use labels for ever hour
    dates = ['"{}"'.format(data_point['dateTime'].strftime('%I:%M %p')) for data_point in data]
    values = [str(data_point['averageValue']) for data_point in data]

    dataChartJSON = """
    {{
        "title": {{
            "text": "{}"
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
    }}""".format(sensorName, ','.join(dates), startDate, endDate, units, ','.join(values), sensorName)  # join values

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
            if (0 != os.system("module load node && export ACCEPT_HIGHCHARTS_LICENSE=TRUE && npm install " + eServerName)):
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
