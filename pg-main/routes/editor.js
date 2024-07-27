import express from 'express';

import { authCheck, getSessionUser } from './utils/session.js';
import { listDocuments, getDocument, putDocument } from './utils/drive.js';
import { deletePersona, getPersonae, getPrompts, putPersona, putPrompt, deletePrompt } from './utils/database.js';
import { getLLMResponse } from './utils/llm.js';
import DOMPurify from 'isomorphic-dompurify';

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
  const doc_id = DOMPurify.sanitize(req.params.id);

  res.send(await getDocument(user, doc_id));
});

editorRouter.put('/doc/:id', authCheck, async function(req, res, next) {
  const user = getSessionUser(req);

  const doc_id = DOMPurify.sanitize(req.params.id);
  const doc_text = DOMPurify.sanitize(req.body.selection?.text);
  const doc_start = typeof(req.body.selection?.start) === 'number' ? req.body.selection?.start : 0;
  const doc_end = typeof(req.body.selection?.end) === 'number' ? req.body.selection?.end : 0;
  
  const prompts = await getPrompts(user, doc_id);
  const persona = DOMPurify.sanitize(req.body.persona);
  const query = DOMPurify.sanitize(req.body.query);
  
  const llm_res = await getLLMResponse(doc_text, persona, prompts, query);

  if (llm_res.status_code == 200) {
    const doc_status_code = await putDocument(
      user,
      doc_id,
      doc_start,
      doc_end,
      llm_res.text,
    );
    res.status(doc_status_code).end();
  } else {
    res.status(llm_res.status_code).end();
  }
});

editorRouter.get('/list/doc/:id/prompts', authCheck, async function(req, res, next) {
  const user = getSessionUser(req);
  const doc_id = DOMPurify.sanitize(req.params.id);

  res.send({ prompts: await getPrompts(user, doc_id) });
});

editorRouter.put('/doc/:id/prompt/:name', authCheck, async function(req, res, next) {
  const user = getSessionUser(req);
  const doc_id = DOMPurify.sanitize(req.params.id);
  const prompt_name = DOMPurify.sanitize(req.params.name);
  const prompt_description = DOMPurify.sanitize(req.body.description);

  const status_code = await putPrompt(user, doc_id, prompt_name, prompt_description);
  res.status(status_code).end();
});

editorRouter.delete('/doc/:id/prompt/:name', authCheck, async function(req, res, next) {
  const user = getSessionUser(req);
  const doc_id = DOMPurify.sanitize(req.params.id);
  const prompt_name = DOMPurify.sanitize(req.params.name);

  const status_code = await deletePrompt(user, doc_id, prompt_name);
  res.status(status_code).end();
});

editorRouter.get('/list/personae', authCheck, async function(req, res, next) {
  const user = getSessionUser(req);
  res.send({ personae: await getPersonae(user) });
});

editorRouter.put('/persona/:name', authCheck, async function(req, res, next) {
  const user = getSessionUser(req);
  const name = DOMPurify.sanitize(req.params.name);
  const description = DOMPurify.sanitize(req.body.description);

  const status_code = await putPersona(user, name, description);
  res.status(status_code).end();
});

editorRouter.delete('/persona/:name', authCheck, async function(req, res, next) {
  const user = getSessionUser(req);
  const name = DOMPurify.sanitize(req.params.name);

  const status_code = await deletePersona(user, name);
  res.status(status_code).end();
});

export { editorRouter };
