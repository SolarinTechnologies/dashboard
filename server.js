const iot_hub_connection_string = "HostName=STIotHub43.azure-devices.net;SharedAccessKeyName=STParticleSA05;SharedAccessKey=CT1zoY5NiK2mkv5n8jINy0UQgrQpJG96Yhkx6UxU4+c="; 
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const moment = require('moment');
const path = require('path');
const iotHubClient = require('./IoThub/iot-hub.js');
const Client = require('azure-iothub').Client;
const client = Client.fromConnectionString(iot_hub_connection_string);
const deviceId = 'MyNodeDevice';
const methodParams = {
  methodName: 'SetTelemetryInterval',
  payload: 3, // seconds
  responseTimeoutInSeconds: 30
};

const app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.use(function (req, res/*, next*/) {
  res.redirect('/');
});

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
wss.broadcast = function broadcast(data) {
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      try {
        console.log('sending data ' + data);
        client.send(data);
      } catch (e) {
        console.error(e);
      }
    }
  });
};

wss.on('connection', function connection(ws) {
  console.log('connection');
  ws.on('message', function incoming(message_string) {
    console.log('server received: %s', message_string);
    var message = JSON.parse(message_string);
    if(message.toggle_state){
      methodParams.payload = 2;
      client.invokeDeviceMethod(deviceId, methodParams, function (err, result) {
        if (err) {
            console.error('Failed to invoke method \'' + methodParams.methodName + '\': ' + err.message);
        } else {
            console.log('Response from ' + methodParams.methodName + ' on ' + deviceId + ':');
            console.log(JSON.stringify(result, null, 2));
        }
      });
    } else {
      methodParams.payload = 10;
      client.invokeDeviceMethod(deviceId, methodParams, function (err, result) {
        if (err) {
            console.error('Failed to invoke method \'' + methodParams.methodName + '\': ' + err.message);
        } else {
            console.log('Response from ' + methodParams.methodName + ' on ' + deviceId + ':');
            console.log(JSON.stringify(result, null, 2));
        }
      });
    }
  });
});

var iotHubReader = new iotHubClient(iot_hub_connection_string, "stconsumergroup17");
iotHubReader.startReadMessage(function (obj, date) {
  try {
    console.log(date);
    date = date || Date.now()
    wss.broadcast(JSON.stringify(Object.assign(obj, { time: moment.utc(date).format('YYYY:MM:DD[T]hh:mm:ss') })));
  } catch (err) {
  	console.log('oh! oh!');
    console.log(obj);
    console.error(err);
  }
});

var port = normalizePort(process.env.PORT || '3000');
server.listen(port, function listening() {
  console.log('Listening on %d', server.address().port);
});

function normalizePort(val) {
  var port = parseInt(val, 10);
  if (isNaN(port)) {
    return val;
  }
  if (port >= 0) {
    return port;
  }
  return false;
}
