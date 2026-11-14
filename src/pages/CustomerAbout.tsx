import React from 'react';
import { MapPin, ShieldCheck, Flame, Award, HeartHandshake } from 'lucide-react';

export const CustomerAbout: React.FC = () => {
  return (
    <div className="min-h-screen bg-stone-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="text-amber-600 font-bold text-xs uppercase tracking-wider">
            Our Heritage & Standards
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight mt-2">
            The Story Behind Pizza House Pakistan
          </h1>
          <p className="text-stone-600 text-sm mt-3 leading-relaxed">
            Founded with a passion to redefine Pakistan's pizza landscape, Pizza House blends traditional Italian Neapolitan stone-baking techniques with the rich, smoky, aromatic flavors of Pakistani char-grilled meats and spices.
          </p>
        </div>

        {/* 3 Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
              <Flame className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-stone-900 mb-2">450°C Stone Hearth Ovens</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Every crust is baked on genuine volcanic stone decks. The high heat seals in moisture while developing blistered leopard spotting on the crust within 90 seconds.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-stone-900 mb-2">100% Halal Artisan Meats</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              We source directly from K&N’s and certified local poultry farms. Our Chicken Tikka, Fajita, and Malai Boti are marinated with fresh ginger, garlic, yogurt, and whole roasted spices.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs">
            <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center mb-4">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-stone-900 mb-2">Fresh Punjab Dairy Mozzarella</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              No artificial cheese analogs or hydrogenated oils. We use 100% pure whole milk mozzarella with golden aged cheddar for the melt-in-mouth pull.
            </p>
          </div>
        </div>

        {/* Kitchen Outlets Locations in Pakistan */}
        <div className="bg-white p-8 rounded-2xl border border-stone-200 shadow-2xs">
          <h2 className="text-xl font-bold text-stone-900 mb-6">Our Flagship Kitchen Locations</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200">
              <div className="flex items-center gap-2 font-bold text-stone-900 text-sm mb-2">
                <MapPin className="w-4 h-4 text-amber-600" />
                <span>Karachi Kitchens</span>
              </div>
              <p className="text-stone-700 font-medium">Branch 1: Clifton Block 8 (Near Do Talwar)</p>
              <p className="text-stone-700 font-medium mt-1">Branch 2: University Road, Gulshan-e-Iqbal</p>
              <p className="text-stone-500 mt-2">Delivery coverage: Clifton, Defence, Gulshan, PECHS, Bahadurabad.</p>
            </div>

            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200">
              <div className="flex items-center gap-2 font-bold text-stone-900 text-sm mb-2">
                <MapPin className="w-4 h-4 text-amber-600" />
                <span>Lahore Kitchens</span>
              </div>
              <p className="text-stone-700 font-medium">Branch 1: Commercial Area, DHA Phase 5</p>
              <p className="text-stone-700 font-medium mt-1">Branch 2: Main Boulevard, Gulberg III</p>
              <p className="text-stone-500 mt-2">Delivery coverage: DHA, Gulberg, Model Town, Cantt, Johar Town.</p>
            </div>

            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200">
              <div className="flex items-center gap-2 font-bold text-stone-900 text-sm mb-2">
                <MapPin className="w-4 h-4 text-amber-600" />
                <span>Islamabad / Rawalpindi</span>
              </div>
              <p className="text-stone-700 font-medium">Branch 1: Beverly Centre, Blue Area (F-7)</p>
              <p className="text-stone-700 font-medium mt-1">Branch 2: Saddar, Rawalpindi</p>
              <p className="text-stone-500 mt-2">Delivery coverage: F-6, F-7, F-8, F-10, G-9, Bahria Town, Saddar.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
