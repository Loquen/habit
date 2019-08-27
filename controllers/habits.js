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
    User.findById(req.user.id, function(err, user){
      res.render('habits/index', {
        user: req.user,
        habits: user.habits,
        month: getCurrentMonth(),
        today: getCurrentDay(),
        title: `${req.user.name.substring(0, req.user.name.indexOf(" "))}'s Habits`
      });
    });
  } else {
    res.render('habits/index', {
      user: null,
      habits: null,
      month: null,
      today: null,
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

function deleteHabit(req, res, next){
  console.log(req.params.id);
  User.findById(req.user.id, function(err, user){
    if(err) {
      return res.render('habits');
    }

    user.habits.forEach((habit,idx) => {
      if(habit.id === req.params.id){
        console.log(habit);
        user.habits.splice(idx, 1);
        user.save(function(err){
          res.redirect('/habits');
        });
      }
    });
  });
}

function edit(req, res){
  User.findById(req.user.id, function(err, user){
    user.habits.forEach((habit, idx) => {
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
  });
}

function update(req, res){
  User.findById(req.user.id, function(err, user){
    // Loop through habits looking for req.params.id
    user.habits.forEach((habit, idx) => {
      if(habit.id === req.params.id){
        habit.name = req.body.name;
        habit.category = req.body.category;
        // console.log(req.body.name, req.body.category);
        user.save(function(err){
          res.redirect('/habits');
        });
      }
    });
  });
}

function complete(req, res){
  let today = getCurrentDay();
  let completedHabits = Object.keys(req.body);

  User.findById(req.user.id, function(err, user){
    console.log(user.habits);
    for(h in user.habits){
      if(completedHabits.includes(h.name)){
        h.months.forEach(m => {
          if(today.month === m.month){
            m.days[today.date - 1] = true;
            // user.save(function(err){
              res.redirect('/habits');
            // });
          }
        });
      }
    };
  });
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
    date: parseInt(date.format('D')),
    day: date.format('ddd'),
    dayOfWeek: date.format('d'),
    do: date.format('Do'),
    month: date.format('MMM')
  };
  return today;
}