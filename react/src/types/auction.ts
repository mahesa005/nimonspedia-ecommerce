import type { ApiResponse } from "./response";

export interface AuctionData {
  auction_id: number;
  product_id: number;
  starting_price: number;
  current_price: number;
  min_increment: number;
  quantity: number;
  start_time: Date;
  end_time: Date | null;
  status: 'scheduled' | 'active' | 'ongoing' | 'ended' | 'cancelled';
  winner_id: number | null;
  created_at: Date;
}

export interface BidData {
  bid_id: number;
  auction_id: number;
  bidder_id: number;
  bid_amount: string;
  bid_time: Date;
}

export interface AuctionDetailData extends AuctionData {
  product_name: string;
  description: string;
  main_image_path: string;
  
  store_id: number;
  store_name: string;
  store_description: string;
  
  bidder_count: number;
}

export interface BidHistoryData extends BidData {
  bidder_name: string;
}

export interface PublicBid extends BidHistoryData {
  is_mine?: boolean;
}

export type AuctionDetailResponse = ApiResponse<{
  auction: AuctionDetailData;
  bids: PublicBid[];
}>;


export interface PlaceBidPayload {
  auctionId: number;
  amount: number;
}

export interface NewBidEvent {
  bid_id: number;
  bidder_id: number;
  auction_id: number;
  amount: number;
  bidder_name: string;
  time: string;
  new_end_time: string;
}

export interface AuctionStartedEvent {
  status: 'active';
  message: string;
}

export interface AuctionEndedEvent {
  auctionId: number;
  winnerId: number | null;
  finalPrice: number;
}

export interface BidErrorEvent {
  message: string;
  code?: string;
}

export interface OrderInsertResult {
  order_id: number;
}

export interface OrderDetailsQuery {
  store_id: number;
  address: string | null;
}