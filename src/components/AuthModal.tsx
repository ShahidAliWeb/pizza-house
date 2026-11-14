import React, { useState } from 'react';
import { X, User, Lock, Mail, Phone, ShieldCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('+92');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login, register, switchUserRole } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register({
          fullName,
          email,
          phone,
          password,
          confirmPassword
        });
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (role: Role) => {
    setError(null);
    setLoading(true);
    try {
      await switchUserRole(role);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Quick login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div onClick={onClose} className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity" />

      <div className="relative bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-stone-200">
        {/* Top Header */}
        <div className="bg-stone-900 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-stone-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-12 h-12 rounded-xl bg-stone-950 border border-amber-500/40 overflow-hidden mb-3 shadow-md">
            <img
              src="/assets/aistudio/pizz_logo_a5bbf288.jpg"
              alt="Pizza House Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <h2 className="text-xl font-extrabold tracking-tight">
            {mode === 'login' ? 'Welcome to Pizza House' : 'Create Customer Account'}
          </h2>
          <p className="text-xs text-stone-400 mt-1">
            {mode === 'login'
              ? 'Sign in to access saved addresses, order history, and express checkout.'
              : 'Join to save your delivery addresses and earn special Pakistani food deals.'}
          </p>

          {/* Tab Selector */}
          <div className="flex bg-stone-800 p-1 rounded-lg mt-5 text-xs font-semibold">
            <button
              onClick={() => { setMode('login'); setError(null); }}
              className={`flex-1 py-1.5 rounded-md transition ${
                mode === 'login' ? 'bg-amber-600 text-white' : 'text-stone-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode('register'); setError(null); }}
              className={`flex-1 py-1.5 rounded-md transition ${
                mode === 'register' ? 'bg-amber-600 text-white' : 'text-stone-400 hover:text-white'
              }`}
            >
              Register New
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Usman Tahir"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Phone Number (Pakistan)
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      placeholder="+923001234567"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                    />
                  </div>
                  <span className="text-[10px] text-stone-400 block mt-0.5">Format: +923XXXXXXXXX</span>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  placeholder="name@example.pk"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Confirm Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    placeholder="Re-type password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 mt-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold transition shadow-xs flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Create Account'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Quick Demo Switcher Section */}
          <div className="mt-6 pt-5 border-t border-stone-200">
            <div className="flex items-center gap-1.5 text-xs font-bold text-stone-700 mb-2">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>Quick Test Account Switcher</span>
            </div>
            <p className="text-[11px] text-stone-500 mb-3">
              Click any pre-configured Pakistani restaurant account to switch immediately:
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickLogin('customer')}
                className="p-2 border border-stone-200 rounded-lg text-left hover:bg-stone-50 hover:border-amber-400 transition"
              >
                <p className="font-semibold text-stone-900">Usman (Customer)</p>
                <p className="text-[10px] text-stone-500">Karachi Addresses</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('order_staff')}
                className="p-2 border border-stone-200 rounded-lg text-left hover:bg-stone-50 hover:border-amber-400 transition"
              >
                <p className="font-semibold text-stone-900">Bilal (Lead Chef)</p>
                <p className="text-[10px] text-stone-500">Kitchen & Status</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('manager')}
                className="p-2 border border-stone-200 rounded-lg text-left hover:bg-stone-50 hover:border-amber-400 transition"
              >
                <p className="font-semibold text-stone-900">Tariq (Manager)</p>
                <p className="text-[10px] text-stone-500">Orders & Inventory</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('super_admin')}
                className="p-2 border border-amber-200 bg-amber-50/50 rounded-lg text-left hover:bg-amber-100/50 hover:border-amber-500 transition"
              >
                <p className="font-semibold text-amber-900">Super Admin</p>
                <p className="text-[10px] text-amber-700">Full System Control</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
