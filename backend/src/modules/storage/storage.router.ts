import { Router } from 'express';
import { getFile } from './storage.controller';
import { requireSession } from '../../middleware/auth.middleware';

export const storageRouter = Router();

// Only authenticated users can access stored files (reports, images)
storageRouter.get('/*key', requireSession, getFile);

