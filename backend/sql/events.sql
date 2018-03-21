# Show existing events
SHOW EVENTS;

# Look at any specific event
SHOW CREATE EVENT DataAggregationEvent;

# Delete any specific event
DROP EVENT DataAggregationEvent;

# Create an event that aggregates data
CREATE DEFINER=`energyhill`@`%` EVENT `DataAggregationEvent` ON SCHEDULE EVERY 10 MINUTE STARTS '2017-12-03 14:10:00' ON COMPLETION PRESERVE ENABLE DO INSERT INTO datahourly(sensorId, averageValue, sampleRate, dateTime)
			(select 
					sensorId, 
					AVG(value) as value,  
					COUNT(VALUE) as samplePerHour, 
					DATE_FORMAT(SEC_TO_TIME(FLOOR((TIME_TO_SEC(CURTIME())+300)/600)*600), "%Y-%m-%d %H:%i:00")  from data
			WHERE data.dateTime > CURRENT_TIMESTAMP - INTERVAL 10 MINUTE
			GROUP BY sensorId)

# retroactively aggregate data (shouldn't be used often)
INSERT INTO datahourly 
	(sensorId, averageValue, sampleRate, dateTime)
SELECT sensorId, AVG(value) as averageValue, 1 as sampleRate, FROM_UNIXTIME(FLOOR(UNIX_TIMESTAMP(dateTime) DIV 600) * 600) as t
  FROM data
  GROUP BY t, sensorId