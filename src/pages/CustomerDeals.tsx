import React from 'react';
import { Tag, Check, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Pizza } from '../types';

interface CustomerDealsProps {
  pizzas: Pizza[];
  setCurrentView: (view: string) => void;
}

export const CustomerDeals: React.FC<CustomerDealsProps> = ({ pizzas, setCurrentView }) => {
  const { applyCoupon, addItem } = useCart();

  const handleApplyCode = async (code: string) => {
    await applyCoupon(code);
  };

  const dealsList = [
    {
      id: 'deal-1',
      title: 'Family Feast Feastival',
      badge: 'Best Family Saver',
      price: 3299,
      originalPrice: 3998,
      description: 'Any 2 Large Pizzas of your choice + Free 1.5L Soft Drink + Free Garlic Bread.',
      code: 'WELCOME10',
      pizzasIncluded: ['Chicken Tikka', 'Malai Boti']
    },
    {
      id: 'deal-2',
      title: 'Duo Delight Combo',
      badge: 'Most Popular',
      price: 2199,
      originalPrice: 2698,
      description: '2 Medium Pizzas (Chicken Fajita & Creamy Tikka) with crispy crusts.',
      code: 'PIZZAFEST',
      pizzasIncluded: ['Chicken Fajita', 'Creamy Tikka']
    },
    {
      id: 'deal-3',
      title: 'Solo Midnight Craving',
      badge: 'Late Night Special',
      price: 899,
      originalPrice: 1099,
      description: '1 Small Gourmet Pizza + 340ml Drink. Available 12:00 PM to 02:00 AM.',
      code: 'WELCOME10',
      pizzasIncluded: ['Cheese Lover']
    }
  ];

  return (
    <div className="min-h-screen bg-stone-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
            <Tag className="w-3.5 h-3.5" />
            <span>Exclusive Pakistani Dining Deals</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
            Special Value Deals & Meal Combos
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-2">
            Enjoy premium Pakistani wood-fired pizzas at discounted bundle rates. Apply promo codes for further instant discounts.
          </p>
        </div>

        {/* Deals Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {dealsList.map((d) => (
            <div
              key={d.id}
              className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-2xs hover:shadow-md transition flex flex-col justify-between"
            >
              <div className="p-6">
                <span className="text-[10px] font-extrabold px-2.5 py-1 bg-amber-600 text-white rounded-md uppercase tracking-wider">
                  {d.badge}
                </span>

                <h3 className="text-xl font-bold text-stone-900 mt-3">{d.title}</h3>
                <p className="text-xs text-stone-600 mt-2 leading-relaxed">{d.description}</p>

                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-2xl font-black text-amber-600 font-mono tabular-nums">
                    PKR {d.price.toLocaleString()}
                  </span>
                  <span className="text-xs text-stone-400 line-through font-mono tabular-nums">
                    PKR {d.originalPrice.toLocaleString()}
                  </span>
                </div>

                {/* Included flavors preview */}
                <div className="mt-4 pt-4 border-t border-stone-100 text-xs">
                  <span className="text-stone-400 block text-[11px] mb-1 font-semibold uppercase">
                    Suggested Flavors:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {d.pizzasIncluded.map((f, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-stone-100 text-stone-700 rounded text-xs">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0 space-y-2">
                <button
                  onClick={() => {
                    // Add first matching pizza to cart and open drawer
                    const p = pizzas.find(item => d.pizzasIncluded.includes(item.name)) || pizzas[0];
                    if (p) {
                      addItem(p, 'Large', 1);
                    }
                  }}
                  className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center justify-center gap-1.5"
                >
                  <span>Select & Add to Order</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => handleApplyCode(d.code)}
                  className="w-full py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-medium transition font-mono"
                >
                  Apply Promo Code: {d.code}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Coupon Codes Section */}
        <div className="bg-white p-8 rounded-2xl border border-stone-200 shadow-2xs">
          <h2 className="text-base font-bold text-stone-900 mb-4">Official Discount Coupon Codes</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200">
              <span className="font-mono font-bold text-amber-700 text-sm">WELCOME10</span>
              <p className="font-bold text-stone-900 mt-1">10% Off First Orders</p>
              <p className="text-stone-500 text-[11px] mt-0.5">Valid on orders above PKR 1,500.</p>
            </div>
            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200">
              <span className="font-mono font-bold text-amber-700 text-sm">PIZZAFEST</span>
              <p className="font-bold text-stone-900 mt-1">PKR 300 Flat Discount</p>
              <p className="text-stone-500 text-[11px] mt-0.5">Valid on orders above PKR 2,000.</p>
            </div>
            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200">
              <span className="font-mono font-bold text-amber-700 text-sm">SUPERDEAL</span>
              <p className="font-bold text-stone-900 mt-1">15% Mega Discount</p>
              <p className="text-stone-500 text-[11px] mt-0.5">Valid on orders above PKR 2,500.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
