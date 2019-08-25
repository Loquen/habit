var mongoose = require('mongoose');

var monthSchema = new mongoose.Schema({
  month: {
    type: Number,
    required: true
  },
  days: [{
    type: Boolean,
    default: false,
    required: true
  }]
}, {
  timestamps: true
});

var habitSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
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