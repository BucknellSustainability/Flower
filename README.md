# Overview
Flower is a data collection and visualization system made for the Renewable Energy Scholars at Bucknell University. It is made of several components that require each other to function. The purpose of the project is to make research easier as well as publicize the sustainability efforts at Bucknell.

# How to use this project
There are `README.md`s in each of the main directories for how to use each component of the project. You will need a MySQL DB running (`/backend/sql`), run the Flask server (`/backend`), compile the React code and run the php server (`/web`), and put code on the Raspberry Pis (`/raspberrypi`), and load programs onto Arduinos (`/arduino`).  

# Running system at Bucknell
We suggest running this system with Bucknell linuxremote servers because that is what we developed on. Any other system is not guarenteed to work, but we will have instructions to give it a shot.

If attempting to run on Bucknell systems, we advise cloning the repo into a user's `~/public_html/` directory (create it if it doesn't exist) to enable the Bucknell Apache server to handle the web page serving.

The system needs to be run on linuxremote3 for the below part to function.

You will also need to setup the system to use https. You need to add a file called `runwsgi.sh` in the same directory that your cloned directory (most likely called `Flower` unless otherwise specified) with the contents of 
```
#!/bin/bash
#source activate e2
source .conda/envs/e2/bin/activate e2
cd {your_cloned_dir}
python runwsgi.py
```
and you will need to contact ENST to have there be a redirect on a certain port. It will look something like `www.eg.bucknell.edu/{your_extension}` with a certain port that they give you.  For our production, it is `www.eg.bucknell.edu/energyhill:4004`. 

# API Keys and Deployment Specific Values
API Keys and other deployment specific values have been removed from the repo to ensure security and flexibility for different deployments.  You will NEED to complete steps 1-6 to have any component of the project to work.

1. Create a file called `config.json` in the repo's root directory.
2. Add this code:
```
{
  "DB_URL" : "",
  "DB_USERNAME" : "",
  "DB_PASSWORD" : "",
  "DB_NAME": ""
}
```
3. Fill out all values of the empty strings with information for your DB/API key info
4. Create a file called `deployment.json` in the repo's root directory.  There are all things unique to your deployment.
5. Add this code:
```
{
 "APPROVAL_LINK": "",
  "FLASK_SERVER": "",
  "GOOGLE_CLIENT_ID": "",
  "REDIRECT_URL": "" 
}
```
6. Fill out all values of the empty string with the information for your deployment
7. Access the values where needed:
    * Python:
       ```
       import json
       with open('path/to/config.json', 'r') as f:
           config = json.load(f)

       config['KEY_NAME']
       ```
    * PHP:
      ```
      $config = json_decode(file_get_contents("path/to/config.json"));
      printf("%s", $config->KEY_NAME);
      ```
    * JS:
      !!!This should only be used with the deployment.json so that DB credentials or other important information isn't leaked on the client side with `config.json`
      ```
      <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script> 
      <script type="text/javascript" src="../common/load-deployment.js" ></script>
      ...
      deploy_config["KEY_NAME"]
      ```
`KEY_NAME` is the key string in your config file such as `DB_NAME` or `FLASK_SERVER`.

This `config.json` and `deployment.json` won't get committed because it is in the `.gitignore` so you will need to do this for each clone of the repo, but it should persist unless you delete the file.

##Linters

### Python - autopep8
To install autopep8 run
```
pip install autopep8
```
Install the `python-autopep8` package in Atom with either `apm install python-autopep8` or through the built in Atom package manager.

Then to run the linter in Atom, highlight all of the text you want to format and then press `Ctrl-shift-p` and type in `autopep8` and then press `Enter` to format the Python code.

You can also run it from the command line with `autopep8 [--in-place] [other-options] filename`.
