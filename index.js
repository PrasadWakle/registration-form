require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("cookie-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const path = require("path");


const port = process.env.PORT || 3000;


const app = express();

app.set("view engine", "ejs");

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.use(express.static("public"));

app.set('trust proxy', 1);

const secret = process.env.secret;

app.use(session({
cookie:{
    secure: true,
    maxAge:60000
       },
// store: MongoStore.create({ mongoUrl: process.env.DATABASE_URL }),
  secret: secret,
  saveUninitialized: true,
  resave: false
}));

app.use(function(req,res,next){
if(!req.session){
    return next(new Error('Oh no')) //handle error
}
next() //otherwise continue
});


app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

require("./src/db/connect") //connect to mongoDB database

const User = require("./src/models/register");// schema
// const { options } = require('nodemon/lib/config');


passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


//****************************************User Route**************************************************

app.get("/user", function (req, res) {
  if (req.isAuthenticated()) {
    User.findById(req.user.id, function (err, user) {
      if (err) {
        console.log(err);
        req.flash("message","Something went wrong");
        res.render("user",{
          message: req.flash("message")
        });
      } else {
        console.log(req.user.id);
        res.render("user", {
          firstName: user.firstName
        });
      }
    });
  } else {
    res.redirect("/login");
  }
});

//****************************************Register User**************************************************

app.get("/", function (req, res) {
  res.render("registration",{message:req.flash("message")});
});

app.post("/", function (req, res,next) {
  User.register(
    {
      firstName: (req.body.firstName).trim(),
      lastName: (req.body.lastName).trim(),
      username: (req.body.username).trim(),
      email: (req.body.email).trim(),
    },
    req.body.password,
    function (err) {
      if (err) {
        console.log(err);
        if(err.code == 11000){
          req.flash("message","A user with the given email is already registered");
        }
        if(err.name == "UserExistsError"){
          req.flash("message",err.message);
        }
        return res.redirect("/");
      }
      else{
        passport.authenticate("local")(req, res, function () {
          res.redirect("/user");
        });
      }
    }
  );
});

//****************************************Login User**************************************************

app.get("/login", function (req, res) {
  res.render("login",{message:req.flash("message"),messageSuccess:req.flash("messageSuccess")});
});

app.post("/login", function (req, res,next) {
  const user = new User({
    username: req.body.username,
    password: req.body.password,
  });


  passport.authenticate("local", function(err, user, info){
    if(err){
      req.flash("message",info.message);
      return next(err);
    }
    if(!user){
      req.flash("message",info.message);
      return res.redirect("/login");
    }

    req.login(user, function(err){
      if (err){
        console.log(err);
        return next(err)
      }
      else{
        res.redirect("/user");
      }
    })
  })(req,res,next);
 });



//****************************************Logout User**************************************************

app.get("/logout", function (req, res) {
  req.logout(function(err){
    if(!err){
      res.redirect("/login");
    }
    else{
      console.log(err);
      res.send("Something went wrong")
    }
  });
});

//****************************************Delete User**************************************************

app.post("/delete", function (req, res) {
  if (req.isAuthenticated()) {
    User.findByIdAndDelete(req.user.id , function (err) {
      if (err) {
        req.flash("message","Something went wrong")
        res.redirect("/updateUser");
      } else {
        req.flash("messageSuccess","Account deleted successfully");
        res.redirect("/login");
      }
    });
  } else {
    res.redirect("/login");
  }
});

//****************************************User Profile**************************************************

app.get("/profile", function (req, res) {

  if (req.isAuthenticated()) {
    User.findById(req.user.id, function (err, user) {
      if (err) {
        console.log(err);
        req.flash("message","Something went wrong")
      } else {
        res.render("profile", {
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
          email: user.email,
          message:req.flash("message")
        });
      }
    });
  } else {
    res.redirect("/login");
  }
});

//****************************************Update User**************************************************
app.get("/updateUser", function (req, res) {
  if (req.isAuthenticated()) {
    User.findById(req.user.id, function (err, user) {
      if (err) {
        console.log(err);
        req.flash("message","Something went wrong")
      } else {
        res.render("updateUser", {
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
          email: user.email,
          message:req.flash("message")
        });
      }
    });
  } else {
    res.redirect("/login");
  }
});

app.post("/updateUser", function (req, res) {
  if (req.isAuthenticated()) {
    User.findByIdAndUpdate(
      req.user.id,
      {
        firstName: (req.body.firstName).trim(),
        lastName: (req.body.lastName).trim(),
        username: (req.body.username).trim(),
        email: (req.body.email).trim(),
      },
      function (err, user) {
        if (err) {
          req.flash("message","Something went wrong")
        } else {
          req.flash("message","Profile updated successfully")
          res.redirect("/updateUser");
        }
      }
    );
  } else {
    res.redirect("/login");
  }
});


app.listen(port, function () {
  console.log("Server has started at port "+port);
});
