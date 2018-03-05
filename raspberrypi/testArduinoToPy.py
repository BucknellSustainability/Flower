
from arduinoToPi import *
import queue

def main():
	q = queue.Queue()

	# Make the queue print stuff out instead of storing
	# data.
	q.put = lambda o: print({"time": o.getTime(), "data": o.getData(), "id": o.getId()})

	arduino_main(q)

if __name__ == "__main__":
	main()

