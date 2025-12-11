import { Router } from 'express';
import { requireAuth } from '../middleware/requireSession';
import { getMe } from '../controllers/userController';
import { getNavbarData } from '../controllers/navbarController';

const router = Router();

router.get('/me', requireAuth, getMe);
router.get('/me/navbar', requireAuth, getNavbarData);

export default router;