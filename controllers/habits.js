const User = require('../models/user');
const moment = require('moment');

module.exports = {
  index,
  new: newHabit,
  create
};

function index(req, res, next){
  if(req.user){
    User.findById(req.user.id, function(err, user){
      res.render('habits/index', {
        user: req.user,
        habits: user.habits,
        month: getCurrentMonth(),
        title: 'All Habits'
      });
    });
  } else {
    res.render('habits/index', {
      user: null,
      habits: null,
      month: null,
      title: 'All Habits'
    })
  }
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
  let newHabit = req.body;
  let newMonth = {};
  // let month = new Date;
  // month = month.getMonth() + 1;
  newMonth.month = getCurrentMonth();
  let numberOfDays = getNumberOfDays(newMonth.month);
  let days = new Array(numberOfDays).fill(false);
  newMonth.days = days;
  newHabit.months = new Array(newMonth);

  // console.log(newMonth, '//////////////');
  User.findById(req.user.id, function(err, user){
    user.habits.push(newHabit);
    user.save(function(err){
      res.redirect('/habits');
    })
  });
  // res.redirect('/habits');
}

/********** HELPER FUNCTIONS *********/

function getCurrentMonth(){
  let month = new Date;
  return month.getMonth() + 1;
}

function getNumberOfDays(month){
  return moment(month).daysInMonth();
}