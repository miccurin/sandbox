var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var Schema = mongoose.Schema;

var userSchema = new Schema({
  username: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  department: { type: String, required: true },
  group: { type: String, required: true },
  added: { type: Date, default: Date.now },
  updated: { type: Date, default: Date.now }
});

/*
// execute before each user.save() call
userSchema.pre('save', function(callback) {
  var user = this;

  // Break out if the password hasn't changed
  if (!user.isModified('password')) return callback();

  // Password changed so we need to hash it
  bcrypt.genSalt(5, function(err, salt) {
    if (err) return callback(err);

    bcrypt.hash(user.password, null, null, function(err, hash) {
      if (err) return callback(err);
      user.password = hash;
      callback();
    });
  });
});

userSchema.methods.verifyPassword = function(password, cb) {
  bcrypt.compare(password, this.password, function(err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};

userSchema.methods.validPassword = function(password) {
  bcrypt.compare(password, this.password, function(err, isMatch) {
    return isMatch;
  });
};
*/

module.exports = mongoose.model('User', userSchema);
