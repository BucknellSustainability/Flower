//get params from URL
var parseQueryString = function(url) {
    var params = {};
    url.replace(
    new RegExp("([^?=&]+)(=([^&]*))?", "g"),
    function($0, $1, $2, $3) {
      params[$1] = $3;
    }
    );
    return params;
}
//hold url parameter results
var result = parseQueryString(location.search);


var gaugeOptions = {
    chart: {
        type: 'solidgauge'
    },
    pane: {
        center: ['50%', '85%'],
        size: '140%',
        startAngle: -90,
        endAngle: 90,
        background: {
            backgroundColor: (Highcharts.theme && Highcharts.theme.background2) || '#EEE',
            innerRadius: '60%',
            outerRadius: '100%',
            shape: 'arc'
        }
    },

    tooltip: {
        enabled: false
    },

    // the value axis
    yAxis: {
        stops: [
            [0.2, '#55BF3B'], // green
            [0.5, '#DDDF0D'], // yellow
            [0.8, '#DF5353'] // red
        ],
        lineWidth: 0,
        minorTickInterval: null,
        tickAmount: 2,
        title: {
            y: -70
        },
        labels: {
            y: 16
        }
    },

    plotOptions: {
        solidgauge: {
            dataLabels: {
                y: 5,
                borderWidth: 0,
                useHTML: true
            }
        }
    }
};

//create chart for sensor
var chart = Highcharts.chart('graphView', Highcharts.merge(gaugeOptions, {
    
	title: {
		text: ""
	},
	subtitle: {
		text: ""
	},
    yAxis: {
        min: parseInt(result.min),
        max: parseInt(result.max)
    },
    credits: {
        enabled: false
    },

    series: [{
        name: "title",
        data: [0],
        dataLabels: {
            format: '<div style="text-align:center"><span style="font-size:25px;color:' +
                ((Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black') + '">{y}</span><br/>' +
                   '<span style="font-size:12px;color:silver">degrees F</span></div>'
     },
     tooltip: {
           valueSuffix: "units"
            },
    }]
}));

function requestSensorInfo(fields, table, condition_fields, condition_values) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', deploy_config["FLASK_SERVER"] + '/read?fields=' + fields + '&table=' + table + '&condition_fields=' + condition_fields + '&condition_values=' + condition_values);
      xhr.responseType = 'json';
      xhr.withCredentials = true;
      xhr.onload = function() {
          let sensor = xhr.response[0];
          chart.setTitle({text: sensor.name});
          chart.setTitle(null, { text: sensor.description});
      };
      xhr.send();
    }

requestSensorInfo('*',
          'sensor',
          'sensorId',
          result.id); 


setInterval(function () {
    //Speed
    let point;
    let data;
    if(chart){
    	point = chart.series[0].points[0];
	      var xhr = new XMLHttpRequest();
	      xhr.open('GET',  deploy_config["FLASK_SERVER"] + '/get-sensor-last-reading?sensorid='+result.id);
	      xhr.responseType = 'json';
	      xhr.withCredentials = true;
	      xhr.onload = function() {
	      	data = xhr.response[0].value;
	      	console.log(data)
            console.log(xhr.response[0].dataId)
	      	point.update(Math.round(data * 100) / 100);
	      };
	      xhr.send();


    }
                //var condition = "WHERE sensorId = " + sensorIds[i] + " ORDER BY dateTime DESC LIMIT 1;";
                //var data = readDB("data",condition,"value")[0];
                //point.update(Math.round(data.value * 100) / 100);
}, 1000);
