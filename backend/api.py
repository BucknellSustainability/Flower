# module load python/3.6
# export FLASK_APP=api.py
# flask run --host=0.0.0.0

import json
import datetime
import pprint

# pip install --user --upgrade google-auth
from google.oauth2 import id_token as id_token_lib
from google.auth.transport import requests

# pip install --user --upgrade flask-mysql flask-cors
from flask import Flask, request
from flask_cors import CORS
from flaskext.mysql import MySQL

# local files
from emailer import *

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
conn = mysql.connect()

@app.route('/read')
def get():
    # TODO: assert that there are those parameters in dict and nothing else
    # TODO: sanitize all parts
    sql_string = 'SELECT {} FROM {} WHERE {};'.format(
          request.values.get('fields'),
          request.values.get('table'),
          request.values.get('condition')
    )
    print(sql_string)
    result = exec_query(sql_string)
    return json.dumps(result, default = jsonconverter)

# TODO: need to commit after executing insert
@app.route('/insert')
def insert():
    try:
        validate_user(request.values.get('id_token'))
    except UserDeniedException as e:
        # TODO: log failure to access
        # return empty response to signify user not given permission
        return ''

    # TODO: assert that there are those parameters in dict and nothing else
    # TODO: sanitize all parts
    sql_string = 'INSERT INTO {} {} VALUES {};'.format(
        request.values.get('table'),
        request.values.get('fields'),
        request.values.get('values')
    )
    result = exec_query(sql_string)
    return json.dumps(result, default = jsonconverter)

# TODO: need to commit after executing update
@app.route('/update')
def modify():
    try:
        validate_user(request.values.get('id_token'))
    except UserDeniedException as e:
        # TODO: log failure to access
        # return empty response to signify user not given permission
        return ''

    # TODO: assert that there are those parameters in dict and nothing else
    # TODO: sanitize all parts
    sql_string = 'UPDATE {} SET {} WHERE {};'.format(
        request.values.get('table'),
        # TODO: need to form this into 'field1 = value1, field2 = value2, ...'
        request.values.get('modify_pairs'),
        request.values.get('condition')
    )
    result = exec_query(sql_string)
    return json.dumps(result, default = jsonconverter)

@app.route('/get-profile', methods = ['GET', 'POST'])
def get_profile():
    # TODO: validate that params are correct and sanitize idtoken
    # validate userid
    try:
        google_id = validate_user(request.values.get('idtoken'))
    except UserDeniedException as e:
        # TODO: log failure to access
        print(e)
        # return empty response to signify user not given permission
        return ''

    return construct_profile_json(google_id)


@app.route('/get-all-sensors', methods = ['GET', 'POST'])
def get_all_sensors():
    return build_all_sensors_dict()


@app.route('/request-access', methods = ['POST'])
def request_access():
    idinfo = get_idinfo(request.values.get('idtoken'))
    
    googleid = idinfo['sub']
    email = idinfo['email']
    name = idinfo['name']
    
    # get user id (maybe use the google id)
    userid_from_googleid_sql = 'SELECT userId FROM user WHERE googleId = {}'.format(
        googleid
    )
    userid = exec_query(userid_from_googleid_sql)[0]['userId']

    # pass id into emailer function to send to admins
    send_approval_email(name, email, userid)

    return ''

@app.route('/approve-user', methods = ['POST'])
def approve_user():
    userid = request.values.get('userid')

    try:
        validate_admin(request.values.get('idtoken'))
    except UserDeniedException as e:
        # TODO: log failure to access
        print(e)
        # return empty response to signify user not given permission
        return ''
    
    # change approved status of `userid` to approved/1
    approve_user_sql = 'UPDATE user SET approved = 1 WHERE userId = {}'.format(userid)
    exec_query(approve_user_sql)

    # get approved user email
    approved_user_email_sql = 'SELECT email FROM user WHERE userId = {}'.format(userid)
    approved_user = exec_query(approved_user_email_sql)

    # send email to student
    send_approved_email(approved_user[0]['email'])
    
    return ''


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
    return_string = json.dumps(profile_dict, default = jsonconverter)
    return return_string

def build_all_sensors_dict():
    # fetch all projects
    projects_sql = 'SELECT * FROM project;'
    projects = exec_query(projects_sql)

    # fetch all devices
    devices_sql = 'SELECT * FROM device;'
    devices = exec_query(devices_sql)

    device_ids = [device['deviceId'] for device in devices]

    # fetch all sensors
    sensors_sql = 'SELECT * FROM sensor'
    sensors = exec_query(sensors_sql)

    sensors_dict = {}
    devices_dict = {}
    project_list = []
    # throw all data into dictionary to be converted to JSON
    for sensor in sensors:
        # construct sensor dict
        sensor_dict = {
            'id': sensor['sensorId'],
            'name': sensor['name'],
            'description': sensor['description']
        }

        device_id = sensor['deviceId'];

        # add to dict (if doesn't exist, create list)
        if device_id not in sensors_dict.keys():
            sensors_dict[device_id] = [sensor_dict]
        else:
            sensors_dict[device_id].append(sensor_dict)

    for device in devices:
        project_id = device['projectId']
        # add to dict (if doesn't exist, create list)
        device_id = device['deviceId']
        if device_id in sensors_dict.keys():
            if project_id not in devices_dict.keys():
                devices_dict[project_id] = sensors_dict[device_id]
            else:
                devices_dict[project_id] += sensors_dict[device_id]

    for project in projects:
        # construct project dict
        project_dict = {
            'id': project['projectId'],
            'name': project['name'],
            #'email': project['email'],
            #'alerts': project['alerts'],
            'sensors': devices_dict[project['projectId']]
        }

        project_list.append(project_dict)

    project_dict = {'projects': project_list}

    pprint.pprint(project_dict)

    # return result as string
    return_string = json.dumps(project_dict, default = jsonconverter)
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
    cursor = conn.cursor()
    descriptions = None
    data = None
    
    try:
        # Execute the SQL command
        cursor.execute(sql_string)
        
        # Fetch all the rows in a list of lists.
        descriptions = cursor.description
        
        # Fetch all of the data
        data = cursor.fetchall()
    except Exception as e:
        print("Error: Couldn't fetch data: {}".format(str(e)))

    # handle query not returning anything - this could mean error or insert/update
    if data is None or descriptions is None:
        # TODO: log that 
        print("Query ({}) didn't return anything".format(sql_string))
        # in case it is an insert/update, need to commit
        conn.commit()
        return []

    # Get column names and data into list of dicts
    column_names = [column_info[0] for column_info in descriptions]
    formatted_data = []
    for row in data:
        formatted_data.append(dict(zip(column_names, row)))

    return formatted_data

def get_idinfo(id_token):
    idinfo = id_token_lib.verify_oauth2_token(id_token, requests.Request(), CLIENT_ID)

    if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
        raise ValueError('Invalid token')

    return idinfo

def validate_user(id_token):
    idinfo = get_idinfo(id_token)

    googleid = idinfo['sub']
    email = idinfo['email']
    name = idinfo['name']

    # TODO: protect against SQL injection
    user_exists_sql = 'SELECT * FROM user WHERE googleId = {}'.format(
        googleid
    )
    result = exec_query(user_exists_sql)

    if result == []:
        # user doesn't exist in system yet, add to db and redirect
        insert_user_sql = 'INSERT INTO user (email, name, approved, googleId) VALUES (\'{}\', \'{}\', {}, \'{}\');'.format(
            email, name, googleid 
        )
        exec_query(insert_user_sql)

        raise UserDeniedException('User was not found in DB')
    elif ord(result[0]['approved']) == False:
        # user is not approved but in system, just redirect
        raise UserDeniedException('User was found in DB, but not approved')

    # if user is in system
    return googleid

def validate_admin(id_token):
    googleid = validate_user(id_token)
    is_admin_sql = 'SELECT isAdmin FROM user WHERE googleId = {}'.format(googleid)
    is_admin = exec_query(is_admin_sql)
    if ord(is_admin[0]['isAdmin']) == False:
        raise UserDeniedException('Currently logged in user trying to approve user is not admin')

    return googleid

def send_approval_email(name, email, userid):
    # TODO: find a better way to do this
    link = 'http://eg.bucknell.edu/~bdm015/Flower/web/requests/approveUser.html?userid={}'.format(
        userid
    )

    body = (EMAIL_HTML_START +
            'Hello, <br>' +
           '{0} ({1}) wants access to the Energy Hill dashboard.  To approve this request, please click this link and sign in to your Google account: <a href="{2}">{2}</a>\n' +
           'Sincerely,<br>' + 
           'Energy Hill Robot' +
           EMAIL_HTML_END).format(
                name,
                email,
                link
            )

    # get list of admin emails
    get_admins_sql = 'SELECT email FROM user WHERE isAdmin = 1'
    admins = exec_query(get_admins_sql)
    admin_emails = [admin['email'] for admin in admins]

    sendEmail(
        sender='energyhill@bucknell.edu',
        receivers=admin_emails,
        subject='Energy Hill Dashboard Access Request',
        body=body,
        attachments=[],
        is_body_html=True
    )

def send_approved_email(approved_user_email):
    # TODO: add actual link to dashboard
    link = ''

    body = (EMAIL_HTML_START +
            'Hello,<br>' +
            'You have been granted access to the Energy Hill dashboard.  You can use this link to access the dashboard <a href="{0}">{0}</a>' +
            'Thanks,<br>' +
            'Energy Hill Robot' +
            EMAIL_HTML_END).format(
                  link 
            )

    sendEmail(
        sender='energyhill@bucknell.edu',
        receivers=[approved_user_email],
        subject='Energy Hill - You\'ve been approved',
        body=body,
        attachments=[],
        is_body_html=True
    )

def jsonconverter(o):
    if isinstance(o, datetime.datetime):
        return o.__str__()


class UserDeniedException(Exception):
    pass
