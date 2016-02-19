var sys = require('util')
var execsync = require('child_process').execSync;
var format = require("string-template");
var mqtt    = require('mqtt');
var fs = require('fs');

var msgpack = require('msgpack5')()
  , encode  = msgpack.encode
  , decode  = msgpack.decode

function puts(error, stderr, stdout) {
  if(error)
    console.log('error: ', error);
  if(stdout)
    console.log('stdout: ', stdout)
  if(stderr)
    console.log('stderr: ', stderr)
}

var options = {
  // keyPath: KEY,
  // certPath: CERT,
  rejectUnauthorized : false,
  //The CA list will be used to determine if server is authorized
  //ca: '/home/ubuntu/codes/pki-example-3/ca/tls-ca-chain.pem'
};

var client  = mqtt.connect('mqtts://secsrv.sensity.com', options);

client.subscribe('/strmv1/gencert/cert/mynodeid');

client.on('message', function(topic, message, packet) {
    var certpack = decode(message);
    console.log('Message on topic certreq: ', certpack);
});

client.publish('/strmv1/certreq', encode({nodeid: 'mynodeid', pass: 'pass'}));

