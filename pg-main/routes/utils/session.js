import dotenv from 'dotenv';
import passport from 'passport';
import GoogleStrategy from 'passport-google-oauth20';
import { addUserIfNew } from './database.js';

dotenv.config();

// Add google strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_API_CLIENT_ID,
    clientSecret: process.env.GOOGLE_API_CLIENT_SECRET,
    callbackURL: 'http://localhost:3000/login/auth/google/callback',
  }, 
  function (accessToken, refreshToken, profile, done) {
    profile.accessToken = accessToken;
    addUserIfNew(profile);
    return done(null, profile);
  }
));

// Simple passport serialize/deserialize user
passport.serializeUser(function(user, done) {
  done(null, user);
});
passport.deserializeUser(function(user, done) {
  done(null, user);
});

// Get the user profile for the given reqest if one exists.
// @param req The request handle
// @return The user profile for the request
function getSessionUser(req) {
  if (process.env.APP_MODE == 'demo') {
    return { displayName: 'Demo User' };
  } else {
    if (req.session?.passport?.user) {
      return req.session.passport.user;
    } else {
      appError('Get session user: Passport user not set');
      return { displayName: 'NULL' };
    }
  }
}

function routeLogin(req, res, next) {
  if (process.env.APP_MODE == 'demo') {
    res.redirect('/editor');
  } else {
    res.render('login');
  }
}

function routeLogout(req, res, next) {
  if (process.env.APP_MODE == 'demo') {
    res.redirect('/editor');
  } else {
    req.logOut(function() {
      res.redirect('/');
    });
  }
}

function authCheck(req, res, next) {
  if (req.isAuthenticated() || process.env.APP_MODE == 'demo') {
    return next();
  } else {
    res.redirect('/login');
  }
}

function authScope(req, res, next) {
  passport.authenticate('google', { 
    scope: [ 
      'https://www.googleapis.com/auth/userinfo.email', 
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/drive',
    ],
  })(req, res, next);
}

function authRedirect(req, res, next) {
  passport.authenticate('google', {
    successRedirect: '/editor',
    failureRedirect: '/login',
  })(req, res, next);
}


export { getSessionUser, routeLogin, routeLogout, authCheck, authScope, authRedirect };