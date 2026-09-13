import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  Plus, 
  ShoppingBag, 
  Star, 
  Check, 
  ArrowLeftRight, 
  Sparkles,
  Search,
  AlertCircle
} from 'lucide-react';
import { Product, Language } from '../types';

interface ProductComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  comparedProducts: Product[];
  allProducts: Product[];
  onRemoveFromCompare: (productId: string) => void;
  onAddToCompare: (product: Product) => void;
  onClearCompare: () => void;
  onAddToCart: (p: Product, size?: string) => void;
  onBuyNow: (p: Product, size?: string) => void;
}

export const ProductComparisonModal: React.FC<ProductComparisonModalProps> = ({
  isOpen,
  onClose,
  lang,
  comparedProducts,
  allProducts,
  onRemoveFromCompare,
  onAddToCompare,
  onClearCompare,
  onAddToCart,
  onBuyNow,
}) => {
  const [highlightDifferences, setHighlightDifferences] = useState(false);
  const [isAddPickerOpen, setIsAddPickerOpen] = useState(false);
  const [pickerSearchQuery, setPickerSearchQuery] = useState('');

  if (!isOpen) return null;

  // Products available to add (excluding ones already being compared)
  const availableToAdd = allProducts.filter(
    p => !comparedProducts.some(cp => cp.id === p.id)
  ).filter(p => {
    if (!pickerSearchQuery.trim()) return true;
    const q = pickerSearchQuery.toLowerCase();
    return (
      p.nameBn.toLowerCase().includes(q) ||
      p.nameEn.toLowerCase().includes(q) ||
      p.fabricBn.toLowerCase().includes(q) ||
      p.fabricEn.toLowerCase().includes(q)
    );
  });

  // Check if a feature is different among compared products
  const isDifferent = (keyExtractor: (p: Product) => string | number | boolean) => {
    if (comparedProducts.length < 2) return false;
    const firstVal = JSON.stringify(keyExtractor(comparedProducts[0]));
    return comparedProducts.some(p => JSON.stringify(keyExtractor(p)) !== firstVal);
  };

  const isPriceDiff = isDifferent(p => p.price);
  const isFabricDiff = isDifferent(p => lang === 'bn' ? p.fabricBn : p.fabricEn);
  const isColorDiff = isDifferent(p => lang === 'bn' ? p.colorBn : p.colorEn);
  const isRatingDiff = isDifferent(p => p.rating);
  const isCategoryDiff = isDifferent(p => p.category);
  const isSizesDiff = isDifferent(p => (p.sizes || []).join(','));

  const maxCompareCount = 3;
  const emptySlotsCount = Math.max(0, maxCompareCount - comparedProducts.length);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-fade-in">
      <div className="relative w-full max-w-6xl bg-stone-900 text-amber-50 rounded-3xl shadow-2xl overflow-hidden border border-amber-500/30 my-auto max-h-[94vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 bg-rose-950 border-b border-amber-500/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center shrink-0">
              <ArrowLeftRight size={22} />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-serif font-extrabold text-amber-100 flex items-center gap-2">
                <span>{lang === 'bn' ? 'পণ্য তুলনা করার টুল' : 'Product Comparison Tool'}</span>
                <span className="text-xs bg-amber-500 text-rose-950 font-black px-2 py-0.5 rounded-full">
                  {comparedProducts.length}/{maxCompareCount}
                </span>
              </h2>
              <p className="text-xs text-amber-300/70">
                {lang === 'bn' 
                  ? 'সর্বোচ্চ ৩টি পণ্যের ফিচার, কাপড়ের ধরন, সাইজ ও মূল্য পাশাপাশি মিলিয়ে দেখুন' 
                  : 'Compare features, fabric, size, and prices side-by-side (Up to 3 items)'}
              </p>
            </div>
          </div>

          {/* Controls Right */}
          <div className="flex items-center gap-2 sm:gap-3">
            {comparedProducts.length >= 2 && (
              <label className="flex items-center gap-2 text-xs font-bold text-amber-200 bg-rose-900/60 border border-amber-500/30 px-3 py-1.5 rounded-xl cursor-pointer hover:bg-rose-900">
                <input
                  type="checkbox"
                  checked={highlightDifferences}
                  onChange={(e) => setHighlightDifferences(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-amber-400 cursor-pointer"
                />
                <span>{lang === 'bn' ? 'পার্থক্য হাইলাইট করুন' : 'Highlight Differences'}</span>
              </label>
            )}

            {comparedProducts.length > 0 && (
              <button
                onClick={onClearCompare}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-900/80 hover:bg-rose-800 text-rose-200 border border-rose-500/30 flex items-center gap-1 transition-colors cursor-pointer"
                title="Clear All"
              >
                <Trash2 size={14} />
                <span className="hidden sm:inline">{lang === 'bn' ? 'সব মুছুন' : 'Clear All'}</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-rose-900 text-amber-200 transition-colors cursor-pointer"
            >
              <X size={22} />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Table Body */}
        <div className="p-4 sm:p-6 overflow-x-auto overflow-y-auto flex-1 scrollbar-thin">
          
          {comparedProducts.length === 0 ? (
            /* Empty State */
            <div className="py-16 text-center space-y-4 max-w-md mx-auto">
              <div className="w-16 h-16 bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center mx-auto border border-amber-500/40">
                <ArrowLeftRight size={32} />
              </div>
              <h3 className="text-xl font-serif font-bold text-amber-100">
                {lang === 'bn' ? 'কোনো পণ্য তুলনা তালিকায় যোগ করা হয়নি' : 'No Products Added for Comparison'}
              </h3>
              <p className="text-xs text-amber-300/70">
                {lang === 'bn' 
                  ? 'পণ্য কার্ডের "তুলনা করুন" বাটনে ক্লিক করুন অথবা নিচের বাটন থেকে সরাসরি পণ্য সিলেক্ট করুন।' 
                  : 'Click the "Compare" button on any product card or choose products using the button below.'}
              </p>
              <button
                onClick={() => setIsAddPickerOpen(true)}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-rose-950 font-extrabold text-sm shadow-xl flex items-center justify-center gap-2 mx-auto cursor-pointer"
              >
                <Plus size={18} />
                <span>{lang === 'bn' ? 'তুলনার জন্য পণ্য সিলেক্ট করুন' : 'Select Products to Compare'}</span>
              </button>
            </div>
          ) : (
            /* Comparison Grid / Table */
            <div className="min-w-[650px] space-y-4">
              
              {/* Top Row: Product Cards Headers */}
              <div className="grid grid-cols-12 gap-3 pb-4 border-b border-amber-500/20">
                {/* Feature Label Column Header */}
                <div className="col-span-3 sm:col-span-3 flex flex-col justify-end p-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                    {lang === 'bn' ? 'বৈশিষ্ট্যসমূহ' : 'Specifications'}
                  </span>
                </div>

                {/* Compared Products Columns */}
                <div className="col-span-9 sm:col-span-9 grid grid-cols-3 gap-3">
                  {comparedProducts.map((product) => {
                    const discount = product.originalPrice 
                      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
                      : 0;

                    return (
                      <div 
                        key={product.id} 
                        className="bg-rose-950/90 rounded-2xl p-3 border border-amber-500/30 flex flex-col justify-between relative group shadow-md"
                      >
                        {/* Remove button */}
                        <button
                          onClick={() => onRemoveFromCompare(product.id)}
                          className="absolute top-2 right-2 p-1.5 rounded-full bg-rose-900/80 hover:bg-rose-700 text-amber-200 transition-colors z-10 shadow cursor-pointer"
                          title={lang === 'bn' ? 'তালিকা থেকে সরান' : 'Remove item'}
                        >
                          <X size={14} />
                        </button>

                        <div className="space-y-2">
                          {/* Image */}
                          <div className="aspect-square rounded-xl overflow-hidden bg-rose-900/40 relative">
                            <img
                              src={product.image}
                              alt={lang === 'bn' ? product.nameBn : product.nameEn}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                            {discount > 0 && (
                              <span className="absolute top-1.5 left-1.5 bg-rose-600 text-white font-bold text-[10px] px-2 py-0.5 rounded-full">
                                -{discount}%
                              </span>
                            )}
                          </div>

                          {/* Name & ID */}
                          <div>
                            <span className="text-[10px] text-amber-300/60 font-mono block">SKU: {product.sku || product.id}</span>
                            <h3 className="text-xs sm:text-sm font-serif font-bold text-amber-100 line-clamp-2 leading-snug">
                              {lang === 'bn' ? product.nameBn : product.nameEn}
                            </h3>
                          </div>
                        </div>

                        {/* Top Cart Action */}
                        <div className="pt-2 mt-2 border-t border-amber-500/20">
                          <button
                            onClick={() => onAddToCart(product)}
                            className="w-full py-1.5 px-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-rose-950 font-extrabold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer shadow"
                          >
                            <ShoppingBag size={13} />
                            <span>{lang === 'bn' ? 'ব্যাগে নিন' : 'Add to Bag'}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {/* Empty Slot Placeholders */}
                  {Array.from({ length: emptySlotsCount }).map((_, idx) => (
                    <div
                      key={idx}
                      onClick={() => setIsAddPickerOpen(true)}
                      className="bg-rose-950/30 rounded-2xl p-4 border-2 border-dashed border-amber-500/30 flex flex-col items-center justify-center text-center space-y-2 cursor-pointer hover:border-amber-400/70 hover:bg-rose-950/50 transition-all min-h-[180px]"
                    >
                      <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center">
                        <Plus size={20} />
                      </div>
                      <span className="text-xs font-bold text-amber-200">
                        {lang === 'bn' ? '+ পণ্য যুক্ত করুন' : '+ Add Item'}
                      </span>
                      <span className="text-[10px] text-amber-300/50">
                        {lang === 'bn' ? `স্লট ${comparedProducts.length + idx + 1}/${maxCompareCount}` : `Slot ${comparedProducts.length + idx + 1}/${maxCompareCount}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Specification Table Rows */}
              <div className="space-y-1 text-xs divide-y divide-amber-500/10">
                
                {/* 1. PRICE */}
                <div className={`grid grid-cols-12 gap-3 py-3 items-center rounded-xl px-2 ${
                  highlightDifferences && isPriceDiff ? 'bg-amber-500/20 border border-amber-400/40' : ''
                }`}>
                  <div className="col-span-3 font-bold text-amber-300 flex items-center gap-1.5">
                    <span>{lang === 'bn' ? 'মূল্য (Price)' : 'Price'}</span>
                    {highlightDifferences && isPriceDiff && (
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" title="Different" />
                    )}
                  </div>
                  <div className="col-span-9 grid grid-cols-3 gap-3">
                    {comparedProducts.map((p) => (
                      <div key={p.id} className="font-extrabold text-amber-200 text-sm">
                        ৳{p.price.toLocaleString()}
                        {p.originalPrice && (
                          <span className="text-xs text-amber-300/50 line-through ml-1.5 font-normal">
                            ৳{p.originalPrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. FABRIC / MATERIAL */}
                <div className={`grid grid-cols-12 gap-3 py-3 items-center rounded-xl px-2 ${
                  highlightDifferences && isFabricDiff ? 'bg-amber-500/20 border border-amber-400/40' : ''
                }`}>
                  <div className="col-span-3 font-bold text-amber-300">
                    {lang === 'bn' ? 'কাপড়ের ধরন (Fabric)' : 'Fabric'}
                  </div>
                  <div className="col-span-9 grid grid-cols-3 gap-3">
                    {comparedProducts.map((p) => (
                      <div key={p.id} className="text-amber-100 font-medium">
                        {lang === 'bn' ? p.fabricBn : p.fabricEn}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. COLOR */}
                <div className={`grid grid-cols-12 gap-3 py-3 items-center rounded-xl px-2 ${
                  highlightDifferences && isColorDiff ? 'bg-amber-500/20 border border-amber-400/40' : ''
                }`}>
                  <div className="col-span-3 font-bold text-amber-300">
                    {lang === 'bn' ? 'রঙ (Color)' : 'Color'}
                  </div>
                  <div className="col-span-9 grid grid-cols-3 gap-3">
                    {comparedProducts.map((p) => (
                      <div key={p.id} className="text-amber-100 font-medium">
                        {lang === 'bn' ? p.colorBn : p.colorEn}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. SIZES AVAILABLE */}
                <div className={`grid grid-cols-12 gap-3 py-3 items-center rounded-xl px-2 ${
                  highlightDifferences && isSizesDiff ? 'bg-amber-500/20 border border-amber-400/40' : ''
                }`}>
                  <div className="col-span-3 font-bold text-amber-300">
                    {lang === 'bn' ? 'উপলব্ধ সাইজ (Sizes)' : 'Sizes'}
                  </div>
                  <div className="col-span-9 grid grid-cols-3 gap-3">
                    {comparedProducts.map((p) => (
                      <div key={p.id} className="flex flex-wrap gap-1">
                        {p.sizes && p.sizes.length > 0 ? (
                          p.sizes.map(sz => (
                            <span key={sz} className="px-2 py-0.5 bg-rose-900 border border-amber-500/30 rounded text-[10px] text-amber-200">
                              {sz}
                            </span>
                          ))
                        ) : (
                          <span className="text-amber-300/50 text-[11px] italic">N/A</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 5. RATING & REVIEWS */}
                <div className={`grid grid-cols-12 gap-3 py-3 items-center rounded-xl px-2 ${
                  highlightDifferences && isRatingDiff ? 'bg-amber-500/20 border border-amber-400/40' : ''
                }`}>
                  <div className="col-span-3 font-bold text-amber-300">
                    {lang === 'bn' ? 'রেটিং (Rating)' : 'Rating'}
                  </div>
                  <div className="col-span-9 grid grid-cols-3 gap-3">
                    {comparedProducts.map((p) => (
                      <div key={p.id} className="flex items-center gap-1.5">
                        <Star size={14} className="fill-amber-400 text-amber-400" />
                        <span className="font-bold text-amber-200">{p.rating}</span>
                        <span className="text-[10px] text-amber-300/60">({p.reviewsCount})</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 6. STOCK STATUS */}
                <div className="grid grid-cols-12 gap-3 py-3 items-center rounded-xl px-2">
                  <div className="col-span-3 font-bold text-amber-300">
                    {lang === 'bn' ? 'স্টক অবস্থা (Stock)' : 'Stock Status'}
                  </div>
                  <div className="col-span-9 grid grid-cols-3 gap-3">
                    {comparedProducts.map((p) => (
                      <div key={p.id}>
                        {p.inStock ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold border border-emerald-500/40">
                            <Check size={12} />
                            {lang === 'bn' ? `স্টকে আছে (${p.stockQuantity || 'উপলব্ধ'})` : `In Stock (${p.stockQuantity || 'Available'})`}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[11px] font-bold border border-rose-500/40">
                            <AlertCircle size={12} />
                            {lang === 'bn' ? 'স্টক আউট' : 'Out of Stock'}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 7. KEY DETAILS / FEATURES */}
                <div className="grid grid-cols-12 gap-3 py-3 items-start rounded-xl px-2">
                  <div className="col-span-3 font-bold text-amber-300">
                    {lang === 'bn' ? 'বিশেষ বৈশিষ্ট্যসমূহ' : 'Key Highlights'}
                  </div>
                  <div className="col-span-9 grid grid-cols-3 gap-3">
                    {comparedProducts.map((p) => {
                      const details = lang === 'bn' ? p.detailsBn : p.detailsEn;
                      return (
                        <div key={p.id} className="space-y-1">
                          {details && details.length > 0 ? (
                            <ul className="list-disc list-inside space-y-1 text-amber-100/90 text-[11px]">
                              {details.map((d, i) => (
                                <li key={i}>{d}</li>
                              ))}
                            </ul>
                          ) : (
                            <span className="text-amber-300/50 italic text-[11px]">-</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 8. DESCRIPTION */}
                <div className="grid grid-cols-12 gap-3 py-3 items-start rounded-xl px-2">
                  <div className="col-span-3 font-bold text-amber-300">
                    {lang === 'bn' ? 'সংক্ষিপ্ত বিবরণ' : 'Description'}
                  </div>
                  <div className="col-span-9 grid grid-cols-3 gap-3">
                    {comparedProducts.map((p) => (
                      <div key={p.id} className="text-amber-200/80 text-[11px] leading-relaxed">
                        {lang === 'bn' ? p.descriptionBn : p.descriptionEn}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 9. BOTTOM ACTION BUTTONS */}
                <div className="grid grid-cols-12 gap-3 pt-4">
                  <div className="col-span-3" />
                  <div className="col-span-9 grid grid-cols-3 gap-3">
                    {comparedProducts.map((p) => (
                      <div key={p.id} className="space-y-2">
                        <button
                          onClick={() => onAddToCart(p)}
                          className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-rose-950 font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
                        >
                          <ShoppingBag size={14} />
                          <span>{lang === 'bn' ? 'ব্যাগে নিন' : 'Add to Bag'}</span>
                        </button>
                        <button
                          onClick={() => onBuyNow(p)}
                          className="w-full py-1.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-rose-950 font-bold text-xs flex items-center justify-center transition-all cursor-pointer shadow"
                        >
                          <span>{lang === 'bn' ? 'অর্ডার করুন' : 'Buy Now'}</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>

        {/* Modal Footer / Add Product Slot Bar */}
        <div className="px-6 py-3 bg-rose-950 border-t border-amber-500/20 flex items-center justify-between">
          <div className="text-xs text-amber-300/80 font-medium">
            {lang === 'bn' 
              ? `তুলনার অধীনে ${comparedProducts.length}টি পণ্য রয়েছে (সর্বোচ্চ ${maxCompareCount}টি)` 
              : `Comparing ${comparedProducts.length} of ${maxCompareCount} products`}
          </div>

          {comparedProducts.length < maxCompareCount && (
            <button
              onClick={() => setIsAddPickerOpen(true)}
              className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/40 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus size={16} />
              <span>{lang === 'bn' ? 'আরেকটি পণ্য যুক্ত করুন' : 'Add Product'}</span>
            </button>
          )}
        </div>

      </div>

      {/* Add Product Picker Sub-Modal */}
      {isAddPickerOpen && (
        <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-rose-950 text-amber-50 rounded-3xl border border-amber-500/30 max-w-lg w-full max-h-[80vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Picker Header */}
            <div className="p-4 bg-rose-900 flex items-center justify-between border-b border-amber-500/20">
              <h3 className="text-sm font-serif font-bold text-amber-100 flex items-center gap-2">
                <Plus size={18} className="text-amber-400" />
                <span>{lang === 'bn' ? 'তুলনার জন্য পণ্য নির্বাচন করুন' : 'Select Product to Compare'}</span>
              </h3>
              <button onClick={() => setIsAddPickerOpen(false)} className="p-1 text-amber-200 hover:text-white">
                <X size={18} />
              </button>
            </div>

            {/* Picker Search */}
            <div className="p-3 border-b border-amber-500/20">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-2.5 text-amber-400" />
                <input
                  type="text"
                  value={pickerSearchQuery}
                  onChange={(e) => setPickerSearchQuery(e.target.value)}
                  placeholder={lang === 'bn' ? 'পণ্যের নাম বা ফেব্রিক লিখে খুঁজুন...' : 'Search by name or fabric...'}
                  className="w-full pl-9 pr-3 py-2 bg-rose-950 border border-amber-500/30 rounded-xl text-xs text-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
            </div>

            {/* Product List */}
            <div className="p-3 overflow-y-auto flex-1 space-y-2">
              {availableToAdd.length === 0 ? (
                <p className="text-xs text-amber-300/60 text-center py-8 italic">
                  {lang === 'bn' ? 'যোগ করার জন্য কোনো পণ্য পাওয়া যায়নি' : 'No available products to add'}
                </p>
              ) : (
                availableToAdd.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => {
                      onAddToCompare(p);
                      setIsAddPickerOpen(false);
                      setPickerSearchQuery('');
                    }}
                    className="p-2.5 bg-rose-900/40 hover:bg-rose-900/80 rounded-2xl border border-amber-500/20 flex items-center gap-3 cursor-pointer transition-colors"
                  >
                    <img
                      src={p.image}
                      alt={p.nameEn}
                      className="w-12 h-12 rounded-xl object-cover shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-serif font-bold text-amber-100 truncate">
                        {lang === 'bn' ? p.nameBn : p.nameEn}
                      </h4>
                      <p className="text-[10px] text-amber-300/70">
                        {lang === 'bn' ? p.fabricBn : p.fabricEn} • ৳{p.price.toLocaleString()}
                      </p>
                    </div>
                    <button className="px-3 py-1.5 rounded-xl bg-amber-500 text-rose-950 font-extrabold text-xs shrink-0">
                      {lang === 'bn' ? 'যোগ করুন' : 'Add'}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
