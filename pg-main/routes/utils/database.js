import dotenv from 'dotenv';
import pg from 'pg';
import { appError } from './log.js';

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

// Add a given user profile to the database and return true if they were not already there.
// @param user a Google user profile
// @return True if the given user profile is new to the database.
async function addUserIfNew(user) {
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
  if (process.env.APP_MODE == 'demo') {
    return [{ 
      header: 'Sample Prompt 1',
      description: 'Provide some additional context for your AI chat.' 
    }];
  } else if (user && documentid) {
    var prompt_query = await pgClient.query(
      `select * from prompts where userid = '${user.id}' and documentid = '${documentid}'`
    );
    return prompt_query.rows;
  } else {
    appError('GET Prompts: User or document ID not given'); 
  }
}

// TODO race condition here: if two PUTs are done in quick succession, leads to dupe entries.
async function putPrompts(user, documentid, prompts) {
  if (process.env.APP_MODE == 'demo') {
    return;
  }
  else if (user && documentid != '0' && documentid != 'undefined') {
    await pgClient.query(
      `delete from prompts where userid = '${user.id}' and documentid = '${documentid}'`
    );
    for (var i in prompts) {
      await pgClient.query(
        `insert into prompts values ` +
        `('${user.id}', '${documentid}', '${prompts[i].header}', '${prompts[i].description}')`
      );
    }
  } else {
    appError('PUT Prompts: User or doc ID not provided'); 
  }
}

export { addUserIfNew, getPrompts, putPrompts };