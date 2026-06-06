import { createContext, useContext, useState, useCallback, useMemo } from 'react';

const AuthContext = createContext(null);

const MOCK_USER = {
  name: 'Amit Kumar',
  phone: '9876543210',
  address: 'Ward 7, Jandaha, Vaishali',
  avatar: '👤',
};

export function AuthProvider({ children }) {
  const [currentRole, setCurrentRole] = useState('customer');
  const [user] = useState(MOCK_USER);

  const switchRole = useCallback((role) => {
    if (['customer', 'admin', 'rider'].includes(role)) {
      setCurrentRole(role);
    }
  }, []);

  const isCustomer = useCallback(() => {
    return currentRole === 'customer';
  }, [currentRole]);

  const isAdmin = useCallback(() => {
    return currentRole === 'admin';
  }, [currentRole]);

  const isRider = useCallback(() => {
    return currentRole === 'rider';
  }, [currentRole]);

  const value = useMemo(
    () => ({
      currentRole,
      user,
      switchRole,
      isCustomer,
      isAdmin,
      isRider,
    }),
    [currentRole, user, switchRole, isCustomer, isAdmin, isRider]
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
