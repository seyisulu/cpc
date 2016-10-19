require('dotenv').config();

var express = require('express'),
    path = require('path'),
    favicon = require('serve-favicon'),
    logger = require('morgan'),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    chalk = require('chalk'),
    Client = require('node-rest-client').Client;
mongoose.Promise = global.Promise;
var app = express(),
    pro = app.get('env') !== 'development'? true: false,
    log = require('./log')({ chalk: chalk }),
    dbo = require('./dbo')({ mongoose: mongoose, log: log }),
    routeOpts = { dbo: dbo, log: log, router: express.Router(), client: new Client() },
    home = require('./routes/home')(routeOpts),
    apiv1 = require('./routes/apiv1')(routeOpts);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.set('view cache', pro);

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', home);
app.use('/api/v1', apiv1);

app.use('/bower_components', express.static(path.join(__dirname, '..', 'bower_components')));
app.use('/node_modules', express.static(path.join(__dirname, '..', 'node_modules')));
app.use(express.static(path.join(__dirname, 'public')));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});
// error handlers
if (!pro) {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}
// production error handler
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;
