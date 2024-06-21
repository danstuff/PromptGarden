import express from 'express';
import { checkAuth } from './utils/session.js';

var editorRouter = express.Router();

editorRouter.get('/', checkAuth, async function(req, res, next) {
  console.log(req.session.passport);
  res.render('editor');
});

export { editorRouter };
