import { Request, Response } from 'express';
import { NavbarService } from '../services/navbarService';
import { getEffectiveFeatureFlag } from '../services/featureFlagService';

export const getNavbarData = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    
    if (!user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const data = await NavbarService.getNavbarData(user.user_id, user.role);

    const [chatFlag, auctionFlag, checkoutFlag] = await Promise.all([
        getEffectiveFeatureFlag({ userId: user.user_id, featureName: 'chat_enabled' }),
        getEffectiveFeatureFlag({ userId: user.user_id, featureName: 'auction_enabled' }),
        getEffectiveFeatureFlag({ userId: user.user_id, featureName: 'checkout_enabled' })
    ]);

    res.json({ 
      success: true, 
      data: {
        ...data,
          flags: {
              chat: chatFlag.enabled,
              auction: auctionFlag.enabled,
              checkout: checkoutFlag.enabled
          }
      } 
    });

  } catch (error) {
    console.error('Navbar Controller Error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};