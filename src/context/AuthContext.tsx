import React, { createContext, useContext, useReducer, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'user' | 'admin' | 'superadmin' | 'warehouse';
  token: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  googleLogin: (idToken: string) => Promise<void>;
  register: (name: string, email: string, password: string, phone: string) => Promise<any>;
  logout: () => void;
  isAdmin: () => boolean;
  isSuperAdmin: () => boolean;
  isWarehouse: () => boolean;
  hasRole: (role: string) => boolean;
  updateUser: (user: User) => void;
  checkUserStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction = 
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGIN_FAILURE' }
  | { type: 'LOGOUT' }
  | { type: 'SET_LOADING'; payload: boolean };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, loading: true };
    case 'LOGIN_SUCCESS':
      return { user: action.payload, loading: false };
    case 'LOGIN_FAILURE':
      return { user: null, loading: false };
    case 'LOGOUT':
      return { user: null, loading: false };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    default:
      return state;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    loading: true
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        dispatch({ type: 'LOGIN_SUCCESS', payload: user });
      } catch (error) {
        localStorage.removeItem('user');
      }
    }
    dispatch({ type: 'SET_LOADING', payload: false });
  }, []);

  // Periodically check user status when logged in
  useEffect(() => {
    if (!state.user?.token) return;
    
    const interval = setInterval(() => {
      checkUserStatus();
    }, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, [state.user?.token]);

  const login = async (email: string, password: string) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('user', JSON.stringify(data));
        dispatch({ type: 'LOGIN_SUCCESS', payload: data });
      } else {
        throw new Error(data.error || data.message || 'Login failed');
      }
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE' });
      throw error;
    }
  };

  const googleLogin = async (idToken: string) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken })
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('user', JSON.stringify(data));
        dispatch({ type: 'LOGIN_SUCCESS', payload: data });
      } else {
        throw new Error(data.error || data.message || 'Google login failed');
      }
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE' });
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string, phone: string): Promise<any> => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, phone })
      });

      const data = await response.json();
      if (response.ok) {
        // Don't automatically log in after registration
        // User needs to verify email first (unless in development mode)
        dispatch({ type: 'LOGIN_FAILURE' });
        return data; // Return the response data for the registration page to handle
      } else {
        throw new Error(data.error || 'Registration failed');
      }
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE' });
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('jwt');
    dispatch({ type: 'LOGOUT' });
    // Force a hard refresh to the homepage to ensure all state is cleared
    window.location.href = '/';
  };

  const isAdmin = () => {
    return state.user?.role === 'admin' || state.user?.role === 'superadmin';
  };

  const isSuperAdmin = () => {
    return state.user?.role === 'superadmin';
  };

  const isWarehouse = () => {
    return state.user?.role === 'warehouse' || state.user?.role === 'admin' || state.user?.role === 'superadmin';
  };

  const hasRole = (role: string) => {
    return state.user?.role === role;
  };

  const updateUser = (user: User) => {
    localStorage.setItem('user', JSON.stringify(user));
    dispatch({ type: 'LOGIN_SUCCESS', payload: user });
  };

  // Check if current user is still active
  const checkUserStatus = async () => {
    if (!state.user?.token) return;
    
    try {
      const response = await fetch('/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${state.user.token}`
        }
      });
      
      if (!response.ok) {
        const data = await response.json();
        if (response.status === 403 && data.message) {
          // User is suspended
          logout();
          // Show error message
          alert(data.message);
        }
      }
    } catch (error) {
      console.error('Error checking user status:', error);
    }
  };

  return (
    <AuthContext.Provider value={{
      ...state,
      login,
      googleLogin,
      register,
      logout,
      isAdmin,
      isSuperAdmin,
      isWarehouse,
      hasRole,
      updateUser,
      checkUserStatus
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};