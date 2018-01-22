$(document).ready(function () {
    /*
    var data = [];
    var t = new Data();
    for (var i = 10; i >= 0; i--) {
        var x = new Date(t.getTime() - i * 1000);
        data.push([x, Math.random()]);
    }

    var g = new Dygraph(document.getElementById("div_g"), data,
        {
            drawPoints: true,
            showRoller: true,
            valueRange: [0.0, 1.2],
            labels: ['Time', 'Random']
        });

    window.intervalId = setInterval(function() {
        var x = new Date();
        var y = Math.random();
        data.push([x, y]);
        g.updateOptions({'file': data});
    }, 1000);
    */

    var myChart = Highcharts.chart('div_g', {
        chart: {
            type: 'bar'
        },
        title: {
            text: 'Fruit Consumption'
        },
        yAxis: {
            title: {
                text: 'Fruit eaten'
            }
        },
        series: [{
            name: 'Jane',
            data: [1, 0, 4]
        }, {
            name: 'John',
            data: [5, 7, 3]
        }]
    });
});
div_g
