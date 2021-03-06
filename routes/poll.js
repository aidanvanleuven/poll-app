var express = require('express');
var router = express.Router();
var mysql = require('mysql2');
var config = require("../db_config.js");
const pool = mysql.createPool(config.connection);
var {
  nanoid
} = require("nanoid");
let io = require("../socketapi").io;

// Display the form for a new poll
router.get('/new', function(req, res) {
  res.render('new');
});

router.get("/view", function(req, res) {
  if (!req.session.votes) {
    return res.send("You haven't voted in any polls!");
  }

  var query = "SELECT * FROM questions WHERE QuestionID = ?";
  var addition = " OR QuestionID = ?";

  req.session.votes.forEach(function (e, i) {
    if (i != 0) {
      query += addition;
    }
  });

  query += " ORDER BY QuestionText";

  console.log(query);
  pool.execute(query, req.session.votes, function (err, rows) {
    if (err) {
      console.log(err);
    }
    res.locals.questionNames = rows;
    return res.render("list");
  });
});

// New poll
router.post('/save', function(req, res) {
  let questionId = nanoid(10);
  pool.execute(`INSERT INTO questions(QuestionID, QuestionText) VALUES(?, ?)`,
    [questionId, req.body.question],
    function(err) {
      if (err) {
        console.log(err);
        return res.status(err.status || 500);
      }


      var insert = "INSERT INTO answers (AnswerID, QuestionID, AnswerText) ";
      var values = "VALUES (?, ?, ?)";
      var params = ", (?, ?, ?)";
      var query = insert + values;
      var array = [];

      req.body.answers.forEach(function (element, index) {
        if (index != 0) {
          query += params;
        }
        array.push(nanoid(10));
        array.push(questionId);
        array.push(element);
      });

      console.log(query);
      pool.execute(query, array, function(err) {
        if (err) {
          console.log(err);
          return res.status(err.status || 500);
        }
      });


      res.json({
        "QuestionID": questionId
      });
    });
});

// Get an existing poll
router.get("/:id", function(req, res) {
  if (!req.session.votes) {
    req.session.votes = [];
  }

  pool.execute(
    `SELECT a.AnswerText, q.QuestionText, a.AnswerID, q.QuestionID, a.Votes
    FROM answers a
    INNER JOIN questions q ON q.QuestionID = a.QuestionID
    WHERE q.QuestionID = ?
    ORDER BY a.AnswerText`,
    [req.params.id],
    function(err, rows) {
      if (err) {
        res.locals.message = err.message;
        res.locals.error = req.app.get('env') === 'development' ? err : {};
        res.status(err.status || 500).render('error');
        return;
      }

      if (rows.length == 0) {
        res.locals.message = "Poll not found";
        res.locals.error = {};
        res.status(500).render('error');
        return;
      }

      var answers = [];
      var total = 0;
      rows.forEach(function(value, i) {
        var temp = {};
        temp.AnswerText = value.AnswerText;
        temp.AnswerID = value.AnswerID;
        temp.Votes = value.Votes;
        total += value.Votes;
        answers.push(temp);
      });

      res.locals.Answers = answers;
      res.locals.QuestionText = rows[0].QuestionText;
      res.locals.QuestionID = rows[0].QuestionID;
      res.locals.Host = req.headers;
      res.locals.Voted = req.session.votes.includes(req.params.id);
      res.locals.Total = total;

      res.render("poll");
    });
});

// Vote on a poll
router.post("/vote", function(req, res) {
  if (!req.body.QuestionID) {
    return res.status(err.status || 500);
  }

  if (!req.session.votes) {
    req.session.votes = [];
  }

  var v = req.session.votes.includes(req.body.QuestionID);

  if (req.body.results || v) {
    pool.execute(
      `SELECT a.AnswerText, q.QuestionText, a.AnswerID, q.QuestionID, a.Votes
      FROM answers a
      INNER JOIN questions q ON q.QuestionID = a.QuestionID
      WHERE q.QuestionID = ?`,
      [req.body.QuestionID],
      function(err, rows) {
        if (!v) {
          req.session.votes.push(req.body.QuestionID);
        }

        var answers = [];
        var total = 0;
        rows.forEach(function(value, i) {
          var temp = {};
          temp.AnswerID = value.AnswerID;
          temp.Votes = value.Votes;
          total += value.Votes;
          answers.push(temp);
        });

        return res.json({
          answers,
          "total": total,
          "voted": v
        });
      });
  } else {
    pool.execute(`UPDATE answers SET Votes=Votes+1 WHERE AnswerID = ?`, [req.body.AnswerID], function(err, rows) {
      if (err) {
        console.log(err);
        return res.status(err.status || 500);
      }

      pool.execute(
        `SELECT a.AnswerText, q.QuestionText, a.AnswerID, q.QuestionID, a.Votes
        FROM answers a
        INNER JOIN questions q ON q.QuestionID = a.QuestionID
        WHERE q.QuestionID = ?`,
        [req.body.QuestionID],
        function(err, rows) {
          req.session.votes.push(req.body.QuestionID);

          var answers = [];
          var total = 0;
          rows.forEach(function(value, i) {
            var temp = {};
            temp.AnswerID = value.AnswerID;
            temp.Votes = value.Votes;
            total += value.Votes;
            answers.push(temp);
          });

          io.to(req.body.QuestionID).emit('update', {
            answers,
            "total": total
          });

          res.json({
            answers,
            "total": total,
            "voted": v
          });
        });
    });
  }
});

module.exports = router;