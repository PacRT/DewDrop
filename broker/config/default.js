var file = require('fs').readFileSync
var path = require('path')
var neo4j = require('neo4j-driver').v1

var stringify = require('stringify-object')

var bunyan = require('bunyan')

var levelup = require('levelup')
//var leveldown = require('leveldown')
var memdown = require('memdown')

var log = bunyan.createLogger({name: "DewDropQ-Config"})

var driver = neo4j.driver("bolt://pacrt.io", neo4j.auth.basic("neo4j", "neo4j123"));
var session = driver.session();
log.info("Neo4J driver instantiated")
session
    .run( "CREATE (a:Person {name:'Arthur', title:'King'})" )
    .then( function()
    {
        return session.run( "MATCH (a:Person) WHERE a.name = 'Arthur' RETURN a.name AS name, a.title AS title" )
    })
    .then( function( result ) {
        log.info( result.records[0].get("title") + " " + result.records[0].get("name") );
        session.close();
        driver.close();
    })
    .catch(function (error) {
        log.erro('Error occurred with neo4j', error)
    })


var db = levelup('./my.db', {valueEncoding: 'json'})
    /*, multilevelHttp = require('multilevel-http')
    , http = require('http')

var app = multilevelHttp.server(db)

var server = http.createServer(app)

server.listen(3000, function(){
    console.log('listening on port %d...', 3000)
}) */


//db.put('Device 11', "/strmv1/certreq1", function(err) {
 db.put({ C: 'US', O: 'PacRT', OU: 'PacRT Hardware', CN: 'Device 11' }, "/strmv1/certreq", function(err) {
    if(err) {
        return log.error('Oops! ', err)
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
        /*db.get(subject, function(err, value) {
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
        })*/
        var neosession = driver.session()
        var neoobject = stringify(subject, {indent: ' '})
        neosession
            .run("match (n " + neoobject + ") return n")
            .then(function(result){
                log.info("Result: ", result)
                //var count = 0
                if(result.records.length > 0) {
                    callback(null) // callback with no error
                } else {
                    callback(new Error('Authorization could not be obtained - no match found'))
                }
            })
            .catch(function(error) {
                log.warn("neo4j error happened: ", error)
                callback(new Error('Authorization could not be obtained'))
            })
    },

    authorizeSubscribe: function (topic, subject, callback) {
        log.info('Authorize subscribe from config is called..... Subject: ', subject)
        callback(null);
    }
}

