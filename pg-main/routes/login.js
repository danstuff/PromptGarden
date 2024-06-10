import express from 'express';

var loginRouter = express.Router();

// GET login page
loginRouter.get('/', function(req, res, next) {
  res.render('login');
});

export { loginRouter };
