import { Router } from "express";
import { requireAuth } from "../middleware/requireSession";
import { getChatRooms, getRoomMessages, sendMessage } from "../controllers/chatController";
import { requireStore } from "../middleware/requireStore";

const router = Router();

router.get('/', requireAuth, getChatRooms);

router.get('/buyer/messages', requireAuth, getRoomMessages);

router.get('/seller/messages', requireAuth, requireStore, getRoomMessages);

router.post('/send', requireAuth, sendMessage);

export default router;