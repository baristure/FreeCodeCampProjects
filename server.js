// server.js
// where your node app starts

// init project
var express = require('express');
var app = express();

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC 
var cors = require('cors');
app.use(cors({optionSuccessStatus: 200}));  // some legacy browsers choke on 204


const requestIp = require('request-ip');
// inside middleware handler
var ipMiddleware = function(req, res, next) {
    const clientIp = requestIp.getClientIp(req); 
    next();
};
// on localhost you'll see 127.0.0.1 if you're using IPv4 
// or ::1, ::ffff:127.0.0.1 if you're using IPv6
//As Connect Middleware
app.use(requestIp.mw())

app.get('/api/whoami', (req, res) => {
var ipadress = req.clientIp;
var language = req.acceptsLanguages();
var software=req.get('User-Agent');
    res.json({
      ipadress: ipadress,
      language:language[0],
      software:software.slice(software.indexOf("(") + 1, software.indexOf(")"))
    });
});


// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});


// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
