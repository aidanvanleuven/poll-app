var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var debug = require('debug')('poll-app:server');
var session = require('express-session');
var mysql = require('mysql2/promise');
var config = require("./db_config.js");
const pool = mysql.createPool(config.connection);
var MySQLStore = require('express-mysql-session')(session);

var options = {

};

var sessionStore = new MySQLStore(options, pool);

var indexRouter = require('./routes/index');
var pollRouter = require('./routes/poll');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev', { stream: { write: msg => debug(msg) } }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  key: 'session_cookie_name',
  cookie: {
    sameSite: true
  },
	secret: 'session_cookie_secret',
	store: sessionStore,
	resave: false,
	saveUninitialized: false
}));

app.use('/', indexRouter);
app.use('/poll', pollRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
