'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authAPI, tokenUtils, userUtils, User } from '../lib/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (userData: { name: string; email: string; username: string; password: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkExistingAuth();
  }, []);

  const checkExistingAuth = async () => {
    try {
      const token = tokenUtils.getToken();
      const savedUser = userUtils.getUser();

      if (token && savedUser) {
        const response = await authAPI.getMe();
        
        if (response.success && response.user) {
          setUser(response.user);
          setIsAuthenticated(true);
          userUtils.saveUser(response.user);
        } else {
          handleLogout();
        }
      } else {
        handleLogout();
      }
    } catch (error) {
      console.error('auth check failed:', error);
      handleLogout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await authAPI.login({ email, password });

      if (response.success && response.user && response.token) {
        tokenUtils.saveToken(response.token);
        userUtils.saveUser(response.user);
        
        setUser(response.user);
        setIsAuthenticated(true);

        return { success: true };
      } else {
        return { success: false, error: response.error || 'login failed' };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'login failed';
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: { name: string; email: string; username: string; password: string }) => {
    try {
      setIsLoading(true);
      const response = await authAPI.register(userData);

      if (response.success && response.user && response.token) {
        tokenUtils.saveToken(response.token);
        userUtils.saveUser(response.user);
        
        setUser(response.user);
        setIsAuthenticated(true);

        return { success: true };
      } else {
        return { success: false, error: response.error || 'registration failed' };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'registration failed';
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    handleLogout();
  };

  const handleLogout = () => {
    tokenUtils.removeToken();
    userUtils.removeUser();
    
    setUser(null);
    setIsAuthenticated(false);
  };

  const refreshUser = async () => {
    try {
      const response = await authAPI.getMe();
      
      if (response.success && response.user) {
        setUser(response.user);
        userUtils.saveUser(response.user);
      }
    } catch (error) {
      console.error('failed to refresh user:', error);
      handleLogout();
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};