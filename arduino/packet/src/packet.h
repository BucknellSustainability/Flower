#ifndef PACKET_H
#define PACKET_H

String json_message = ("NULL");
const int BAUD_RATE = 9600;

bool isInitialized();

/**
 * Constructor that starts a JSON message
 * Returns nonzero on error
 */
int start_packet();

/** Adds an integer to the JSON message
 *  Returns nonzero on error
 */
int add_int_field(const char* name, int value);

/** Adds a double to the JSON message
 *  Returns nonzero on error
 */
int add_double_field(const char* name, double value, int decimalPlaces);

/** Adds a string to the JSON message
 *  Returns nonzero on error
 */
int add_text_field(const char* name, const char* value);

/** Sends the JSON message along the serial connection.
 *  Returns nonzero on error
 */
int end_packet();

#endif
