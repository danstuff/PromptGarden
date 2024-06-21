import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import passport from 'passport';
import GoogleStrategy from 'passport-google-oidc';
import pg from 'pg';

dotenv.config();

var pgClient = new pg.Client({
  host: process.env.PSQL_HOST,
  port: process.env.PSQL_PORT,
  database: process.env.PSQL_DATABASE,
  user: process.env.PSQL_USERNAME,
  password: process.env.PSQL_PASSWORD,
});
await pgClient.connect();

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_API_CLIENT_ID,
    clientSecret: process.env.GOOGLE_API_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/login/auth/google/callback",
    passReqToCallback: true,
  }, 
  function (request, issuer, profile, done) {
    addUserIfNew(profile);
    return done(null, profile);
  }
));

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

async function addUserIfNew(profile) {
  var user_query = await pgClient.query(`select * from users where id = '${profile.id}'`);
  if (user_query.rowCount <= 0) {
    await pgClient.query(`insert into users values('${profile.id}')`);
    return true;
  }
  return false;
}

function checkAuth(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  } else {
    res.redirect("/login");
  }
}

export { checkAuth, addUserIfNew };