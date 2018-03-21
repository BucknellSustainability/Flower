show triggers;

show create trigger datahourly_AFTER_INSERT;

# Create trigger to add alerts
CREATE DEFINER=`admin`@`%` TRIGGER `energyhill`.`datahourly_AFTER_INSERT` AFTER INSERT ON `datahourly` FOR EACH ROW
BEGIN

DECLARE _alertMinVal DOUBLE;
DECLARE _alertMaxVal DOUBLE;
 DECLARE _alertsEnabled TINYINT;


SELECT alertMinVal, alertMaxVal, alertsEnabled
INTO _alertMinVal, _alertMaxVal, _alertsEnabled
FROM sensor
WHERE sensor.sensorId = new.sensorId;

if((_alertsEnabled = 1) AND (_alertMaxVal <= new.averageValue OR _alertMinVal >= new.averageValue))
THEN INSERT INTO alerts (sensorId) VALUES (new.sensorId);

END IF;
END