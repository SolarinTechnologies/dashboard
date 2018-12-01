$(document).ready(function () {
  var timeData = [],
    temperatureData = [],
    humidityData = [];
  var data = {
    labels: timeData,
    datasets: [
      {
        fill: false,
        label: 'Visible',
        yAxisID: 'Temperature',
        borderColor: "rgba(255, 204, 0, 1)",
        pointBoarderColor: "rgba(255, 204, 0, 1)",
        backgroundColor: "rgba(255, 204, 0, 0.4)",
        pointHoverBackgroundColor: "rgba(255, 204, 0, 1)",
        pointHoverBorderColor: "rgba(255, 204, 0, 1)",
        data: temperatureData
      }
    ]
  }
  var doughtnut_data = {
    labels: ["Infrared", "Visible", "Ultraviolet"],
    datasets: [
      {
        label: "Intensity (lux)",
        backgroundColor: ["#c45850","gray","#8e5ea2",],
        data: [0],
      }
    ]
  };

  var basicOption = {
    title: {
      display: true,
      text: 'Noise',
      fontSize: 15
    },
    legend: {
        display: false,
        labels: {
            fontColor: "#000080",
        }
    },
    scales: {
      yAxes: [{
        id: 'Temperature',
        type: 'linear',
        scaleLabel: {
          labelString: 'Pressure (dB)',
          display: true
        },
        position: 'left',
      }]
    }
  }
  var ctx = document.getElementById("myChart").getContext("2d");
  var optionsNoAnimation = { animation: false }
  var myLineChart = new Chart(ctx, {
    type: 'line',
    data: data,
    options: basicOption
  });

  var ctx1 = document.getElementById("doughnut-chart").getContext("2d");
  // var optionsNoAnimation = { animation: true }
  var myDoughnutChart = new Chart(ctx1, {
    type: 'doughnut',
    data: doughtnut_data,
    options: {
      responsive: false,
      rotation: 1 * Math.PI,
      circumference: 1 * Math.PI,
      title: {
        display: true,
        text: 'Light'
      }
    }
  });

  // var ws = new WebSocket('ws://stwebapp30.azurewebsites.net');
  var ws = new WebSocket('ws://localhost:3000');

  ws.onopen = function () {
	console.log('Successfully connect WebSocket');
	$('#checkbox0').click(function(event){
		var toggle_state = $(this).prop("checked") == true;
		var toggle_state_message = {};
		toggle_state_message.toggle_state = toggle_state;
		ws.send(JSON.stringify(toggle_state_message));
	});
  }
  function addData(chart, label, data) {
    chart.data.labels = [];
    chart.data.labels.push(label);
    chart.data.datasets.forEach((dataset) => {
        dataset.data = [];
        dataset.data.push(data);
    });
    chart.update();
  }
  ws.onmessage = function (message) {
    console.log('receive message: ' + message.data);
    try {
      var obj = JSON.parse(message.data);
      if(!obj.time) {
        return;
      }
      var uv_alert_region = $('.uv_alert_region').text(obj.uv_alert)
      if(obj.uv_alert){
        uv_alert_region.css('background-color', 'red');
      } else {
        uv_alert_region.css('background-color', '#666666');
      };
      timeData.push(obj.time);
      var data = obj;
      temperatureData.push(data.visible);
      const maxLen = 50;
      var len = timeData.length;
      if (len > maxLen) {
        timeData.shift();
        temperatureData.shift();
      }

      if (data.ultraviolet) {
        humidityData.push(data.ultraviolet);
      }
      if (humidityData.length > maxLen) {
        humidityData.shift();
      }

      myLineChart.update();

      myDoughnutChart.data.datasets.forEach((dataset) => {
          dataset.data = [];
          dataset.data.push(obj.infrared, obj.visible,obj.ultraviolet);
      });
      myDoughnutChart.update();
    } catch (err) {
      console.error(err);
    }
  }
	var carbon_slider_control = document.getElementById("carbon_slider");
	var carbon_slider_output = document.getElementById("carbon_slider_output");
	carbon_slider_control.value = Math.floor((Math.random() * 100));
	carbon_slider_output.innerHTML = carbon_slider_control.value;
	carbon_slider_control.oninput = function() {
		carbon_slider_output.innerHTML = this.value;
	}
	var humidity_slider_control = document.getElementById("humidity_slider");
	var humidity_slider_output = document.getElementById("humidity_slider_output");
	humidity_slider_control.value = Math.floor((Math.random() * 100));
	humidity_slider_output.innerHTML = humidity_slider_control.value;
	humidity_slider_control.oninput = function() {
		humidity_slider_output.innerHTML = this.value;
	}
	var temperature_slider_control = document.getElementById("temperature_slider");
	var temperature_slider_output = document.getElementById("temperature_slider_output");
	temperature_slider_control.value = Math.floor((Math.random() * 100));
	temperature_slider_output.innerHTML = temperature_slider_control.value;
	temperature_slider_control.oninput = function() {
		temperature_slider_output.innerHTML = this.value;
	}
});
