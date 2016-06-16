'use strict';

var tls = require('tls');
//var fs        = require('fs');
//var mqstream = require('mqstream')();
var mqstream = require('aedes')();
var http = require('http');
var https = require('https');
var net = require('net');
var websocket = require('websocket-stream');
var config = require('config');
var bunyan = require('bunyan');

var numClient = 0;

var log = bunyan.createLogger({name: 'DewDropQ'});

var server; // global variable to have a clean EXIT

if (config.has('mqtts')) {
    var options = config.mqtts;
    var mqtts_server = tls.createServer(options, mqstream.handle);
    mqtts_server.listen(config.mqtts.port, function () {
        log.info('Secure DewDropQ is bound on port ', config.mqtts.port);
    });
}

if (config.has('mqtt')) {
    var options = config.mqtt;
    var mqtt_server = net.createServer({}, mqstream.handle);
    server = mqtt_server;
    mqtt_server.listen(config.mqtt.port, function () {
        log.info('DewDropQ (non-TLS) is bound on port ', config.mqtt.port);
    });
}

if (config.has('ws')) {
    var http_server = http.createServer();
    server = http_server;
    websocket.createServer({server: http_server}, mqstream.handle);
    http_server.listen(config.ws.port, config.ws.host, function () {
        log.info('DewDropQ-WS is bound on port ', config.ws.port);
    });
}

if (config.has('wss')) {
    var options = config.wss;
    var https_server = https.createServer(options);
    server = https_server;
    websocket.createServer({server: https_server}, mqstream.handle);
    https_server.listen(config.wss.port, config.wss.host, function () {
        log.info('DewDropQ-WSS is bound on port ', config.wss.port);
    });
}

mqstream.on('client', function (client) {
    log.info('Client: ', client.id, ' connected..');
    if (client.id != null) ++numClient;
    log.info('Connected clients: ', numClient);
    mqstream.publish({
        topic: 'clientcount',
        payload: new Buffer(numClient.toString(), 'utf8'),
        retain: true
    }, function () {
    })
});

mqstream.on('clientDisconnect', function (client) {
    log.info('Client: ', client.id, ' disconnected..');
    if (client.id != null) --numClient;
    log.info('Connected clients: ', numClient);
    mqstream.publish({
        topic: 'clientcount',
        payload: new Buffer(numClient.toString(), 'utf8'),
        retain: true
    }, function () {
    })
});

mqstream.on('clientError', function (client, error) {
    log.info('Client: ', client.id, ' has error: ', error);
});

mqstream.on('publish', function (packet, client) {
    var clientid;
    if (client == null) clientid = null;
    log.info('Client: ', clientid, ' published packet: ', packet);
});

mqstream.on('subscribe', function (subscriptions, client) {
    log.info('Client: ', client.id, ' subscribed: ', subscriptions);
});

mqstream.on('unsubscribe', function (unsubscriptions, client) {
    log.info('Client: ', client.id, ' unsubscribed: ', unsubscriptions);
});

mqstream.authenticate = function (client, username, password, callback) {
    // log.info('Client..: ', client);
    // log.info('Conn: ', client.conn);
    if (config.auth_scheme != null && client.conn.server.requestCert && config.auth_scheme.clientcert === true) {
        var subj = client.conn.getPeerCertificate().subject;
        log.info('Cert Subject: ', subj);
        return callback(null, true)
    } else {
        log.warn('WARNING!!! Be careful unsecured configuration detected');
        callback(null, true);
    }
}

mqstream.authorizePublish = function (client, packet, callback) {
    log.info('AuthorizePublish is called')
    if (packet.topic === '/aaaa/bb') {
        log.warn('Wrong topic', packet.topic)
        return callback(new Error('wrong topic'))
    }

    if (packet.topic === 'test/strmv1/certreq') {
        packet.payload = new Buffer('overwrite packet payload')
        return callback(null);
    }
    if (config.authorizePublish != null) {
        // log.info('Conn: ', client.conn);

        if(client.conn.server.requestCert) {
            config.authorizePublish(packet.topic, client.conn.getPeerCertificate().subject, function (err) {
                if (err) {
                    log.warn('Not authorized to publish on topic: ', packet.topic)
                    return callback(new Error('Not authorized to publish on topic: ' + packet.topic))
                }
                else
                    return callback(null)
            });
        } else {
            log.warn('CAREFUL!!!! Unsecured connection is being used.. Consider switching off all the ports except 8883');
            return callback(null)
        }
    } else {
        log.warn('CAREFUL!!!! anybody can publish to most any topic')
        return callback(null)
    }
}

mqstream.authorizeSubscribe = function (client, packet, callback) {
    if (packet.topic === 'aaaa') {
        return callback(new Error('wrong topic'))
    }
    if (packet.topic === 'bbb') {
        // overwrites subscription
        packet.qos = packet.qos + 128
        return callback(null, topic)
    }
    if (config.authorizeSubscribe != null) {
        if(client.conn.server.requestCert) {
            config.authorizeSubscribe(packet.topic, client.conn.getPeerCertificate().subject, function (err) {
                if (err) {
                    return callback(new Error('Not authorized to subscribe on topic: ' + packet.topic))
                } else {
                    return callback(null, packet)
                }

            });
        } else {
            log.warn('CAREFUL!!!! Unsecured connection is being used.. Consider switching off all the ports except 8883');
            return callback(null, packet)
        }
    }
    log.warn('CAREFUL!!!! anybody can subscribe to most any topic')
    return callback(null, packet)
}

// Cleanly shut down process on SIGTERM to ensure that perf-<pid>.map gets flushed
process.on('SIGINT', onSIGINT);

function onSIGINT() {
    // IMPORTANT to log on stderr, to not clutter stdout which is purely for data, i.e. dtrace stacks
    console.error('Caught SIGTERM, shutting down.');
    server.close();
    config.cleanup();
    process.exit(0);
}
