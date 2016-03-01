var tls       = require('tls');
//var fs        = require('fs');
var aedes     = require('aedes')();
var http      = require('http');
var https     = require('https');
var net       = require('net');
var websocket = require('websocket-stream');
var config    = require('config');
var bunyan    = require('bunyan');

var numClient = 0;

var log = bunyan.createLogger({name: 'DewDropQ'});

if(config.has('mqtts')) {
  var options = config.mqtts;
  var mqtts_server = tls.createServer(options, aedes.handle);
  mqtts_server.listen(config.mqtts.port, function() {
    log.info('Secure DewDropQ is bound on port ', config.mqtts.port);
  });
}

if(config.has('mqtt')) {
  var options = config.mqtt;
  var mqtt_server = net.createServer({}, aedes.handle);
  mqtt_server.listen(config.mqtt.port, function() {
    log.info('DewDropQ (non-TLS) is bound on port ', config.mqtt.port);
  });
}

if(config.has('ws')) {
  var http_server = http.createServer();
  websocket.createServer({server: http_server}, aedes.handle);
  http_server.listen(config.ws.port, config.ws.host, function() {
    log.info('DewDropQ-WS is bound on port ', config.ws.port);
  });
}

if(config.has('wss')) {
  var options = config.wss;
  var https_server = https.createServer(options);
  websocket.createServer({server: https_server}, aedes.handle);
  https_server.listen(config.wss.port, config.wss.host, function() {
    log.info('DewDropQ-WSS is bound on port ', config.wss.port);
  });
}

aedes.on('client', function(client) {
  log.info('Client: ', client.id, ' connected..');
  if(client.id != null) ++numClient;
  log.info('Connected clients: ', numClient);
  aedes.publish({topic: 'clientcount', payload: new Buffer(numClient.toString(), 'utf8'), retain: true}, function() {})
});

aedes.on('clientDisconnect', function(client) {
  log.info('Client: ', client.id, ' disconnected..');
  if(client.id != null) --numClient;
  log.info('Connected clients: ', numClient);
  aedes.publish({topic: 'clientcount', payload: new Buffer(numClient.toString(), 'utf8'), retain: true}, function() {})
});

aedes.on('clientError', function(client, error) {
  log.info('Client: ', client.id, ' has error: ', error);
});

aedes.on('publish', function(packet, client) {
  var clientid;
  if(client == null) clientid = null;
  log.info('Client: ', clientid, ' published packet: ', packet);
});

aedes.on('subscribe', function(subscriptions, client) {
  log.info('Client: ', client.id, ' subscribed: ', subscriptions);
});

aedes.on('unsubscribe', function(unsubscriptions, client) {
  log.info('Client: ', client.id, ' unsubscribed: ', unsubscriptions);
});

aedes.authenticate = function (client, username, password, callback) {

  if(config.auth_scheme.clientcert === true) {
    var subj = client.conn.getPeerCertificate().subject;
    log.info('Cert Subject: ', subj);
    return callback(null, true)
  }
  //callback(null, username === 'matteo')
  log.info('authenticate method is called..');
  callback(null, true);
}

// Cleanly shut down process on SIGTERM to ensure that perf-<pid>.map gets flushed
process.on('SIGINT', onSIGINT)

function onSIGINT () {
  // IMPORTANT to log on stderr, to not clutter stdout which is purely for data, i.e. dtrace stacks
  console.error('Caught SIGTERM, shutting down.')
  server.close()
  process.exit(0)
}
