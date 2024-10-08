import dotenv from 'dotenv';
import pg from 'pg';
import { appError, appLog } from './log.js';

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

function dbValid(user, args) {
  if (process.env.APP_MODE == 'demo') {
    appLog('Database disabled in demo mode');
    return false;
  }

  if (!user || user.id == 0) {
    appError(`Invalid user`);
    return false;
  }
  
  for (var i in args) {
    if (args[i] == null || args[i] == '0' || args[i] == 'undefined') {
      appError(`Argument ${i} is invalid`);
      return false;
    }
  }

  return true;
}

// Add a given user profile to the database and return true if they were not already there.
// @param user a Google user profile
// @return True if the given user profile is new to the database.
async function addUserIfNew(user) {
  if (!dbValid(user)) {
    return false;
  }

  var user_query = await pgClient.query(
      `select * from users where id = '${user.id}'`
  );
  if (user_query.rowCount <= 0) {
    await pgClient.query(
      `insert into users values('${user.id}')`
    );
    return true;
  }
  return false;
}

async function getPrompts(user, documentid) {
  if (!dbValid(user, [ documentid ])) {
    return [{ 
      name: 'Sample Prompt 1',
      description: 'Provide some additional context for your AI chat.' 
    }];
  }

  var prompt_query = await pgClient.query(
    `select * from prompts where userid = '${user.id}' and documentid = '${documentid}'`
  );
  return prompt_query.rows;
}

async function putPrompt(user, documentid, name, description) {
  if (!dbValid(user, [ documentid, name, description ])) {
    return 400;
  }

  var exists_query =
    await pgClient.query(
      `select * from prompts where userid = '${user.id}' and documentid = '${documentid}' and name = '${name}'`);

  if (exists_query.rowCount > 0) {
    await pgClient.query(
      `update prompts set description = '${description}' where userid = '${user.id}' and documentid = '${documentid}' and name = '${name}'`);
  }
  else {
    await pgClient.query(
      `insert into prompts values ` +
      `('${user.id}', '${documentid}', '${name}', '${description}')`
    );
  }

  return 200;
}

async function deletePrompt(user, documentid, name) {
  if (!dbValid(user, [ documentid, name ])) {
    return 400;
  }

  await pgClient.query(
    `delete from prompts where userid = '${user.id}' and documentid = '${documentid}' and name = '${name}'`);

  return 200;
}

async function getPersonae(user) {
  if (!dbValid(user)) {
    return;
  }

  var persona_query =
    await pgClient.query(`select * from personae where userid = '${user.id}'`);

  return persona_query.rows;
}

async function putPersona(user, name, description) {
  if (!dbValid(user, [ name, description ])) {
    return 400;
  }

  var exists_query =
    await pgClient.query(`select * from personae where userid = '${user.id}' and name = '${name}'`);

  if (exists_query.rowCount > 0) {
    await pgClient.query(
      `update personae set description = '${description}' where userid = '${user.id}' and name = '${name}'`);
  }
  else {
    await pgClient.query(
      `insert into personae values ('${user.id}', '${name}', '${description}')`);
  }

  return 200;
}

async function deletePersona(user, name) {
  if (!dbValid(user, [ name ])) {
    return 400;
  }

  await pgClient.query(
    `delete from personae where userid = '${user.id}' and name = '${name}'`);

  return 200;
}

export { addUserIfNew, getPrompts, putPrompt, deletePrompt, getPersonae, putPersona, deletePersona };