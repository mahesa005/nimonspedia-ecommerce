import { Request, Response } from 'express';
import { NavbarService } from '../services/navbarService';

export const getNavbarData = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    
    if (!user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const data = await NavbarService.getNavbarData(user.user_id, user.role);

    res.json({ 
      success: true, 
      data 
    });

  } catch (error) {
    console.error('Navbar Controller Error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};