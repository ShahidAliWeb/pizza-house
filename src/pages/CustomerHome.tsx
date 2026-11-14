import React, { useState } from 'react';
import { ArrowRight, Flame, Clock, Award, ShieldCheck, Tag, X } from 'lucide-react';
import { Pizza, Category } from '../types';
import { PizzaCard } from '../components/PizzaCard';
import { useCart } from '../context/CartContext';

interface CustomerHomeProps {
  pizzas: Pizza[];
  categories: Category[];
  setCurrentView: (view: string) => void;
  setSelectedCategory: (cat: string) => void;
  selectedCategory: string;
}

export const CustomerHome: React.FC<CustomerHomeProps> = ({
  pizzas,
  categories,
  setCurrentView,
  setSelectedCategory,
  selectedCategory
}) => {
  const [selectedPizzaModal, setSelectedPizzaModal] = useState<Pizza | null>(null);
  const [modalSize, setModalSize] = useState<'Small' | 'Medium' | 'Large'>('Medium');
  const { addItem } = useCart();

  const activeCategories = categories.filter(c => c.isActive !== false);

  const filteredPizzas = pizzas.filter((p) => {
    if (selectedCategory === 'All') return true;
    const catObj = categories.find(c => c.slug.toLowerCase() === selectedCategory.toLowerCase() || c.name.toLowerCase() === selectedCategory.toLowerCase());
    if (catObj && p.category.toLowerCase() === catObj.name.toLowerCase()) return true;
    return (
      p.category.toLowerCase() === selectedCategory.toLowerCase() ||
      p.category.toLowerCase().includes(selectedCategory.toLowerCase()) ||
      p.categoryId === selectedCategory
    );
  });

  const handleModalAddToCart = () => {
    if (selectedPizzaModal && selectedPizzaModal.isAvailable) {
      const hasMultipleSizes = selectedPizzaModal.hasSizes !== false;
      addItem(selectedPizzaModal, hasMultipleSizes ? modalSize : 'Regular', 1);
      setSelectedPizzaModal(null);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50">
      {/* 1. Hero Section (§2.A Storefront Hero) */}
      <section className="relative bg-stone-900 text-white overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-40">
          <img
            src="/src/assets/images/hero_pizza_house_1794214328601.jpg"
            alt="Pizza House Wood-Fired Oven"
            className="w-full h-full object-cover object-center filter brightness-75"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-950/80 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-28">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-600/30 border border-amber-500/40 rounded-full text-amber-300 text-xs font-semibold mb-6">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Wood-Fired Pizza & Fast Food Specialties</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Hot Fresh Slices, <br />
              <span className="text-amber-400">Burgers, Wraps & More.</span>
            </h1>

            <p className="mt-4 text-stone-300 text-sm sm:text-base leading-relaxed max-w-xl">
              From our famous Chicken Tikka, Malai Boti, and Crown Crust pizzas to crispy Zinger Burgers, Paratha Rolls, Doner Shawarma, Loaded Fries, Wings, and Pastas. Cooked hot to order for Pakistan's food lovers.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                onClick={() => {
                  const menuEl = document.getElementById('menu-section');
                  menuEl?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-6 py-3.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg hover:shadow-amber-600/25 transition active:scale-98"
              >
                <span>Explore Full Menu</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setCurrentView('deals')}
                className="px-5 py-3.5 bg-stone-800/80 hover:bg-stone-800 text-stone-200 border border-stone-700 rounded-xl text-sm font-semibold transition"
              >
                View Daily Deals
              </button>
            </div>

            {/* Trust Markers Bar */}
            <div className="mt-12 pt-8 border-t border-stone-800 grid grid-cols-3 gap-4 text-xs text-stone-300">
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>30-45 Min Hot Delivery</span>
              </div>
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                <span>100% Halal Certified</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Award className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Fresh Dough Daily</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Promo Banner */}
      <div className="bg-amber-600 text-white py-2.5 px-4 text-center text-xs font-semibold shadow-inner">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 flex-wrap">
          <Tag className="w-3.5 h-3.5" />
          <span>USE COUPON CODE:</span>
          <span className="font-mono bg-stone-900 text-amber-400 px-2 py-0.5 rounded text-[11px] font-bold">
            WELCOME10
          </span>
          <span>FOR 10% OFF ON ORDERS ABOVE PKR 1,500!</span>
        </div>
      </div>

      {/* 3. Featured Menu Section */}
      <section id="menu-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
              Our Complete Menu
            </h2>
            <p className="text-stone-500 text-xs sm:text-sm mt-1">
              Explore 14 handcrafted fast-food categories prepared fresh daily with quality ingredients.
            </p>
          </div>

          <div className="text-xs text-stone-500 font-medium">
            Showing <span className="font-bold text-stone-900">{filteredPizzas.length}</span> delicious items
          </div>
        </div>

        {/* Dynamic Category Navigation Carousel/Tabs */}
        <div className="mb-8 overflow-x-auto pb-3 pt-1 scrollbar-thin scrollbar-thumb-stone-300">
          <div className="flex items-center gap-2 min-w-max">
            <button
              type="button"
              onClick={() => setSelectedCategory('All')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shadow-xs ${
                selectedCategory === 'All'
                  ? 'bg-amber-600 text-white shadow-amber-600/30'
                  : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100 hover:text-stone-900'
              }`}
            >
              <span>🍽️</span>
              <span>All Menu ({pizzas.length})</span>
            </button>

            {activeCategories.map((cat) => {
              const active =
                selectedCategory.toLowerCase() === cat.name.toLowerCase() ||
                selectedCategory.toLowerCase() === cat.slug.toLowerCase();
              const itemCount = pizzas.filter(
                p => p.category.toLowerCase() === cat.name.toLowerCase() || p.categoryId === cat._id
              ).length;

              return (
                <button
                  key={cat._id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all shadow-xs ${
                    active
                      ? 'bg-stone-900 text-white font-semibold shadow-stone-900/30 ring-2 ring-amber-500/50'
                      : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100 hover:text-stone-900'
                  }`}
                >
                  {cat.image && (cat.image.startsWith('/') || cat.image.startsWith('http') || cat.image.startsWith('data:')) ? (
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-5 h-5 rounded-full object-cover shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/uploads/products/placeholder.svg';
                      }}
                    />
                  ) : (
                    <span className="text-sm">{cat.image || '🍕'}</span>
                  )}
                  <span>{cat.name}</span>
                  {itemCount > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      active ? 'bg-stone-800 text-amber-300' : 'bg-stone-100 text-stone-500'
                    }`}>
                      {itemCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>


        {/* Pizza Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredPizzas.map((pizza) => (
            <PizzaCard
              key={pizza._id}
              pizza={pizza}
              onOpenDetails={(p) => {
                setSelectedPizzaModal(p);
                setModalSize('Medium');
              }}
            />
          ))}
        </div>
      </section>

      {/* 4. Craftsmanship / Restaurant Story Section */}
      <section className="bg-stone-100 py-16 border-y border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="text-amber-600 font-semibold text-xs tracking-wider uppercase mb-2">
                The Pizza House Standard
              </div>
              <h2 className="text-3xl font-extrabold text-stone-900 tracking-tight leading-snug">
                Why Pakistani Pizza Lovers Choose Us
              </h2>
              <p className="mt-4 text-stone-600 text-sm leading-relaxed">
                At Pizza House, we believe a great pizza is founded upon three uncompromising pillars:
                a 48-hour slow fermented dough that yields a light, airy, digestible crust; 100% pure Pakistani artisanal mozzarella and sharp cheddar; and real boneless chicken char-grilled over open embers with traditional secret Tikka and Malai marinades.
              </p>

              <div className="mt-6 grid grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-white rounded-xl border border-stone-200 shadow-2xs">
                  <span className="font-bold text-stone-900 block text-sm mb-1">0% Artificial Additives</span>
                  <span className="text-stone-500">Pure flour, extra virgin olive oil, and filtered water.</span>
                </div>
                <div className="p-4 bg-white rounded-xl border border-stone-200 shadow-2xs">
                  <span className="font-bold text-stone-900 block text-sm mb-1">Recipe Stock Automation</span>
                  <span className="text-stone-500">Real-time inventory deduction guarantees freshness every single hour.</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <img
                src="/src/assets/images/pizza_chicken_tikka_1794214328353.jpg"
                alt="Chicken Tikka Pizza"
                className="rounded-2xl object-cover w-full h-56 shadow-md"
              />
              <img
                src="/src/assets/images/pizza_malai_boti_1794214330015.jpg"
                alt="Malai Boti Pizza"
                className="rounded-2xl object-cover w-full h-56 shadow-md mt-6"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 5. Pizza Details Modal */}
      {selectedPizzaModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="relative bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-stone-200 overflow-hidden">
            <button
              onClick={() => setSelectedPizzaModal(null)}
              className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-stone-900/60 text-white flex items-center justify-center hover:bg-stone-900 transition"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="relative h-56 bg-stone-100 overflow-hidden">
              <img
                src={selectedPizzaModal.image}
                alt={selectedPizzaModal.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/uploads/products/placeholder.svg';
                }}
              />
            </div>

            <div className="p-6">
              <div className="flex items-center gap-2 text-xs text-stone-500 mb-1">
                <span>{selectedPizzaModal.category}</span>
                <span>·</span>
                <span className="font-mono">{selectedPizzaModal.sku}</span>
                <span>·</span>
                <span>Prep: {selectedPizzaModal.prepTimeMinutes} mins</span>
              </div>

              <h3 className="text-xl font-extrabold text-stone-900">{selectedPizzaModal.name}</h3>
              <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                {selectedPizzaModal.description}
              </p>

              {/* Ingredients */}
              <div className="mt-4">
                <h4 className="text-xs font-semibold text-stone-800 uppercase tracking-wider mb-2">
                  Toppings & Fresh Ingredients:
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedPizzaModal.ingredients.map((ing, i) => (
                    <span
                      key={i}
                      className="text-xs px-2.5 py-1 bg-stone-100 text-stone-700 rounded-md font-medium"
                    >
                      {ing}
                    </span>
                  ))}
                </div>
              </div>

              {/* Size Selector if multiple sizes */}
              {selectedPizzaModal.hasSizes !== false ? (
                <div className="mt-6 pt-4 border-t border-stone-100">
                  <label className="block text-xs font-semibold text-stone-700 mb-2">
                    Select Portion / Size:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['Small', 'Medium', 'Large'] as const).map((sz) => {
                      const price = selectedPizzaModal.sizes?.[sz.toLowerCase() as 'small' | 'medium' | 'large'] || 0;
                      const active = modalSize === sz;
                      return (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => setModalSize(sz)}
                          className={`p-3 text-center rounded-xl border transition ${
                            active
                              ? 'border-amber-600 bg-amber-50/50 text-stone-900 font-bold shadow-xs'
                              : 'border-stone-200 hover:border-stone-300 text-stone-700'
                          }`}
                        >
                          <span className="block text-xs">{sz}</span>
                          <span className="block text-xs font-bold text-amber-600 mt-1 tabular-nums">
                            PKR {price.toLocaleString()}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="mt-6 pt-4 border-t border-stone-100">
                  <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block mb-1">
                    Serving:
                  </span>
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-700 flex items-center justify-between">
                    <span className="font-medium">Standard Restaurant Portion</span>
                    <span className="font-bold text-amber-600">
                      PKR {(selectedPizzaModal.price ?? selectedPizzaModal.sizes?.medium ?? 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

              {/* Action Button */}
              <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between gap-4">
                <div>
                  <span className="text-xs text-stone-500 block">Total Price:</span>
                  <span className="text-xl font-extrabold text-stone-900 tabular-nums">
                    PKR {(
                      selectedPizzaModal.hasSizes !== false
                        ? (selectedPizzaModal.sizes?.[modalSize.toLowerCase() as 'small' | 'medium' | 'large'] || 0)
                        : (selectedPizzaModal.price ?? selectedPizzaModal.sizes?.medium ?? 0)
                    ).toLocaleString()}
                  </span>
                </div>

                <button
                  onClick={handleModalAddToCart}
                  disabled={!selectedPizzaModal.isAvailable}
                  className="px-6 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition shadow-xs"
                >
                  {selectedPizzaModal.isAvailable ? 'Add to Cart' : 'Sold Out'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
