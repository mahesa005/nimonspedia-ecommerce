import { Router } from 'express';
import { getAuctionDetail } from '../controllers/auctionController';

const router = Router();

router.get('/:id', getAuctionDetail);

export default router;