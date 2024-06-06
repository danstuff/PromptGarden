var express = require('express');
var env = require('dotenv');
var router = express.Router();

env.config();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('chat');
});

module.exports = router;
