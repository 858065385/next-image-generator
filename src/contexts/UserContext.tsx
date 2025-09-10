'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface User {
  id: string;
  email: string;
  name?: string;
  image?: string;
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      // 首先尝试从 localStorage 获取
      const cachedUser = localStorage.getItem('userInfo');
      if (cachedUser) {
        setUser(JSON.parse(cachedUser));
        setLoading(false);
      }

      // 从服务器获取最新信息
      const response = await fetch('/api/auth/session');
      const session = await response.json();
      
      if (session.user) {
        setUser(session.user);
        localStorage.setItem('userInfo', JSON.stringify(session.user));
      } else {
        setUser(null);
        localStorage.removeItem('userInfo');
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, loading, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}