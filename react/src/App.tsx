import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { socket } from './socket';
import AdminLoginPage from './pages/admin/AdminLoginPage';

// Placeholder Components
const Chat = () => <h1 className="text-3xl font-bold text-blue-500">Chat Page</h1>;
const AuctionList = () => <h1 className="text-3xl font-bold text-green-600">Auction List Page</h1>;
const AuctionDetail = () => <h1 className="text-3xl font-bold text-blue-600">Auction Detail Page (ID: ?)</h1>;
const AdminDashboard = () => <h1 className="text-3xl font-bold text-red-600">Admin Dashboard</h1>;
const NotFound = () => <h1 className="text-xl text-gray-500">404 - Page Not Found</h1>;
function App() {
  
  useEffect(() => {
    socket.connect();

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/auction" />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/auction" element={<AuctionList />} />
        <Route path="/auction/:id" element={<AuctionDetail />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;