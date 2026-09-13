import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag, Check, Truck } from 'lucide-react';
import { CartItem, Language, StoreSettings } from '../types';
import { COUPON_CODES } from '../data/products';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  cartItems: CartItem[];
  storeSettings?: StoreSettings;
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onProceedToCheckout: (appliedDiscount: number, shippingFee: number) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  lang,
  cartItems,
  storeSettings,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout
}) => {
  if (!isOpen) return null;

  const [couponInput, setCouponInput] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [deliveryArea, setDeliveryArea] = useState<'dhaka' | 'outside' | 'express'>('dhaka');

  const shippingInside = storeSettings?.shippingInsideDhaka || 80;
  const shippingOutside = storeSettings?.shippingOutsideDhaka || 150;
  const shippingFee = deliveryArea === 'dhaka' ? shippingInside : deliveryArea === 'outside' ? shippingOutside : (shippingInside + 120);

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.product.price * item.quantity, 
    0
  );

  const discountAmount = Math.round(subtotal * discountPercent);
  const finalTotal = subtotal - discountAmount + shippingFee;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    setCouponSuccess('');

    const upper = couponInput.trim().toUpperCase();
    if (COUPON_CODES[upper]) {
      setDiscountPercent(COUPON_CODES[upper]);
      setCouponSuccess(
        lang === 'bn' 
          ? `কুপন সফল! ${(COUPON_CODES[upper] * 100)}% ছাড় পাওয়া গেছে।` 
          : `Coupon Applied! ${(COUPON_CODES[upper] * 100)}% Discount Applied.`
      );
    } else {
      setCouponError(
        lang === 'bn' 
          ? 'অবৈধ কুপন কোড! চেষ্টা করুন "RONGILA20" বা "BOISHAKH10"' 
          : 'Invalid Code! Try "RONGILA20" or "BOISHAKH10"'
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm animate-fade-in flex justify-end">
      <div className="w-full max-w-md bg-stone-50 h-full shadow-2xl flex flex-col justify-between border-l border-amber-500/20">
        
        {/* Cart Drawer Header */}
        <div className="px-6 py-4 bg-rose-950 text-amber-50 flex items-center justify-between border-b border-amber-500/20">
          <div className="flex items-center gap-2">
            <ShoppingBag className="text-amber-400" size={20} />
            <h2 className="text-lg font-serif font-bold text-amber-100">
              {lang === 'bn' ? 'শপিং ব্যাগ' : 'Your Shopping Bag'}
            </h2>
            <span className="bg-amber-500 text-rose-950 font-bold text-xs px-2 py-0.5 rounded-full">
              {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-rose-900 text-amber-200 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Cart Item List */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {cartItems.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-16 h-16 bg-amber-100 text-rose-900 rounded-full flex items-center justify-center mx-auto opacity-70">
                <ShoppingBag size={32} />
              </div>
              <p className="text-stone-600 font-medium text-sm">
                {lang === 'bn' ? 'আপনার শপিং ব্যাগটি বর্তমানে ফাঁকা!' : 'Your shopping bag is currently empty!'}
              </p>
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-full bg-rose-900 text-amber-100 font-bold text-xs hover:bg-rose-800 transition-colors"
              >
                {lang === 'bn' ? 'কেনাকাটা শুরু করুন' : 'Start Shopping'}
              </button>
            </div>
          ) : (
            cartItems.map((item) => (
              <div 
                key={item.product.id}
                className="p-3 bg-white rounded-2xl border border-stone-200 shadow-sm flex items-center gap-3 relative group"
              >
                <img
                  src={item.product.image}
                  alt={lang === 'bn' ? item.product.nameBn : item.product.nameEn}
                  referrerPolicy="no-referrer"
                  className="w-16 h-20 object-cover rounded-xl border border-stone-100 shrink-0"
                />

                <div className="flex-1 min-w-0 space-y-1">
                  <h4 className="text-xs font-serif font-bold text-stone-900 truncate">
                    {lang === 'bn' ? item.product.nameBn : item.product.nameEn}
                  </h4>

                  {item.selectedSize && (
                    <span className="inline-block text-[10px] bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded font-medium">
                      {lang === 'bn' ? 'সাইজ:' : 'Size:'} {item.selectedSize}
                    </span>
                  )}

                  <div className="text-xs font-bold text-rose-900 flex items-center gap-1">
                    <span>৳{(item.product.price * item.quantity).toLocaleString()}</span>
                    {item.quantity > 1 && (
                      <span className="text-[10px] text-stone-500 font-normal">
                        ({item.quantity}টি × ৳{item.product.price.toLocaleString()})
                      </span>
                    )}
                  </div>

                  {/* Quantity controls */}
                  <div className="flex items-center gap-2 pt-1">
                    <div className="flex items-center border border-stone-200 rounded-lg bg-stone-50">
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, -1)}
                        className="p-1 hover:bg-stone-200 text-stone-700 rounded-l-lg"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="px-2.5 text-xs font-bold text-stone-800">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, 1)}
                        className="p-1 hover:bg-stone-200 text-stone-700 rounded-r-lg"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onRemoveItem(item.product.id)}
                  className="p-1.5 text-stone-400 hover:text-rose-600 transition-colors"
                  aria-label="Remove item"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer calculation section */}
        {cartItems.length > 0 && (
          <div className="p-6 bg-white border-t border-stone-200 space-y-4 shadow-lg">
            {/* Delivery Charge Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700 flex items-center gap-1">
                <Truck size={14} className="text-amber-600" />
                <span>{lang === 'bn' ? 'ডেলিভারি এরিয়া নির্বাচন:' : 'Delivery Area:'}</span>
              </label>
              <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                <button
                  onClick={() => setDeliveryArea('dhaka')}
                  className={`p-2 rounded-xl border text-center font-semibold transition-all ${
                    deliveryArea === 'dhaka' 
                      ? 'bg-rose-950 text-amber-200 border-rose-950 shadow' 
                      : 'bg-stone-50 text-stone-700 border-stone-200'
                  }`}
                >
                  <div>{lang === 'bn' ? 'ঢাকা শহর' : 'Dhaka City'}</div>
                  <div className="text-[10px] text-amber-400">৳{shippingInside}</div>
                </button>

                <button
                  onClick={() => setDeliveryArea('outside')}
                  className={`p-2 rounded-xl border text-center font-semibold transition-all ${
                    deliveryArea === 'outside' 
                      ? 'bg-rose-950 text-amber-200 border-rose-950 shadow' 
                      : 'bg-stone-50 text-stone-700 border-stone-200'
                  }`}
                >
                  <div>{lang === 'bn' ? 'ঢাকার বাইরে' : 'Outside Dhaka'}</div>
                  <div className="text-[10px] text-amber-400">৳{shippingOutside}</div>
                </button>

                <button
                  onClick={() => setDeliveryArea('express')}
                  className={`p-2 rounded-xl border text-center font-semibold transition-all ${
                    deliveryArea === 'express' 
                      ? 'bg-rose-950 text-amber-200 border-rose-950 shadow' 
                      : 'bg-stone-50 text-stone-700 border-stone-200'
                  }`}
                >
                  <div>{lang === 'bn' ? 'এক্সপ্রেস (২৪ঘণ্টা)' : 'Express 24h'}</div>
                  <div className="text-[10px] text-amber-400">৳{shippingInside + 120}</div>
                </button>
              </div>
            </div>

            {/* Coupon Promo Form */}
            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  placeholder={lang === 'bn' ? 'কুপন কোড (যেমন: RONGILA20)' : 'Coupon Code (e.g. RONGILA20)'}
                  className="w-full pl-8 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs uppercase text-stone-800 font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
                <Tag size={14} className="absolute left-2.5 top-2.5 text-stone-400" />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-stone-800 text-white font-bold text-xs rounded-xl hover:bg-stone-900"
              >
                {lang === 'bn' ? 'প্রয়োগ' : 'Apply'}
              </button>
            </form>

            {couponSuccess && (
              <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                <Check size={12} /> {couponSuccess}
              </p>
            )}
            {couponError && (
              <p className="text-[11px] text-rose-600 font-bold">
                {couponError}
              </p>
            )}

            {/* Calculations Summary */}
            <div className="space-y-1.5 text-xs text-stone-600 pt-2 border-t border-stone-100">
              <div className="flex justify-between">
                <span>{lang === 'bn' ? 'সাবটোটাল:' : 'Subtotal:'}</span>
                <span className="font-bold text-stone-800">৳{subtotal.toLocaleString()}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>{lang === 'bn' ? 'কুপন ডিসকাউন্ট:' : 'Coupon Discount:'}</span>
                  <span>-৳{discountAmount.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>{lang === 'bn' ? 'ডেলিভারি চার্জ:' : 'Shipping Fee:'}</span>
                <span className="font-bold text-stone-800">৳{shippingFee}</span>
              </div>

              <div className="flex justify-between text-base font-serif font-extrabold text-rose-950 pt-2 border-t border-stone-200">
                <span>{lang === 'bn' ? 'সর্বমোট মূল্য:' : 'Total Payable:'}</span>
                <span className="text-xl font-sans">৳{finalTotal.toLocaleString()}</span>
              </div>
            </div>

            {/* Proceed Button */}
            <button
              onClick={() => onProceedToCheckout(discountAmount, shippingFee)}
              className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-rose-950 font-bold text-sm shadow-xl flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98"
            >
              <span>{lang === 'bn' ? 'চেকআউট সম্পন্ন করুন' : 'Proceed to Checkout'}</span>
              <ArrowRight size={18} />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
