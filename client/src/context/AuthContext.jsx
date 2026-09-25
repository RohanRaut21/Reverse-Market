import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeRole, setActiveRole] = useState('Buyer'); // Frontend view role

  useEffect(() => {
    // Check if user is logged in
    const checkLoggedIn = async () => {
      try {
        const response = await fetch('/api/auth/me');
        const data = await response.json();
        
        if (data.success && data.user) {
          setUser(data.user);
          setActiveRole(data.user.role); // Set default view role based on db
        }
      } catch (err) {
        console.error('Error checking authentication status:', err);
      } finally {
        setLoading(false);
      }
    };
    
    checkLoggedIn();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      
      if (data.success) {
        setUser(data.user);
        setActiveRole(data.role || data.user.role);
        return { success: true };
      } else {
        return { success: false, error: data.message };
      }
    } catch (err) {
      return { success: false, error: 'Server error. Please try again.' };
    }
  };

  const register = async (userData) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      const data = await res.json();
      
      if (data.success) {
        setUser(data.user);
        setActiveRole(data.user.role);
        return { success: true };
      } else {
        return { success: false, error: data.message };
      }
    } catch (err) {
      return { success: false, error: 'Server error. Please try again.' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout');
      setUser(null);
      setActiveRole('Buyer');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Seamless toggle between Buyer and Seller view for testing/dual role profiles
  const toggleActiveRole = async () => {
    const nextRole = activeRole === 'Buyer' ? 'Seller' : 'Buyer';
    setActiveRole(nextRole);
    
    // Update local user object state immediately
    if (user) {
      setUser(prev => prev ? { ...prev, role: nextRole } : prev);
    }
    
    // Sync back to database to update role persistence
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: nextRole }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
      }
    } catch (err) {
      console.error('Error syncing role toggle to DB:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, activeRole, login, register, logout, toggleActiveRole, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
