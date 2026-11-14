import React from 'react';
import { Phone, Clock, MapPin, Mail, ShieldCheck } from 'lucide-react';

export const Footer: React.FC<{ setCurrentView: (v: string) => void }> = ({ setCurrentView }) => {
  return (
    <footer className="bg-stone-950 text-stone-300 border-t border-stone-800 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1 */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <img
                src="/assets/aistudio/pizz_logo_a5bbf288.jpg"
                alt="Pizza House Logo"
                className="w-10 h-10 rounded-lg object-cover border border-stone-700 shrink-0"
              />
              <span className="text-lg font-bold text-white tracking-tight">Pizza House</span>
            </div>
            <p className="text-stone-400 text-xs leading-relaxed mb-4">
              Crafting premium wood-fired and artisanal Pakistani fusion pizzas with slow-fermented dough, 100% mozzarella, and char-grilled chicken boti.
            </p>
            <div className="flex items-center gap-2 text-xs text-amber-500 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>100% Halal Certified Meats & Ingredients</span>
            </div>
          </div>

          {/* Col 2 */}
          <div>
            <h4 className="text-white text-xs font-semibold uppercase tracking-wider mb-3">Kitchen Outlets</h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-stone-500 mt-0.5 shrink-0" />
                <span>Karachi: Clifton Block 8 & Gulshan-e-Iqbal</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-stone-500 mt-0.5 shrink-0" />
                <span>Lahore: DHA Phase 5 & Gulberg III</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-stone-500 mt-0.5 shrink-0" />
                <span>Islamabad: Beverly Centre, Blue Area & F-7/2</span>
              </li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h4 className="text-white text-xs font-semibold uppercase tracking-wider mb-3">Quick Navigation</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => setCurrentView('menu')} className="text-stone-400 hover:text-white transition">
                  Full Pizza Menu
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('deals')} className="text-stone-400 hover:text-white transition">
                  Discount Deals & Coupons
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('track')} className="text-stone-400 hover:text-white transition">
                  Live Order Tracker
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('about')} className="text-stone-400 hover:text-white transition">
                  Our Ingredients & Ovens
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('admin')} className="text-amber-500 hover:text-amber-400 transition font-medium">
                  Staff & Admin Dashboard
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4 */}
          <div>
            <h4 className="text-white text-xs font-semibold uppercase tracking-wider mb-3">Helpline & Hours</h4>
            <div className="space-y-2.5 text-xs text-stone-400">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span className="font-mono text-stone-200 font-semibold">+92 300 1234567</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                <span>orders@pizzahouse.pk</span>
              </div>
              <div className="flex items-start gap-2 pt-1">
                <Clock className="w-3.5 h-3.5 text-stone-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-stone-300 font-medium">Open 7 Days a Week</p>
                  <p className="text-stone-500">12:00 PM – 02:00 AM (Midnight)</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>© {new Date().getFullYear()} Pizza House Pakistan. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span>Prices displayed in Pakistani Rupees (PKR)</span>
            <span>·</span>
            <span>Provincial GST Applied</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
