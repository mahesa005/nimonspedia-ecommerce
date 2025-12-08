import { Router } from 'express';
import { cancelAuction, getAuctionDetail, stopAuction } from '../controllers/auctionController';
import { verifySellerAuction } from '../middleware/verifySeller';
import { requireAuth } from '../middleware/requireSession';

const router = Router();

router.get('/:id', getAuctionDetail);

router.post('/:id/cancel', requireAuth,verifySellerAuction, cancelAuction);

router.post('/:id/stop', requireAuth,verifySellerAuction, stopAuction);

export default router;