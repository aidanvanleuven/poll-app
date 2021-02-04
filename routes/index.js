var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  if (req.session.votes) {
    res.locals.hasVoted = req.session.votes.length != 0;
  } else {
    res.locals.hasVoted = false;
  }
  res.render('index');
});

module.exports = router;
