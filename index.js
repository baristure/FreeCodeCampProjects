const express = require('express');
const app = express();

app.get('/api/timestamp/:dateString?', (request, response) => {
  const dateString = request.params.dateString;

  let date;
  // If the date string is empty it should be equivalent to trigger new Date(), i.e. the service uses the current timestamp.
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
  // If the date string is invalid the api returns a JSON having the structure  {"error" : "Invalid Date" }.
  if (date.toString() === 'Invalid Date') {
    response.json({ error: date.toString() });
  } else {
    // If the date string is valid the api returns a JSON having the structure {"unix": <date.getTime()>, "utc" : <date.toUTCString()> }
    response.json({ unix: date.getTime(), utc: date.toUTCString() });
  }
});

app.use(express.static('public'));

app.get('/', (request, response) => {
  response.sendFile(`${__dirname}/views/index.html`);
});

const portNumber = process.env.PORT || 8000;
app.listen(portNumber, () => {
  console.log(`listening on port ${portNumber}`);
});