"use strict";

const express = require("express");
const bodyParser = require("body-parser");
const fccTesting = require("./freeCodeCamp/fcctesting.js");
const session = require("express-session");
const passport = require("passport");
const ObjectID = require("mongodb").ObjectID;
const db = require("mongodb").MongoClient;
const mongo = require("mongodb").MongoClient;
const LocalStrategy = require("passport-local");

const app = express();

fccTesting(app); //For FCC testing purposes
app.use("/public", express.static(process.cwd() + "/public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "pug");


app.use(passport.initialize());
app.use(passport.session());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true
  })
);
//Serialize and Deserialize User Functions
passport.serializeUser((user, done) => {
  done(null, user._id);
});
passport.deserializeUser((id, done) => {
  mongo.collection("users").findOne({ _id: new ObjectID(id) }, (err, doc) => {
    done(null, doc);
  });
});

//Connect Database
mongo.connect(process.env.DATABASE, (err, db) => {
  if (err) {
    console.log("Database error: " + err);
  } else {
    console.log("Successful database connection");

    //serialization and app.listen
  }
});

//Authentication Strategies
//This is defining the process to take when we try to authenticate someone locally.
passport.use(
  new LocalStrategy(function(username, password, done) {
    mongo.collection("users").findOne({ username: username }, function(err, user) {
      console.log("User " + username + " attempted to log in.");
      if (err) {
        return done(err);
      }
      if (!user) {
        return done(null, false);
      }
      if (password !== user.password) {
        return done(null, false);
      }
      return done(null, user);
    });
  })
);

// create the middleware function
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/");
}

//Render page
app.route("/").get((req, res) => {
  res.render(process.cwd() + "/views/pug/index", {
    showLogin: true,
    showRegistration: true,
    title: "Home Page",
    message: "Please login"
  });
});

//İf Login is successfully, set route to profile
app
  .route("/login")
  .post(
    passport.authenticate("local", { failureRedirect: "/" }),
    (req, res) => {
      res.redirect("/profile");
    }
  );

//Render profile page
//ensureAuthenticated as a middleware to the request for the profile page before the argument to the get request containing the function that renders the page
app.route("/profile").get(ensureAuthenticated, (req, res) => {
  res.render(process.cwd() + "/views/pug/profile", {
    username: req.user.username
  });
});

//Register

app.route("/register").post(
  (req, res, next) => {
    mongo.collection("users").findOne({ username: req.body.username }, function(
      err,
      user
    ) {
      if (err) {
        next(err);
      } else if (user) {
        res.redirect("/");
      } else {
        mongo.collection("users").insertOne(
          { username: req.body.username, password: req.body.password },
          (err, doc) => {
            if (err) {
              res.redirect("/");
            } else {
              next(null, user);
            }
          }
        );
      }
    });
  },
  passport.authenticate("local", { failureRedirect: "/" }),
  (req, res, next) => {
    res.redirect("/profile");
  }
);

//Set Logout Route
app.route("/logout").get((req, res) => {
  req.logout();
  res.redirect("/");
});

//Create Error middleware
app.use((req, res, next) => {
  res
    .status(404)
    .type("text")
    .send("Not Found");
});

//Listen requests
app.listen(process.env.PORT || 3000, () => {
  console.log("Listening on port " + process.env.PORT);
});
