import express from 'express';

import { authCheck, getSessionUser } from './utils/session.js';
import { listDocuments, getDocument, putDocument } from './utils/drive.js';
import { getPrompts, putPrompts } from './utils/database.js';
import { appLog } from './utils/log.js';

var editorRouter = express.Router();

editorRouter.get('/', authCheck, async function(req, res, next) {
  res.render('editor', { user: getSessionUser(req) }); // TODO don't pass access token
});

editorRouter.get('/doc/list', authCheck, async function(req, res, next) {
  res.send({ files: await listDocuments(getSessionUser(req)) });
});

editorRouter.get('/doc/:id', authCheck, async function(req, res, next) {
  res.send(await getDocument(getSessionUser(req), req.params.id));
});

editorRouter.put('/doc/:id/', authCheck, async function(req, res, next) {
  // const user = getSessionUser(req);
  // TODO await putDocument(user, req.params.id, req.body.start, req.body.end, await getLLMReply(user, req.body.message));
  res.status(200).end();
});

editorRouter.get('/doc/:id/prompts', authCheck, async function(req, res, next) {
  res.send({ prompts: await getPrompts(getSessionUser(req), req.params.id) });
});

editorRouter.put('/doc/:id/prompts', authCheck, async function(req, res, next) {
  await putPrompts(getSessionUser(req), req.params.id, req.body.prompts);
  res.status(200).end();
});

export { editorRouter };
