#include <Packet.h>

Packet::Packet(void) :
    _baud_rate(defaultBaudrate),
    _json_message("NULL")
{
    ;
}

String json_message = ("NULL");
const int BAUD_RATE = 9600;

bool Packet::initialize(){
    baud_rate = BAUD_RATE;
    Serial.begin(baud_rate);
}

bool Packet::initialize(int baud_rate){
    _baud_rate = baud_rate;
    // TODO: Check for erroneous baud_rate
    Serial.begin(baud_rate);
}

bool Packet::close(){
    Serial.end();
}

bool Packet::isInitialized(){
    if (_json_message.compareTo("NULL") == 0){
        printf("JSON message null");
        return false;
    }
    return true;
}

/**
 * Constructor that starts a JSON message
 * Returns nonzero on error
 */
int Packet::start_packet(){
    _json_message.remove(0); // Clear the string
    _json_message.concat("{"); // Opening curly bracket of json
    return 0;
}

/** Adds an integer to the JSON message
 *  Returns nonzero on error
 */
int Packet::add_int_field(const char* name, int value){
    if (!this.isInitialized()){
        return -1;
    }
    
    // Trailing comma incase there are more attributes but should
    // be removed when finishing json object
    
    if (!json_message.concat(String("\"") + String(name) + String("\":") + String(value,DEC) + String(","))){
        return -1;
    }
    return 0;
}

/** Adds a double to the JSON message
 *  Returns nonzero on error
 */
int Packet::add_double_field(const char* name, double value, int decimalPlaces){
    if (!this.isInitialized()){
        return -1;
    }

    // Trailing comma incase there are more attributes but should
    // be removed when finishing json object

    if (!_json_message.concat(String("\"") + String(name) + String("\":") + String(value,decimalPlaces) + String(","))){
        return -1;
    }
    return 0;
}

/** Adds a string to the JSON message
 *  Returns nonzero on error
 */
int Packet::add_text_field(const char* name, const char* value){
    if (!isInitialized()){
        return -1;
    }
  if (!_json_message.concat(String("\"") + String(name) + String("\":\"") + String(value) + String("\","))){
        return -1;
    }
    return 0;
}

/** Sends the JSON message along the serial connection.
 *  Returns nonzero on error
 */
int Packet::end_packet(){
    if (!isInitialized()){
        return -1;
    }
    if (_json_message.endsWith(",")){
        // If there's a trailing comma, remove it
        _json_message.remove(_json_message.length()-1);
    }
    _json_message.concat("}\n");
    Serial.write(_json_message.c_str());
    _json_message.remove(0); // Clear message
    _json_message.concat("NULL");
    return 0;
}
