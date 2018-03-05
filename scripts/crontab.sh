# Replaces crontab file with text
# Should be run on new user account or if need to updated cronjob

(crontab -l 2>/dev/null; echo "*/10 * * * * cd /home/accounts/courtesy/e/energyhill/public_html/Flower/WebServer && /usr/remote/anaconda-3.6/bin/python alerts.py >> alerts.log 2>&1") | crontab -

