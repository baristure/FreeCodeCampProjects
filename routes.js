const express = require('express');
const router = express.Router();
const path = require('path');
const moment = require('moment');

router.get('/', (req, res, next) => res.sendFile(path.join(__dirname, '/views/index.html')));

router.get('/:date', (req, res, next) => {

  const formats = [
    'X',
    'MMMM D, YYYY',
    'MMMM D YYYY',
    'MMM D, YYYY',
    'MMM D YYYY',
    'D MMMM YYYY',
    'D MMM YYYY',
  ];

  const date = moment(req.params.date, formats, true);

  let dateObj;

  if (date.isValid()) {
    dateObj = {
      unix: Number(date.format('X')),
      natural: date.format('MMMM D, YYYY')
    };
  } else {
    dateObj = {
      unix: null,
      natural: null
    };
  }
  res.json(dateObj);
});

// Note 1: Format validation is needed or else moment.js will do interesting things like accept November 31, 2016 and convert it to December 1, 2016 in the returned JSON.

// Note 2: Solely numeric dates (ex. 11-30-16, or most variations thereof) have been excluded in the interest of not discriminating against either the group of people who choose to put their month first or the group of people who choose to put their day first.

module.exports = router;
