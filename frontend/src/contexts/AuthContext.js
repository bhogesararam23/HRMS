import { createContext, useContext, useState, useEffect } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

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
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in (from localStorage)
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('hrms_user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      // Call the backend /token endpoint with OAuth2 form data
      const formData = new URLSearchParams();
      formData.append('username', email);  // Backend expects 'username' for OAuth2
      formData.append('password', password);

      const response = await fetch(`${API_BASE_URL}/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Login failed');
      }

      const data = await response.json();

      // Save token to localStorage
      localStorage.setItem('token', data.access_token);

      // Create user object from response
      const userData = {
        id: data.user_id,
        email: data.email,
        name: data.name,
        role: data.role,
        employeeId: `EMP${String(data.user_id).padStart(3, '0')}`
      };

      // Save user to localStorage
      localStorage.setItem('hrms_user', JSON.stringify(userData));

      setToken(data.access_token);
      setUser(userData);

      return { success: true, user: userData };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('hrms_user');
  };

  // Helper function to get auth headers for API calls
  const getAuthHeaders = () => {
    const storedToken = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${storedToken}`,
      'Content-Type': 'application/json'
    };
  };

  // Helper function for authenticated API calls
  const authFetch = async (url, options = {}) => {
    const storedToken = localStorage.getItem('token');
    const headers = {
      'Authorization': `Bearer ${storedToken}`,
      'Content-Type': 'application/json',
      ...options.headers
    };

    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers
    });

    if (response.status === 401) {
      // Token expired, logout
      logout();
      throw new Error('Session expired. Please login again.');
    }

    return response;
  };

  const value = {
    user,
    token,
    login,
    logout,
    isLoading,
    isAdmin: user?.role === 'admin',
    getAuthHeaders,
    authFetch,
    API_BASE_URL
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};