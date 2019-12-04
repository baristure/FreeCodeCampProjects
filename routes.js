const express = require('express');
const router = express.Router();
const path = require('path');
const moment = require('moment');

router.get('/', (req, res, next) => res.sendFile(path.join(__dirname, '/views/index.html')));

router.get('/:date', (req, res, next) => {

  const formats = [
    'X',
    'YYYY-MM-DD'
  ];

  const date = moment(req.params.date, formats, true);

  let dateObj;

  if (date.isValid()) {
    dateObj = {
      unix: Number(date.format('X')),
      natural: date.format('MMMM Do YYYY, h:mm:ss')
    };
  } else {
    dateObj = {
      unix: null,
      natural: null
    };
  }
  res.json(dateObj);
});


module.exports = router;
