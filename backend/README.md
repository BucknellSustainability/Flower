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
    - `fields`: the column names which should be retrieved
    - `table`: the table which to pull data from
    - `condition`: the condition to select rows of data with

## Inserting into the DB
- `{endpoint}`: `insert`
- allowed http requests: `POST`
- parameters:
    - `idtoken`: the token that Google Auth gives to the client
    - `table`: the table which to pull data from
    - `fields`: the column names which should be retrieved
    - `values`: the values to place into the fields in the same order that the fields are in

## Update the DB
- `{endpoint}`: `insert`
- allowed http requests: `POST`
- parameters:
    - idtoken`: the token that Google Auth gives to the client
    - `table`: the table which to pull data from
    - `modify_pairs`: pairs of fields and data in the form `field1 = value1, field2 = value2, ...`
    - `condition`: the condition to select rows of data with


## Get the User Profile
- `{endpoint}`: `get-profile`
- allowed http requests: `POST`
- parameters:
    - `idtoken`: the token that Google Auth gives to the client


## Get all of the sensors with project information
- `{endpoint}`: `get-all-sensors`
- allowed http requests: `GET`
- parameters: None


## Ask admins for approval for user
- `{endpoint}`: `request-access`
- allowed http requests: `POST`
- parameters:
    - `idtoken`: the token that Google Auth gives to the client, needs to be for the user that wants aaccess


## Approve user for dashboard access
- `{endpoint}`: `approve-user`
- allowed http requests: `POST`
- parameters:
    - `idtoken`: the token that Google Auth gives to the client, needs to be admin user
    - `userid`: the userid from the DB that is to be approved access


## Upload a file
- `{endpoint}`: `store-code`
- allowed http requests: `POST`
- parameters:
    - `idtoken`: the token that Google Auth gives to the client, needs to be admin user
    - `deviceid`: the deviceid from the DB that the code is to uploaded to`


## Download a file
- `{endpoint}`: `download-code`
- allowed http requests: `GET`
- parameters:
    - `uploadid`: the uploadid from the DB that specifies the code upload
    

## Log error message after attempt at code upload
- `{endpoint}`: `log-error`
- allowed http requests: `GET`
- parameters:
    - `deviceid`: the deviceid from the DB that the code upload was attempted on
    - `error_msg`: the full error message to be saved and relayed


## Log success message after attempt at code upload
- `{endpoint}`: `log-success`
- allowed http requests: `GET`
- parameters:
    - `deviceid`: the deviceid from the DB that the code upload was attempted on


## Check for status of code upload
- `{endpoint}`: `check-error`
- allowed http requests: `GET`
- parameters:
    - `deviceid`: the deviceid from the DB that is waiting to be attempted at code upload
