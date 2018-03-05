# Setting up backend on Bucknell's linuxremote
1. Make sure that you have a `config.json` file in the root directory of the repo

2. Run the foloowing commands to make sure you are using python 3.6
```
module load python/3.6
```

3. Run the following commands to install all necessary python packages
```
pip install --user --upgrade google-auth flask-mysql
```

4. Run the following commands to actually start running the flask server
```
  export FLASK_APP=api.py
  flask run --host=0.0.0.0
```


# Using the api
Each of these end points need to be accessed by an http request to `http://linuxremote#.bucknell.edu:5000/{endpoint}` where `#` is the number of linuxremote you are running the flask server on and where `{endpoint}` which is described below.  Each http request needs to be accompanied with parameters described below.


## Reading from the DB
- `{endpoint}`: `read`
- allowed http requests: `GET`
- parameters:
    - `table`: the table which to pull data from. Must be a valid table in the DB.
    - `fields`: the column names which should be retrieved. Must be valid column of `table`
    - `condition_fields`: the condition field to compare a value equal to.  Must be a valid column name for `table`
    - `condition_values`: the values that must match up with the `condition_fields` to make a condition. Each subsequent field/value pair will be `AND`ed with the others.
- form: `SELECT fields FROM table WHERE condition_fields[0] = condition_values[0] AND condition_fields[1] = condition_value[1] AND ...`
- returns: JSON serialization of DB output

## Inserting into the DB
- `{endpoint}`: `insert`
- allowed http requests: `POST`
- parameters:
    - `idtoken`: the token that Google Auth gives to the client
    - `table`: the table which to insert data into. Must be a valid table in DB.
    - `fields`: the column names which should be inserted into. Must be valid columns in `table`.
    - `values`: the values to place into the fields in the same order that the fields are in
- form: `INSERT INTO table (fields) VALUES (values)`
- returns: JSON serialization of DB output

## Update the DB
- `{endpoint}`: `update`
- allowed http requests: `POST`
- parameters:
    - `idtoken`: the token that Google Auth gives to the client
    - `table`: the table which to pull data from. Must be valid table in DB.
    - `fields`: the columns of which to update information with. Must be valid columns in `table`
    - `values`: the values to update into the fields columns in the same order that the fields are in.
    - `condition_fields`: the condition field to compare a value equal to.  Must be a valid column name for `table`
    - `condition_values`: the values that must match up with the `condition_fields` to make a condition. Each subsequent field/value pair will be `AND`ed with the others.
- form: `UPDATE table SET (fields[0] = values[0], fields[1] = values[1], ...) WHERE condition_fields[0] = condition_values[0] AND condition_fields[1] = condition_value[1] AND ...`
- returns: JSON serialization of DB output


## Get the User Profile
- `{endpoint}`: `get-profile`
- allowed http requests: `POST`
- parameters:
    - `idtoken`: the token that Google Auth gives to the client
- returns: JSON serialization of all profile information for user log in


## Get all of the sensors with project information
- `{endpoint}`: `get-all-sensors`
- allowed http requests: `GET`
- parameters: None
- returns: JSON serialization of all sensors and their project information


## Ask admins for approval for user
- `{endpoint}`: `request-access`
- allowed http requests: `POST`
- parameters:
    - `idtoken`: the token that Google Auth gives to the client, needs to be for the user that wants access
- returns: nothing


## Approve user for dashboard access
- `{endpoint}`: `approve-user`
- allowed http requests: `POST`
- parameters:
    - `idtoken`: the token that Google Auth gives to the client, needs to be admin user
    - `userid`: the userid from the DB that is to be approved access
- returns: nothing

## Upload a file
- `{endpoint}`: `store-code`
- allowed http requests: `POST`
- parameters:
    - `idtoken`: the token that Google Auth gives to the client, needs to be admin user
    - `deviceid`: the deviceid from the DB that the code is to uploaded to
    - file: a `.hex` file to be uploaded (see `web/control-panel/codeupload.html` for an example)
- returns: nothing

## Download a file
- `{endpoint}`: `download-code`
- allowed http requests: `GET`
- parameters:
    - `uploadid`: the uploadid from the DB that specifies the code upload
- returns: the `.hex` file requested

## Log error message after attempt at code upload
- `{endpoint}`: `log-error`
- allowed http requests: `GET`
- parameters:
    - `deviceid`: the deviceid from the DB that the code upload was attempted on
    - `error_msg`: the full error message to be saved and relayed
- returns: nothing

## Log success message after attempt at code upload
- `{endpoint}`: `log-success`
- allowed http requests: `GET`
- parameters:
    - `deviceid`: the deviceid from the DB that the code upload was attempted on
- returns: nothing

## Check for status of code upload
- `{endpoint}`: `check-error`
- allowed http requests: `GET`
- parameters:
    - `deviceid`: the deviceid from the DB that is waiting to be attempted at code upload
- returns: the error message for the device if failure and `SUCCESS` if success
