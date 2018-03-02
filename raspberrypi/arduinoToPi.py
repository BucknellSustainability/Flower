



import serial
# To install pyserial:
# sudo apt-get install python3-pip
# sudo pip3 install pyserial

import datetime
import fcntl
import re
import traceback
import subprocess
import os
import json
from threading import Thread
from queue import Queue

# global keep-alive
mainThreadAlive = False

# One copy of this thread is spawned to look for new USB devices.
# master_queue is a thread-safe queue of SensorReading objects.
def arduino_main(master_queue):
	global mainThreadAlive
	#reset_all_usb_ports()

	# Array of ArduinoWorkers
	workers = []

	

	while True:
		try:
			mainThreadAlive = True
			# Check that all the arduino threads are ok.
			dead_workers = []
			for worker in workers:
				if not worker.getThread().is_alive():
					# TODO: Error handling.
					print("Joining worker: %s", worker.getId())
					worker.getThread().join()
					dead_workers.append(worker)
			for worker in dead_workers:
				workers.remove(worker)

			# Check if any new devices have been plugged in.
			open_ports = []
			for port in get_all_usb_ports():
				if port.hasDevice():
					conflict = False
					for worker in workers:
						if port.getId() == worker.getId():
							conflict = True
							break
					if not conflict:
						# No conflicts
						open_ports.append(port)
				

			# Check if any of the open ports are arduinos.
			arduino_ports = open_ports
			#arduino_ports = []
			#for port in open_ports:
			#	# TODO: Make this less hacky.
			#	if "Arduino" in port.getName():
			#			arduino_ports.append(port)

			# Make new threads.
			for port in arduino_ports:
				print("Connecting to port: %s", port.getId())
				arduino_id = port.getId()
				thread = Thread(target=arduino_thread, args=(master_queue, port))
				worker = ArduinoWorker(arduino_id, thread)
				workers.append(worker)
				thread.start()
				print("Worker started: %s", worker.getId())
		except (KeyboardInterrupt, SystemExit):
			print("KeyboardInterrupt or SystemExit; cleaning up...");
			mainThreadAlive = False
			for worker in workers:
				print("Waiting for worker %s..." % worker.getId())
				worker.getThread().join()
			workers = []
			print("done")
			return
		except Exception as e:
			print(e)


# This thread is spawned for each connected arduino.
def arduino_thread(master_queue, port):
	global mainThreadAlive
	try:
		while (mainThreadAlive):
			# Get sensor data from the arduino.
			json = read_packet(port)

			# Get the current time as a UNIX timestamp.
			# TODO: Get the timestamp before parsing the json?
			time = datetime.datetime.now()

			# Send it to the queue.
			queue_entry = SensorReading(time, json, port.getId())
			master_queue.put(queue_entry)
		print("Thread %s: mainThreadAlive is %s; closing" % (port.getId(), str(mainThreadAlive)))
	except:
		# TODO: Error handling.
		# Currently, if there's an error, the thread ends.
		print(traceback.format_exc())
		return


# Read one packet from the arduino, parse it, and return it.
def read_packet(arduino):
	text = read_json(arduino)
	packet = parse_packet(text)
	return packet

# This method will get as many lines as necessary to find a full JSON object, and return
# it as a string.
def read_json(arduino):
	with serial.Serial(arduino.getPath(), 115200, timeout=5) as conn:
		packet = ""
		line = ""

		# Read lines until the start of a packet is found.
		# TODO: If this infinite loops, the thread never checks to see if it should quit.
		while ('{' not in line):
			line = read_line(conn)
		
		# Chop off any text before the packet starts.
		startIndex = line.find('{')
		line = line[startIndex:]

		# Read lines until the end of the packet is found
		# (May be the same line as the start)
		# TODO: Technically, it's possible for a } character to appear within a JSON object in
		# two ways: inside a string, and as part of a nested object. Nested objects are not allowed.
		# But it could be inside a string, which isn't allowed for the moment, but should be allowed
		# in the future.
		# TODO: If this infinite loops, the thread never checks to see if it should quit.
		while ('}' not in line):
			packet += " " + line
			line = read_line(conn)
		
		# Chop off any text after the packet ends.
		endIndex = line.find('}') + 1
		packet += line[:endIndex]

		print("raw packet: '%s'" % line)
		return packet

# TODO: Error checking
def parse_packet(packet_text):
	return json.loads(packet_text)

def read_line(arduino):
	"""arduino is the serial I/O object with the arduino. This method returns a line read from the arduino."""
	# Get the next line of input from the arduino. It's in the form of a
	# binary string, with /r/n characters at the end. This is a blocking
	# read.
	data = arduino.readline()
	
	# Convert the string from binary to utf-8.
	data = data.decode("ascii")

	# Remove the last newline. (\r\n or just \n)
	if data[-1] == "\n":
		data = data[0:-1]
	
	if data[-1] == "\r":
		data = data[0:-1]

	return data


# Reset all USB ports; if an arduino is connected during the pi's bootup,
# we won't be able to talk to it for some reason.
def reset_all_usb_ports():
	for port in get_all_usb_ports():
		try:
			reset_usb_port(port)
			print("Successfully reset port " + port.getPath() + " named \"" + port.getName() + "\".")
		except Exception as err:
			print("Failed to read from port " + port.getPath() + " named \"" + port.getName() + "\":")
			print(err)


# Reboot any attached USB device. portObj is a UsbPort object.
def reset_usb_port(portObj):
	# This is the ID of a command for the linux kernel.
	USBDEVFS_RESET = 21780

	# Open the USB port.
	with os.open(portObj.getPath(), os.O_WRONLY) as port:
		# Try to reset the USB port.
		try:
			fcntl.ioctl(port, USBDEVFS_RESET, 0)
		except OSError as err:
			message = "Error while attempting to reset USB port \"%s\" with ID \"%s\"" % (portObj.getPath(), portObj.getId())
			raise Exception(message)




# This wonderful magic is from https://stackoverflow.com/a/8265634
# Variable names have been modified to make more sense.
#
# We don't use pyserial's serial.tools.list_ports function, because that includes
# all serial ports, not just USB ones.
#
# This returns an array of UsbPort objects.
def get_all_usb_ports():
	# All usb tty devices are listed in /sys/bus/usb-serial/devices.
	# We will assume that they are all arduinos.
	#tty_list = os.listdir("/sys/bus/usb-serial/devices")
	# TODO: This is a hack.
	tty_list = ["/dev/ttyUSB0", "/dev/ttyUSB1", "/dev/ttyUSB2", "/dev/ttyUSB3"]

	ports = []
	for name in tty_list:
		if os.path.exists(name):
			port = UsbPort(name)
			ports.append(port)
		else:
			ports.append(UsbPort(""))
	return ports

"""	# Parse each line of the output.
	ports = []
	for line in lsusb_text.split('\n'):
		# Match the regex against the line.
		if line:
			line_match = usb_regex.match(line)
	
		# Check that the line matched.
		if line_match:
			# Make a UsbPort object and save it.
			port_info = line_match.groupdict()
			port = UsbPort(port_info["bus"], port_info["device"], port_info["id"], port_info["tag"])
			ports.append(port)
		else:
			# This should never happen; lsusb output something weird.
			message = "Error: Unexpected output from lsusb: \"%s\"" % line
			raise Exception(message)
	
	return ports"""

# TODO: Document this.
# See https://sites.google.com/site/itmyshare/system-admin-tips-and-tools/udevadm---useage-examples
def get_serial_id(port):
	name = port.getPath().split('/')[2]
	usb_props = subprocess.check_output(["udevadm", "info", "--query=property", "--name=%s" % name]).decode()
	id_regex = re.compile("ID_SERIAL=(?P<id_str>.*)", re.I)
	for line in usb_props.split('\n'):
		if line:
			line_match = id_regex.match(line)

		if line_match:
			return line_match.group("id_str")

	return None

# A container for info about usb ports.
# Note that ID strings are unique, and stay constant between unplugging, reboot, etc.
class UsbPort:
	def __init__(self, path):
		self.path = path
		if path == "":
			self.is_device = False
		else:
			self.is_device = True
			self.id_string = get_serial_id(self)
	"""def __init__(self, bus_number, device_number, vin_pin_str, name):
		self.bus_number = bus_number
		self.device_number = device_number
		self.name = name
		
		# The VIN and PIN uniquely identify the type of Arduino board is plugged in.
		# See https://github.com/arduino/Arduino/blob/1.6.1/hardware/arduino/avr/boards.txt
		vin_pin = vin_pin_str.split(':')
		self.vin = vin_pin[0]
		self.pin = vin_pin[1]

		# Try to get an id number
		if self.hasDevice():
			self.id_string = get_serial_id(self)
		else:
			self.id_string = None"""
	
	# This returns the path to the port file.
	"""def getPath(self):
		return "/dev/bus/usb/%s/%s" % (self.bus_number, self.device_number)
	"""
	def getPath(self):
		return self.path

	def getId(self):
		return self.id_string

	def getName(self):
		return self.name

	# This returns true if there is something connected to this USB port.
	def hasDevice(self):
		# If there is nothing connected to the port, the ID is 0.
		# Note: a device is allowed to have an empty name string; don't use that
		# to check if there's a device connected!
		#return self.vin == "0000" and self.pin == "0000"
		return self.is_device


# TODO: Document this.
class ArduinoWorker:
	# Note: this cannot be given the port object, because that is being used by the thread_obj thread.
	def __init__(self, id_string, thread_obj):
		self.id_string = id_string
		self.thread_obj = thread_obj

	def getThread(self):
		return self.thread_obj

	def getId(self):
		return self.id_string

class SensorReading:
	def __init__(self, time, data, id_string):
		self.time = time
		self.data = data
		self.id_string = id_string

	def getTime(self):
		return self.time

	def getData(self):
		return self.data

	def getId(self):
		return self.id_string

