import json
import MySQLdb

from logger import *
init_logger(logging.INFO)

# load config (db info)
with open("config.json", 'r') as f:
    config = json.load(f)

'''Singleton solution to MySql DB cursor getting
'''
class Db:
    connection = None

    """ Creates connection to DB if one doesn't already exist.
    Should not be called from outside class
    """
    def _connect():
        if Db.connection is None:
            Db.connection = MySQLdb.connect(host=config['DB_URL'],
                user = config['DB_USERNAME'],
                passwd = config['DB_PASSWORD'],
                db = config['DB_NAME'])
            Db.connection.autocommit = True

    def get_cursor():
        if Db.connection is None:
            Db._connect()
        
        return Db.connection.cursor()

    def commit():
        if Db.connection is not None:
            Db.connection.commit()
        
    """Closes the database connection"""
    def disconnect(error=''):
        if Db.connection is not None:
            Db.connection.close()
            Db.connection = None

    '''
    Generic way to execute queries and return results as a dictionary.

    param formatted_sql_string: string with `%s` where userinput will be placed
    param param_tuple: tuple with same number of elements as `%s` in formatted_sql_string
    '''
    def exec_query(formatted_sql_string, param_tuple=()):
        assert isinstance(formatted_sql_string, str), 'DB Call does not have sql string'
        assert type(param_tuple) is tuple, 'DB Call does not have user input tuple'
        assert formatted_sql_string.count('%s') == len(param_tuple), 'DB Call has mismatching number of user inputs'

        cursor = Db.get_cursor()
        descriptions = None
        data = None

        try:
            # Execute the SQL command
            cursor.execute(formatted_sql_string, param_tuple)

            logger.debug('Executed SQL Query: ', cursor._last_executed)

            # Fetch all the rows in a list of lists.
            descriptions = cursor.description

            # Fetch all of the data
            data = cursor.fetchall()
            Db.commit()
        except Exception as e:
            logger.error('Couldn\'t execute query - {}'.format(cursor._last_executed), exc_info=True)

        # handle if query didn't return anything
        if data is None or descriptions is None:
            return []

        # Get column names and data into list of dicts
        column_names = [column_info[0] for column_info in descriptions]
        formatted_data = []
        for row in data:
            formatted_data.append(dict(zip(column_names, row)))

        return formatted_data
