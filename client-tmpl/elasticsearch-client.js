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

// Connect to the this host's cluster, sniff
// for the rest of the cluster right away, and
// again every 5 minutes
var client = elasticsearch.Client({
  host: 'localhost:9200',
  sniffOnStart: true,
  sniffInterval: 300000
});

// Connect to this host using https, basic auth,
// a path prefix, and static query string values
var client = new elasticsearch.Client({
  host: 'localhost:9200'
});

// elasticsearch.js adds the elasticsearch namespace to the window
var client = elasticsearch.Client({ ... });

// elasticsearch.jquery.js adds the es namespace to the jQuery object
var client = jQuery.es.Client({ ... });

// elasticsearch.angular.js creates an elasticsearch
// module, which provides an esFactory
var app = angular.module('app', ['elasticsearch']);
app.service('es', function (esFactory) {
  return esFactory({ ... });
});


// index a document
client.index({
  index: 'blog',
  type: 'post',
  id: 1,
  body: {
    title: 'JavaScript Everywhere!',
    content: 'It all started when...',
    date: '2013-12-17'
  }
}, function (err, resp) {
  // ...
});
