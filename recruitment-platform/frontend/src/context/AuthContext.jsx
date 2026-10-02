import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from 'react';

import { apiRequest } from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Prevent an old /auth/me request from overwriting a successful login
  const authRequestId = useRef(0);

  const checkAuth = async () => {
    const requestId = ++authRequestId.current;

    try {
      const userData = await apiRequest('/auth/me');

      // Only apply result if this is still the latest auth request
      if (requestId === authRequestId.current) {
        setUser(userData);
      }
    } catch (error) {
      // Only clear user if this is still the latest auth request
      if (requestId === authRequestId.current) {
        setUser(null);
      }
    } finally {
      if (requestId === authRequestId.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email, password) => {
    // Invalidate any previous /auth/me request
    authRequestId.current++;

    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
      }),
    });

    setUser(data);
    setLoading(false);

    return data;
  };

  const register = async (fullName, email, password) => {
    // Invalidate any previous /auth/me request
    authRequestId.current++;

    const data = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: fullName,
        email,
        password,
      }),
    });

    setUser(data);
    setLoading(false);

    return data;
  };

  const logout = async () => {
    // Invalidate any pending auth request
    authRequestId.current++;

    try {
      await apiRequest('/auth/logout', {
        method: 'POST',
      });
    } finally {
      setUser(null);
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);