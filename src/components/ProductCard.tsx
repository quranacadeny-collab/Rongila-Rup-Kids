import React, { useState } from 'react';
import { Heart, Star, ShoppingBag, Eye, CheckCircle, ArrowLeftRight, Share2, Check } from 'lucide-react';
import { Product, Language } from '../types';

interface ProductCardProps {
  product: Product;
  lang: Language;
  isWishlisted: boolean;
  onToggleWishlist: (p: Product) => void;
  onAddToCart: (p: Product) => void;
  onBuyNow?: (p: Product) => void;
  onQuickView: (p: Product) => void;
  isCompared?: boolean;
  onToggleCompare?: (p: Product) => void;
  onOpenShareModal?: (p: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  lang,
  isWishlisted,
  onToggleWishlist,
  onAddToCart,
  onBuyNow,
  onQuickView,
  isCompared = false,
  onToggleCompare,
  onOpenShareModal
}) => {
  const [copiedLink, setCopiedLink] = useState(false);

  const discountPercent = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
    : 0;

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onOpenShareModal) {
      onOpenShareModal(product);
      return;
    }
    const nav = typeof window !== 'undefined' ? window.navigator : undefined;
    if (nav && 'share' in nav && typeof (nav as any).share === 'function') {
      (nav as any).share({
        title: lang === 'bn' ? product.nameBn : product.nameEn,
        text: `রঙিলা রূপ কিডস - ${lang === 'bn' ? product.nameBn : product.nameEn} (৳${product.price})`,
        url: `${window.location.origin}${window.location.pathname}?product=${product.id}`
      }).catch(() => {});
    } else {
      const productUrl = `${window.location.origin}${window.location.pathname}?product=${product.id}`;
      if (nav && nav.clipboard) {
        nav.clipboard.writeText(productUrl).catch(() => {});
      }
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2200);
    }
  };

  return (
    <div className={`group bg-white text-stone-900 rounded-3xl overflow-hidden border transition-all duration-300 flex flex-col h-full relative ${
      isCompared ? 'border-amber-500 ring-2 ring-amber-400/40 shadow-xl' : 'border-stone-200 shadow-sm hover:shadow-xl hover:border-amber-400'
    }`}>
      
      {/* Product Image Area */}
      <div className="relative aspect-[4/3] sm:aspect-[1/1] overflow-hidden bg-stone-100 cursor-pointer" onClick={() => onQuickView(product)}>
        <img
          src={product.image}
          alt={lang === 'bn' ? product.nameBn : product.nameEn}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
        />

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          {discountPercent > 0 && (
            <span className="bg-rose-600 text-white font-bold text-[10px] sm:text-xs px-2 py-0.5 rounded-full shadow-md">
              -{discountPercent}% {lang === 'bn' ? 'ছাড়' : 'OFF'}
            </span>
          )}
          {product.isBestSeller && (
            <span className="bg-amber-400 text-rose-950 font-bold text-[10px] sm:text-xs px-2 py-0.5 rounded-full shadow-md">
              ★ {lang === 'bn' ? 'বেস্ট সেলার' : 'Best Seller'}
            </span>
          )}
          {product.isFestiveSpecial && (
            <span className="bg-rose-900 text-amber-200 font-bold text-[10px] sm:text-xs px-2 py-0.5 rounded-full shadow-md border border-amber-400/30">
              {lang === 'bn' ? 'উৎসব কালেকশন' : 'Festive'}
            </span>
          )}
          {(product.isBoosted || product.boostStatus === 'Active') && (
            <span className="bg-gradient-to-r from-amber-500 via-rose-500 to-amber-500 text-rose-950 font-extrabold text-[10px] sm:text-xs px-2 py-0.5 rounded-full shadow-md border border-amber-300">
              🚀 {lang === 'bn' ? 'ট্রেন্ডিং' : 'Trending'}
            </span>
          )}
        </div>

        {/* Action buttons top right (Wishlist, Compare, Share Link) */}
        <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist(product);
            }}
            className={`p-2 rounded-full backdrop-blur-md transition-all shadow-md cursor-pointer ${
              isWishlisted 
                ? 'bg-rose-600 text-white' 
                : 'bg-white/90 text-stone-700 hover:bg-rose-50 hover:text-rose-600 border border-stone-200'
            }`}
            aria-label="Wishlist"
            title={lang === 'bn' ? 'উইশলিস্টে রাখুন' : 'Save to Wishlist'}
          >
            <Heart size={15} fill={isWishlisted ? "currentColor" : "none"} />
          </button>

          {/* Share Product across platforms Button */}
          <button
            onClick={handleShareClick}
            className={`p-2 rounded-full backdrop-blur-md transition-all shadow-md cursor-pointer ${
              copiedLink 
                ? 'bg-emerald-600 text-white' 
                : 'bg-white/90 text-stone-700 hover:bg-amber-50 hover:text-amber-700 border border-stone-200'
            }`}
            aria-label="Share Product"
            title={lang === 'bn' ? 'পণ্যটি শেয়ার করুন' : 'Share this product'}
          >
            {copiedLink ? <Check size={15} /> : <Share2 size={15} />}
          </button>

          {onToggleCompare && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleCompare(product);
              }}
              className={`p-2 rounded-full backdrop-blur-md transition-all shadow-md cursor-pointer ${
                isCompared
                  ? 'bg-amber-400 text-rose-950 font-bold border border-amber-300 ring-2 ring-amber-400/50'
                  : 'bg-white/90 text-stone-700 hover:bg-amber-50 hover:text-rose-950 border border-stone-200'
              }`}
              aria-label="Compare"
              title={isCompared ? (lang === 'bn' ? 'তুলনা থেকে সরান' : 'Remove from Compare') : (lang === 'bn' ? 'তুলনা করুন' : 'Add to Compare')}
            >
              <ArrowLeftRight size={15} />
            </button>
          )}
        </div>

        {/* Hover Quick View Overlay Button */}
        <div className="absolute inset-0 bg-stone-900/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(product);
            }}
            className="px-4 py-2 rounded-full bg-rose-950 text-amber-200 font-extrabold text-xs sm:text-sm shadow-xl hover:bg-rose-900 transition-all flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 duration-300"
          >
            <Eye size={16} />
            <span>{lang === 'bn' ? 'এক নজরে দেখুন' : 'Quick View'}</span>
          </button>
        </div>
      </div>

      {/* Product Content Details */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between space-y-2.5">
        <div>
          <div className="flex items-center justify-between text-xs mb-1 font-medium">
            <span className="bg-amber-100/80 text-amber-900 border border-amber-200 px-2 py-0.5 rounded-lg text-[11px] font-bold">
              {lang === 'bn' ? product.fabricBn : product.fabricEn}
            </span>
            <div className="flex items-center gap-1 text-amber-600">
              <Star size={12} className="fill-amber-400 text-amber-400" />
              <span className="font-bold text-stone-800">{product.rating}</span>
              <span className="text-[10px] text-stone-400">({product.reviewsCount})</span>
            </div>
          </div>

          <h3 
            onClick={() => onQuickView(product)}
            className="text-sm sm:text-base font-serif font-bold text-stone-900 line-clamp-2 hover:text-rose-900 transition-colors cursor-pointer leading-snug"
          >
            {lang === 'bn' ? product.nameBn : product.nameEn}
          </h3>
        </div>

        <div className="pt-2 border-t border-stone-100 space-y-2">
          {/* Price Tag & Stock */}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg sm:text-xl font-bold text-rose-950 font-sans">
                  ৳{product.price.toLocaleString()}
                </span>
                {product.originalPrice && (
                  <span className="text-xs text-stone-400 line-through font-sans">
                    ৳{product.originalPrice.toLocaleString()}
                  </span>
                )}
              </div>
              <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
                <CheckCircle size={10} />
                {lang === 'bn' ? 'স্টকে আছে' : 'In Stock'}
              </span>
            </div>

            <div className="text-[9px] text-stone-600 bg-stone-100 border border-stone-200 px-1.5 py-0.5 rounded font-semibold">
              <span>🚚 ৳৮০/৳১৫০</span>
            </div>
          </div>

          {/* Action Buttons: Instant Direct Order & Add to Cart */}
          <div className="grid grid-cols-2 gap-1.5 pt-0.5">
            <button
              onClick={() => onBuyNow ? onBuyNow(product) : onAddToCart(product)}
              className="w-full py-2 px-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-rose-950 font-black text-xs flex items-center justify-center gap-1 shadow-sm active:scale-95 cursor-pointer border border-amber-400"
              title={lang === 'bn' ? 'শুধুমাত্র এই পণ্যটি সরাসরি অর্ডার করুন' : 'Order this single product directly'}
            >
              <span>⚡ {lang === 'bn' ? 'অর্ডার করুন' : 'Order'}</span>
            </button>

            <button
              onClick={() => onAddToCart(product)}
              className="w-full py-2 px-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs flex items-center justify-center gap-1 border border-stone-200 active:scale-95 cursor-pointer transition-colors"
              title={lang === 'bn' ? 'কার্টে যোগ করুন' : 'Add to cart'}
            >
              <ShoppingBag size={13} />
              <span>{lang === 'bn' ? 'কার্ট' : 'Cart'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
