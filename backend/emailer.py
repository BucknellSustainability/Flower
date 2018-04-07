import os
import subprocess
import smtplib
from email.mime.text import MIMEText
from email.mime.image import MIMEImage
from email.mime.multipart import MIMEMultipart

EMAIL_HTML_START = '<html><head></head><body><p>'
EMAIL_HTML_END = '</p></body></html>'

"""
Send Email with attachments and text

attachments should be a list of objects that can be attached to a MIMEMultipart obj
"""
def sendEmail(sender, receivers, subject, body, attachments, is_body_html=False):
    assert type(attachments) is list
    assert type(receivers) is list
    
    msg = MIMEMultipart()
    text = MIMEText(body, 'html') if is_body_html else MIMEText(body)

    # attach elements to email
    msg.attach(text)
    [msg.attach(attachment) for attachment in attachments]

    # me == the sender's email address
    # you == the recipient's email address
    msg['Subject'] = subject
    msg['From'] = sender
    msg['To'] = ','.join(receivers)

    try:
        smtpObj = smtplib.SMTP('smtp.bucknell.edu')
        smtpObj.sendmail(sender, receivers, msg.as_string())
        # TODO: log this message instead of printing to console
        print("Successfully sent email")
        smtpObj.quit()
    except SMTPException as e:
        # TODO: log this message instead of printing to console
        print("Error: unable to send email: {}".format(e))

"""
Installs highcharts-export-server if not already installed.
Returns 0 if successful, returns 1 if export server is not installed at the
expected path and could not be installed.
"""
eServerPath = "./node_modules/.bin/highcharts-export-server"
eServerName = "highcharts-export-server"


def prepareChartExport():
    if not os.path.isfile(eServerPath):
        if 0 != os.system("module load node && export ACCEPT_HIGHCHARTS_LICENSE=TRUE && npm install " + eServerName):
            raise ImportError("Could not install chart export server")


"""
Generates a PNG image from a JSON Object
Assumes highcharts-export-server is present in the working directory
param chartJSON: A JSON string representing the chart being exported.
returns: A PNG MIMEImage object
"""
def exportChart(chartJSON):  # TODO: Handle errors
    prepareChartExport()

    # Write chartJSON into chart.json
    fp = open('chart.json', 'w')
    fp.write(chartJSON)
    fp.close()

    # Run export server to create chart.png file
    eServerCommand =  "module load node && " + eServerPath + " -infile chart.json -outfile chart.png"
    subprocess.check_output(eServerCommand, shell=True)

    # Return chart.png image
    fp = open('chart.png', 'rb')  # Open in write binary mode
    chartImage = MIMEImage(fp.read())
    fp.close()
    return chartImage
