#!/usr/bin/python

# pip install --client --upgrade mysqlclient

# local python file
from emailer import sendEmail, exportChart
from db import *
from logger import *
Logger.init_logger('alerts')
logger = Logger.logger
Db.set_logger(logger)

LAST_10_MINS_CONDITION = '''databuffer.dateTime >= FROM_UNIXTIME(FLOOR(UNIX_TIMESTAMP(NOW())/600)*600) - INTERVAL 10 MINUTE AND databuffer.dateTime < FROM_UNIXTIME(FLOOR(UNIX_TIMESTAMP(NOW())/600)*600)'''

AGGREGATION_SQL = '''INSERT INTO datahourly(sensorId, averageValue, sampleRate, dateTime)
			(select 
			        sensorId, 
				AVG(value) as value,  
				COUNT(VALUE) as samplePerHour, 
				FROM_UNIXTIME(FLOOR(UNIX_TIMESTAMP(NOW())/600)*600) as currTime
                            FROM databuffer
			    WHERE {}
			    GROUP BY sensorId)'''.format(LAST_10_MINS_CONDITION)

COPY_SQL = '''INSERT INTO data(sensorId, value, dateTime) (
                    SELECT
                        sensorId, value, dateTime
                    FROM databuffer
                    WHERE {}
                )'''.format(LAST_10_MINS_CONDITION)

DELETE_SQL = '''DELETE FROM databuffer WHERE {}'''.format(LAST_10_MINS_CONDITION)


UNHANDLED = 0
HANDLED = 1

def main():
    aggregate_buffer()
    copy_buffer()
    delete_buffer()
    
    # get all of the unhandled alerts from the aggregation
    unhandled_alerts = get_unhandled_alerts()

    # for each unhandled alert, send email to correct user with picture of vis, then mark handled
    for alert in unhandled_alerts:
        send_alert_email(alert['sensorId'], alert['alertId'])
        mark_handled(alert['alertId'])

def send_alert_email(sensor_id, alert_id):
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
        chart = exportChart(jsonData)

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
        sendEmail('energyhill@bucknell.edu', owner_emails, subject, body, [chart])
        logger.info('Sent alert email to owners')

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
    
def aggregate_buffer():
    logger.info('Aggregating buffer data')
    try:
        # do aggregation first
        Db.exec_query(AGGREGATION_SQL)
    except Exception as e:
        logger.exception('Failed to aggregate buffer data', exc_info=True)
    logger.info('Done aggregating buffer data')

def copy_buffer():
    logger.info('Copying buffer data')
    try:
        # then copy
        Db.exec_query(COPY_SQL)
    except Exception as e:
        logger.exception('Failed to copy buffer data', exc_info=True)
    logger.info('Done copying buffer data')

def delete_buffer():
    logger.info('Deleting buffer data')
    try:
        # finally delete
        Db.exec_query(DELETE_SQL)
    except Exception as e:
        logger.exception('Failed to delete buffer data', exc_info=True)
    logger.info('Done deleting buffer data')

def get_unhandled_alerts():
    try:
        get_unhandled_sql = "SELECT * FROM alerts WHERE handled = {}".format(UNHANDLED)
        return Db.exec_query(get_unhandled_sql)
    except Exception as e:
        logger.exception('Failed to get unhandled alerts', exc_info=True)


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

if __name__ == "__main__":
    main()
