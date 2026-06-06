import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../config/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [currentRole, setCurrentRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize and listen to Supabase Auth state
  useEffect(() => {
    // Check active sessions and sets the user
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await fetchUserProfile(session.user);
      } else {
        setLoading(false);
      }
    };

    fetchSession();

    // Listen for changes on auth state (sign in, sign out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await fetchUserProfile(session.user);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setCurrentRole(null);
        setIsAuthenticated(false);
        localStorage.removeItem('jandahahub_role'); // Clear explicit role override
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (authUser) => {
    try {
      // Fetch custom profile from our public.profiles table
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (profile) {
        setUser({ ...authUser, ...profile });
        
        // If we stored a temporary role override in localStorage for testing, use it
        // Otherwise use the role from the database.
        const storedOverride = localStorage.getItem('jandahahub_role');
        setCurrentRole(storedOverride || profile.role || 'customer');
        setIsAuthenticated(true);
      } else if (error && error.code === 'PGRST116') {
        // Profile doesn't exist yet, create one!
        const newProfile = {
          id: authUser.id,
          name: authUser.user_metadata?.full_name || 'New User',
          phone: authUser.phone || null,
          role: 'customer',
          avatar: authUser.user_metadata?.avatar_url || '👤'
        };
        
        await supabase.from('profiles').insert([newProfile]);
        
        setUser({ ...authUser, ...newProfile });
        setCurrentRole('customer');
        setIsAuthenticated(true);
      }
    } catch (err) {
      console.error("Error fetching user profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
    if (error) throw error;
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  // For testing purposes, allow quick role switching if logged in
  const switchRole = useCallback(async (role) => {
    if (['customer', 'shopkeeper', 'driver', 'delivery', 'admin'].includes(role)) {
      setCurrentRole(role);
      localStorage.setItem('jandahahub_role', role);
      // In production, we would update the database role here if authorized.
      // await supabase.from('profiles').update({ role }).eq('id', user.id);
    }
  }, [user]);

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
      loading,
      loginWithGoogle,
      logout,
      switchRole,
      isCustomer,
      isShopkeeper,
      isDriver,
      isDelivery,
      isAdmin,
    }),
    [isAuthenticated, user, currentRole, loading, switchRole, isCustomer, isShopkeeper, isDriver, isDelivery, isAdmin]
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
