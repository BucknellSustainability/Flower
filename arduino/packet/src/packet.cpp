String json_message = ("NULL");
const int BAUD_RATE = 9600;

bool isInitialized(){
    if (json_message.compareTo("NULL") == 0){
        printf("JSON message null");
        return false;
    }
    return true;
}

/**
 * Constructor that starts a JSON message
 * Returns nonzero on error
 */
int start_packet(){
    Serial.begin(BAUD_RATE);
    json_message.remove(0); // Clear the string
    json_message.concat("{"); // Opening curly bracket of json
    return 0;
}

/** Adds an integer to the JSON message
 *  Returns nonzero on error
 */
int add_int_field(const char* name, int value){
    if (!isInitialized()){
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
int add_double_field(const char* name, double value, int decimalPlaces){
    if (!isInitialized()){
        return -1;
    }

    // Trailing comma incase there are more attributes but should
    // be removed when finishing json object

    if (!json_message.concat(String("\"") + String(name) + String("\":") + String(value,decimalPlaces) + String(","))){
        return -1;
    }
    return 0;
}

/** Adds a string to the JSON message
 *  Returns nonzero on error
 */
int add_text_field(const char* name, const char* value){
    if (!isInitialized()){
        return -1;
    }
  if (!json_message.concat(String("\"") + String(name) + String("\":\"") + String(value) + String("\","))){
        return -1;
    }
    return 0;
}

/** Sends the JSON message along the serial connection.
 *  Returns nonzero on error
 */
int end_packet(){
    if (!isInitialized()){
        return -1;
    }
    if (json_message.endsWith(",")){
        // If there's a trailing comma, remove it
        json_message.remove(json_message.length()-1);
    }
    json_message.concat("}\n");
    Serial.write(json_message.c_str());
    //free(json_message);
    //*json_message = NULL;
    json_message.remove(0); // Clear message
    json_message.concat("NULL");
    return 0;
}
