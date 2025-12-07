import { Request, Response } from 'express';
import { AuctionService } from '../services/auctionService';
import { AuctionDetailResponse } from '../models/auctionModel';

export const getAuctionDetail = async (req: Request, res: Response<AuctionDetailResponse>) => {
  try {
    const auctionId = parseInt(req.params.id || '');

    if (isNaN(auctionId)) {
      return res.status(400).json({ success: false, data: null,  message: 'Invalid Auction ID'});
    }

    const data = await AuctionService.getAuctionPageData(auctionId);

    if (!data) {
      return res.status(404).json({ success: false, data: null,  message: 'Auction not found' });
    }

    res.json({ success: true, data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, data: null,  message: 'Internal Server Error' });
  }
};