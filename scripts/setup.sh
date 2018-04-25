chmod +x ./*

module load python/3.6
pip install --user --upgrade getpass
python setup.py

# start flask
./restart_flask.sh

# build react
./build.sh

# setup alert/aggregator
./crontab.sh

# change permissions 
./change_permissions.sh
