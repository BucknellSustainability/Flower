#!/usr/bin/python

import smtplib
import MySQLdb
import json
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


if __name__ == "__main__":
    main()
