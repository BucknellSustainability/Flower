#!/usr/bin/python

import smtplib
import MySQLdb
from email.mime.text import MIMEText

def main():
    # Open database connection
    db = MySQLdb.connect("digitalgreens.cixglou4nxxh.us-east-1.rds.amazonaws.com", "jvoves", "digitalgreens", "energyhill")

    # prepare a cursor object using cursor() method
    cursor = db.cursor()

    sql = "SELECT * FROM alerts WHERE handled != 1;"

    unhandled = None

    try:
        # Execute the SQL command
        cursor.execute(sql)
        # Fetch all the rows in a list of lists.
        unhandled = cursor.fetchall()
    except:
        print "Error: unable to fecth data"

    for row in unhandled:
        body = "You are receiving this because an alert has been made"
        subject = "Warning: {}".format(row[1])
        # sendEnergyHillEmail("bdm015@bucknell.edu", subject, body)
        print(row)

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
        print "Successfully sent email"
        smtpObj.quit()
    except SMTPException:
        print "Error: unable to send email"


if __name__ == "__main__":
    main()
