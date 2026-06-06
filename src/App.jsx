import { Routes, Route, useLocation } from 'react-router-dom'
import { useAuth } from './context/AuthContext.jsx'
import Header from './components/Header.jsx'
import BottomNav from './components/BottomNav.jsx'
import HomePage from './pages/HomePage.jsx'
import CategoryPage from './pages/CategoryPage.jsx'
import CartPage from './pages/CartPage.jsx'
import CheckoutPage from './pages/CheckoutPage.jsx'
import OrdersPage from './pages/OrdersPage.jsx'
import RideBookingPage from './pages/RideBookingPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import AdminPanel from './pages/AdminPanel.jsx'

function App() {
  const { isAdmin } = useAuth()
  const location = useLocation()

  // Determine if we should show the admin panel
  const showAdmin = isAdmin()

  return (
    <div className="min-h-dvh bg-background font-sans">
      <Header />

      {showAdmin ? (
        <main className="safe-bottom">
          <AdminPanel />
        </main>
      ) : (
        <main className="safe-bottom">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/category/:categoryId" element={<CategoryPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/rides" element={<RideBookingPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </main>
      )}

      <BottomNav />
    </div>
  )
}

export default App
