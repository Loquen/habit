var express = require('express');
var router = express.Router();
var habitsCtrl = require('../controllers/habits');

// GET /all Habits
router.get('/habits', habitsCtrl.index);
router.get('/habits/new', habitsCtrl.new);
router.post('/habits', habitsCtrl.create);


module.exports = router;
