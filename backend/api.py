# export FLASK_DEBUG=0
# export FLASK_APP=api.py
# flask run

import json

from google.oauth2 import id_token
from google.auth.transport import requests

from flask import Flask, request
from flaskext.mysql import MySQL
app = Flask(__name__)

CLIENT_ID = '438120227370-lb3gicq14kf8nl6gh6d0rgtnqassqoej'

# load config (db info)
with open("../config.json", 'r') as f:
    config = json.load(f)

# give mysql plug the db info
app.config.update(
    MYSQL_DATABASE_HOST = config['DB_URL'],
    MYSQL_DATABASE_USER = config['DB_USERNAME'],
    MYSQL_DATABASE_PASSWORD = config['DB_PASSWORD'],
    MYSQL_DATABASE_DB = config['DB_NAME']
)

# Intialize mysql flask plugin and get cursor
mysql = MySQL()
mysql.init_app(app)

@app.route('/read')
def get():
    # TODO: assert that there are those parameters in dict and nothing else
    # TODO: sanitize all parts
    sql_string = 'SELECT {} FROM {} WHERE {};'.format(
        request.args.get('fields'),
        request.args.get('table'),
        request.args.get('condition')
    )
    # TODO: clean up output of db call
    return exec_query(sql_string)


@app.route('/insert')
def insert():
    validate_user(request.args.get('id_token'))
    # TODO: assert that there are those parameters in dict and nothing else
    # TODO: sanitize all parts
    sql_string = 'INSERT INTO {} {} VALUES {};'.format(
        request.args.get('table'),
        request.args.get('fields'),
        request.args.get('values')
    )
    exec_query(sql_string)
    # TODO: clean up output of db call
    return 'Insert'

@app.route('/modify')
def modify():
    validate_user(request.args.get('id_token'))

    # TODO: assert that there are those parameters in dict and nothing else
    # TODO: sanitize all parts
    sql_string = 'UPDATE {} SET {} WHERE {};'.format(
        request.args.get('table'),
        # TODO: need to form this into 'field1 = value1, field2 = value2, ...'
        request.args.get('modify_pairs'),
        request.args.get('condition')
    )
    exec_query(sql_string)
    # TODO: clean up output of db call
    return 'Modify'

@app.route('/get-profile')
def get_profile():
    # TODO: validate that params are correct and sanitize inputs
    # validate userid
    # user_id = validate_user(request.args.get('id_token'))

    # return construct_profile_json(user_id)
    return construct_profile_json(request.args.get('userid'))

def construct_profile_json(user_id):
    # fetch user info
    fetch_user_sql = 'SELECT * FROM user WHERE userId = {}'.format(
        user_id
    )
    user_data = exec_query(fetch_user_sql)

    # TODO: figure out query to do this `easily`
    # use user info to fetch projects
    pojects_sql = ''.format(

    )
    projects = exec_query(projects_sql)

    # use projects info to fetch devices
    project_ids = [project['projectId'] for project in projects]

    # TODO: test if this "IN" thing is correct
    #fetch_device
    devices_sql = 'SELECT * FROM device WHERE projectId IN {}'.format(
        str(tuple(project_ids))
    )

    devices = exec_query(devices_sql)

    # TODO: figure out how to get just the device ids
    device_ids = [device['deviceId'] for device in devices]

    # use devices info to fetch sensors
    sensors_sql = 'SELECT * FROM sensor WHERE deviceId IN {}'.format(
        # TODO: format device_ids from python list into mysql list
        str(tuple(device_ids))
    )

    sensors = exec_query(sensors_sql)

    sensors_dict = {}
    devices_dict = {}
    project_list = []
    # throw all data into dictionary to be converted to JSON
    for sensor in sensors:
        # construct sensor dict
        sensor_dict = {
            'id': sensor['sensorId'],
            'name': sensor['name']
        }

        device_id = sensor['device_id'];

        # add to dict (if doesn't exist, create list)
        if device_id not in sensors_dict.keys():
            sensors_dict[device_id] = [sensor_dict]
        else:
            sensors_dict[device_id].append(sensor_dict)

    for device in devices:
        # construct device dict
        device_dict = {
            'id': device['deviceId'],
            'name': device['name'],
            'sensors': sensors_dict[device['deviceId']]
        }

        project_id = device['projectId']

         # add to dict (if doesn't exist, create list)
        if project_id not in devices_dict.keys():
            devices_dict[project_id] = [device_dict]
        else:
            devices_dict[project_id].append(device_dict)

    for project in projects:
        # construct project dict
        project_dict = {
            'id': project['projectId'],
            'name': project['name'],
            'email': project['email'],
            'alerts': project['alerts'],
            'devices': devices_dict[project['projectId']]
        }

        project_list.append(project_dict)

    profile_dict = {
        'name': user_data['name']
        'projects': project_list
    }

    # return result as string
    # return json.dumps(profile_dict)
    return 'yay'

def exec_query(sql_string):
    cursor = mysql.get_db().cursor()
    data = None
    try:
        # Execute the SQL command
        cursor.execute(sql_string)
        # Fetch all the rows in a list of lists.
        data = cursor.fetchall()
    except:
        print("Error: unable o fetch data")

    # Get column names
    column_names = [column_info[0] for column_info in cursor.description]
    formatted_data = []
    for row in data:
        formatted_data.append(dict(zip(column_names, row)))

    return formatted_data


def validate_user(id_token):
    idinfo = id_token.verify_oauth2_token(id_token, requests.Request(), CLIENT_ID)

    if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
        print('Invalid token')


    userid = idinfo['sub']
    email = idinfo['email']
    name = idinfo['name']

    user_exists_sql = 'SELECT * FROM user WHERE userId = {}'.format(
        userid
    )
    result = exec_query(user_exists_sql)
    print(result)
    # TODO: fix this to reflect failed query
    if result == []:
        pass
    else:
        pass
