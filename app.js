const express = require('express');
const app = express();

app.use('/', require('./routes'));

const port = process.env.PORT || 8080;
app.listen(port, function() {
  console.log(`Force be with us on port ${port}`);
});

app.use('/', (err, req, res, next) => {
  console.log(  "You don't know the power of the dark side! ");
  res.sendStatus(err.status || 500);
});