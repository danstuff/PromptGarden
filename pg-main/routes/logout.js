import express from 'express';

var logoutRouter = express.Router();

logoutRouter.get('/', async function(req, res, next) {
  req.logOut(function() {
    res.redirect('/');
  });
});

export { logoutRouter };  