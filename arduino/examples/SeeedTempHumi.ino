// Example testing sketch for various DHT humidity/temperature sensors
// Written by ladyada, public domain

#include "DHT.h"
#include "Packet.h"

#define DHTPIN A0     // what pin we're connected to

// Uncomment whatever type you're using!
#define DHTTYPE DHT11   // DHT 11 
//#define DHTTYPE DHT22   // DHT 22  (AM2302)
//#define DHTTYPE DHT21   // DHT 21 (AM2301)

// Connect pin 1 (on the left) of the sensor to +5V
// Connect pin 2 of the sensor to whatever your DHTPIN is
// Connect pin 4 (on the right) of the sensor to GROUND
// Connect a 10K resistor from pin 2 (data) to pin 1 (power) of the sensor

Packet p;
DHT dht(DHTPIN, DHTTYPE);
const int DOUBLE_PRECISION = 2;

void setup() 
{
    p.initialize("Seeed Temp&Humi Example");
    dht.begin();
}

void loop() 
{
    // Reading temperature or humidity takes about 250 milliseconds!
    // Sensor readings may also be up to 2 seconds 'old' (its a very slow sensor)
    float h = dht.readHumidity();
    float t = dht.readTemperature();

    // check if returns are valid, if they are NaN (not a number) then something went wrong!
    if (isnan(t) || isnan(h)) 
    {
        p.start_packet();
        p.add_text_field("Error", "Failed to read from DHT");
    } 
    else 
    {
        p.start_packet();
        p.add_double_field("Humidity", h, DOUBLE_PRECISION);
        p.add_double_field("Temperature (C)", t, DOUBLE_PRECISION);
        p.end_packet();
    }
}
