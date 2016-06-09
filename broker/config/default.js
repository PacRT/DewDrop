var file = require('fs').readFileSync
var path = require('path')

var bunyan = require('bunyan')

var levelup = require('levelup')
var leveldown = require('leveldown')
var memdown = require('memdown')
var db = levelup('./db')

var log = bunyan.createLogger({name: "DewDropQ-Config"})

//db.put('Device 11', "/strmv1/certreq1", function(err) {
 db.put({ C: 'US', O: 'PacRT', OU: 'PacRT Hardware', CN: 'Device 11' }, "/strmv1/certreq", function(err) {
    if(err) {
        return log.error('Oops! ', err)
    }
})

db.get({ C: 'US', O: 'PacRT', OU: 'PacRT Hardware', CN: 'Device 11' }, function(err, value) {
    if(err) {
        return log.error('Oops! ', err)
    } else {
        log.info('Value: ', value)
    }
})

module.exports =
{
    /** Strike out the options you don't need - mixing options with different security types are dangerous **/
    mqtts: {
        port: 8883,
        pfx: file('crypto_objects/certs/pacrt.io.p12'),
        //pfx: file('crypto_objects/certs/sensity.com.p12'),
        crl: [file('crypto_objects/crls/tls-ca.crl'), file('crypto_objects/crls/root-ca.crl')],
        passphrase: 'pass',
        requestCert: true,
        rejectUnauthorized: true,

        ca: [file('crypto_objects/certs/root-ca.crt'), file('crypto_objects/certs/tls-ca.crt')]
    },

    mqtt: {
        port: 1883
    },

    wss: {
        port: 8443,
        pfx: file("crypto_objects/certs/pacrt.io.p12"),
        passphrase: 'pass'
    },

    ws: {
        port: 8000,
        host: '0.0.0.0'
    },

    auth_scheme: {clientcert: true},

    authorizePublish: function (topic, subject, callback) {
        console.log('Authorize publish from config is called..... Subject: ', subject)
        db.get(subject, function(err, value) {
            if(err) {
                log.info('Error: ', err)
                callback(new Error('Not authorized to publish'));
                //return log.info('Oops! ', err)
            } else {
                log.info('Topic: ', value)
                if(topic === value) {
                    callback(null)
                } else {
                    callback(new Error('Not authorized to publish'));
                }
            }
        })
    },

    authorizeSubscribe: function (topic, subject, callback) {
        console.log('Authorize subscribe from config is called..... Subject: ', subject)
        callback(null);
    }
}

