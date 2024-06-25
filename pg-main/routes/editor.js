import express from 'express';
import { authCheck, getUser } from './utils/session.js';

var editorRouter = express.Router();

editorRouter.get('/', authCheck, async function(req, res, next) {
  res.render('editor', { user: getUser(req) });
});

editorRouter.get('/prompts', authCheck, async function(req, res, next) {
  // TODO res.send(await getContext());
});

editorRouter.put('/prompts', authCheck, async function(req, res, next) {
  // TODO await updatePrompts(req);
  res.status(200).end();
});

editorRouter.get('/doc/list', authCheck, async function(req, res, next) {
  // TODO res.send(await listDocuments());
});

editorRouter.get('/doc', authCheck, async function(req, res, next) {
  // TODO res.send(await getDocument(req));
});

editorRouter.put('/doc', authCheck, async function(req, res, next) {
  // TODO await updateDocument(req);
  res.status(200).end();
});

editorRouter.post('/chat', authCheck, async function(req, res, next) {
  // TODO res.send(await getLLMReply(req));
});

export { editorRouter };
