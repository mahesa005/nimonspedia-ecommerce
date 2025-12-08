import { Request, Response } from 'express';
import { AuctionService } from '../services/auctionService';
import { AuctionDetailResponse, AuctionResponse } from '../models/auctionModel';

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

export const cancelAuction = async (req: Request, res: Response<AuctionResponse>) => {
  try {
    const auctionId = parseInt(req.params.id || '');
    const { reason } = req.body;

    if (isNaN(auctionId)) {
      return res.status(400).json({ success: false, data: null, message: 'Invalid Auction ID' });
    }

    if (!reason || reason.trim() === '') {
      return res.status(400).json({ success: false, data: null, message: 'Cancel reason is required' });
    }

    const auction = await AuctionService.cancelAuction(auctionId, reason);

    if (!auction) {
      return res.status(404).json({ success: false, data: null, message: 'Auction not found or cannot be cancelled' });
    }

    res.json({ success: true, data: auction, message: 'Auction cancelled successfully' });

  } catch (error: any) {
    console.error(error);
    res.status(500).json({ success: false, data: null, message: 'Internal Server Error' });
  }
};

export const stopAuction = async (req: Request, res: Response<AuctionResponse>) => {
  try {
    const auctionId = parseInt(req.params.id || '');

    if (isNaN(auctionId)) {
      return res.status(400).json({ success: false, data: null, message: 'Invalid Auction ID' });
    }

    const auction = await AuctionService.finalizeAuction(auctionId);

    if (!auction) {
      return res.status(404).json({ success: false, data: null, message: 'Auction not found or cannot be stopped' });
    }

    res.json({ success: true, data: auction, message: 'Auction stopped successfully' });

  } catch (error: any) {
    console.error(error);
    res.status(500).json({ success: false, data: null, message: 'Internal Server Error' });
  }
};