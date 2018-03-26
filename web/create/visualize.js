// TODO: have this populate from the deployment.json file
let deploy_config = {"FLASK_SERVER": 'https://eg.bucknell.edu/energyhill'}

function requestProjectInfo(fields, table, condition_fields, condition_values){
      var xhr = new XMLHttpRequest();
      xhr.open('GET', deploy_config["FLASK_SERVER"] + '/read?fields=' + fields + '&table=' + table + '&condition_fields=' + condition_fields + '&condition_values=' + condition_values);
      xhr.responseType = 'json';
      xhr.withCredentials = true;
      xhr.onload = function() {
          let project;
          for (key in xhr.response){
            project = xhr.response[key];
            chart.setTitle({text: project.name});
            chart.setTitle(null, { text: project.description});
          }
      }
      xhr.send();
}

function requestSensorInfo(fields, table, condition_fields, condition_values) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', deploy_config["FLASK_SERVER"] + '/read?fields=' + fields + '&table=' + table + '&condition_fields=' + condition_fields + '&condition_values=' + condition_values);
      xhr.responseType = 'json';
      xhr.withCredentials = true;
      xhr.onload = function() {
          //console.log(xhr.response)
          let sensor;
          for (key in xhr.response){
            sensor = xhr.response[key];
            getSensorData(sensor);
          }
      };
      xhr.send();
    }

function getSensorData(sensor){
      var xhr = new XMLHttpRequest();
      xhr.open('GET', deploy_config["FLASK_SERVER"] + '/read?fields=*&table=datahourly&condition_fields=sensorId&condition_values=' + sensor.sensorId);
      xhr.responseType = 'json';
      xhr.withCredentials = true;
      xhr.onload = function() {
          addDataToChart(xhr.response, sensor)
      };
      xhr.send();
}


function addDataToChart(data, sensor){
    var nodes = [] //holds all datapoints for a given series
    for(var j=0; j<data.length; j++) { 
        var time = data[j].dateTime.split(/[- :]/);; //formatting date for highcharts to understand

        var nodeDate = new Date(Date.UTC(time[0], time[1]-1, time[2], time[3], time[4]));
        var timezoneOffset = nodeDate.getTimezoneOffset() * 60000;
      
        var node = [];
        node.push(nodeDate.getTime() + timezoneOffset);
        node.push(parseFloat(Math.round(data[j].averageValue * 100) / 100));

        nodes.push(node);
    }

    //add sensor[i] data as a series
    chart.addSeries({                        
        name: sensor.name + " (" + sensor.units + ")",
        data: nodes
    });
}

//create chart
var chart = Highcharts.stockChart('graphView', {
    chart: {
         renderTo: "graphView", 
         zoomType: 'x'
      },
    credits: {
        enabled: false
    },
    title: {
        text: "Here"
    },
    subtitle: {
        text: ""
    },
    xAxis: {
        type: 'datetime'
    },
    yAxis: {
        title: {
            text: "Sensor Data"
        }
    },
    dateTimeLabelFormats: {
        millisecond: '%H:%M:%S.%L',
        second: '%l:%M:%S %p',
        minute: '%l:%M %p',
        hour: '%l:%M %p',
        day: '%e. %b',
        week: '%e. %b',
        month: '%b \'%y',
        year: '%Y'
    },

    rangeSelector:{
        enabled:true,
        floating: true,
        y: -65,
verticalAlign: 'bottom'
    },
navigator: {
        margin: 60
    },
})

// TODO: move this to common
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

//get sennsorId parameter from url string (?id=...)
var result = parseQueryString(location.search);
requestProjectInfo('*',
                  'project',
                  'projectId',
                  result.projectId)

requestSensorInfo('*',
              'sensor',
              'sensorId',
              result.id); 
