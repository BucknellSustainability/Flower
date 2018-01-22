#include <math.h>
//#include <Xbee.h>

// Schematic:
// [Ground] ---- [10k-Resistor] -------|------- [Thermistor] ---- [+5V]
//                                  Analog 0

// NOTE: RawADC is a number between 0 and 1024, where 0 = 0V and 1024 = SUPPLY VOLTAGE.
// So if this is being run via USB, then the supply voltage is 5V! If it's being run from
// a wall outlet, it's whatever the power adapter puts out!
double Thermistor(int RawADC) {
	// Using Steinhart-Hart Thermistor equation
	float Temp;
	float v_out;
	float v_in = 5;
	float v_supply = 5;
	
	v_out = (RawADC / 1024.0) * v_supply;
	Temp = 10000.0 * ( (v_in / v_out) - 1);
	//Temp = log(10000.0*((1024.0/RawADC-1))); // Gets resistance of thermistor
	//Serial.print("Resistance: ");
	//Serial.print(Temp);
	
	// Beta equation: T = 1/((1/B)ln(R/R0) + 1/T0)
	// Where:
	//	 B = Beta
	//	 R = Measured Resistance
	//	 T0 = Reference temperature (KELVIN!)
	//	 R0 = Resistance at T0
	//
	// For an NTCLP100E3103H Thermistor,
	//	 B = 3977;
	//	 T0 = 25C = 298.15K
	//	 R0 = 10,000 Ohms 
	//
	// Note: log() is the natural logorithm.
	float B = 3977;
	float T0 = 298.15;
	float R0 = 10000;
	Temp = 1/((1 / B) * log(Temp / R0) + 1 / T0);
	//Serial.print(", Kelvin: ");
	//Serial.print(Temp);
	
	Temp = Temp - 273.15; // Convert K to C
	//Serial.print(", Celsius: ");
	//Serial.print(Temp);
	
	Temp = (Temp * 9.0)/ 5.0 + 32.0; // Convert C to F
	//Serial.print(", Fahrenheit: ");
	Serial.print(Temp);
	
	return Temp;
}

void setup() {
	Serial.begin(115200);
}

const size_t BUFF_LEN = 100;

void loop() {
	// Check if the serial output buffer can fit the data. If it can't, println() will block,
	// so we skip writing it instead.
	char* message_buffer[BUFF_LEN];
        int data = int(Thermistor(analogRead(0)));
        int message_len = snprintf(message_buffer, BUFF_LEN, "%d", data);
        
        // Try to output this if the original message is too long.
        char* short_message = null;
        
        if (message_len < 0) {
          // Sprintf failed. TODO: Error handling (errno?)
          message_buffer = "Error 0: Failed to format";
          message_len = strlen(message_buffer);
          // TODO: Document this error code.
          short_message = "!E0";
        } else if (message_len >= BUFF_LEN) {
          // Not enough space in the buffer. Don't output partial data.
          // Output an error code and name instead.
          message_buffer = "Error 1: Truncated Output";
          message_len = strlen(message_buffer);
          // TODO: Document this error code.
          short_message = "!E1";
        }
        
	// The +1 is for the null terminal '\0'.
        // The +2 is for the '\n', which may be 2 bytes. (LF CR)
	message_len += 1 + 2;
        int short_msg_len = strlen(short_message) + 1 + 2;

	size_t buffer_space = Serial.availableForWrite();

	if (buffer_space >= message_len) {
		Serial.println(message_buffer); // displays F
	} else if (buffer_space >= short_msg_len) {
                Serial.println(short_message);
        } else {
          // TODO: Maybe output an error eventually? Especially if
          // short_message != NULL.
        }
	delay(1000);
}
