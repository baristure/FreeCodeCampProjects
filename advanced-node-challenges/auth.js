const session     = require('express-session');
const passport    = require('passport');
const ObjectID    = require('mongodb').ObjectID;
const LocalStrategy = require('passport-local');
const bcrypt      = require('bcrypt');
var GitHubStrategy = require('passport-github').Strategy;
module.exports = function (app,db) {
  
  app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
  }));
  app.use(passport.initialize());
  app.use(passport.session());
  
      //serialization and app.listen
      //Serialize and Deserialize User Functions
      passport.serializeUser((user, done) => {
        done(null, user._id);
      });
      passport.deserializeUser((id, done) => {
        db.collection("users").findOne(
          { _id: new ObjectID(id) },
          (err, doc) => {
            done(null, doc);
          }
        );
      });

  passport.use(new LocalStrategy(
    function(username, password, done) {
      db.collection('users').findOne({ username: username }, function (err, user) {
        console.log('User '+ username +' attempted to log in.');
        if (err) { return done(err); }
        if (!user) { return done(null, false); }
        if (!bcrypt.compareSync(password, user.password)) { return done(null, false); }
        //if (password !== user.password) { return done(null, false); }
        return done(null, user);
      });
    }
  ));
  /*
  passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
callbackURL:'https://glitch.com/~bdev-node-express/auth/github/callback'
  },
function(accessToken, refreshToken, profile, cb) {
    console.log(profile);
    //Database logic here with callback containing our user object
  }
));
  */
  
}