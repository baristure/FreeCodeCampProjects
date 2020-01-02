'use strict';
//Dependencies
var express = require('express');
var bodyParser = require('body-parser');
// We'll be using Helmet.js to help secure out Express.js app:
const helmet = require("helmet");
// Let's make accessible here to our , so let's make them accessible here to our server so that it can use them
const apiRoutes = require('./routes/api.js');
// We'll need Mongo database to store all the project's CRUD operations
const MongoClient = require('mongodb').MongoClient;

var expect = require('chai').expect;
var cors = require('cors');
var fccTestingRoutes = require('./routes/fcctesting.js');
var runner = require('./test-runner');

// With our dependencies sorted, we'll instantiate our Express.js server...
var app = express();

app.use('/public', express.static(process.cwd() + '/public'));

app.use(cors({
  origin: '*'
})); //For FCC testing purposes only


// We have to use body parser to catch object data and encoded data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

// We need to use Helmet.js to secure our app. Helmet will default load with this modules active : dnsPrefetchControl (control browser DNS prefetching), frameguard (prevent clickjacking), 
// hidePoweredBy (remove X-Powered-By header), hsts (HTTP Strict Transport Security), ieNoOpen (X-Download-Options for IE8+), noSniff (stop clients from
// sniffing MIME type), and xssFilter (small XSS protections).  
// We'll need to disable the frameguard module, which loads by default we just need the xssFilter module.
app.use(helmet({
  frameguard: false
}));




//Sample front-end
app.route('/:project/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/issue.html');
  });

//Index page (static HTML)
app.route('/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
  });

MongoClient.connect(
  process.env.DB,
  (err, db) => {
    if (err) return console.log("Database connection error : ", err);
    else {
      console.log("Successful database connection");
    // If there are no errors, we'll make sure that we're properly connected to the database using a robust test:
    (db.serverConfig.isConnected()) ? console.log("Successfully connected to Mongo database."): console.log("Mongo DB is NOT CONNECTED!");

      //For FCC testing purposes
      fccTestingRoutes(app, db);

      //Routing for API 
      apiRoutes(app, db);


      //404 Not Found Middleware
      app.use(function (req, res, next) {
        res.status(404)
          .type('text')
          .send('Not Found');
      });

      //Start our server and tests!
      app.listen(process.env.PORT || 3000, function () {
        console.log("Listening on port " + process.env.PORT);
        if (process.env.NODE_ENV === 'test') {
          console.log('Running Tests...');
          setTimeout(function () {
            try {
              runner.run();
            } catch (e) {
              var error = e;
              console.log('Tests are not valid:');
              console.log(error);
            }
          }, 3500);
        }
      });
    }
  }
)


module.exports = app; //for testing