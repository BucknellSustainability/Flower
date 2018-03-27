/*
 * bmp280_example.ino
 * Example sketch for BMP280
 *
 * Copyright (c) 2016 seeed technology inc.
 * Website    : www.seeedstudio.com
 * Author     : Lambor, CHN
 * Create Time:
 * Change Log :
 *
 * The MIT License (MIT)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

 // Adapted by Daniel Vasquez for the use with the Packet library

#include "Seeed_BMP280.h"
#include "Wire.h"
#include "Packet.h"

BMP280 bmp280;
Packet p;
const int DOUBLE_PRECISION = 2;

void setup()
{
  p.initialize("Seeed Barometer Example");
  if(!bmp280.init()){
    p.start_packet();
    p.add_text_field("Error", "Failed to intialize barometric sensor (bmp280)");
    p.end_packet();
  }
}

void loop()
{
  float pressure;
  
  //get and print temperatures
  p.start_packet();
  p.add_double_field("Temperature (C)", bmp280.getTemperature(), DOUBLE_PRECISION);
  
  //get and print atmospheric pressure data
  p.add_double_field("Pressure (Pa)", pressure = bmp280.getPressure(), DOUBLE_PRECISION);
  
  //get and print altitude data
  p.add_double_field("Altitude (m)", bmp280.calcAltitude(pressure), DOUBLE_PRECISION);
  p.end_packet();
  delay(1000);
}
