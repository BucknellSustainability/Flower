# Setup on any system
Coming soon to a movie theatre near you

# Manual setting up backend on Bucknell's linuxremote
1. Make sure that you have a `config.json` and `deployment.json` file in the root directory of the repo. If you don't, read instructions in `/README.md`

2. Run the folowing commands to make sure you are using python 3.6
```
module load python/3.6
```

3. Run the following commands to install all necessary python packages
```
pip install --user --upgrade google-auth flask flask-mysql
```

4. Go to the `scripts` directory and run the flask starting script
```
./restart_flask.sh
```

# Using the api
Each of these end points need to be accessed by an http request to `https://eg.bucknell.edu/energyhill/{endpoint}` where `{endpoint}` which is described below.  Each http request needs to be accompanied with parameters described below.

Generally, hardcoding the URL shouldn't be in code, but instead you should use the deployment config setup (information found in `/README.md`)

## Reading from the DB
- `{endpoint}`: `read`
- allowed http requests: `GET`
- parameters:
    - `table`: the table which to pull data from. Must be a valid table in the DB.
    - `fields`: the column names which should be retrieved. Must be valid column of `table`
    - `condition_fields`: the condition field to compare a value equal to.  Must be a valid column name for `table` or `null` (if `null`, then values must also be `null`)
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
    - `table`: the table which to update data from. Must be valid table in DB.
    - `fields`: the columns of which to update information with. Must be valid columns in `table`
    - `values`: the values to update into the fields columns in the same order that the fields are in.
    - `condition_fields`: the condition field to compare a value equal to.  Must be a valid column name for `table` or `null` (if `null`, then values must also be `null`)
    - `condition_values`: the values that must match up with the `condition_fields` to make a condition. Each subsequent field/value pair will be `AND`ed with the others.
- form: `UPDATE table SET (fields[0] = values[0], fields[1] = values[1], ...) WHERE condition_fields[0] = condition_values[0] AND condition_fields[1] = condition_value[1] AND ...`
- returns: JSON serialization of DB output

## Delete from the DB
- `{endpoint}`: `delete`
- allowed http requests: `POST`
- parameters:
    - `idtoken`: the token that Google Auth gives to the client
    - `table`: the table which to delete data from. Must be valid table in DB.
    - `condition_fields`: the condition field to compare a value equal to.  Must be a valid column name for `table` or `null` (if `null`, then values must also be `null`)
    - `condition_values`: the values that must match up with the `condition_fields` to make a condition. Each subsequent field/value pair will be `AND`ed with the others.
- form: `DELETE FROM table WHERE condition_fields[0] = condition_values[0] AND condition_fields[1] = condition_value[1] AND ...`
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
- allowed http requests: `POST`
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


## Get the most recent reading for a sensor
- `{endpoint}`: `get-sensor-last-reading`
- allowed http requests: `GET`
- parameters:
    - `sensorid`: the id of the sensor that you want the most recent reading from
- returns: json with one key - `value` which corresponds to the data of the most recent reading


## Change the admin status of user
- `{endpoint}`: `set-admin-status`
- allowed http requests: `POST`
- parameters:
    - `idtoken`: the token that Google Auth gives to the client, needs to be admin user 
    - `userids`: the userids of the users to have their isAdmin status set to adminstatus
    - `adminstatus`: the status that is to be set for the users. Must be strictly either `0` or `1`
- returns: empty string on success, 503 status if user is denied access


## Get the project that the user doesn't own
- `{endpoint}`: `get-all-others-projects
- allowed http requests: `GET`
- parameters:
    - `userId`: the userid of the user whose projects should not be included
- returns: list of objects that contain projectId and name that aren't owned by user
