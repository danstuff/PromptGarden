import express from 'express';
import passport from 'passport';

var loginRouter = express.Router();

loginRouter.get('/', function(req, res, next) {  
  res.render('login');
});
  
loginRouter.get('/auth/google', passport.authenticate('google', { 
  scope: [ 
    'https://www.googleapis.com/auth/userinfo.email', 
    'https://www.googleapis.com/auth/userinfo.profile',
  ],
}));

loginRouter.get('/auth/google/callback', passport.authenticate('google', {
  successRedirect: '/editor',
  failureRedirect: '/login',
}));

export { loginRouter };  