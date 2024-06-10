import dotenv from 'dotenv';
import express from 'express';

import pg from 'pg';
import OpenAI from 'openai';

dotenv.config();
var userRouter = express.Router();

var pgClient = new pg.Client({
  host: process.env.PSQL_HOST,
  port: process.env.PSQL_PORT,
  database: process.env.PSQL_DATABASE,
  user: process.env.PSQL_USERNAME,
  password: process.env.PSQL_PASSWORD,
});
await pgClient.connect();

var openai = new OpenAI({
  organization: process.env.OPENAI_ORG_ID,
  project: process.env.OPENAI_PROJECT_ID,
  apiKey: process.env.OPENAI_API_KEY,
});

/* GET users listing. */
userRouter.get('/', async function(req, res, next) {
  var query_result = await pgClient.query('select * from users');
  res.send(query_result.rows);
});

export { userRouter };
