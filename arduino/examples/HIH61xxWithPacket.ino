#include <SoftWire.h>
#include <HIH61xx.h>
#include <AsyncDelay.h>
#include <Packet.h>

const int DOUBLE_PRECISION;
HIH61xx hih;
AsyncDelay samplingInterval;
Packet p;

bool printed = true;
void setup(void){
    hih.initialise(A4, A5);
    samplingInterval.start(3000, AsyncDelay::MILLIS);
    p.initialise();
}

void loop(void){
    if (samplingInterval.isExpired() && !hih.isSampling()){
        hih.start();
        samplingInterval.repeat();
    }

    hih.process();

    if (hih.isFinished()) {
        printed = true;
        p.start_packet();
        p.add_double_field("AirTemp(deg C)", hih.getAmbientTemp() / 100.0, DOUBLE_PRECISION);
        p.add_double_field("RelHumidity", hih.getRelHumidity() / 100.0, DOUBLE_PRECISION);
        p.end_packet();
    }
}
