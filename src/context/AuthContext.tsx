import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import AuthModal from '@/components/AuthModal';

interface AuthContextType {
  user: any | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  openLoginModal: (onSuccess?: () => void) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

let loginModalCallback: (() => void) | null = null;

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem('jwt');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      setLoading(false);
      throw new Error('Invalid credentials');
    }
    const data = await res.json();
    setToken(data.token);
    setUser(data);
    localStorage.setItem('jwt', data.token);
    localStorage.setItem('user', JSON.stringify(data));
    setLoading(false);
    setShowLoginModal(false);
    if (loginModalCallback) {
      loginModalCallback();
      loginModalCallback = null;
    }
  };

  const register = async (email: string, password: string) => {
    setLoading(true);
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: email, email, password })
    });
    if (!res.ok) {
      setLoading(false);
      throw new Error('Registration failed');
    }
    const data = await res.json();
    setToken(data.token);
    setUser(data);
    localStorage.setItem('jwt', data.token);
    localStorage.setItem('user', JSON.stringify(data));
    setLoading(false);
    setShowLoginModal(false);
    if (loginModalCallback) {
      loginModalCallback();
      loginModalCallback = null;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('jwt');
    localStorage.removeItem('user');
  };

  const openLoginModal = useCallback((onSuccess?: () => void) => {
    loginModalCallback = onSuccess || null;
    setShowLoginModal(true);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, openLoginModal }}>
      {children}
      {showLoginModal && <AuthModal onClose={() => setShowLoginModal(false)} />}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// You will need to import LoginModal at the top of this file
// import LoginModal from '@/components/LoginModal';
