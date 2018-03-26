pkill -U "$(id -u energyhill)" -f start_flask
nohup ./start_flask.sh & 
