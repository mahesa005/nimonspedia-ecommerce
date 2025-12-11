import { Router } from 'express';
import { cancelAuction, getAuctionDetail, stopAuction, getAuctions } from '../controllers/auctionController';
import { cancelAuction, getAuctionDetail, stopAuction, createAuctionFromProduct } from '../controllers/auctionController';
import { verifySellerAuction } from '../middleware/verifySeller';
import { requireAuth } from '../middleware/requireSession';

const router = Router();

router.get('/', getAuctions);
router.get('/:id', getAuctionDetail);

router.post('/:id/cancel', requireAuth, verifySellerAuction, cancelAuction);

router.post('/:id/stop', requireAuth, verifySellerAuction, stopAuction);

router.post('/', requireAuth, createAuctionFromProduct);

export default router;