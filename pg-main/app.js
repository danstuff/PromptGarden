import dotenv from 'dotenv';
import createError from 'http-errors';
import path from 'path';
import logger from 'morgan';
import passport from 'passport';
import express from 'express';
import session from 'express-session';

import { editorRouter } from './routes/editor.js';
import { loginRouter } from './routes/login.js';
import { logoutRouter } from './routes/logout.js';

dotenv.config();
var app = express();

// view engine setup
app.set('views', path.join(import.meta.dirname, 'views'));
app.set('view engine', 'pug');

// use modules
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(session({
  secret: process.env.COOKIE_SECRET,
  resave: false,
  saveUninitialized: true,
}));
app.use(passport.initialize());
app.use(passport.session());

// use static routes
app.use(express.static(path.join(import.meta.dirname, 'public')));
app.use(express.static(path.join(import.meta.dirname, 'node_modules', 'bootstrap', 'dist', 'css')));
app.use(express.static(path.join(import.meta.dirname, 'node_modules', 'bootstrap', 'dist', 'js')));
app.use(express.static(path.join(import.meta.dirname, 'node_modules', 'jquery', 'dist')));
app.use(express.static(path.join(import.meta.dirname, 'node_modules', 'dompurify', 'dist')));

// router setup
app.use('/editor', editorRouter);
app.use('/login', loginRouter);
app.use('/logout', logoutRouter);

// TODO index page, for now redirect to login
app.get('/', function(req, res, next) {  
  res.redirect('/login');
});

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
