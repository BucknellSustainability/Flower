chmod +x ./*

echo "Please enter the information:"
module load python/3.6
pip install --user --upgrade getpass
python setup.py

# start flask
echo "starting flask server"
./restart_flask.sh

# build react
echo "building react pages"
./build.sh

# setup alert/aggregator
echo "starting alert/aggregator"
./crontab.sh

# change permissions 
echo "allowing all pages to be accessed"
./change_permissions.sh
