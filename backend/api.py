# module load python/3.6
# export FLASK_APP=api.py
# flask run --host=0.0.0.0

import json
import time
import datetime
import os

# pip install --user --upgrade google-auth
from google.oauth2 import id_token as id_token_lib
from google.auth.transport import requests

# pip install --user --upgrade flask-mysql
from flask import Flask, request, redirect, url_for, send_from_directory
from flask_cors import CORS
from flaskext.mysql import MySQL
from werkzeug.utils import secure_filename

# local files
from emailer import *

# load config (db info)
with open("../config.json", 'r') as f:
    config = json.load(f)
with open("../deployment.json", 'r') as f:
    deploy_config = json.load(f)

CLIENT_ID = deploy_config['GOOGLE_CLIENT_ID']
ERROR_FOLDER = 'errors/'
UPLOAD_FOLDER = 'uploads/'
# DO NOT ALLOW PHP FILES BECAUSE THEN USERS CAN EXECUTE ARBITRARY CODE
ALLOWED_EXTENSIONS = set(['hex'])

app = Flask(__name__)
CORS(app, supports_credentials=True)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

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

@app.route('/read', methods = ['GET'])
def get():
    # TODO: assert that there are those parameters in dict and nothing else
    # TODO: sanitize all parts
    sql_string = 'SELECT {} FROM {} WHERE {};'.format(
          request.values.get('fields'),
          request.values.get('table'),
          request.values.get('condition')
    )
    result = exec_query(sql_string)
    return json.dumps(result, default = jsonconverter)

@app.route('/insert', methods = ['POST'])
def insert():
    try:
        validate_user(request.values.get('id_token'))
    except UserDeniedException as e:
        print(e)
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

@app.route('/update', methods = ['POST'])
def modify():
    try:
        validate_user(request.values.get('id_token'))
    except UserDeniedException as e:
        print(e)
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


@app.route('/get-profile', methods = ['POST'])
def get_profile():
    # TODO: validate that params are correct and sanitize idtoken
    # validate useridi
    try:
        google_id = validate_user(request.values.get('idtoken'))
    except UserDeniedException as e:
        print(e)
        # return empty response to signify user not given permission
        return ''

    return construct_profile_json(google_id)


@app.route('/get-all-sensors', methods = ['GET'])
def get_all_sensors():
    return build_all_sensors_dict()

@app.route('/request-access', methods = ['POST'])
def request_access():
    idinfo = get_idinfo(request.values.get('idtoken'))

    googleid = idinfo['sub']
    email = idinfo['email']
    name = idinfo['name']

    # get user id from googleid
    userid_from_googleid_sql = 'SELECT userId FROM user WHERE googleId = ?'
    userid = exec_query(userid_from_googleid_sql, (googleid,))[0]['userId']

    # pass id into emailer function to send to admins
    send_approval_email(name, email, userid)

    return ''

@app.route('/approve-user', methods = ['POST'])
def approve_user():
    userid = request.values.get('userid')

    try:
        validate_admin(request.values.get('idtoken'))
    except UserDeniedException as e:
        print(e)
        # return empty response to signify user not given permission
        return ''

    # change approved status of `userid` to approved/1
    approve_user_sql = 'UPDATE user SET approved = 1 WHERE userId = ?'
    exec_query(approve_user_sql, (userid,))

    # get approved user email
    approved_user_email_sql = 'SELECT email FROM user WHERE userId = ?'
    approved_user = exec_query(approved_user_email_sql, (userid,))

    # send email to student
    send_approved_email(approved_user[0]['email'])

    return ''

@app.route('/log-success', methods = ['GET'])
def log_success():
    deviceid = request.values.get('deviceid')
    handle_codeupload_response(deviceid, None)
    return '' # TODO: figure out what should return

# TODO: does this need to be protected since it is creating files???
@app.route('/log-error', methods = ['GET'])
def log_error():
    deviceid = request.values.get('deviceid')
    error_msg = request.values.get('error_msg')
    handle_codeupload_response(deviceid, error_msg)
    return '' # TODO: figure out what to return

@app.route('/check-error', methods = ['GET'])
def check_error():
    deviceid = request.values.get('deviceid')

    check_status_sql = 'SELECT handled FROM codeupload WHERE deviceId = {}'.format(
        deviceid
    )
    status = exec_query(check_status_sql)

    # if row was deleted or handled is 1, then
    print(status[0]['handled'] == True)
    if status == [] or status[0]['handled'] == True:
        error_sql = 'SELECT errorId, path FROM errors WHERE deviceId = {} AND errorId = (SELECT MAX(errorId) FROM errors)'.format(
            deviceid
        )
        error = exec_query(error_sql)

        # TODO: validate that this is correct way to show Null string
        if error[0]['path'] == None:
            # success!
            # TODO: agree on what value to return, could use http return codes to help convey
            return 'SUCCESS'
        else:
            # failure!
            errorid = error[0]['errorId']
            error_dir_path = os.path.join(app.root_path, ERROR_FOLDER)
            return send_from_directory(directory=error_dir_path, filename=get_error_filename(errorid))
    else:
        return ''


@app.route('/store-code', methods = ["POST"])
def store_code():
    # check if valid user
    try:
        validate_user(request.values.get('idtoken'))
    except UserDeniedException as e:
        print(e)
        return ''

    deviceid = request.values.get('deviceid')

    # check if the post request has the file part
    if 'file' not in request.files:
        return redirect(request.url)
    file = request.files['file']
    # if user does not select file, browser also
    # submit a empty part without filename
    if file.filename == '':
        return redirect(request.url)
    if file and allowed_file(file.filename):
        # insert alert entry into db
        insert_codeupload_alert_sql = 'INSERT INTO codeupload (deviceId) VALUES (?)'
        # TODO: in theory this can become a race condition, but very unlikely.  Would need
        # two users to be uploading file for one device at same time...
        exec_query(insert_codeupload_alert_sql, (deviceid,))

        get_uploadid_sql = 'SELECT uploadId FROM codeupload WHERE uploadId = (SELECT MAX(uploadId) FROM codeupload WHERE deviceId = ?)'
        uploadid = exec_query(get_uploadid_sql, (deviceid,))[0]['uploadId']

        # construct path to put code file and make upload dir if doesn't already exist
        filename = get_code_filename(uploadid)
        path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        if not os.path.exists(app.config['UPLOAD_FOLDER']):
            os.makedirs(app.config['UPLOAD_FOLDER'])
        file.save(path)

        # update uploadid row to have path
        upload_path_update_sql = 'UPDATE codeupload SET path = ? WHERE uploadId = ?'
        exec_query(upload_path_update_sql, (path, uploadid))

        return ''

@app.route('/download-code', methods = ['GET'])
def download_code():
    # no need to validate user, maybe validate RaPi

    uploadid = request.values.get('uploadid')

    upload_dir_path = os.path.join(app.root_path, app.config['UPLOAD_FOLDER'])
    return send_from_directory(directory=upload_dir_path, filename=get_code_filename(uploadid))

def get_code_filename(uploadid):
    return str(uploadid) + '.hex'

def get_error_filename(errorid):
    return str(errorid) + '.txt'

def allowed_file(filename):
    return '.' in filename and \
        filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def handle_codeupload_response(deviceid, error_msg):
    handling_sql = 'INSERT INTO errors (deviceId, timestamp) VALUES (\'{}\', \'{}\')'.format(
        deviceid,
        datetime.datetime.fromtimestamp(time.time()).strftime('%Y-%m-%d %H:%M:%S')
    )
    exec_query(handling_sql)

    # can't be race condition here because one Pi can't be trying to upload two things at same time

    if error_msg is not None:
        # get errorid of row just inserted
        get_errorid_sql = 'SELECT errorId FROM errors WHERE errorId = (SELECT MAX(errorId) FROM errors WHERE deviceId = {})'.format(
            deviceid
        )
        errorid = exec_query(get_errorid_sql)[0]['errorId']

        if not os.path.exists(ERROR_FOLDER):
            os.makedirs(ERROR_FOLDER)

        filename = get_error_filename(errorid)
        path = os.path.join(ERROR_FOLDER, filename)

        #save error in file
        text_file = open(path, "w")
        text_file.write(error_msg)
        text_file.close()

        update_path_sql = 'UPDATE errors SET path = \'{}\' WHERE errorId = {}'.format(
            path,
            errorid
        )
        exec_query(update_path_sql)

    # once stored error message and created row, can finally mark as handled
    mark_handled_sql = 'UPDATE codeupload SET handled = 1 WHERE deviceId = {}'.format(deviceid)
    exec_query(mark_handled_sql)

def validate_table_name(table_name):
    # pull list of table names
    cursor = conn.cursor()
    cursor.execute('SHOW TABLES')
    valid_tables = cursor.fetchall()

    if table_name not in valid_tables:
        raise InputError('Query has invalid table name')

def validate_column_name(table_name, column_name):
    # validate table name first
    validate_table_name(table_name)

    # pull list of columns for table
    cursor = conn.cursor()
    cursor.execute('SELECT column_name FROM information_schema.columns WHERE table_name = ?', table_name)
    valid_columns = cursor.fetchall()

    if column_name not in valid_columns:
        raise InputError('Query has invalid column name')

def construct_profile_json(google_id):
    # fetch user info
    fetch_user_sql = 'SELECT * FROM user WHERE googleId = ?'
    user_data = exec_query(fetch_user_sql, (google_id,))[0]

    # use user info to fetch projects
    projects_id_sql = 'SELECT * FROM owners WHERE userId = ?'
    project_ids = [owner_row['projectId'] for owner_row in exec_query(projects_id_sql, (user_data['userId'],))]


    projects_sql = 'SELECT * FROM project WHERE {}'.format(
        build_condition('projectId', project_ids)
    )

    projects = exec_query(projects_sql, tuple(project_ids))

    #fetch_device
    devices_sql = 'SELECT * FROM device WHERE {}'.format(
        build_condition('projectId', project_ids)
    )

    devices = exec_query(devices_sql, tuple(project_ids))

    device_ids = [device['deviceId'] for device in devices]

    # use devices info to fetch sensors
    sensors_sql = 'SELECT * FROM sensor WHERE {}'.format(
        build_condition('deviceId', device_ids)
    )

    sensors = exec_query(sensors_sql, tuple(device_ids))

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
    projects = exec_query(projects_sql, ())

    # fetch all devices
    devices_sql = 'SELECT * FROM device;'
    devices = exec_query(devices_sql, ())

    device_ids = [device['deviceId'] for device in devices]

    # fetch all sensors
    sensors_sql = 'SELECT * FROM sensor'
    sensors = exec_query(sensors_sql, ())

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

'''
This function is safe to string format into WHERE clause
'''
def build_condition(column_name, list_of_vals):
    if len(list_of_vals) == 1:
        return '{} = {}'.format(
            column_name,
            list_of_vals[0]
        )
    else:
        return '{} IN ({})'.format(
            column_name,
            '?, ' * len(list_of_vals)
        )


'''
Generic way to execute queries and return results as a dictionary.

param formatted_sql_string: string with `?` where userinput will be placed
param param_tuple: tuple with same number of elements as `?` in formatted_sql_string
'''
def exec_query(formatted_sql_string, param_tuple):
    assert type(formatted_sql_string) is string, 'DB Call does not have sql string'
    assert type(param_tuple) is tuple, 'DB Call does not have user input tuple'
    assert formatted_sql_string.count('?') == len(param_tuple), 'DB Call has mismatching number of user inputs'

    cursor = conn.cursor()
    descriptions = None
    data = None

    try:
        # Execute the SQL command
        cursor.execute(formatted_sql_string, param_tuple)

        # Fetch all the rows in a list of lists.
        descriptions = cursor.description

        # Fetch all of the data
        data = cursor.fetchall()
    except Exception as e:
        print("Error: Couldn't fetch data: {}".format(str(e)))

    # handle query not returning anything - this could mean error or insert/update
    if data is None or descriptions is None:
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
    user_exists_sql = 'SELECT * FROM user WHERE googleId = ?'
    result = exec_query(user_exists_sql, (googleid,))

    if result == []:
        # user doesn't exist in system yet, add to db and redirect
        insert_user_sql = 'INSERT INTO user (email, name, googleId) VALUES (?, ?, ?)'
        exec_query(insert_user_sql, (email, name, googleid))

        raise UserDeniedException('User was not found in DB')
    elif ord(result[0]['approved']) == False:
        # user is not approved but in system, just redirect
        raise UserDeniedException('User was found in DB, but not approved')

    # if user is in system
    return googleid

def validate_admin(id_token):
    googleid = validate_user(id_token)
    print('admin is good to go')
    is_admin_sql = 'SELECT isAdmin FROM user WHERE googleId = ?'
    is_admin = exec_query(is_admin_sql, (googleid,))
    if ord(is_admin[0]['isAdmin']) == False:
        raise UserDeniedException('Currently logged in user trying to approve user is not admin')

    return googleid

def send_approval_email(name, email, userid):
    link = deploy_config['APPROVAL_LINK'].format(
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
    admins = exec_query(get_admins_sql, ())
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
    body = (EMAIL_HTML_START +
        'Hello,<br>' +
        'You have been granted access to the Energy Hill dashboard.  You can now access the dashboard.<br>' +
        'Thanks,<br>' +
        'Energy Hill Robot' +
        EMAIL_HTML_END)

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
