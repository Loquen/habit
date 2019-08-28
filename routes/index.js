var express = require('express');
var router = express.Router();
var passport = require('passport');
var habitsCtrl = require('../controllers/habits');

/* GET home page. */
router.get('/', habitsCtrl.index);


// Google OAuth login route
router.get('/auth/google', passport.authenticate(
  'google',
  { scope: ['profile', 'email'] }
));
// Google OAuth callback route
router.get('/oauth2callback', passport.authenticate(
  'google',
  {
    successRedirect : '/habits',
    failureRedirect : '/habits'
  }
));
// OAuth logout route
router.get('/logout', function(req, res){
  req.logout();
  res.redirect('/habits');
});

module.exports = router;
