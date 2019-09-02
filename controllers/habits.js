// const User = require('../models/user');
const moment = require('moment');

module.exports = {
  index,
  new: newHabit,
  create,
  delete: deleteHabit,
  edit,
  update,
  complete,
  all,
  visualize
};

function index(req, res){
  // Only populate habits object with habits in the correct category
  let habits = [];
  let categories = new Set(); // Sets only allow an item to occur once
  let month = getCurrentMonth();
  let today = getCurrentDay();
  let daysToRender = {};

  // Initialize our days object that will be rendered with the 4 days
  daysToRender.today = today;
  daysToRender.month = month;
  daysToRender.habits = [];

  if(req.user){
    let save = false;
    req.user.habits.forEach(h => {
      let monthFlag = false;
      h.months.forEach(m => {
        if(month === m.month) categories.add(h.category);
        if(month === m.month) monthFlag = true;
      });

      if(!monthFlag){
        // We need to add the current month for this habit
        let newMonth = createNewMonth();
        h.months.push(newMonth);
        save = true;
      }
    });

    // We have a new month to add to the users habits, we need to save
    if(save){
      req.user.save()
        .then(() => {
          res.redirect('/habits');
        })
        .catch(err => {
          console.log(err);
          res.redirect('/habits');
        });
    }

    // Building the days to render object
    // we need the habit name and an array of objects that contains the date, month and complete?
    req.user.habits.forEach(h => {
      let habit = {};
      habit.name = h.name;
      habit.days = [];
      switch (today.date) {
        case 1:
          // Add the last 3 days of the prev month and 1 of this month
          h.months.forEach(m => {
            if(m.month === month - 1){
              let prevMonthDays = getNumberOfDays(month - 1);
              for(let i = 1; i <= 3; i++){
                habit.days.push({
                  month: month - 1,
                  date: prevMonthDays - 3 + i,
                  complete: m.days[prevMonthDays - 4 + i]
                });
              }
            }else if(month === m.month){
              habit.days.push({
                month,
                date: today.date,
                complete: m.days[today.date - 1]
              });
            }
          });
          break;
        case 2:
          // Add last 2 days of prev month and first 2 of this month
          h.months.forEach(m => {
            if(m.month === month - 1){
              let prevMonthDays = getNumberOfDays(month - 1);
              for(let i = 1; i <= 2; i++){
                habit.days.push({
                  month: month - 1,
                  date: prevMonthDays - 2 + i,
                  complete: m.days[prevMonthDays - 3 + i]
                });
              }
            }else if(month === m.month){
              for(let i = 0; i <= 1; i++){
                habit.days.push({
                  month,
                  date: today.date + i - 1,
                  complete: m.days[today.date + i - 1]
                });
              }
            }
          });
          break;
        case 3:
          // Add the last day of prev month and first 3 of this month
          h.months.forEach(m => {
            let prevMonthDays = getNumberOfDays(month - 1);
            if(m.month === month - 1){
              habit.days.push({
                month: month - 1,
                date: prevMonthDays,
                complete: m.days[prevMonthDays - 1]
              });
            }else if(month === m.month){
              for(let i = 1; i <= 3; i++){
                habit.days.push({
                  month,
                  date: i,
                  complete: m.days[i - 1]
                });
              }
            }
          });
          break;
        default: 
          // Add the past 4 days including today
          h.months.forEach(m => {
            if(month === m.month){
              m.days.forEach((d, i) => {
                if(i === today.date - 4 || i === today.date - 3 || i === today.date - 2 || i === today.date - 1){
                  habit.days.push({
                    month,
                    date: i + 1,
                    complete: m.days[i]
                  });
                }
              });
            }
          });
      }
      daysToRender.habits.push(habit);
    });

    console.log(daysToRender);

    if(req.query.category && req.query.category !== 'All Habits'){ // We have a valid query
      req.user.habits.forEach(h => {
        if(h.category === req.query.category){ // The current habit is in the queried category
          h.months.forEach(m => {
            if(month === m.month){ // The current habit is in the queried month
              habits.push(h);
            }
          });
        }
      });
    }else{ // No query or All Habits, render all habits
      req.user.habits.forEach(h => {
        h.months.forEach(m => {
          if(month === m.month){ // The current habit is in the queried month
            habits.push(h);
          }
        });
      });
    }

    res.render('habits/index', {
      user: req.user,
      habits,
      daysToRender,
      allHabits: req.user.habits,
      categories: Array.from(categories).sort(),
      month,
      today,
      title: `${req.user.name.substring(0, req.user.name.indexOf(" "))}'s Habits`,
      nav: 'Today'
    });
  }else{
    res.render('habits/index', {
      user: null,
      habits: null,
      daysToRender: null,
      month: null,
      today: null,
      categories: null,
      title: 'Praxis',
      nav: 'Today'
    });
  }
}

// Render new habit page
function newHabit(req, res){
  res.render('habits/new', {
    user: req.user,
    title: 'Add A New Habit',
    nav: 'New'
  });
}

// Create a new habit
function create(req, res){
  let newHabit = req.body;
  let newMonth = {};
  let today = getCurrentDay();

  newMonth.month = getCurrentMonth();
  let numberOfDays = getNumberOfDays(newMonth.month);
  let days = new Array(numberOfDays).fill(false);
  newMonth.days = days;
  newMonth.year = today.year;
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

function deleteHabit(req, res){
  req.user.habits.forEach((habit,idx) => {
    if(habit.id === req.params.id){
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
        category: habit.category,
        nav: 'Edit'
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

// To mark a habit complete, find the checked habits and traverse users' habits for current month/day
function complete(req, res){
  let today = getCurrentDay();
  let completedHabits = Object.keys(req.body);
  completedHabits = completedHabits.slice(0, completedHabits.length-1);

  req.user.habits.forEach((h, habitIndex) => {
    if(completedHabits.includes(h.name)){
      h.months.forEach((m, monthIndex) => {
        if(today.m === m.month) req.user.habits[habitIndex].months[monthIndex].days.set((today.date - 1), true);
      });
    }else{
      h.months.forEach((m, monthIndex) => {
        if(today.m === m.month) req.user.habits[habitIndex].months[monthIndex].days.set((today.date - 1), false);
      });
    }
  });

  req.user.save()
    .then(() => {
      res.redirect('/habits');
    })
    .catch(err => {
      console.log(err);
    });
}

function all(req, res){
  let month = parseInt(req.query.month);
  let daysInMonth = getNumberOfDays(month);
  let habits = [];
  let monthsFilter = new Set(); // Sets only allow an item to occur once

  req.user.habits.forEach(h => {
    h.months.forEach(m => {
      monthsFilter.add(m.month);
    });
  });

  if(req.query.month && req.query.month !== 'All Months'){ // We have a valid query
    req.user.habits.forEach(h => {
      h.months.forEach(m => {
        if(m.month.toString() === req.query.month){ // The current habit is in the queried month
          habits.push(h);
        }
      });
    });
  }else{ // No query or All Habits, render all habits
    habits = req.user.habits;
    month = getCurrentMonth();
    daysInMonth = getNumberOfDays(month);
  }
  
  res.render('habits/all', {
    user: req.user,
    habits,
    allHabits: req.user.habits,
    month,
    daysInMonth,
    monthsFilter: Array.from(monthsFilter).sort((a, b) =>  b-a),
    today: getCurrentDay(),
    title: `All Habits`,
    nav: 'All Habits'
  });
}

function visualize(req, res){
  let habits = new Object();
  let habit = {};

  req.user.habits.forEach((habit, idx) => {
    habits[habit.name] = {
          total: 0,
          streak: 0,
          dayTotal: {
            'Sun': 0, 
            'Mon': 0,
            'Tue': 0,
            'Wed': 0,
            'Thu': 0,
            'Fri': 0,
            'Sat': 0 
          }
        }
    currentStreak = 0;

    habit.months.forEach(month => {
      month.days.forEach((day, idx) => {
        if(day){
          habits[habit.name].total++; // Increment the total
          if(habits[habit.name].streak === 0 && currentStreak === 0){ // First streak
            habits[habit.name].streak = 1;
          }else if(habits[habit.name].streak > currentStreak && month.days[idx-1]){
            habits[habit.name].streak++;
          }
          let dayOfWeek = moment({
            y: month.year,
            M: month.month - 1,
            d: idx + 1
          }).format('ddd');
          habits[habit.name].dayTotal[dayOfWeek]++;
        }else{
          currentStreak = 0;
        }
      });
    });
  });

  if(req.query.habit){
    habit = habits[req.query.habit];
    habit.name = req.query.habit;
  } else {
    habit = Object.values(habits)[0];
    habit.name = Object.keys(habits)[0];
  }

  res.render('habits/visualize',{
    user: req.user,
    habit,
    habitFilter: Object.keys(habits),
    title: `Visualize Your Habits`,
    nav: 'Visualize'
  });
}

/********** HELPER FUNCTIONS *********/

function getCurrentMonth(){
  let month = new Date;
  return month.getMonth() + 1;
}

function getNumberOfDays(month){
  return moment(month, 'M MM').daysInMonth();
}

function getCurrentDay(){
  let date = moment();
  let today = {
    date: parseInt(date.format('D')), // 29 Number
    day: date.format('ddd'), // Sun
    dayOfWeek: date.format('d'), // 5 Number
    do: date.format('Do'), // 1st
    m: parseInt(date.format('M')), // 8 Number
    month: date.format('MMM'), // Aug
    year: date.format('YYYY') // 2019 Number
  };
  return today;
}

function createNewMonth(){
  let newMonth = {};
  let today = getCurrentDay();

  newMonth.month = getCurrentMonth();
  let numberOfDays = getNumberOfDays(newMonth.month);
  let days = new Array(numberOfDays).fill(false);
  newMonth.days = days;
  newMonth.year = today.year;
  
  return newMonth;
}