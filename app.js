// BASIC DEPENDENCIES
var express = require("express");
var path = require("path");
var bodyParser = require("body-parser");
var fs = require('fs');
var qs = require('querystring');
var session = require('express-session');
var passport = require('passport');
var httpAdapter = 'https';
var https = require('https');
var http = require('http');
var config = require('./config.js');

// TWILIO SPECFIC DEPENDENCIES + SETUP 
var twilio = require('twilio');
var resp = new twilio.TwimlResponse();
var accountSid = 'AC23d38d64f113cbd57fe69b744ae37c46';
var authToken = '4767a1a13814d3e80b13773824e79f44';
var client = require('twilio')(accountSid, authToken);

// UBER SPECIFIC DEPENDENCIES + SETUP
var uberStrategy = require('passport-uber');
var request = require('request');
var Uber = require('node-uber');
var clientID = config.ClientID;
var clientSecret = config.ClientSecret;
var ServerID = config.ServerID;
var sessionSecret = "UBERAPIROCKS";
var globalAccessToken;
var uber = new Uber({
  client_id: clientID,
  client_secret: clientSecret,
  server_token: ServerID,
  redirect_uri: "http://localhost:8000/auth/uber/callback",
  name: 'Textber'
});

// GOOGLE GEOCODER SETUP
var geocodeProvider = 'google';
var extra = {
    apiKey: "",
    formatter: null
};
var geocoder = require('node-geocoder')(geocodeProvider, httpAdapter, extra);


// APP SETUP
var app = express();
app.use(session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, "./client")));
app.use(bodyParser.json());
app.set('views',__dirname + '/views');
app.set('view engine','ejs');

var server = app.listen(process.env.PORT || 3000, function(){
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});

// UPON FILLING OUT ONLINE FORM TO SIGNUP FOR TEXTBER {

    //////////////////////////////////////////////////////////////////////////////////////////
    // SAVE THEIR UBER RELATED INFORMATION AND PHONE NUMBER INTO MONGODB

    // SEND CONFIRMATION EMAIL TO USER
    // client.messages.create({
    //     body: "Thank you for signing up for TextBER, please relpy 'accept' to confirm your account",
    //     to: FORM.PHONE NUMBER
    //     from: "+16505420611"
    // }, function(err, message) {
    //     process.stdout.write(message.sid);
    // });
// }


var POST;
app.post('/processcall', function(req,res) {
    var body = '';

    req.on('data', function (data) {
        body += data;
    });

    req.on('end', function () {

        POST = qs.parse(body);
        console.log(POST);

        // LOOK UP THE PHONE NUMBER, IF IT DOESN'T EXIST, HANGUP THEN CALL THEM WITH THE MESSAGE "THE NUMBER YOU CALLED FROM DOESN'T HAVE AN ACCOUNT ASSOCIATED WITH IT
        // ELSE
        // RESPOND WITH 'WE'RE PROCESSING YOUR REQUEST, WE'LL CALL BACK ONCE WE'VE BOOKED YOUR RIDE.
        // LOOKUP THAT USER'S DEFAULT ADDRESS WITH THE NUMBER AND MAKE A REQUEST, CALL BACK WITH THE INFO 
    });
});


app.post('/processtext', function(req,res) {
    if (req.method == 'POST') {
        var body = '';
        req.on('data', function (data) {
            body += data;
        });
        req.on('end', function () {
            POST = qs.parse(body);
            console.log(POST);

                 //validate incoming request is from twilio using your auth token and the header from Twilio
                        header = req.headers['x-twilio-signature'];

                    //validateRequest returns true if the request originated from Twilio
                    if (twilio.validateRequest(authToken, header, 'http://twilio-raw.herokuapp.com', POST)) {
                        //generate a TwiML response
                        var resp = new twilio.TwimlResponse();
                        resp.say('hello, twilio!');

                        res.writeHead(200, { 'Content-Type':'text/xml' });
                        res.end(resp.toString());
                    }
                    else {
                        res.writeHead(403, { 'Content-Type':'text/plain' });
                        res.end('you are not twilio - take a hike.');
                    }

            if (POST.Body == 'accept') {
                // LOOKUP THE PHONE NUMBER, IF IT MATCHES, CHANGE THE 'CONFIRMED' FIELD IN THE MONGODB TO TRUE FOR THEIR NUMBER, SEND CONFIRMATION

                    // client.messages.create({
                    //     body: "YOU HAVE NOW BEEN CONFIRMED! GO TO TEXTBER.co/INstructions if you need to learn how to do stuff",
                    //     to: POST.From
                    //     from: "+16505420611"
                    // }, function(err, message) {
                    //     process.stdout.write(message.sid);
                    // });
            } else {
                for (var x = 0; x < (POST.Body).length; i++ ){
                    if (POST.Body[i] == ':') {

                        //////////////////////////////////////////////////////////////////////////////////////////
                        // LOGIC TO LOOK UP PHONE NUMBER, IF IT DOESN'T EXIST, SEND TEXT ABOUT NO ACCOUNT...ELSE {
                        // USE THAT ACCOUNT INFO THEN LOOK UP THE ADDRESSES AND CONFIRM THAT THEY'RE OKAY, THEN MAKE THE UBER REQUEST, THEN SEND TEXT WITH THE DETAILS

                    } else {
                        // client.messages.create({
                        //     body: "INVALID REQUEST, PLEASE CALL US AT 911 TO HELP"
                        //     to: POST.From
                        //     from: "+16505420611"
                        // }, function(err, message) {
                        //     process.stdout.write(message.sid);
                        // });
                    }
                }
            }
        });
    }
    else {
        res.writeHead(404, { 'Content-Type':'text/plain' });
        res.end('send a POST');
    }
  });
