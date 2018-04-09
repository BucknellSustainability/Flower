import logging

logger = None

def init_logger(logging_level):
    logger = logging.getLogger(__name__)
    logger.setLevel(logging_level)

    # create a file handler
    handler = logging.FileHandler(__name__ + '.log')
    handler.setLevel(logging_level)

    # create a logging format
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    handler.setFormatter(formatter)

    # add the handlers to the logger
    logger.addHandler(handler)

