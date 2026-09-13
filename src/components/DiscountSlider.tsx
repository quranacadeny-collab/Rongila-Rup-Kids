import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  ChevronLeft, 
  ChevronRight, 
  ShoppingBag, 
  Sparkles, 
  ArrowRight,
  Eye
} from 'lucide-react';
import { Language, Product } from '../types';

interface DiscountSliderProps {
  products: Product[];
  lang: Language;
  onAddToCart: (product: Product) => void;
  onQuickView: (product: Product) => void;
}

export const DiscountSlider: React.FC<DiscountSliderProps> = ({
  products,
  lang,
  onAddToCart,
  onQuickView
}) => {
  // Filter products that have a discount (originalPrice > price)
  const discountProducts = products.filter(p => p.originalPrice && p.originalPrice > p.price);
  
  // Fallback to top products if none explicitly have originalPrice
  const displayProducts = discountProducts.length > 0 ? discountProducts : products.slice(0, 5);

  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-advance slider every 4 seconds
  useEffect(() => {
    if (displayProducts.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % displayProducts.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [displayProducts.length]);

  if (displayProducts.length === 0) return null;

  const currentProduct = displayProducts[currentIndex];
  const discountPercent = currentProduct.originalPrice 
    ? Math.round(((currentProduct.originalPrice - currentProduct.price) / currentProduct.originalPrice) * 100)
    : 20;

  const handlePrev = () => {
    setCurrentIndex(prev => (prev - 1 + displayProducts.length) % displayProducts.length);
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev + 1) % displayProducts.length);
  };

  return (
    <div className="bg-gradient-to-r from-rose-950 via-amber-950 to-rose-950 rounded-3xl p-4 sm:p-6 text-amber-50 shadow-xl border border-amber-500/30 relative overflow-hidden my-4">
      {/* Background Decorative Pattern */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>

      <div className="flex items-center justify-between border-b border-amber-500/20 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-amber-500 text-rose-950 rounded-xl font-bold animate-bounce shadow-md">
            <Flame size={18} />
          </div>
          <h3 className="font-serif font-extrabold text-base sm:text-lg text-amber-100 flex items-center gap-2">
            <span>{lang === 'bn' ? 'আজকের স্পেশাল ডিসকাউন্ট অফার' : 'Daily Flash Discount Deals'}</span>
            <span className="bg-rose-700 text-amber-200 text-[10px] px-2 py-0.5 rounded-full font-sans uppercase font-bold animate-pulse">
              HOT SALE
            </span>
          </h3>
        </div>

        {/* Carousel Indicators & Controls */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-amber-300 mr-1 hidden sm:inline">
            {currentIndex + 1} / {displayProducts.length}
          </span>
          <button
            onClick={handlePrev}
            className="p-1.5 bg-white/10 hover:bg-white/20 text-amber-200 rounded-full transition-colors cursor-pointer"
            title="Previous Discount"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={handleNext}
            className="p-1.5 bg-white/10 hover:bg-white/20 text-amber-200 rounded-full transition-colors cursor-pointer"
            title="Next Discount"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Slide Content - Slim YouTube 16:9 Thumbnail Format */}
      <div className="flex flex-col md:flex-row items-center gap-3 sm:gap-5">
        {/* Left Image Showcase - YouTube 16:9 Aspect Ratio */}
        <div 
          className="w-full md:w-72 shrink-0 relative group cursor-pointer" 
          onClick={() => onQuickView(currentProduct)}
        >
          <div className="aspect-[16/9] w-full rounded-2xl overflow-hidden border-2 border-amber-500/40 shadow-xl relative">
            <img 
              src={currentProduct.image} 
              alt={currentProduct.nameEn} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
            <div className="absolute top-2 left-2 bg-gradient-to-r from-amber-500 to-rose-600 text-rose-950 font-black text-[11px] px-2.5 py-0.5 rounded-full shadow-md border border-amber-300 flex items-center gap-1">
              <Sparkles size={11} />
              <span>{discountPercent}% {lang === 'bn' ? 'ছাড়' : 'OFF'}</span>
            </div>
          </div>
        </div>

        {/* Right Product Info */}
        <div className="flex-1 min-w-0 space-y-2 w-full">
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase tracking-wider font-bold text-amber-400 block">
              {currentProduct.category} • {lang === 'bn' ? currentProduct.fabricBn : currentProduct.fabricEn}
            </span>
            <h4 
              onClick={() => onQuickView(currentProduct)}
              className="text-base sm:text-xl font-serif font-black text-amber-100 hover:text-amber-300 transition-colors cursor-pointer truncate"
            >
              {lang === 'bn' ? currentProduct.nameBn : currentProduct.nameEn}
            </h4>
          </div>

          {/* Pricing Box */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span className="text-xl sm:text-2xl font-mono font-black text-amber-400">
              ৳{currentProduct.price.toLocaleString()}
            </span>
            {currentProduct.originalPrice && (
              <span className="text-xs font-mono text-stone-400 line-through">
                ৳{currentProduct.originalPrice.toLocaleString()}
              </span>
            )}
            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
              {lang === 'bn' ? `সেভ ৳${(currentProduct.originalPrice! - currentProduct.price).toLocaleString()}` : `Save ৳${(currentProduct.originalPrice! - currentProduct.price).toLocaleString()}`}
            </span>
            <span className="text-[10px] text-amber-300 font-semibold bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/40">
              🚚 {lang === 'bn' ? 'কুরিয়ার ৳৮০/৳১৫০' : 'Courier ৳80/৳150'}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => onAddToCart(currentProduct)}
              className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-rose-950 font-black text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-transform hover:scale-102 cursor-pointer"
            >
              <ShoppingBag size={14} />
              <span>{lang === 'bn' ? 'অর্ডারে যোগ করুন' : 'Add to Order'}</span>
            </button>

            <button
              onClick={() => onQuickView(currentProduct)}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-amber-200 font-bold text-xs rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Eye size={14} />
              <span>{lang === 'bn' ? 'বিস্তারিত' : 'Details'}</span>
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};
