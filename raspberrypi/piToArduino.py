


import subprocess
import os

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
	




