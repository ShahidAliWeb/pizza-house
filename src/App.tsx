/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { AuthModal } from './components/AuthModal';
import { CustomerHome } from './pages/CustomerHome';
import { CustomerCheckout } from './pages/CustomerCheckout';
import { CustomerAccount } from './pages/CustomerAccount';
import { CustomerDeals } from './pages/CustomerDeals';
import { CustomerAbout } from './pages/CustomerAbout';
import { OrderTrackingView } from './pages/OrderTrackingView';
import { AdminPortal } from './pages/admin/AdminPortal';
import { api } from './api';
import { Pizza, Category } from './types';

function MainAppContent() {
  const [currentView, setCurrentView] = useState<string>('home');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeOrderNumber, setActiveOrderNumber] = useState<string>('PH-2026-1002');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Global data
  const [pizzas, setPizzas] = useState<Pizza[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGlobalData = async () => {
    try {
      const [pizzaRes, catRes] = await Promise.all([
        api.getPizzas(),
        api.getCategories()
      ]);
      setPizzas(pizzaRes.pizzas);
      setCategories(catRes.categories);
    } catch (err) {
      console.error('Failed to load menu data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGlobalData();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 selection:bg-amber-500 selection:text-white">
      {/* Top Bar Header (Shown unless on standalone admin view if preferred, but keeping unified access) */}
      <Header
        currentView={currentView}
        setCurrentView={setCurrentView}
        openAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Main Content Router */}
      <div className="flex-1">
        {loading ? (
          <div className="min-h-[60vh] flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-xs font-semibold text-stone-600 tracking-wider uppercase">
              Firing Up Pizza House Ovens...
            </p>
          </div>
        ) : (
          <>
            {/* Customer Home */}
            {currentView === 'home' && (
              <CustomerHome
                pizzas={pizzas}
                categories={categories}
                setCurrentView={setCurrentView}
                setSelectedCategory={setSelectedCategory}
                selectedCategory={selectedCategory}
              />
            )}

            {/* Menu View */}
            {currentView === 'menu' && (
              <CustomerHome
                pizzas={pizzas}
                categories={categories}
                setCurrentView={setCurrentView}
                setSelectedCategory={setSelectedCategory}
                selectedCategory={selectedCategory}
              />
            )}

            {/* Deals View */}
            {currentView === 'deals' && (
              <CustomerDeals
                pizzas={pizzas}
                setCurrentView={setCurrentView}
              />
            )}

            {/* Checkout View */}
            {currentView === 'checkout' && (
              <CustomerCheckout
                setCurrentView={setCurrentView}
                setActiveOrderNumber={setActiveOrderNumber}
              />
            )}

            {/* Live Order Tracker */}
            {currentView === 'track' && (
              <OrderTrackingView
                initialOrderNumber={activeOrderNumber}
                setCurrentView={setCurrentView}
              />
            )}

            {/* Customer Account & Saved Addresses */}
            {currentView === 'account' && (
              <CustomerAccount
                setCurrentView={setCurrentView}
                setActiveOrderNumber={setActiveOrderNumber}
                openAuthModal={() => setIsAuthModalOpen(true)}
              />
            )}

            {/* Kitchen Story & Locations */}
            {currentView === 'about' && (
              <CustomerAbout />
            )}

            {/* Administrative Management Portal */}
            {currentView === 'admin' && (
              <AdminPortal
                setCurrentView={setCurrentView}
                onRefreshData={fetchGlobalData}
              />
            )}
          </>
        )}
      </div>

      {/* Slide-over Cart Drawer */}
      <CartDrawer
        onProceedToCheckout={() => setCurrentView('checkout')}
      />

      {/* Auth Modal with Quick Demo Switcher */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Footer */}
      {currentView !== 'admin' && (
        <Footer setCurrentView={setCurrentView} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <MainAppContent />
      </CartProvider>
    </AuthProvider>
  );
}
