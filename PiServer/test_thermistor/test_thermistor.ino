#include <math.h>
//#include <Xbee.h>

// Schematic:
// [Ground] ---- [10k-Resistor] -------|------- [Thermistor] ---- [+3.3V]
//                                 Analog 0

double Thermistor(int RawADC) {
  // Using Steinhart-Hart Thermistor equation
  float Temp;
  float v_out;
  
  v_out = (RawADC / 1024.0) * 3.3;
  Temp = 10000.0 * ( (3.3 / v_out) - 1);
  //Temp = log(10000.0*((1024.0/RawADC-1))); // Gets resistance of thermistor
  //Serial.print("Resistance: ");
  //Serial.print(Temp);
  
  //Temp = 1/(0.001129148 + (0.000234125 + (0.0000000876741 * Temp * Temp))*Temp);
  Temp = 1 / (0.001129148 + (0.000234125 * log(Temp)) + (0.0000000876741 * pow(log(Temp), 3)));
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

void loop() {
  Serial.println(int(Thermistor(analogRead(0)))); // displays F
  delay(1000);
}
