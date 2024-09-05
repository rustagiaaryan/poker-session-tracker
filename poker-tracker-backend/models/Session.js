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
  notes: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  setting: {
    type: String,
    enum: ['In Person', 'Online'],
    default: 'In Person'
  },
  sessionType: {
    type: String,
    enum: ['Cash', 'Tournament'],
    default: 'Cash'
  }
});

module.exports = mongoose.model('Session', SessionSchema);