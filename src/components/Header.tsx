import React from 'react';
import { ShoppingBag, User as UserIcon, Shield, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

interface HeaderProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  openAuthModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, setCurrentView, openAuthModal }) => {
  const { user, isAdminOrStaff } = useAuth();
  const { totalItemCount, setIsCartOpen } = useCart();

  return (
    <header className="sticky top-0 z-40 bg-stone-900 text-stone-100 border-b border-stone-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-18">
          {/* Zone 1: Brand Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setCurrentView('home')}
              className="flex items-center gap-2.5 text-left group transition"
            >
              <div className="w-11 h-11 rounded-xl bg-stone-950 border border-amber-500/40 overflow-hidden shadow-md shrink-0">
                <img
                  src="/assets/aistudio/pizz_logo_a5bbf288.jpg"
                  alt="Pizza House Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <span className="text-xl font-extrabold tracking-tight text-white group-hover:text-amber-400 transition-colors whitespace-nowrap">
                  Pizza House
                </span>
                <span className="hidden sm:inline-block ml-2 text-xs font-mono text-stone-400">
                  PAKISTAN
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: 4–5 single-line clean nav links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-stone-300">
            <button
              onClick={() => setCurrentView('menu')}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
                currentView === 'menu' ? 'text-amber-400 font-semibold' : ''
              }`}
            >
              Full Menu
            </button>
            <button
              onClick={() => setCurrentView('deals')}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
                currentView === 'deals' ? 'text-amber-400 font-semibold' : ''
              }`}
            >
              Special Deals
            </button>
            <button
              onClick={() => setCurrentView('track')}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
                currentView === 'track' ? 'text-amber-400 font-semibold' : ''
              }`}
            >
              Track Order
            </button>
            <button
              onClick={() => {
                if (!user) openAuthModal();
                else setCurrentView('account');
              }}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
                currentView === 'account' ? 'text-amber-400 font-semibold' : ''
              }`}
            >
              My Orders
            </button>
            <button
              onClick={() => setCurrentView('about')}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
                currentView === 'about' ? 'text-amber-400 font-semibold' : ''
              }`}
            >
              Our Kitchens
            </button>
          </nav>

          {/* Zone 3: Primary Action & Controls */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Admin Switcher if staff/admin */}
            {isAdminOrStaff && (
              <button
                onClick={() => setCurrentView('admin')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border transition whitespace-nowrap shrink-0 ${
                  currentView === 'admin'
                    ? 'bg-amber-600 text-white border-amber-600'
                    : 'bg-stone-800 text-stone-200 border-stone-700 hover:bg-stone-700'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Admin Portal</span>
                <span className="sm:hidden">Admin</span>
              </button>
            )}

            {/* User Account Button */}
            {user ? (
              <button
                onClick={() => setCurrentView('account')}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-stone-200 hover:text-white bg-stone-800/80 hover:bg-stone-800 border border-stone-700 rounded-md transition whitespace-nowrap shrink-0"
              >
                <UserIcon className="w-3.5 h-3.5 text-amber-500" />
                <span className="max-w-[110px] truncate">{user.fullName.split(' ')[0]}</span>
              </button>
            ) : (
              <button
                onClick={openAuthModal}
                className="px-3.5 py-1.5 text-xs font-medium text-stone-300 hover:text-white border border-stone-700 rounded-md hover:bg-stone-800 transition whitespace-nowrap shrink-0"
              >
                Sign In
              </button>
            )}

            {/* Shopping Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center justify-center p-2 text-stone-200 hover:text-white bg-amber-600 hover:bg-amber-500 rounded-md transition shadow-sm whitespace-nowrap shrink-0"
              aria-label="View Shopping Cart"
            >
              <ShoppingBag className="w-4 h-4" />
              {totalItemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[10px] font-bold rounded-full h-5 min-w-[20px] px-1 flex items-center justify-center tabular-nums shadow">
                  {totalItemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
