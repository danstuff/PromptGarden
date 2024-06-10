import express from 'express';

var createRouter = express.Router();

// GET login page
createRouter.get('/', function(req, res, next) {
  res.render('create');
});

export { createRouter };
