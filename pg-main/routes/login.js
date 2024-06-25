import express from 'express';
import passport from 'passport';
import { routeLogin, authScope, authRedirect } from './utils/session.js';

var loginRouter = express.Router();

loginRouter.get('/', routeLogin);
  
loginRouter.get('/auth/google', authScope);

loginRouter.get('/auth/google/callback', authRedirect);

export { loginRouter };  