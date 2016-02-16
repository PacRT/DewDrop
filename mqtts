var tls       = require('tls');
var fs        = require('fs');
var aedes     = require('aedes')();
var http      = require('http');
var https     = require('https');
var net       = require('net');
var websocket = require('websocket-stream')
var conf      = require("config")
var ws        = require('ws').Server

/*
  before running this server in your local env follow the steps below
  run pkiTLScacerts.sh - it will create the TLS CA certs chain
  edit the pkiservercerts.sh and place your proper domain name anf then run pkiservercerts.sh
  then run pkiclientcerts.sh
*/

var options = {
  pfx: fs.readFileSync(conf.mqtts.cert),
  //crl: [fs.readFileSync('/home/ubuntu/codes/pki-example-3/crl/tls-ca.crl'), fs.readFileSync('/home/ubuntu/codes/pki-example-3/crl/root-ca.crl')],
  passphrase: 'pass',
  // requestCert: true,
  // rejectUnauthorized: true

  // This is necessary only if the client uses the self-signed certificate.
  //ca: [ fs.readFileSync('keys-certs/client.crt') ]
};


var mqtts_server = tls.createServer(options, aedes.handle);

//mqtts_server.listen(8883, '0.0.0.0', function() {
  mqtts_server.listen(conf.mqtts.port, function() {
  console.log('Secure aedes in running on port '+ conf.mqtts.port);
});

aedes.on('client', function(client) {
  console.log('Client: ', client.id, ' connected..');
});

aedes.on('clientDisconnect', function(client) {
  console.log('Client: ', client.id, ' disconnected..');
});

aedes.on('clientError', function(client, error) {
  console.log('Client: ', client.id, ' has error: ', error);
});

aedes.on('publish', function(packet, client) {
  var clientid;
  if(client == null) clientid = null;
  console.log('Client: ', clientid, ' published packet: ', packet);
});

aedes.on('subscribe', function(subscriptions, client) {
  console.log('Client: ', client.id, ' subscribed: ', subscriptions);
});

aedes.on('unsubscribe', function(unsubscriptions, client) {
  console.log('Client: ', client.id, ' unsubscribed: ', unsubscriptions);
});

aedes.authenticate = function (client, username, password, callback) {
  //callback(null, username === 'matteo')
  console.log('authenticate method is called..');
  callback(null, true);
}
