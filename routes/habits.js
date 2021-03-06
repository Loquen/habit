var express = require('express');
var router = express.Router();
var habitsCtrl = require('../controllers/habits');

router.get('/habits', habitsCtrl.index);
router.get('/habits/new', isLoggedIn, habitsCtrl.new);
router.get('/habits/all', isLoggedIn, habitsCtrl.all);
router.get('/habits/visualize', isLoggedIn, habitsCtrl.visualize);
router.get('/habits/:id', isLoggedIn, habitsCtrl.edit);
router.post('/habits', isLoggedIn, habitsCtrl.create);
router.put('/habits/complete', isLoggedIn, habitsCtrl.complete);
router.put('/habits/:id', isLoggedIn, habitsCtrl.update);
router.delete('/habits/:id', isLoggedIn, habitsCtrl.delete);

function isLoggedIn(req, res, next) {
  if ( req.isAuthenticated() ) return next();
  res.redirect('/auth/google');
}

module.exports = router;
