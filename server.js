'use strict';

var express = require('express');
var cors = require('cors');
var multer = require('multer');
const bodyParser = require('body-parser');
var upload = multer({dest:'uploads/'});
var app = express();
app.use(bodyParser.json());

// require and use "multer"...


app.use(cors());
app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function (req, res) {
     res.sendFile(process.cwd() + '/views/index.html');
  });


app.post('/upload', upload.single('file'), (req, res, next) => {
    return res.json();
});



app.listen(process.env.PORT || 3000, function () {
  console.log('Node.js listening ...');
});
