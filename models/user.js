var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var UserSchema = new Schema({
    admin:{
        type: Boolean,
        default: false
    }
});

UserSchema.plugin(passportLocalMongoose);

var Users = mongoose.model('user', UserSchema);

module.exports = Users;