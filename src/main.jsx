import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { CartProvider } from './context/CartContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { OrderProvider } from './context/OrderContext.jsx'
import './index.css'

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {})
  })
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <OrderProvider>
            <App />
          </OrderProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
