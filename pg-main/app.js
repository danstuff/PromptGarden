import dotenv from 'dotenv';

import createError from 'http-errors';
import path from 'path';
import cookieParser from 'cookie-parser';

import logger from 'morgan';
import express from 'express';

import { indexRouter } from './routes/index.js';
import { loginRouter } from './routes/login.js';
import { createRouter } from './routes/create.js';
import { userRouter } from './routes/user.js';

dotenv.config();
var app = express();

// view engine setup
app.set('views', path.join(import.meta.dirname, 'views'));
app.set('view engine', 'pug');

// use modules
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRET));

// use static routes
app.use(express.static(path.join(import.meta.dirname, 'public')));
app.use(express.static(path.join(import.meta.dirname, 'node_modules', 'jquery', 'dist')));
app.use(express.static(path.join(import.meta.dirname, 'node_modules', 'bootstrap', 'dist')));
app.use(express.static(path.join(import.meta.dirname, 'node_modules', 'bootstrap-icons')));

// router setup
app.use('/', indexRouter);
app.use('/login', loginRouter);
app.use('/create', createRouter);
app.use('/user', userRouter);

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

export { app };
