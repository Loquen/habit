var express = require('express');
var router = express.Router();
var habitsCtrl = require('../controllers/habits');

// GET /students
router.get('/habits', habitsCtrl.index);

module.exports = router;
