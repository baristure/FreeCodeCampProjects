var express = require('express');
var app = express();


// We need CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing) for our APIs remotely testable by FCC 
var cors = require('cors');
app.use(cors({optionSuccessStatus: 200}));



app.get('/api/timestamp/:dateString?', (req, res) => {
  const dateString = req.params.dateString;

  let date;
  // If the date string is empty, it should be equivalent to new Date(), i.e. the service uses the current timestamp.
  if (!dateString) {
    date = new Date();
  } else {
    // non-empty dateString
    // if datestring is integer, convert dateString to an integer
    if (!isNaN(dateString)) {
      date = new Date(parseInt(dateString));
    } else {
      date = new Date(dateString);
    }
  }
  // If the date string is invalid the api returns an error JSON {"error" : "Invalid Date" }
  if (date.toString() === 'Invalid Date') {
    res.json({ error: date.toString() });
  } else {
    // If the date string is valid the api returns a JSON like this format {"unix": <date.getTime()>, "utc" : <date.toUTCString()> }
    res.json({ unix: date.getTime(), utc: date.toUTCString() });
  }
});


//Shows our index.html file
app.use(express.static('public'));
app.get('/', (req, res) => {
  res.sendFile(`${__dirname}/views/index.html`);
});


// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});