var express = require("express");
var session = require('express-session');
var path = require("path");
var bodyParser = require("body-parser");
var app = express();
var twilio = require('twilio');
var qs = require('querystring');
var passport = require('passport');
var uberStrategy = require('passport-uber');
var https = require('https');
var http = require('http');
var config = require('./config.js');
var Uber = require('node-uber');
var ejs = require('ejs');
var geocodeProvider = 'google';
var httpAdapter = 'https';
var extra = {
    apiKey: "",
    formatter: null
};
var geocoder = require('node-geocoder')(geocodeProvider, httpAdapter, extra);
var accountSid = 'AC23d38d64f113cbd57fe69b744ae37c46';
var authToken = '4767a1a13814d3e80b13773824e79f44';
var client = require('twilio')(accountSid, authToken);
var clientID = config.ClientID;
var clientSecret = config.ClientSecret;
var ServerID = config.ServerID;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "./client")));


client.messages.create({
    body: "Thank you for signing up!",
    to: "+14083869581",
    from: "+16505420611"
}, function(err, message) {
    process.stdout.write(message.sid);
});

app.post('/processtext', function(req,res) {
        var body = '';
        req.on('data', function (data) {
            body += data;
        });

        req.on('end', function () {
            var POST = qs.parse(body);
            if (POST.From == "+14083869581") {
                client.messages.create({
                    body: "Hi Arash" + POST.Body,
                    to: "+14083869581",
                    from: "+16505420611"
                }, function(err, message) {
                    process.stdout.write(message.sid);
                });
            }
        });
        // res.end('send a POST');
  });

var server = app.listen(8000);

// var server = app.listen(process.env.PORT || 8000, function(){
//   console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
// });