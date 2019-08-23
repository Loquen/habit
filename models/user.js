var mongoose = require('mongoose');

var monthSchema = new mongoose.Schema({
  month: {
    type: Date,
    required
  },
  days: [{
    type: Boolean,
    default: false,
    required
  }]
}, {
  timestamps: true
});

var habitSchema = new mongoose.Schema({
  name: {
    type: String,
    required
  },
  category: String,
  months: [monthSchema]
}, {
  timestamps: true
});

var userSchema = new mongoose.Schema({
  name: String,
  email: String,
  avatar: String,
  habits: [habitSchema],
  googleId: String
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);