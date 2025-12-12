import { Router } from 'express';
import { cancelAuction, getAuctionDetail, stopAuction, createAuctionFromProduct, getAuctions } from '../controllers/auctionController';
import { verifySellerAuction } from '../middleware/verifySeller';
import { requireAuth } from '../middleware/requireSession';

const router = Router();

router.get('/', getAuctions);
router.get('/:id', getAuctionDetail);

router.post('/:id/cancel', requireAuth, verifySellerAuction, cancelAuction);

router.post('/:id/stop', requireAuth, verifySellerAuction, stopAuction);

router.post('/', requireAuth, createAuctionFromProduct);

router.get('/api/auth/validate-session', requireAuth, );

export default router;