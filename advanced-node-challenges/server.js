"use strict";

const express = require("express");
const bodyParser = require("body-parser");
const fccTesting = require("./freeCodeCamp/fcctesting.js");
const session = require("express-session");
const passport = require("passport");
const mongo = require("mongodb").MongoClient;
const ObjectID = require("mongodb").ObjectID;
const LocalStrategy = require("passport-local");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const routes = require("./routes.js");
const auth = require("./auth.js");
const GitHubStrategy = require("passport-github").Strategy;
const passportSocketIo = require("passport.socketio");
const cookieParser = require("cookie-parser");
const sessionStore = new session.MemoryStore();

/*
mongoose.connect(mongoConnectionString, {useUnifiedTopology: true});
*/
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
fccTesting(app); //For FCC testing purposes
app.use("/public", express.static(process.cwd() + "/public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.set("view engine", "pug");

//Connect to the Database
mongo.connect(
  process.env.DATABASE,
  { useUnifiedTopology: true },
  (err, connection) => {
    if (err) {
      console.log("Database error: " + err);
    } else {
      console.log("Successful database connection");
      const db = connection.db();

      auth(app, db);

      routes(app, db);

      app.route("/auth/github").get(passport.authenticate("github"));

      app
        .route("/auth/github/callback")
        .get(
          passport.authenticate("github", { failureRedirect: "/" }),
          (req, res) => {
            res.redirect("/profile");
          }
        );

      passport.use(
        new GitHubStrategy(
          {
            clientID: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
            callbackURL:
              "https://glitch.com/~bdev-node-express/auth/github/callback"
          },
          function(accessToken, refreshToken, profile, cb) {
            db.collection("socialusers").findAndModify(
              { id: profile.id },
              {},
              {
                $setOnInsert: {
                  id: profile.id,
                  name: profile.displayName || "John Doe",
                  photo: profile.photos[0].value || "",
                  email: profile.emails[0].value || "No public email",
                  created_on: new Date(),
                  provider: profile.provider || ""
                },
                $set: {
                  last_login: new Date()
                },
                $inc: {
                  login_count: 1
                }
              },
              { upsert: true, new: true },
              (err, doc) => {
                return cb(null, doc.value);
              }
            );
            //Database logic here with callback containing our user object
          }
        )
      );
      //start socket.io code

      io.use(
        passportSocketIo.authorize({
          cookieParser: cookieParser,
          key: "express.sid",
          secret: process.env.SESSION_SECRET,
          store: sessionStore
        })
      );

     
    var currentUsers = 0;  
    
    io.on('connection', socket => {
      
      ++currentUsers;
      console.log('user ' + socket.request.user.name + ' connected');
      io.emit('user', {name: socket.request.user.name, currentUsers, connected: true});
      
      socket.on('chat message', (message) => {
        io.emit('chat message', {name: socket.request.user.name, message});
      });

      socket.on('disconnect', () => {
        --currentUsers;
        io.emit('user', {name: socket.request.user.name, currentUsers, connected: true});
      });

    });

      //end socket.io code

      //Listen requests
      app.listen(process.env.PORT || 3000, () => {
        console.log("Listening on port " + process.env.PORT);
      });
    }
  }
);
