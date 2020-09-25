var express = require('express');
var router = express.Router();
const bodyParser = require('body-parser');
var User = require('../models/user');
var passport = require('passport');
var authenticate = require('../authenticate');


router.use(bodyParser.json());

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

// Register a new user
router.post('/signup', function(req, res, next){
  User.register(new User({username: req.body.username}), 
    req.body.password, 
    (err, user) => {
    if(err){
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.json({err: err})
    } else {
      passport.authenticate('local')(req, res, ()=>{
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({success: true ,status: 'Registration Successfully! '});
      });
    }
  });
});

// Sign in an account
router.post('/login', passport.authenticate('local'), (req, res, next) => {
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
