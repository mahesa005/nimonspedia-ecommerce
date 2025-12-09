import { Router } from 'express';
import { requireAuth } from '../middleware/requireSession';
import { subscribe, triggerNotification } from '../controllers/notificationController';

const router = Router();

router.post('/subscribe', requireAuth, subscribe);
router.post('/trigger', triggerNotification);

export default router;