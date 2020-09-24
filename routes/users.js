var express = require('express');
var router = express.Router();
const bodyParser = require('body-parser');
var User = require('../models/user');

router.use(bodyParser.json());

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

// Register a new user
router.post('/signup', function(req, res, next){
  User.findOne({username: req.body.username})
  .then((user) =>{
    // Check whether the username already exist
    if(user != null){
      var err = new Error('User '+ req.body.username + ' already exists');
      err.status = 403;
      next(err);
    } else {
      // If the username does not exist
      return User.create({
        username: req.body.username,
        password: req.body.password
      });
    }
  })
  .then((user)=>{
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({status: 'Registration Successfully! ', user: user});
  }, (err)=>next(err))
  .catch((err) => next(err))
});

// Sign in an account
router.post('/login', (req, res, next) => {
  // Check whether user is authenticated
  if(!req.session.user){
    var authHeader = req.headers.authorization;
    if(!authHeader){
      var err = new Error('You are not authenticated!');
      res.setHeader('WWW-Authenticate', 'Basic');
      err.status = 401;
      return next(err);
    }

    // Acquring the login information
    var auth = new Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');

    var username = auth[0];
    var password = auth[1];

    // Search whether the username exists
    User.findOne({username: username})
    .then((user)=>{
      if(user === null){
        var err = new Error('User '+username + ' does not exist!');
        res.setHeader('WWW-Authenticate', 'Basic');
        err.status = 403;
        return next(err);
      } else if (user.password !== password){
        var err = new Error('Your password is incorrect!');
        res.setHeader('WWW-Authenticate', 'Basic');
        err.status = 403;
        return next(err);
      } else if(user.username === username && user.password === password) {
        //res.cookie('user', 'admin', {signed: true})
        req.session.user = 'authenticated';
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        res.end('You are authenticated')
      } else {
        var err = new Error('You are not authenticated!');
        res.setHeader('WWW-Authenticate', 'Basic');
        err.status = 401;
        return next(err);
      }
    })
    .catch((err)=>next(err));  
  } else {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('You are already authenticated!');
  }
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
