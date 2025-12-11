import { Request, Response } from 'express';
import { AuctionService } from '../services/auctionService';
import { AuctionDetailResponse, AuctionResponse } from '../models/auctionModel';
import { Server } from 'socket.io';

export const getAuctionDetail = async (req: Request, res: Response<AuctionDetailResponse>) => {
  try {
    const auctionId = parseInt(req.params.id || '');

    if (isNaN(auctionId)) {
      return res.status(400).json({ success: false, data: null, message: 'Invalid Auction ID' });
    }

    const data = await AuctionService.getAuctionPageData(auctionId);

    if (!data) {
      return res.status(404).json({ success: false, data: null, message: 'Auction not found' });
    }

    res.json({ success: true, data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, data: null, message: 'Internal Server Error' });
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

    const io: Server = req.app.get('io');

    io.to(`auction_${auctionId}`).emit('auction_cancelled', {
      auctionId,
      reason: auction.cancel_reason,
      status: 'cancelled'
    });

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

    const io: Server = req.app.get('io');

    io.to(`auction_${auctionId}`).emit('auction_ended', {
      auctionId,
      winnerId: auction.winner_id,
      finalPrice: Number(auction.current_price)
    });

    res.json({ success: true, data: auction, message: 'Auction stopped successfully' });

  } catch (error: any) {
    console.error(error);
    res.status(500).json({ success: false, data: null, message: 'Internal Server Error' });
  }
};

export const getAuctions = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string || '1');
    const limit = parseInt(req.query.limit as string || '12');
    const search = (req.query.search as string) || '';
    const status = (req.query.status as string) || 'active';

    const result = await AuctionService.getAuctions(page, limit, search, status);
    res.json({ success: true, ...result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
export const createAuctionFromProduct = async (
  req: Request,
  res: Response<AuctionResponse>
) => {
  try {
    const {
      productId,
      startingPrice,
      minIncrement,
      quantity,
      startTime,
      endTime,
    } = req.body as {
      productId?: number;
      startingPrice?: number;
      minIncrement?: number;
      quantity?: number;
      startTime?: string;
      endTime?: string;
    };

    // Ambil sellerId dari session / auth
    const sellerId =
      (req as any).user?.user_id;

    if (!sellerId) {
      return res
        .status(401)
        .json({ success: false, data: null, message: 'Unauthorized' });
    }

    // Validasi basic di controller
    if (!productId || isNaN(productId)) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'productId is required and must be a number',
      });
    }

    if (!startingPrice || startingPrice <= 0) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'startingPrice must be greater than 0',
      });
    }

    if (!minIncrement || minIncrement <= 0) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'minIncrement must be greater than 0',
      });
    }

    if (!quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'quantity must be greater than 0',
      });
    }

    if (!startTime || !endTime) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'startTime and endTime are required',
      });
    }

    const auction = await AuctionService.createAuctionForProduct({
      sellerId,
      productId,
      startingPrice,
      minIncrement,
      quantity,
      startTime,
      endTime,
    });

    return res.status(201).json({
      success: true,
      data: auction,
      message: 'Auction created successfully',
    });
  } catch (error: any) {
    console.error('Error creating auction:', error);

    if (error instanceof Error) {
      if (error.message === 'PRODUCT_NOT_FOUND') {
        return res.status(404).json({
          success: false,
          data: null,
          message: 'Product not found',
        });
      }
      if (error.message === 'FORBIDDEN') {
        return res.status(403).json({
          success: false,
          data: null,
          message: 'You are not allowed to create auction for this product',
        });
      }
      if (error.message === 'INVALID_QUANTITY') {
        return res.status(400).json({
          success: false,
          data: null,
          message: 'Quantity exceeds product stock or invalid',
        });
      }
      if (error.message === 'AUCTION_ALREADY_EXISTS') {
        return res.status(400).json({
          success: false,
          data: null,
          message: 'There is already an active auction for this product',
        });
      }
      if (error.message === 'CREATE_FAILED') {
        return res.status(500).json({
          success: false,
          data: null,
          message: 'Failed to create auction',
        });
      }
    }

    return res.status(500).json({
      success: false,
      data: null,
      message: 'Internal Server Error',
    });
  }
};