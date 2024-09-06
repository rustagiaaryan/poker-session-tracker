const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  buyIn: {
    type: Number,
    required: true
  },
  cashOut: {
    type: Number
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date
  },
  duration: {
    type: Number
  },
  gameType: {
    type: String
  },
  stakes: {
    type: String
  },
  setting: {
    type: String
  },
  sessionType: {
    type: String
  },
  notes: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

module.exports = mongoose.model('Session', SessionSchema);