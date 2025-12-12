import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../../styles/navbar_buyer.css';
import Toast from './toast';

interface BuyerNavbarProps {
  userBalance: number;
  cartItemCount: number;
  onLogout: () => void;
  onBalanceUpdate: (newBalance: number) => void;
  flags: { chat: boolean; auction: boolean; checkout: boolean };
}

export default function BuyerNavbar({ userBalance, cartItemCount, onLogout, onBalanceUpdate, flags }: BuyerNavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const formattedBalance = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(userBalance);

  const handleTopUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseInt(topUpAmount, 10);

    if (isNaN(amount) || amount < 1000) {
      Toast({message: "Tolong masukkan jumlah yang valid (minimal Rp 1.000)", type: "error", onClose: () => {}});
      return;
    }

    setIsLoading(true);

    try {
      const formData = new URLSearchParams();
      formData.append('amount', amount.toString());

      const res = await fetch('/api/buyer/balance/topup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
        credentials: 'include'
      });

      const json = await res.json();

      if (json.success) {
        Toast({message: json.message || 'Top up berhasil!', type: "success", onClose: () => {}});
        
        onBalanceUpdate(userBalance + amount); 
        
        setIsBalanceModalOpen(false);
        setTopUpAmount('');
      } else {
        Toast({message: json.message || 'Top up gagal.', type: "success", onClose: () => {}});
      }
    } catch (err) {
      console.error("Top up error:", err);
      Toast({message: 'Terjadi kesalahan saat memproses top up.', type: "error", onClose: () => {}});
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <header>
        <nav className="navbar">
          <a href="/" className="navbar-brand">Nimonspedia</a>

          <button 
            className={`navbar-toggle ${isMobileMenuOpen ? 'active' : ''}`} 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggle-icon"></span>
            <span className="navbar-toggle-icon"></span>
            <span className="navbar-toggle-icon"></span>
          </button>

          <div className={`navbar-menu ${isMobileMenuOpen ? 'active' : ''}`}>
             
             <div className="navbar-links">
                {flags.auction && (
                  <Link to="/auction" className="navbar-link">Lelang</Link>
                )}

                {flags.chat && (
                  <Link to="/chat" className="navbar-link">Chat</Link>
                )}
             </div>

             <div className="action-wrapper">
                <a href="/cart" className="navbar-cart">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512">
                    <path fill="#42b549" d="M0 24C0 10.7 10.7 0 24 0H69.5c22 0 41.5 12.8 50.6 32h411c26.3 0 45.5 25 38.6 50.4l-41 152.3c-8.5 31.4-37 53.3-69.5 53.3H170.7l5.4 28.5c2.2 11.3 12.1 19.5 23.6 19.5H488c13.3 0 24 10.7 24 24s-10.7 24-24 24H199.7c-34.6 0-64.3-24.6-70.7-58.5L77.4 54.5c-.7-3.8-4-6.5-7.9-6.5H24C10.7 48 0 37.3 0 24zM128 464a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zm336-48a48 48 0 1 1 0 96 48 48 0 1 1 0-96z"/>
                  </svg>
                  {cartItemCount > 0 && (
                    <div className="item-counter">{cartItemCount}</div>
                  )}
                </a>

                <button 
                  className="navbar-balance" 
                  onClick={() => setIsBalanceModalOpen(true)}
                >
                  {formattedBalance}
                </button>

                <div className="navbar-profile">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className="profile-icon">
                    <path fill="#42b549" d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512H418.3c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304H178.3z"/> 
                  </svg>

                  <ul className="profile-dropdown">
                    <li><a href="/profile">Profil</a></li>
                    <li><a href="/orders">Riwayat Pesanan</a></li>
                    <li><button onClick={onLogout} className="text-left w-full">Logout</button></li>
                  </ul>
                </div>
             </div>
          </div>
        </nav>
      </header>

      {/* Top Up Modal */}
      {isBalanceModalOpen && (
        <div className="fixed inset-0 z-1001 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
          <div className="bg-white p-8 rounded-lg shadow-xl w-[90%] max-w-[400px] relative text-center">
            <button 
              onClick={() => setIsBalanceModalOpen(false)}
              className="absolute top-2 right-4 text-2xl text-gray-400 hover:text-[#42b549]"
            >
              &times;
            </button>
            <h2 className="text-[#42b549] text-xl font-bold mb-2">Top Up Saldo</h2>
            <p className="text-gray-700 mb-4">Masukkan jumlah saldo yang ingin di-top up:</p>
            
            <form onSubmit={handleTopUpSubmit}>
              <div className="flex flex-col items-center gap-3 w-full max-w-[280px] mx-auto">
                <div className="flex items-center gap-2 w-full">
                  <label className="text-gray-500 font-normal">Rp</label>
                  <input 
                    type="number" 
                    value={topUpAmount}
                    onChange={(e) => setTopUpAmount(e.target.value)}
                    placeholder="Min 1.000" 
                    min="1000" 
                    step="1000"
                    className="flex-1 p-2 border border-gray-300 rounded focus:border-[#42b549] outline-none"
                    required 
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full bg-[#42b549] text-white font-semibold py-2 rounded-lg hover:bg-[#369b3f] transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Memproses...' : 'Top Up'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}