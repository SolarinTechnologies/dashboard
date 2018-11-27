const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const moment = require('moment');
const path = require('path');
const iotHubClient = require('./IoThub/iot-hub.js');

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
  ws.on('message', function incoming(message) {
    console.log('server received: %s', message);
  });
  ws.send('something from server');
});

var iotHubReader = new iotHubClient("HostName=STIotHub43.azure-devices.net;SharedAccessKeyName=STParticleSA05;SharedAccessKey=CT1zoY5NiK2mkv5n8jINy0UQgrQpJG96Yhkx6UxU4+c=", "stconsumergroup17");
iotHubReader.startReadMessage(function (obj, date) {
  try {
    console.log(date);
    debugger;
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
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}
