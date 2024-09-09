const mongoose = require('mongoose');
const Session = require('./Session');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  date: {
    type: Date,
    default: Date.now
  }
});

UserSchema.pre('remove', async function(next) {
  try {
    await Session.deleteMany({ user: this._id });
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('user', UserSchema);