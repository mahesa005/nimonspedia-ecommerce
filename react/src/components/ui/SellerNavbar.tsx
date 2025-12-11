import { useState } from 'react';
import { Link } from 'react-router-dom';
import '../../styles/navbar_seller.css';

interface SellerNavbarProps {
  storeBalance: number;
  onLogout: () => void;
}

export default function SellerNavbar({ storeBalance, onLogout }: SellerNavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const formattedBalance = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(storeBalance);

  return (
    <header>
      <nav className="navbar">
        <a href="/seller/dashboard" className="navbar-brand">Nimonspedia Seller</a>

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
            <a href="/seller/dashboard" className="navbar-link">Dashboard</a>
            <a href="/seller/products" className="navbar-link">Produk</a>
            <a href="/seller/orders" className="navbar-link">Pesanan</a>
            <Link to="/seller/auctions" className="navbar-link">Lelang</Link>
            <Link to="/chat" className="navbar-link">Chat</Link>
          </div>

          <div className="navbar-actions">
            <div className="navbar-store-balance">
              {formattedBalance}
            </div>
            <button onClick={onLogout} className="navbar-logout">Logout</button>
          </div>
        </div>
      </nav>
    </header>
  );
}