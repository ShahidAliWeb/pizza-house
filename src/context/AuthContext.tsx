import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types';
import { api } from '../api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<User>;
  register: (payload: any) => Promise<User>;
  logout: () => void;
  switchUserRole: (role: Role) => Promise<void>;
  updateUserInContext: (updated: User) => void;
  isAdminOrStaff: boolean;
  isSuperAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check saved session
    const savedUserId = localStorage.getItem('ph_user_id');
    if (savedUserId) {
      api.getUser(savedUserId)
        .then(res => {
          if (res.user && res.user.status === 'active') {
            setUser(res.user);
          } else {
            localStorage.removeItem('ph_user_id');
          }
        })
        .catch(() => {
          localStorage.removeItem('ph_user_id');
        })
        .finally(() => setLoading(false));
    } else {
      // Default initial session: Customer Usman Tahir
      api.getUser('usman.tahir@example.pk')
        .catch(() => null)
        .finally(() => setLoading(false));
    }
  }, []);

  const login = async (email: string, pass: string) => {
    const res = await api.login({ email, password: pass });
    setUser(res.user);
    localStorage.setItem('ph_user_id', res.user._id);
    return res.user;
  };

  const register = async (payload: any) => {
    const res = await api.register(payload);
    setUser(res.user);
    localStorage.setItem('ph_user_id', res.user._id);
    return res.user;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('ph_user_id');
  };

  const switchUserRole = async (role: Role) => {
    const roleAccounts: Record<Role, { email: string; pass: string }> = {
      super_admin: { email: 'admin@pizzahouse.pk', pass: 'Admin@123456' },
      admin: { email: 'admin@pizzahouse.pk', pass: 'Admin@123456' },
      manager: { email: 'tariq.manager@pizzahouse.pk', pass: 'Manager@123456' },
      order_staff: { email: 'bilal.kitchen@pizzahouse.pk', pass: 'Staff@123456' },
      customer: { email: 'usman.tahir@example.pk', pass: 'Customer@123' }
    };

    const acc = roleAccounts[role];
    if (acc) {
      await login(acc.email, acc.pass);
    }
  };

  const updateUserInContext = (updated: User) => {
    setUser(updated);
  };

  const isAdminOrStaff = !!user && user.role !== 'customer';
  const isSuperAdmin = !!user && user.role === 'super_admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        switchUserRole,
        updateUserInContext,
        isAdminOrStaff,
        isSuperAdmin
      }}
    >
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
