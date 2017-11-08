#!/usr/bin/python

import smtplib
import MySQLdb

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
        print(row)

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


if __name__ == "__main__":
    main()
