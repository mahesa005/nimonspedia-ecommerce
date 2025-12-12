import { NavbarRepository } from '../repositories/navbarRepository';

interface NavbarDataResponse {
  cartCount: number;
  store: any | null;
}

export const NavbarService = {
  async getNavbarData(userId: number, role: string): Promise<NavbarDataResponse> {
    const response: NavbarDataResponse = {
      cartCount: 0,
      store: null
    };

    if (role === 'BUYER') {
      response.cartCount = await NavbarRepository.getCartCount(userId);
    }

    if (role === 'SELLER') {
      response.store = await NavbarRepository.getStoreByUserId(userId);
    }

    return response;
  }
};