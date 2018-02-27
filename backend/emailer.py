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
