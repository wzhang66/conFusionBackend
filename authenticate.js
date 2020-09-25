var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('./models/user');
var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var jwt = require('jsonwebtoken');

var config = require('./config');


exports.local = passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
// serializeUser() and deserializeUser() are functions provided by the passport-local-mongoose plugin

// Issue a json web token with payload as user and the secretKey from config file
exports.getToken = function(user) {
    return jwt.sign(user, config.secretKey, {
        expiresIn: 3600
    });
}

// Specify some options for jwt strategy
var opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.secretKey;

exports.jwtPassport = passport.use(new JwtStrategy(opts, 
    (jwt_payload, done) => {
        console.log('JWT payload: ', jwt_payload);
        User.findOne({_id: jwt_payload._id}, (err, user) => {
            if(err) {
                // if err does not exist, use null, use false for user not exists.
                return done(err, false);
            } else if (user) {
                return done(null, user);
            } else {
                return done(null, false)
            }
        });
    }));

// we do not create session in this case.
exports.verifyUser = passport.authenticate('jwt', {session: false})