var file    = require('fs').readFileSync
var path    = require('path');

module.exports =
{
    /** Strike out the options you don't need - mixing options with different security types are dangerous **/
    mqtts:
    {
        port: 8883,
        pfx: file('crypto_objects/certs/pacrt.io.p12'),
        crl: [file('crypto_objects/crls/tls-ca.crl'), file('crypto_objects/crls/root-ca.crl')],
        passphrase: 'pass',
        requestCert: true,
        rejectUnauthorized: true,

        ca: [file('crypto_objects/certs/root-ca.crt'), file('crypto_objects/certs/tls-ca.crt')]
    },

    mqtt:
    {
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

    auth_scheme: {clientcert: true}
}

