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
  
  // Steinhart-Hart equation
  // 1/Temp = a + b * ln(R) + c * (ln(R)) ^ 3
  // Data points:
  //   At 0C, R=40,000
  //   At 21.1C, R=10,000
  //   At 100C, R=800
  //
  // Values from http://www.thinksrs.com/downloads/programs/Therm%20Calc/NTCCalibrator/NTCcalculator.htm
  float A = -0.1202735605 * pow(10, -3);
  float B = 4.599159055 * pow(10, -4);
  float C = -9.179861304 * pow(10, -7);
  Temp = 1 / (A + B * log(Temp) + C * pow(log(Temp), 3));
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
