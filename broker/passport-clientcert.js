var fs = require('fs');
var path = require('path');
var https = require('https');
var connect = require('connect');
var passport = require('passport');
var tls = require('tls');
var file    = require('fs').readFileSync
require('colors');

var ClientCertStrategy = require('passport-client-cert').Strategy;

var config = require('config');

var PORT = 3443;

// A list of valid user IDs
// test/data contains certs for users bob and ann.
// Ann is in the list, so requests with that key/cert will be authorized.
// Bob is not in the list, so requests will not be authorized.
var users = ['ann'];

/*
 * Dummy user lookup method - simulates database lookup
 */
function lookupUser(cn, done) {
    var user = users.indexOf(cn) >= 0 ? { username: cn } : null;
    done(null, user);
}

/**
 * Authentication callback for PKI authentication
 *  - Look up a user by ID (which, in this simple case, is identical
 *    to the certificate's Common Name attribute).
 */
function authenticate(cert, done) {
    var subject = cert.subject;
    var msg = 'Attempting PKI authentication';

    if(!subject) {
        console.log(msg + ' ✘ - no subject'.red);
        done(null, false);
    } else if(!subject.CN) {
        console.log(msg +  '✘ - no client CN'.red);
        done(null, false);
    } else {
        var cn = subject.CN;

        lookupUser(cn, function(err, user) {
            msg = 'Authenticating ' +  cn + ' with certificate';

            if(!user) {
                console.log(msg + ' ✘ - no such user'.red);
                done(null, false);
            } else {
                console.log(msg + ' - ✔'.green);
                done(null, user);
            }
        });
    }
}

var certDir = path.join(__dirname, '..', 'test', 'data');

var options = config.wss;

passport.use(new ClientCertStrategy(authenticate));

var app = connect();
app.use(passport.initialize());
app.use(passport.authenticate('client-cert', { session: false }));
app.use(function(req, res) {
    res.end(JSON.stringify(req.user));
});

exports.app = app;

// Test curl command:
// $ curl -k --cert test/data/ann.crt --key test/data/ann.key --cacert test/data/ca.crt https://localhost:3443

// curl on OSX Mavericks and newer has broken --cacert: http://curl.haxx.se/mail/archive-2013-10/0036.html
// If this affacets you, equivalent wget command:
// wget -qSO - --no-check-certificate --certificate=test/data/ann.crt --private-key=test/data/ann.key --ca-certificate=test/data/ca.crt https://localhost:3443/
tls.createServer(options, app).listen(PORT, function() {
    console.log('Server listening on port ' + PORT);
});