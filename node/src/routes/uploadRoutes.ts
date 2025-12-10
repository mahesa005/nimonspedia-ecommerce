import { Router } from 'express';
import { requireAuth } from '../middleware/requireSession';
import { serveFile, upload, uploadImage } from '../controllers/uploadController';

const router = Router();

router.post('/', requireAuth, upload.single('image'), uploadImage);

router.get('/:subfolder/:filename', requireAuth, serveFile);

export default router;