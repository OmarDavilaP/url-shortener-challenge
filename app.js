const express = require('express');
require('dotenv').config(); // first fix solved, it seems dotenv was ommited even when the packages was included in the .json file.
const bodyParser = require('body-parser');
const url = require('./app/url/routes');
const app = express();
const path = require('path');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/', url);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json({
    message: err.message,
    code: err.status
  });
});

module.exports = app;
