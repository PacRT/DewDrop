var sys = require('util')
var execsync = require('child_process').execSync;
var format = require("string-template");
var mqtt    = require('mqtt');
var fs = require('fs');
var config = require('config');

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

var client  = mqtt.connect('mqtts://pacrt.io', config.mqtts);
//var client  = mqtt.connect('mqtts://secsrv.sensity.com', config.mqtts);

//client.subscribe('/strmv1/gencert/cert/mynodeid');

client.subscribe('/strmv1/certreq');
client.subscribe('/aaaa/bb');

client.on('message', function(topic, message, packet) {
    var certpack = decode(message);
    console.log('Message on topic: ', topic, "----", certpack);
});

client.publish('/strmv1/certreq', encode({nodeid: 'mynodeid', pass: 'pass'}));

//client.publish('/aaaa/bb', encode({nodeid: 'mynodeid', pass: 'pass'}));

