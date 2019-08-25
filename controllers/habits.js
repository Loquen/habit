const User = require('../models/user');
const moment = require('moment');

module.exports = {
  index,
  new: newHabit,
  create
};

function index(req, res, next){
  console.log(req.query)
  // Make the query object to use with Student.find based up
  // the user has submitted the search form or now
  let modelQuery = req.query.name ? {name: new RegExp(req.query.name, 'i')} : {};
  // Default to sorting by name
  let sortKey = req.query.sort || 'name';
  User.find(modelQuery)
  .sort(sortKey).exec(function(err, user) {
    if (err) return next(err);
    // Passing search values, name & sortKey, for use in the EJS
    res.render('habits/index', {
      user: req.user,
      name: req.query.name,
      sortKey,
      title: 'All Habits'
    });
  });
}

// Render new habit page
function newHabit(req, res, next){
  res.render('habits/new', {
    user: req.user,
    title: 'Add A New Habit'
  });
}

// Create a new habit
function create(req, res, next){
  // What info do we have?
  // Grab current month
  // create array of month.daysInMonth() with default False values
  let newHabit = req.body;
  let newMonth = {};
  let month = new Date;
  month = month.getMonth() + 1;
  newMonth.month = month; 
  let numberOfDays = moment(month).daysInMonth();
  let days = new Array(numberOfDays).fill(false);
  newMonth.days = days;
  newHabit.months = new Array(newMonth);
  console.log(newHabit);
  res.redirect('/habits');
}