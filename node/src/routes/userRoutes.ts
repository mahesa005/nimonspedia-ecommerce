import { Router } from 'express';
import { requireAuth } from '../middleware/requireSession';
import { getMe } from '../controllers/userController';

const router = Router();

router.get('/me', requireAuth, getMe);

export default router;