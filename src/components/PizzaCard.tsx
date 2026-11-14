import React, { useState } from 'react';
import { Plus, Check, Clock } from 'lucide-react';
import { Pizza } from '../types';
import { useCart } from '../context/CartContext';

interface PizzaCardProps {
  pizza: Pizza;
  onOpenDetails?: (pizza: Pizza) => void;
}

export const PizzaCard: React.FC<PizzaCardProps> = ({ pizza, onOpenDetails }) => {
  const hasMultipleSizes = pizza.hasSizes !== false;
  const [selectedSize, setSelectedSize] = useState<'Small' | 'Medium' | 'Large' | 'Regular'>('Medium');
  const [addedAnimation, setAddedAnimation] = useState(false);
  const { addItem } = useCart();

  const currentPrice = hasMultipleSizes
    ? pizza.sizes?.[(selectedSize.toLowerCase() as 'small' | 'medium' | 'large')] || pizza.sizes?.medium || 0
    : (pizza.price ?? pizza.sizes?.medium ?? pizza.sizes?.small ?? 0);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!pizza.isAvailable) return;
    addItem(pizza, hasMultipleSizes ? (selectedSize as 'Small' | 'Medium' | 'Large') : 'Regular', 1);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 900);
  };

  return (
    <div
      onClick={() => onOpenDetails && onOpenDetails(pizza)}
      className="group bg-white rounded-xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col cursor-pointer"
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] bg-stone-100 overflow-hidden">
        <img
          src={pizza.image}
          alt={pizza.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/uploads/products/placeholder.svg';
          }}
        />
        {/* Availability Badge */}
        {!pizza.isAvailable && (
          <div className="absolute inset-0 bg-stone-900/70 backdrop-blur-[2px] flex items-center justify-center">
            <span className="text-white text-xs font-semibold px-3 py-1 bg-red-600 rounded">
              Sold Out Today
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Metadata: Category & SKU */}
          <div className="flex items-center gap-2 text-xs text-stone-500 mb-1">
            <span className="font-medium text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded text-[11px]">{pizza.category}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-[11px]">{pizza.sku}</span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-stone-400" />
              <span>{pizza.prepTimeMinutes}m</span>
            </span>
          </div>

          <h3 className="text-base font-bold text-stone-900 group-hover:text-amber-600 transition-colors">
            {pizza.name}
          </h3>

          <p className="text-xs text-stone-600 line-clamp-2 mt-1 leading-relaxed">
            {pizza.description}
          </p>

          {/* Key ingredients */}
          {pizza.ingredients && pizza.ingredients.length > 0 && (
            <div className="mt-2 text-[11px] text-stone-500 truncate">
              {pizza.ingredients.slice(0, 4).join(', ')}
              {pizza.ingredients.length > 4 && '...'}
            </div>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-stone-100">
          {/* Size Selector Tabs if has multiple sizes */}
          {hasMultipleSizes ? (
            <div className="flex items-center justify-between mb-3" onClick={(e) => e.stopPropagation()}>
              <span className="text-[11px] font-medium text-stone-500">Size:</span>
              <div className="flex items-center bg-stone-100 p-0.5 rounded-lg text-xs font-medium">
                {(['Small', 'Medium', 'Large'] as const).map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => setSelectedSize(sz)}
                    className={`px-2.5 py-1 rounded-md transition-all ${
                      selectedSize === sz
                        ? 'bg-white text-stone-900 shadow-xs font-semibold'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    {sz[0]}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mb-2">
              <span className="inline-block text-[10px] font-semibold text-stone-400 uppercase tracking-wider">
                Standard Portion
              </span>
            </div>
          )}

          {/* Price & Action Button */}
          <div className="flex items-center justify-between gap-2">
            <div>
              <span className="text-xs text-stone-400 block leading-none">
                {hasMultipleSizes ? `Price (${selectedSize})` : 'Price'}
              </span>
              <span className="text-base font-extrabold text-stone-900 tabular-nums">
                PKR {currentPrice?.toLocaleString()}
              </span>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={!pizza.isAvailable}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition shadow-xs whitespace-nowrap shrink-0 ${
                !pizza.isAvailable
                  ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                  : addedAnimation
                  ? 'bg-emerald-600 text-white'
                  : 'bg-amber-600 text-white hover:bg-amber-500 active:scale-95'
              }`}
            >
              {addedAnimation ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Added!</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add to Cart</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
