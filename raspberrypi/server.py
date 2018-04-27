

from arduinoToPi import *
from piToDb import *
import os

def main():
	print("Starting pi server...")
	print("Current directory: " + str(os.getcwd()))
	
	master_queue = Queue()
	
	# Note: we need a comma after the queue to indicate that we want a tuple,
	# rather than just an expression with parentheses around it.
	arduino_thread = Thread(target=arduino_main, args=(master_queue,))
	db_thread = Thread(target=database_main, args=(master_queue,))
	
	arduino_thread.start()
	db_thread.start()
	arduino_thread.join()
	db_thread.join()

if __name__ == "__main__":
	main()

