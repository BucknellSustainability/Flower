import logging

class Logger:
    logger = None

    def init_logger(logger_file):
        Logger.logger = logging.getLogger(logger_file)
        Logger.logger.setLevel(logging.INFO)

        # create a file handler
        handler = logging.FileHandler(logger_file + '.log')
        handler.setLevel(logging.INFO)

        # create a logging format
        formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
        handler.setFormatter(formatter)

        # add the handlers to the logger
        Logger.logger.addHandler(handler)

