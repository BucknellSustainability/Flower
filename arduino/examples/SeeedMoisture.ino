#include <Packet.h>

int sensorPin = A0;
int sensorValue = 0;
String soilStatus = "";
Packet p = Packet();

void setup() {
  // put your setup code here, to run once:
  p.initialize("Soil Moisture Example"); // Name your project here
}

void loop() {
  // put your main code here, to run repeatedly:
  sensorValue = analogRead(sensorPin);
  if (sensorValue < 300){
    soilStatus = "Dry";
  } else if (sensorValue < 700){
    soilStatus = "Moist";
  } else {
    soilStatus = "Waterlogged";
  }
  p.start_packet();
  p.add_int_field("Resistivity", sensorValue);
  p.add_text_field("Status", soilStatus.c_str());
  p.end_packet();
  delay(1000);
}
