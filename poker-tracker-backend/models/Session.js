const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  buyIn: {
    type: Number,
    required: true
  },
  cashOut: {
    type: Number,
    default: 0
  },
  duration: {
    type: Number,
    default: 0
  },
  gameType: {
    type: String,
    default: 'Texas Hold\'em'
  },
  stakes: {
    type: String,
    default: ''
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
  },
  notes: {
    type: String,
    default: ''
  },
  photos: [{
    type: String
  }]
});

SessionSchema.virtual('profit').get(function() {
  return this.cashOut - this.buyIn;
});

SessionSchema.virtual('profitPerHour').get(function() {
  const hours = this.duration / 60;
  return hours > 0 ? this.profit / hours : 0;
});

SessionSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Session', SessionSchema);