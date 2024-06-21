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

// Verify google cookies, then add a cookie to a user session to keep them logged in. 
// @param req the request handle.
// @return the google user ID if found.
async function createUserSession(req, res) {
  // Verify google cross-site request forgery token
  let g_csrf_cookie = req.cookies['g_csrf_token'];
  let g_csrf_body = req.body['g_csrf_token'];
  if (!g_csrf_cookie || !g_csrf_body || g_csrf_body != g_csrf_cookie) {
    console.error("Failed to verify cross-site request forgery token.");
  }

  // Verify google ID token and get payload
  const g_ticket = await oAuthClient.verifyIdToken({
    idToken: req.body['credential'],
    audience: process.env.GOOGLE_API_CLIENT_ID,
  });

  const g_payload = g_ticket.getPayload();
  const g_user = {
    id: g_payload['sub'],
    name: g_payload['given_name'],
    picture: g_payload['picture'],
    is_new: false,
  }

  if (!g_user.id) {
    console.error("Failed to get Google User ID.");
  }

  // Add or update user
  var user_query = await pgClient.query(`select * from users where id = '${g_user.id}'`);
  if (user_query.rowCount <= 0) {
    await pgClient.query(`insert into users values('${g_user.id}', '${g_user.name}', '${g_user.picture}')`);
    g_user.is_new = true;
  }
  else {
    await pgClient.query(`update users set name = '${g_user.name}', picture = '${g_user.picture}' where id = '${g_user.id}'`);
  }

  // Create a new session token
  const session_token = uuidv4();
  
  const now = new Date();
  const expires = new Date(now + 30 * 1000 * 60 * 60 * 24); // 30 days from now

  await pgClient.query(`insert into sessions values('${session_token}', '${g_user.id}', ${expires.getTime()})`);

  res.cookie('session_token', session_token, { expires: expires });

  return g_user;
}

// Get the session token for a given request and return the user ID for that session.
// @param req the request handle.
// @return the google user ID if found, 0 otherwise.
async function getSessionUser(req) {
  const token = req.cookies['session_token'];
  console.log(req.cookies);
  if (!token) {
    return;
  }

  var session_query = await pgClient.query(`select * from sessions where token = '${token}'`);
  var session = session_query.rows[0];
  if (!session) {
    return;
  }

  if (session.expires < Date.now()) {
    await pgClient.query(`delete from sessions where token = '${token}'`);
    return;
  }
  
  var user_query = await pgClient.query(`select * from users where id = '${session.userid}'`);
  return user_query.rows[0];
}

// Delete a session token if one exists for the current session.
// @parm req The request handle
// @param res The response handle
async function endSession(req, res) {
  const token = req.cookies['session_token'];
  if (!token) {
    return;
  }

  await pgClient.query(`delete from sessions where token = '${token}'`);
  res.clearCookie('session_token');
}

export { checkAuth, addUserIfNew };