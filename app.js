var express = require("express");
var path = require("path");
var app = express();
var bodyParser = require("body-parser");
var session = require('express-session');
var passport = require('passport');
var uberStrategy = require('passport-uber');
var https = require('https');
var http = require('http');
var config = require('./config.js');
var Uber = require('node-uber');
app.use(bodyParser.json());

var twilio = require('twilio');
var qs = require('querystring');

var geocodeProvider = 'google';
var httpAdapter = 'https';
var extra = {
    apiKey: "",
    formatter: null
};
var geocoder = require('node-geocoder')(geocodeProvider, httpAdapter, extra);

var clientID = config.ClientID;
var clientSecret = config.ClientSecret;
var ServerID = config.ServerID;
var sessionSecret = "UBERAPIROCKS";
var uber = new Uber({
  client_id: clientID,
  client_secret: clientSecret,
  server_token: ServerID,
  redirect_uri: "http://localhost:3000/auth/uber/callback",
  // redirect_uri: "https://uberforall.herokuapp.com/auth/uber/callback",
  name: 'Textber'
});
app.use(session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.urlencoded({extended: true}));

// require('./config/routes.js')(app);

app.use(express.static(path.join(__dirname, "./client")));

var server = app.listen(process.env.PORT || 3000, function(){
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});

var accountSid = 'AC23d38d64f113cbd57fe69b744ae37c46';
var authToken = '4767a1a13814d3e80b13773824e79f44';
var client = require('twilio')(accountSid, authToken);
 
client.messages.create({
    body: "Send me a response, prease",
    to: "+14083869581",
    from: "+16505420611"
}, function(err, message) {
    process.stdout.write(message.sid);
});


// var sys = require('sys');

// app.post('http://f8ec7b1b.ngrok.io', function(req, res) {

// var message = req.body.Body;
// var from = req.body.From;
// sys.log('From: ' + from + ', Message: ' + message);

//                var twiml = '<?xml version="1.0" encoding="UTF-8" ?>n<Response>n<Sms>Thanks for your text, well be in touch.</Sms>n</Response>';
//                console.log(res);
//                res.send(twiml, {'Content-Type':'text/xml'}, 200);
//                app.get("http://localhost:4040", function(req,res) {
//  console.log(req, res);
// });

// });

// var recievedData = false;
app.post('/processtext', function(req,res) {
    if (req.method == 'POST') {
        var body = '';

        req.on('data', function (data) {
            body += data;
        });

        req.on('end', function () {

          // console.log(body);
            var POST = qs.parse(body);
            console.log(POST);
            var addressData = {};
            addressData.locations = POST.Body;
            addressData.phoneNumber = POST.From;
            console.log(addressData);

            if (POST.From == "+14083869581") {
                client.messages.create({
                    body: "FUCK OFF NERD",
                    to: "+14083869581",
                    from: "+16505420611"
                }, function(err, message) {
                    process.stdout.write(message.sid);
                });
            }
            //validate incoming request is from twilio using your auth token and the header from Twilio
            var token = '4767a1a13814d3e80b13773824e79f44',
                header = req.headers['x-twilio-signature'];

            //validateRequest returns true if the request originated from Twilio
            if (twilio.validateRequest(token, header, 'https://uberforall.herokuapp.com/', POST)) {
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
        });
    }
    else {
        res.writeHead(404, { 'Content-Type':'text/plain' });
        res.end('send a POST');
    }
  });

passport.serializeUser(function (user, done){
    done(null, user);
});
passport.deserializeUser(function (user, done){
    done(null, user);
});
passport.use(new uberStrategy({
        clientID: clientID,
        clientSecret: clientSecret,
        // callbackURL: "https://uberforall.herokuapp.com/auth/uber/callback"
        callbackURL: "http://localhost:3000/auth/uber/callback"
    },
    function (accessToken, refreshToken, user, done) {
        // console.log('user:', user.first_name, user.last_name);
        // console.log('access token:', accessToken);
        // console.log('refresh token:', refreshToken);
    // THIS IS WHERE YOU WOULD PUT SOME DB LOGIC TO SAVE THE USER
        user.accessToken = accessToken;
        return done(null, user);
    }
));
// ------------------------------------
// MAKE THIS WORK PLEASE
// ------------------------------------
// login page 
app.get('/login', function (request, response) {
    response.render('login');
});

app.get('/trackRide', function (request, response) {
  response.render('trackRide');
});

// get request to start the whole oauth process with passport
app.get('/auth/uber',
    passport.authenticate('uber',
        { scope: ['profile', 'request', 'request_receipt'] }
    )
);
// authentication callback redirects to /login if authentication failed or home if successful
app.get('/auth/uber/callback',
    passport.authenticate('uber', {
        failureRedirect: '/login'
    }), function(req, res) {
    res.redirect('/');
  });
app.post("/addUser", function(request, response){
    console.log(request.body);
    confirmPhone = "+1" + request.body.phoneNumber;
    users.push({phone: confirmPhone});

    client.messages.create({
        body: "Thank you for signing up for TEXTBER",
        to: confirmPhone,
        from: "+16505420611"
    }, function(err, message) {
        process.stdout.write(message.sid);
    });

    response.redirect("/");

});

app.get('/', ensureAuthenticated, function (request, response) {
    response.render('index');
});
// Price Estimates
app.get('/price', ensureAuthenticated, function(request, response){
    var parameters = {
        start_latitude : 37.37720,
        start_longitude: -121.91240,
        end_latitude: 37.37720,
        end_longitude: -121.8800299
    };
    uber.estimates.price(parameters, function(err, res){
        console.log(res);
    });
});
// Time Estiamtes
app.get('/time', ensureAuthenticated, function(request, response){
    var parameters = {
        start_latitude : 37.37720,
        start_longitude: -121.91240,
        end_latitude: 37.37720,
        end_longitude: -121.8800299
    };
    uber.estimates.time(parameters, function(err, res){
        console.log(res);
    });
});
// ------------------------------------
// MAKE THIS WORK PLEASE
// ------------------------------------
// ride request API endpoint
app.post('/request', ensureAuthenticated, function (request, response) {
    var parameters = {
        start_latitude : request.body.start_latitude,
        start_longitude: request.body.start_longitude,
        end_latitude: request.body.end_latitude,
        end_longitude: request.body.end_longitude,
        product_id: "a1111c8c-c720-46c3-8534-2fcdd730040d"
    };

    postAuthorizedRequest('/v1/requests', request.user.accessToken, parameters, function (error, res) {
        if (error) { console.log(error); }
          response.redirect('/trackRide'); 
    },  request);
});

app.get('/currentRide', function(request, response) {
    getAuthorizedRequest('/v1/requests/' + request.user.request_id,  request.user.accessToken, function(error, res){
          response.send(res);
    });
});

app.post('/changeStatus', function(request, response) {
    var parameters = {
        status : request.body.status,
      };

    putAuthorizedRequest('/v1/sandbox/requests/' + request.user.request_id,  request.user.accessToken, parameters, function(error, res){
          response.send(res);
    });
});
// route middleware to make sure the request is from an authenticated user
function ensureAuthenticated (request, response, next) {
  console.log('inside ensure Authenticated');
    if (request.isAuthenticated()) {
        return next();
    }
    response.redirect('/login');
}
// use this for an api post request
var request_id = 0; // Might not need this
function postAuthorizedRequest(endpoint, accessToken, parameters, callback, request) {
    var options = {
        hostname: "sandbox-api.uber.com",
        path: endpoint,
        method: "POST",
        headers: {
            Authorization: "Bearer " + accessToken,
            'Content-Type': 'application/json'
        }
    };
    var req = https.request(options, function(res) {
        var responseParts = '';
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            responseParts += chunk;
        });
        res.on('end', function () {
            request_id = JSON.parse(responseParts).request_id;
            request.user.request_id = request_id;
            callback(null, JSON.parse(responseParts));
        });
    });
    req.write(JSON.stringify(parameters));
    req.end();
    req.on('error', function(err) {
        callback(err, null);
    });
}
function putAuthorizedRequest(endpoint, accessToken, parameters, callback, request) {
    var options = {
        hostname: "sandbox-api.uber.com",
        path: endpoint,
        method: "PUT",
        headers: {
            Authorization: "Bearer " + accessToken,
            'Content-Type': 'application/json'
        }
    };
    var req = https.request(options, function(res) {
        res.on('data', function(data) {
            // console.log('data!');
            // console.log(JSON.parse(data));
            callback(null, JSON.parse(data));
        });
    });
    req.write(JSON.stringify(parameters));
    req.end();
    req.on('error', function(err) {
        callback(err, null);
    });
}








