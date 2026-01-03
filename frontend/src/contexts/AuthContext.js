import { createContext, useContext, useState, useEffect } from 'react';

export const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in (from localStorage)
    const storedUser = localStorage.getItem('hrms_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = (email, password) => {
    // Mock authentication logic
    const isAdmin = email.toLowerCase().includes('admin');
    const userData = {
      email,
      role: isAdmin ? 'admin' : 'employee',
      employeeId: isAdmin ? 'ADMIN001' : 'EMP001',
      name: isAdmin ? 'Admin User' : 'Sarah Johnson'
    };
    
    setUser(userData);
    localStorage.setItem('hrms_user', JSON.stringify(userData));
    return userData;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('hrms_user');
  };

  const value = {
    user,
    login,
    logout,
    isLoading,
    isAdmin: user?.role === 'admin'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};