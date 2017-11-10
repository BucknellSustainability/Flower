#!/usr/bin/python

import smtplib
import MySQLdb
import json
import os
from email.mime.text import MIMEText

def main():
    with open("config.json", 'r') as f:
        config = json.load(f)

    # Open database connection
    db = MySQLdb.connect(config["DB_URL"],
                         config["DB_USERNAME"],
                         config["DB_PASSWORD"],
                         config["DB_NAME"])

    # prepare a cursor object using cursor() method
    cursor = db.cursor()

    sql = "SELECT * FROM alerts WHERE handled != 1;"

    try:
        # Execute the SQL command
        cursor.execute(sql)
        # Fetch all the rows in a list of lists.
        unhandled = cursor.fetchall()
    except:
        print("Error: unable to fecth data")

    for row in unhandled:
        body = "You are receiving this because an alert has been made"
        subject = "Warning: {}".format(row[1])
        sendEnergyHillEmail("bdm015@bucknell.edu", subject, body)

    # updates each row that email was sent for
    if(unhandled is not ()):
        sql = """UPDATE alerts SET handled = 1 WHERE alertId IN ({});""".format(
            ",".join([str(x[0]) for x in unhandled])
        )

        try:
            # Execute the SQL command
            cursor.execute(sql)
            db.commit()
        except:
            print("Error: unable to update data")

    # disconnect from server
    db.close()


def sendEnergyHillEmail(receiver, subject, body):
    sender = 'energyhill@bucknell.edu'

    msg = MIMEText(body)

    # me == the sender's email address
    # you == the recipient's email address
    msg['Subject'] = subject
    msg['From'] = sender
    msg['To'] = receiver

    try:
        smtpObj = smtplib.SMTP('smtp.bucknell.edu')
        smtpObj.sendmail(sender, [receiver], msg.as_string())
        print("Successfully sent email")
        smtpObj.quit()
    except SMTPException:
        print("Error: unable to send email")

def prepareChartExport():
    eServerPath = "./node_modules/bin/highcharts-export-server"
    eServerName = "highcharts-export-server"
    if (not os.path.isfile(eServerPath)):
        try:
            os.system("export ACCEPT_HIGHCHARTS_LICENSE=TRUE")
            if (0 != os.system("npm install " + eServerName)):
                raise ImportError("Could not install chart export server")
        except ImportError:
            return 1
    return 0

"""
Generates a PNG image from a JSON Object
Assumes highcharts-export-server is present in the working directory
param chartJSON: A JSON object representing the chart being exported.
returns: A PNG image file object
"""
def exportChart(chartJSON):
    os. # TODO: Write JSON to temp file
    os.system(eServerPath + " -infile chart.json -outfile chart.png")
    os. # TODO: Read PNG into python object

if __name__ == "__main__":
    main()
