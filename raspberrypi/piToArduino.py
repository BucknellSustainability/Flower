


import subprocess
import time
import traceback
import os

download_thread_force_terminate = False

# Uses avrdude to send a file to an arduino. Note that this will block until the upload
# is complete.
def send_file_to_arduino(filename, port):
	assert(isinstance(filename, str))
	assert(isinstance(port, str))

	# Ensure the port is an absolute path.
	port
	if port[0] != "/":
		raise Exception("Error: The string %s is not a valid port." % port)

	# Ensure the filename is an absolute path.
	abs_filename = filename
	if filename[0] != "/":
		abs_filename = os.path.abspath(filename)

	# Make the base command for avrdude.
	base_args = ["avrdude", "-c", "wiring", "-p", "atmega2560", "-P", port, "-b", "115200"]

	# Make the upload args.
	upload_args = base_args + ["-D", "-Uflash:w:" + abs_filename + ":i"]

	# Check that the right kind of arduino is plugged in.
	check_arduino_type(base_args)

	# Upload the file, and block until it has finished.
	print("Sending hex file to arduino...")
	child = subprocess.Popen(upload_args, stderr = subprocess.PIPE)
	child.wait()
	(_, err) = child.communicate()

	if "DOCTYPE" in open(filename).read():
		# We got a 404 or a 500 from the server.
		raise Exception(open(filename).read())

	# Check if it was successful.
	if child.returncode != 0:
		print(err.decode())	
		raise Exception("Unable to send file %s to arduino on port %s" % (abs_filename, port))
	
	# Done.
	print("Arduino successfully reprogrammed.")

# This function does a dry-run of avrdude to check that the port is open, the baud rate is
# right, and the 
def check_arduino_type(args):
	print("Checking arduino board type...")

	# Run avrdude, and block until it is finished.
	child = subprocess.Popen(args, stderr = subprocess.PIPE)
	child.wait()
	(out, err) = child.communicate()

	# Check if it was successful.
	if child.returncode != 0:
		print(err.decode())
		raise Exception("Unable to connect to the arduino; or, it is not an ATMega2560.")
	

# set_reserved_arduino and get_reserved_arduino are lambda functions to get around circular importing
# of global variables. :(
def code_download_main(device_id, hardware_id, upload_id, set_reserved_arduino, get_reserved_arduino):
	assert(isinstance(device_id, int))
	assert(isinstance(hardware_id, str))
	assert(isinstance(upload_id, int))

	global download_thread_force_terminate

	# Start the process of reserving the arduino.
	set_reserved_arduino((hardware_id, None))

	# Start downloading the code file.
	print("Starting download for device id: " + str(device_id) + " (" + hardware_id + ")")
	
	path_to_hex = "code_download_" + str(upload_id) + ".hex"

	curl = subprocess.Popen(["curl", "http://eg.bucknell.edu/energyhill/download-code?uploadid=" + str(upload_id),
			"-o", path_to_hex])
	curl.wait()	# TODO: Wait with a timeout, and monitor download_thread_force_terminate.

	print("Download for device id " + str(device_id) + " complete. Reserving port...")

	# Spin-loop until the arduino is reserved.
	while not download_thread_force_terminate:
		print("Reservation state: " + str(get_reserved_arduino()))
		(_, usb_port) = get_reserved_arduino()
		if usb_port:
			break
		time.sleep(1)
	
	if download_thread_force_terminate:
		set_reservedArduino(None)
		return

	print("Port reserved for device id " + str(device_id) + ".")

	# Send the file to the arduino.
	(_, usb_port) = get_reserved_arduino()
	success = True
	try:
		error = send_file_to_arduino(path_to_hex, usb_port.getPath())
		if error and error != "":
			send_error_to_db(upload_id, device_id, error)
			success = False
		
	except:
		success = False	

		# Send error info.
		error = traceback.format_exc()
		send_error_to_db(upload_id, device_id, error)
		
		raise Exception("Error while sending file to arduino")
	finally:
		set_reserved_arduino(None)

		# Delete the file that was downloaded.
		os.remove(path_to_hex)

	if success:
		# Success!
		send_success_to_db(upload_id, device_id)

	print("Code upload complete.")
	
def send_success_to_db(upload_id, device_id):
	assert(isinstance(upload_id, int))
	assert(isinstance(device_id, int))

	# Tell the DB that we're done.
	curl = subprocess.Popen(["curl", "http://eg.bucknell.edu/energyhill/log-success?uploadid=" + str(upload_id)
		+ "&deviceid=" + str(device_id)])
	curl.wait() # TODO: Wait with a timeout, and monitor download_thread_force_terminate.

def send_error_to_db(upload_id, device_id, error):
	assert(isinstance(upload_id, int))
	assert(isinstance(device_id, int))
	assert(isinstance(error, str))

	# ENSURE there are no quotation shenanigans!
	error = error.replace('"', "'")
	
	# Tell the DB there was a specific error.
	curl = subprocess.Popen(["curl", "-X", "POST", "-H", "Content-Type: text/plain", 
			"http://eg.bucknell.edu/energyhill/log-error?uploadid=" + str(upload_id)
			+ "&deviceid=" + str(device_id), "--data", error])
	curl.wait()



