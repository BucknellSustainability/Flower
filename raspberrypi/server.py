
from arduinoToPi import *
from piToDb import *

master_queue = Queue()

arduino_thread = Thread(target=arduino_main, args=(master_queue))
db_thread = Thread(target=database_main, args=(master_queue))
arduino_thread.start()
db_thread.start()
arduino_thread.join()
db_thread.join()

