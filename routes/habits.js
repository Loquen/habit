var express = require('express');
var router = express.Router();
var habitsCtrl = require('../controllers/habits');

// GET /all Habits
router.get('/habits', habitsCtrl.index);
router.get('/habits/new', isLoggedIn, habitsCtrl.new);
router.post('/habits', isLoggedIn, habitsCtrl.create);

function isLoggedIn(req, res, next) {
  if ( req.isAuthenticated() ) return next();
  res.redirect('/auth/google');
}

module.exports = router;
