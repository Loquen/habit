const User = require('../models/user');

module.exports = {
  index,
  new: newHabit
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

function newHabit(req, res, next){
  res.render('habits/new', {
    user: req.user,
    title: 'Add A New Habit'
  });
}