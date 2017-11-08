#!/usr/bin/python

import smtplib
import MySQLdb

# Open database connection
db = MySQLdb.connect("digitalgreens.cixglou4nxxh.us-east-1.rds.amazonaws.com", "jvoves", "digitalgreens", "energyhill")

# prepare a cursor object using cursor() method
cursor = db.cursor()

# execute SQL query using execute() method.
cursor.execute("SELECT VERSION()")

# Fetch a single row using fetchone() method.
data = cursor.fetchone()
print "Database version : %s " % data

# disconnect from server
db.close()


def sendEnergyHillEmail(receiver, body):
    sender = 'energyhill@bucknell.edu'
    receivers = [receiver]

    message = """From: Energy Hill <{}>
    To: Ben Matase <{}>
    Subject: SMTP e-mail test

    This is a test e-mail message.
    """.format(sender, receivers[0])

    try:
       smtpObj = smtplib.SMTP('smtp.bucknell.edu')
       smtpObj.sendmail(sender, receivers, message)
       print "Successfully sent email"
    except SMTPException:
       print "Error: unable to send email"
