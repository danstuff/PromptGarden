import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import passport from 'passport';
import GoogleStrategy from 'passport-google-oidc';
import pg from 'pg';

dotenv.config();

// Connect postgresql client
const pgClient = new pg.Client({
  host: process.env.PSQL_HOST,
  port: process.env.PSQL_PORT,
  database: process.env.PSQL_DATABASE,
  user: process.env.PSQL_USERNAME,
  password: process.env.PSQL_PASSWORD,
});
await pgClient.connect();

// Add google strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_API_CLIENT_ID,
    clientSecret: process.env.GOOGLE_API_CLIENT_SECRET,
    callbackURL: 'http://localhost:3000/login/auth/google/callback',
    passReqToCallback: true,
  }, 
  function (request, issuer, user, done) {
    addUserIfNew(user);
    return done(null, user);
  }
));

// Simple passport serialize/deserialize user
passport.serializeUser(function(user, done) {
  done(null, user);
});
passport.deserializeUser(function(user, done) {
  done(null, user);
});

// Report an error to console if in debug mode.
// @param error The error message to report
function appError(error) {
  if (process.env.APP_MODE == 'debug') {
    console.error(error);
  }
}

// Add a given user profile to the database and return true if they were not already there.
// @param user a Google user profile
// @return True if the given user profile is new to the database.
async function addUserIfNew(user) {
  var user_query = await pgClient.query(`select * from users where id = '${user.id}'`);
  if (user_query.rowCount <= 0) {
    await pgClient.query(`insert into users values('${user.id}')`);
    return true;
  }
  return false;
}

// Get the user profile for the given reqest if one exists.
// @param req The request handle
// @return The user profile for the request
function getUser(req) {
  if (process.env.APP_MODE == 'demo') {
    return { displayName: "Demo User" };
  } else {
    if (req && req.session && req.session.passport) {
      return req.session.passport.user;
    } else {
      appError('Failed to get google user');
      return null;
    }
  }
}

async function getContext(req) {
  if (process.env.APP_MODE == 'demo') {
    return [{ name: 'Sample Prompt 1', description: 'Provide some additional context for your AI chat.' }];
  } else {
    var user = getUser(req);
    if (user) {
      // TODO per-document contexts
      var prompt_query = await pgClient.query(`select * from prompts where userid = '${user.id}' and docname = 'default'`);
      return prompt_query.rows;
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
      'https://www.googleapis.com/auth/documents',
    ],
  })(req, res, next);
}

function authRedirect(req, res, next) {
  passport.authenticate('google', {
    successRedirect: '/editor',
    failureRedirect: '/login',
  })(req, res, next);
}


export { getUser, getContext, routeLogin, routeLogout, authCheck, authScope, authRedirect };