var express = require('express');
var router = express.Router();
const bodyParser = require('body-parser');
var User = require('../models/user');
var passport = require('passport');
var authenticate = require('../authenticate');
const cors = require('./cors');


router.use(bodyParser.json());

/* GET users listing. */
router.route('/')
.get(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, function(req, res, next) {
  User.find({})
    .then((user) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(user);
    }, (err) => next(err))
    .catch((err) => next(err));
});

// Register a new user
router.post('/signup', cors.corsWithOptions, function(req, res, next){
  User.register(new User({username: req.body.username}), 
    req.body.password, 
    (err, user) => {
    if(err){
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.json({err: err});
    } else {
      if (req.body.firstname) {
        user.firstname = req.body.firstname;
      } 
      if (req.body.lastname) {
        user.lastname = req.body.lastname;
      }
      user.save((err, user) => {
        if(err){
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.json({err: err});
          return ;
        } else {
          passport.authenticate('local')(req, res, ()=>{
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json({success: true ,status: 'Registration Successfully! '});
          });
        }
      });
      
    }
  });
});

// Sign in an account
router.post('/login', cors.corsWithOptions,  passport.authenticate('local'), (req, res, next) => {
  // Create a token
  var token = authenticate.getToken({_id: req.user._id});
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.json({success: true, token: token, status: 'Log in Successfully! '});
});

// Log out endpoint
router.get('/logout',(req, res, next)=>{
  if(req.session){
    // End the session by using the destroy() function remove the session in the server side
    // Delete the cookie in the client side
    req.session.destroy();
    res.clearCookie('session-id');
    res.redirect('/');
  } else {
    var err = new Error('You are not logged in!');
    err.status = 403;
    next(err);
  }
});

module.exports = router;
