import { Router } from 'express';
import { requireAuth } from '../middleware/requireSession';
import { subscribe } from '../controllers/notificationController';

const router = Router();

router.post('/subscribe', requireAuth, subscribe);

export default router;