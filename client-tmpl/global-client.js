var sys = require('util')
var execsync = require('child_process').execSync;
var format = require("string-template");
var mqtt    = require('mqtt');
var fs = require('fs');
var config = require('config');
var msgpack = require('msgpack5')()
  , encode  = msgpack.encode
  , decode  = msgpack.decode;
var elasticsearch = require('elasticsearch');

// Connect to localhost:9200 and use the default settings
var client = new elasticsearch.Client();

// Connect the client to two nodes, requests will be
// load-balanced between them using round-robin
var client = elasticsearch.Client({
  hosts: [
    'localhost:9200'
  ]
});



// ES variable initialization start //
var elasticsearch = require('elasticsearch');
var esclient = new elasticsearch.Client({
    host: 'localhost:9200'
})
esclient.ping({
    // ping usually has a 3000ms timeout
    requestTimeout: Infinity,

    // undocumented params are appended to the query string
    hello: "elasticsearch!"
}, function (error) {
    if (error) {
        console.trace('elasticsearch cluster is down!');
    } else {
        console.log('All is well');
    }
});

// ES variable initialization end

function puts(error, stderr, stdout) {
  if(error)
    console.log('error: ', error);
  if(stdout)
    console.log('stdout: ', stdout)
  if(stderr)
    console.log('stderr: ', stderr)
}

var client  = mqtt.connect('mqtt://localhost', config.mqtt);

console.log('mqtt.connect');

client.on('connect', function () {
  console.log('on connect');
});

client.on('error', function(err) {
  console.log('on error', err);
});

client.on('close', function() {
  console.log('on close');
});

client.on('disconnect', function() {
  console.log('on disconnect');
});

client.on('reconnect', function() {
  console.log('on reconnect');
});

client.on('offline', function() {
  console.log('on offline');
});

client.on('message', function (topic, message) {
  // message is Buffer 
  console.log(message.toString());

// calling ES client for indexing subscribed messages
  esclient.index({
  index: 'mqqt',
  type: 'deviceinfo',
  body:JSON.parse(message.toString())
}, function (err, resp) {
});
  //if you want to close the client enable below function 
  //client.end();  
});

client.subscribe('#');

