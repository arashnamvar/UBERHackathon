var express = require("express");
require('./config/mongoose.js');
var path = require("path");
var app = express();
var bodyParser = require("body-parser");
app.use(bodyParser.json());

var twilio = require('twilio');
var qs = require('querystring');


// require('./config/routes.js')(app);

app.use(express.static(path.join(__dirname, "./client")));

var server = app.listen(process.env.PORT || 3000, function(){
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});

var accountSid = 'AC23d38d64f113cbd57fe69b744ae37c46';
var authToken = '4767a1a13814d3e80b13773824e79f44';
var client = require('twilio')(accountSid, authToken);
 
client.messages.create({
    body: "Jenny please?! I love you <3",
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
// 	console.log(req, res);
// });

// });

app.post('/processtext', function(req,res) {
    if (req.method == 'POST') {
        var body = '';

        req.on('data', function (data) {
            body += data;
        });

        req.on('end', function () {

          // console.log(body);
            var POST = qs.parse(body);

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


