import { Routes, Route, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import Header from './components/Header.jsx';
import BottomNav from './components/BottomNav.jsx';

import LoginPage from './pages/LoginPage.jsx';
import HomePage from './pages/HomePage.jsx';
import CategoryPage from './pages/CategoryPage.jsx';
import CartPage from './pages/CartPage.jsx';
import CheckoutPage from './pages/CheckoutPage.jsx';
import OrdersPage from './pages/OrdersPage.jsx';
import RideBookingPage from './pages/RideBookingPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';

import AdminPanel from './pages/AdminPanel.jsx';
import ShopkeeperPanel from './pages/ShopkeeperPanel.jsx';
import DriverPanel from './pages/DriverPanel.jsx';
import DeliveryPanel from './pages/DeliveryPanel.jsx';

function App() {
  const { isAuthenticated, isCustomer, isShopkeeper, isDriver, isDelivery, isAdmin } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-dvh bg-background font-sans">
      <Header />

      <main className="safe-bottom">
        {isAdmin() && <AdminPanel />}
        {isShopkeeper() && <ShopkeeperPanel />}
        {isDriver() && <DriverPanel />}
        {isDelivery() && <DeliveryPanel />}
        
        {isCustomer() && (
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/category/:categoryId" element={<CategoryPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/rides" element={<RideBookingPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        )}
      </main>

      {/* Only show bottom nav for customers, or maybe others too? For now, just customers. */}
      {isCustomer() && <BottomNav />}
    </div>
  );
}

export default App;
