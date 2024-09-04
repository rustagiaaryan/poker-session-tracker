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
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  location: {
    type: String
  },
  gameType: {
    type: String
  },
  notes: {
    type: String
  }
});

SessionSchema.virtual('profit').get(function() {
  return this.cashOut - this.buyIn;
});

SessionSchema.virtual('profitPerHour').get(function() {
  return (this.cashOut - this.buyIn) / (this.duration / 60);
});

SessionSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Session', SessionSchema);