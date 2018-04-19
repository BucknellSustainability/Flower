#ifndef PACKET_H
#define PACKET_H
#include <Arduino.h>

class Packet{
public:
  const long DEFAULT_BAUD_RATE = 115200;
  /**
   * Constructor
   */
  Packet(void);

  bool isInitialized();

  /**
   * Opens a serial connection with the given baud_rate.
   * @return           nonzero on error
   */
  int initialize(String project_name);

  /**
   * Opens a serial connection with the given baud_rate.
   * @param  baud_rate long representing speed of communication in bits per second (baud)
   * @return           nonzero on error
   */
  int initialize(String project_name, long baud_rate);

  /**
   * Closes the serial connection
   * @return nonzero on error
   */
  int close();

  /**
   * Starts a JSON message
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
private:
  long _baud_rate;
  String _json_message;
  String _project_name;
};

#endif
