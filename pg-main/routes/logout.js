import express from 'express';
import { routeLogout } from './utils/session.js';

var logoutRouter = express.Router();

logoutRouter.get('/', routeLogout);

export { logoutRouter };  