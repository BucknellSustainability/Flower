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
- parameters: 
    - `fields`: the column names which should be retrieved
    - `table`: the table which to pull data from
    - `condition`: the condition to select rows of data with

## Inserting into the DB
- `{endpoint}`: `insert`
- parameters:
    - `idtoken`: the token that Google Auth gives to the client
    - `table`: the table which to pull data from
    - `fields`: the column names which should be retrieved
    - `values`: the values to place into the fields in the same order that the fields are in

## Update the DB
- `{endpoint}`: `insert`
- parameters:
    - idtoken`: the token that Google Auth gives to the client
    - `table`: the table which to pull data from
    - `modify_pairs`: pairs of fields and data in the form `field1 = value1, field2 = value2, ...`
    - `condition`: the condition to select rows of data with


## Get the User Profile
- `{endpoint}`: `get-profile`
- parameters:
    - `idtoken`: the token that Google Auth gives to the client
