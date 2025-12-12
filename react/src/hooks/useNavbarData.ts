import { useState, useEffect, useCallback } from 'react';
import type { User } from '../types/user';

interface NavbarData {
  user: User | null;
  store: any | null;
  cartCount: number;
  flags: {
      chat: boolean;
      auction: boolean;
      checkout: boolean;
  };
  loading: boolean;
  refreshData: () => Promise<void>;
  handleLogout: () => void;
  updateLocalBalance: (newBalance: number) => void;
}

export const useNavbarData = (): NavbarData => {
  const [user, setUser] = useState<User | null>(null);
  const [store, setStore] = useState<any | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [flags, setFlags] = useState({ chat: true, auction: true, checkout: true });

  const fetchData = useCallback(async () => {
    try {
      const meRes = await fetch('/api/node/me', { credentials: 'include' });
      const meJson = await meRes.json();

      if (meJson.success) {
        setUser(meJson.data);

        const navRes = await fetch('/api/node/me/navbar', { credentials: 'include' });
        const navJson = await navRes.json();

        if (navJson.success) {
          setCartCount(navJson.data.cartCount);
          setStore(navJson.data.store);
          setFlags(navJson.data.flags);
        }
      }
    } catch (err) {
      console.error("Failed to load navbar data", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleLogout = () => {
    window.location.href = '/logout';
  };

  const updateLocalBalance = (newBalance: number) => {
    if (user) {
      setUser({ ...user, balance: newBalance });
    }
  };

  return { user, store, cartCount, flags, loading, refreshData: fetchData, handleLogout, updateLocalBalance };
};