const passport = require("passport");
const bcrypt = require("bcrypt");

module.exports = function(app, db) {
  // create the middleware function
  function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect("/");
  }

  //


  //Render page
  app.route("/").get((req, res) => {
    res.render(process.cwd() + "/views/pug/index", {
      title: "Hello",
      message: "login",
      showLogin: true,
      showRegistration: true
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
      var hash = bcrypt.hashSync(req.body.password, 12);
      db.collection("users").findOne({ username: req.body.username }, function(
        err,
        user
      ) {
        if (err) {
          next(err);
        } else if (user) {
          res.redirect("/");
        } else {
          //Create BCrypt variable

          db.collection("users").insertOne(
            {
              username: req.body.username,
              password: hash
            },
            (err, user) => {
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
    passport.authenticate("local", {
      //  successRedirect:"/profile",
      failureRedirect: "/"
    }),
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
};
