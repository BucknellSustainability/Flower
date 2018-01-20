#include <math.h>
//#include <Xbee.h>

// Schematic:
// [Ground] ---- [10k-Resistor] -------|------- [Thermistor] ---- [+5V]
//                                 Analog 0

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
  //   B = Beta
  //   R = Measured Resistance
  //   T0 = Reference temperature (KELVIN!)
  //   R0 = Resistance at T0
  //
  // For an NTCLP100E3103H Thermistor,
  //   B = 3977;
  //   T0 = 25C = 298.15K
  //   R0 = 10,000 Ohms 
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

void loop() {
  Serial.println(int(Thermistor(analogRead(0)))); // displays F
  delay(1000);
}
