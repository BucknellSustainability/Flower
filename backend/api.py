# module load python/3.6
# export FLASK_APP=api.py
# flask run --host=0.0.0.0

import json

# pip install --user --upgrade google-auth
from google.oauth2 import id_token as id_token_lib
from google.auth.transport import requests

# pip install --user --upgrade flask-mysql
from flask import Flask, request
from flask_cors import CORS
from flaskext.mysql import MySQL

app = Flask(__name__)
CORS(app, supports_credentials=True)

CLIENT_ID = '438120227370-65o4j0kmk9mbij1bp3dqvnts9dh4kfrf.apps.googleusercontent.com'

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

# Intialize mysql flask plugin
mysql = MySQL()
mysql.init_app(app)

@app.route('/read')
def get():
    # TODO: assert that there are those parameters in dict and nothing else
    # TODO: sanitize all parts
    sql_string = 'SELECT {} FROM {} WHERE {};'.format(
          request.values.get('fields'),
          request.values.get('table'),
          request.values.get('condition')
    )
    result = exec_query(sql_string)
    return json.dumps(result)

# TODO: need to commit after executing insert
@app.route('/insert')
def insert():
    validate_user(request.values.get('id_token'))
    # TODO: assert that there are those parameters in dict and nothing else
    # TODO: sanitize all parts
    sql_string = 'INSERT INTO {} {} VALUES {};'.format(
        request.values.get('table'),
        request.values.get('fields'),
        request.values.get('values')
    )
    result = exec_query(sql_string)
    return json.dumps(result)

# TODO: need to commit after executing update
@app.route('/update')
def modify():
    validate_user(request.values.get('id_token'))

    # TODO: assert that there are those parameters in dict and nothing else
    # TODO: sanitize all parts
    sql_string = 'UPDATE {} SET {} WHERE {};'.format(
        request.values.get('table'),
        # TODO: need to form this into 'field1 = value1, field2 = value2, ...'
        request.values.get('modify_pairs'),
        request.values.get('condition')
    )
    result = exec_query(sql_string)
    return json.dumps(result)

@app.route('/get-profile', methods = ['GET', 'POST'])
def get_profile():
    # TODO: validate that params are correct and sanitize idtoken
    # validate userid
    google_id = validate_user(request.values.get('idtoken'))
    
    return construct_profile_json(google_id)

# TODO: handle empty results of queries
def construct_profile_json(google_id):
    # fetch user info
    fetch_user_sql = 'SELECT * FROM user WHERE googleId = {};'.format(
        google_id
    )
    user_data = exec_query(fetch_user_sql)[0]

    # use user info to fetch projects
    projects_id_sql = 'SELECT * FROM owners WHERE userId = {};'.format(
		user_data['userId']
    )
    project_ids = [owner_row['projectId'] for owner_row in exec_query(projects_id_sql)]


    projects_sql = 'SELECT * FROM project WHERE {};'.format(
        build_condition('projectId', project_ids)
    )

    projects = exec_query(projects_sql)

    #fetch_device
    devices_sql = 'SELECT * FROM device WHERE {}'.format(
        build_condition('projectId', project_ids)
    )

    devices = exec_query(devices_sql)

    device_ids = [device['deviceId'] for device in devices]

    # use devices info to fetch sensors
    sensors_sql = 'SELECT * FROM sensor WHERE {}'.format(
        build_condition('deviceId', device_ids)
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

        device_id = sensor['deviceId'];

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
            #'email': project['email'],
            #'alerts': project['alerts'],
            'devices': devices_dict[project['projectId']]
        }

        project_list.append(project_dict)

    profile_dict = {
        'name': user_data['name'],
        'projects': project_list
    }

    # return result as string
    return_string = json.dumps(profile_dict)
    return return_string

def build_condition(column_name, list_of_vals):
    if len(list_of_vals) == 1:
        return '{} = {}'.format(
            column_name,
            list_of_vals[0]
        )
    else:
        return '{} IN {}'.format(
            column_name,
            str(tuple(list_of_vals))
        )


def exec_query(sql_string):
    cursor = mysql.get_db().cursor()
    try:
        # Execute the SQL command, by calling execute like this, it handles sql injection
        cursor.execute(sql_string)
    except Exception as e:
        print(e)

    descriptions = None
    try:
        # Fetch all the rows in a list of lists.
        descriptions = cursor.description
        print(data)
    except:
        print("Error: Couldn't fetch description")

    data = None
    try:
        # Fetch all of the data
        data = cursor.fetchall()
    except:
        print("Error: Couldn't fetch data")


    # Get column names
    # TODO: check to make sure descriptions and data gets populated
    # should exit program gracefully instead of None type error
    column_names = [column_info[0] for column_info in descriptions]
    formatted_data = []
    for row in data:
        formatted_data.append(dict(zip(column_names, row)))

    return formatted_data


def validate_user(id_token):
    idinfo = id_token_lib.verify_oauth2_token(id_token, requests.Request(), CLIENT_ID)

    if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
        raise ValueError('Invalid token')


    userid = idinfo['sub']
    email = idinfo['email']
    name = idinfo['name']

    return userid

    # TODO: create process to add user to db and start approval process
''' General logic of approval process
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
'''
''' Query object to be used later
class SqlQuery:
    def __init__(self, format_string, arg_tuple):
        self.format_string = format_string
        self.arg_tuple = arg_tuple
'''
