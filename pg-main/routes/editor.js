import express from 'express';

import { authCheck, getSessionUser } from './utils/session.js';
import { listDocuments, getDocument, putDocument } from './utils/drive.js';
import { deletePersona, getPersonae, getPrompts, putPersona, putPrompts } from './utils/database.js';
import { getLLMReply } from './utils/llm.js';

var editorRouter = express.Router();

editorRouter.get('/', authCheck, async function(req, res, next) {
  const user = getSessionUser(req);
  res.render('editor', { user: { displayName: user.displayName } });
});

editorRouter.get('/list/docs', authCheck, async function(req, res, next) {
  const user = getSessionUser(req);
  res.send({ files: await listDocuments(user) });
});

editorRouter.get('/doc/:id', authCheck, async function(req, res, next) {
  const user = getSessionUser(req);
  res.send(await getDocument(user, req.params.id));
});

editorRouter.put('/doc/:id', authCheck, async function(req, res, next) {
  const user = getSessionUser(req);
  const status_code = await putDocument(
    user,
    req.params.id,
    req.body.selection.start,
    req.body.selection.end,
    await getLLMReply(req.body.selection.text, req.body.persona, req.body.message)
  );
  res.status(status_code).end();
});

// TODO singular prompt get/put/post/delete via UUIDs 
editorRouter.get('/doc/:id/prompts', authCheck, async function(req, res, next) {
  res.send({ prompts: await getPrompts(getSessionUser(req), req.params.id) });
});

editorRouter.put('/doc/:id/prompts', authCheck, async function(req, res, next) {
  const user = getSessionUser(req);
  const status_code = await putPrompts(user, req.params.id, req.body.prompts);
  res.status(status_code).end();
});

editorRouter.get('/list/personae', authCheck, async function(req, res, next) {
  const user = getSessionUser(req);
  res.send({ personae: await getPersonae(user) });
});

editorRouter.put('/persona/:name', authCheck, async function(req, res, next) {
  const user = getSessionUser(req);
  const status_code = await putPersona(user, req.params.name, req.body.description);
  res.status(status_code).end();
});

editorRouter.delete('/persona/:name', authCheck, async function(req, res, next) {
  const user = getSessionUser(req);
  const status_code = await deletePersona(user, req.params.name);
  res.status(status_code).end();
});

export { editorRouter };
