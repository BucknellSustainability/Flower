#!/usr/bin/env python
"""
Very simple HTTP server in python.

Usage::
    ./db.py [<port>]

Send a GET request::
    curl http://localhost

Send a HEAD request::
    curl -I http://localhost

Send a POST request::
    curl -d "foo=bar&bin=baz" http://localhost

"""
import MySQLdb
import json
import ssl

from urllib.parse import urlparse, parse_qs
from http.server import BaseHTTPRequestHandler, HTTPServer

# $ pip install --upgrade google-api-python-client
# $ pip install --upgrade google-auth google-auth-oauthlib google-auth-httplib2
from google.oauth2 import id_token
from google.auth.transport import requests

CLIENT_ID = '438120227370-lb3gicq14kf8nl6gh6d0rgtnqassqoej'

with open("../config.json", 'r') as f:
    config = json.load(f)

class S(BaseHTTPRequestHandler):
    def _set_headers(self):
        self.send_response(200)
        self.send_header('Content-type', 'text/html')
        self.end_headers()

    def do_GET(self):
        self._set_headers()

        # get GET data and put data into dictionary
        query_dict = parse_qs(urlparse(self.path).query)
        query_dict = {key: query_dict[key][0] for key in query_dict.keys()}

        # execute query and return result to caller
        result = handle_request(query_dict)
        self.wfile.write(str(result).encode('ascii'))

    def do_HEAD(self):
        self._set_headers()

    def do_POST(self):
        self._set_headers()

        # get POST data
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length).decode('ascii')

        # parse data into dictionary and execute query
        query_dict = parse_qs(post_data)
        query_dict = {key: query_dict[key][0] for key in query_dict.keys()}
        result = handle_request(query_dict)

        # return information to caller
        self.wfile.write(b"Posted successful")

def handle_request(query_dict):
    if query_dict['type'] == 'user_structure':
        # TODO: validate that params are correct and sanitize inputs
        # validate userid
        user_id = validate_user(query_dict['id_token'])

        # fetch user info
        fetch_user_sql = 'SELECT * FROM user WHERE userId = {}'.format(
            user_id
        )
        user_data = exec_query(fetch_user_sql)

        # use user info to fetch projects

        # use projects info to fetch devices
        project_ids = list()
        #fetch_device

        # use devices info to fetch sensors
        # throw into JSON object structure
        # return result as string
    else: # all other `simple` requests
        sql_string = build_sql(query_dict)
        print(sql_string)
        return exec_query(sql_string)

def exec_query(sql_string):
    db = MySQLdb.connect(config["DB_URL"],
                         config["DB_USERNAME"],
                         config["DB_PASSWORD"],
                         config["DB_NAME"])

    cursor = db.cursor()

    try:
        # Execute the SQL command
        cursor.execute(sql_string)
        # Fetch all the rows in a list of lists.
        data = cursor.fetchall()
        print(data)
        return data
    except:
        print("Error: unable o fetch data")


def build_sql(query_dict):
    if query_dict['type'] == 'read':
        # TODO: assert that there are those parameters in dict and nothing else
        # TODO: sanitize all parts
        return 'SELECT {} FROM {} WHERE {};'.format(
            query_dict['fields'],
            query_dict['table'],
            query_dict['condition']
        )
    elif query_dict['type'] == 'insert':
        validate_user(query_dict['id_token'])

        # TODO: assert that there are those parameters in dict and nothing else
        # TODO: sanitize all parts
        return 'INSERT INTO {} {} VALUES {};'.format(
            query_dict['table'],
            query_dict['fields'],
            query_dict['values']
        )
    elif query_dict['type'] == 'update':
        validate_user(query_dict['id_token'])

        # TODO: assert that there are those parameters in dict and nothing else
        # TODO: sanitize all parts
        return 'UPDATE {} SET {} WHERE {};'.format(
            query_dict['table'],
            # TODO: need to form this into 'field1 = value1, field2 = value2, ...'
            query_dict['update_pairs'],
            query_dict['condition']
        )
    else:
        raise ValueError('Unsupported http request type')

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
    # TODO: fix this to reflect failed query
    if result == []:
        pass
    else:
        pass

def run(server_class=HTTPServer, handler_class=S, port=80):
    server_address = ('localhost', port)
    httpd = server_class(server_address, handler_class)
    # TODO: figure out https stuff
    # httpd.socket = ssl.wrap_socket(httpd.socket, certfile='~/cert.pem', keyfile='~/key.pem', server_side=True)
    print('Starting httpd...')
    httpd.serve_forever()

if __name__ == "__main__":
    from sys import argv

    if len(argv) == 2:
        run(port=int(argv[1]))
    else:
        run()
