import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [currentRole, setCurrentRole] = useState(null);

  // Load auth state from local storage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('jandahahub_user');
    const storedRole = localStorage.getItem('jandahahub_role');
    
    if (storedUser && storedRole) {
      setUser(JSON.parse(storedUser));
      setCurrentRole(storedRole);
      setIsAuthenticated(true);
    }
  }, []);

  const login = useCallback((userData, role) => {
    setUser(userData);
    setCurrentRole(role);
    setIsAuthenticated(true);
    localStorage.setItem('jandahahub_user', JSON.stringify(userData));
    localStorage.setItem('jandahahub_role', role);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setCurrentRole(null);
    setIsAuthenticated(false);
    localStorage.removeItem('jandahahub_user');
    localStorage.removeItem('jandahahub_role');
  }, []);

  // For testing/admin purposes, allow quick role switching if logged in
  const switchRole = useCallback((role) => {
    if (['customer', 'shopkeeper', 'driver', 'delivery', 'admin'].includes(role)) {
      setCurrentRole(role);
      localStorage.setItem('jandahahub_role', role);
    }
  }, []);

  const isCustomer = useCallback(() => currentRole === 'customer', [currentRole]);
  const isShopkeeper = useCallback(() => currentRole === 'shopkeeper', [currentRole]);
  const isDriver = useCallback(() => currentRole === 'driver', [currentRole]);
  const isDelivery = useCallback(() => currentRole === 'delivery', [currentRole]);
  const isAdmin = useCallback(() => currentRole === 'admin', [currentRole]);

  const value = useMemo(
    () => ({
      isAuthenticated,
      user,
      currentRole,
      login,
      logout,
      switchRole,
      isCustomer,
      isShopkeeper,
      isDriver,
      isDelivery,
      isAdmin,
    }),
    [isAuthenticated, user, currentRole, login, logout, switchRole, isCustomer, isShopkeeper, isDriver, isDelivery, isAdmin]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
