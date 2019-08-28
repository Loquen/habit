const User = require('../models/user');
const moment = require('moment');

module.exports = {
  index,
  new: newHabit,
  create,
  delete: deleteHabit,
  edit,
  update,
  complete
};

function index(req, res, next){
  if(req.user){
    res.render('habits/index', {
      user: req.user,
      habits: req.user.habits,
      month: getCurrentMonth(),
      today: getCurrentDay(),
      title: `${req.user.name.substring(0, req.user.name.indexOf(" "))}'s Habits`
    });
  } else {
    res.render('habits/index', {
      user: null,
      habits: null,
      month: null,
      today: null,
      title: 'Praxis'
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

  newMonth.month = getCurrentMonth();
  let numberOfDays = getNumberOfDays(newMonth.month);
  let days = new Array(numberOfDays).fill(false);
  newMonth.days = days;
  newHabit.months = new Array(newMonth);

  req.user.habits.push(newHabit);
  req.user.save()
    .then(() => {
      res.redirect('/habits');
    })
    .catch(err => {
      console.log(err);
      res.redirect('/habits');
    });
}

function deleteHabit(req, res, next){
  req.user.habits.forEach((habit,idx) => {
    if(habit.id === req.params.id){
      console.log(habit);
      req.user.habits.splice(idx, 1);
      req.user.save()
        .then(user => {
          res.redirect('/habits');
        })
        .catch(err => {
          console.log(err);
          res.redirect('/habits');
        });
    }
  });
}

function edit(req, res){
  req.user.habits.forEach((habit, idx) => {
    if(habit.id === req.params.id){
      res.render('habits/edit', {
        habit,
        user: req.user,
        title: 'Update Habit',
        name: habit.name,
        category: habit.category
      });
    }
  })
}

function update(req, res){
  // Loop through habits looking for req.params.id
  req.user.habits.forEach((habit, idx) => {
    if(habit.id === req.params.id){
      habit.name = req.body.name;
      habit.category = req.body.category;
      req.user.save(function(err){
        res.redirect('/habits');
      });
    }
  });
}

function complete(req, res){
  let today = getCurrentDay();
  let completedHabits = Object.keys(req.body);
  let hidx = [];
  let midx = [];

  // User.findById(req.user.id, function(err, user){
    req.user.habits.forEach((h, habitIndex) => {
      if(completedHabits.includes(h.name)){
        h.months.forEach((m, monthIndex) => {
          if(today.m === m.month){
            hidx.push(habitIndex);
            midx.push(monthIndex);
            console.log(today.date);
            req.user.habits[habitIndex].months[monthIndex].days[today.date - 1] = true;
            // console.log(m.days[today.date - 1], '///////////////');
          
          }
        });
      }
    });
    req.user.save()
    .then(user => {
      console.log(user);
      res.redirect('/habits');
      console.log(req.user.habits[hidx[0]].name, '########## OUTSIDE ##########');
      console.log(req.user.habits[hidx[0]].months[midx[0]].days, '/////////// OUTSIDE /////////');
    })
    .catch(err => {
      console.log(err);
    });
  // });
}

/********** HELPER FUNCTIONS *********/

function getCurrentMonth(){
  let month = new Date;
  return month.getMonth() + 1;
}

function getNumberOfDays(month){
  return moment(month).daysInMonth();
}

function getCurrentDay(){
  let date = moment();
  let today = {
    date: parseInt(date.format('D')), // Number
    day: date.format('ddd'), // Sun
    dayOfWeek: date.format('d'), // Number
    do: date.format('Do'), // 1st
    m: parseInt(date.format('M')), // Number
    month: date.format('MMM') // Aug
  };
  return today;
}