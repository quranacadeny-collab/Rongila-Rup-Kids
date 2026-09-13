import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Heart, 
  Search, 
  Sparkles, 
  Truck, 
  Globe, 
  Menu, 
  X,
  PhoneCall,
  User,
  ArrowLeftRight,
  Lock,
  ShieldCheck
} from 'lucide-react';
import { Language, CategoryId } from '../types';

interface NavbarProps {
  lang: Language;
  onLanguageToggle: () => void;
  cartCount: number;
  wishlistCount: number;
  compareCount?: number;
  pendingOrdersCount?: number;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onOpenCompare?: () => void;
  onOpenAIStylist: () => void;
  onOpenTrackOrder: () => void;
  onOpenAdmin: () => void;
  onOpenDrive?: () => void;
  onOpenCustomerProfile?: () => void;
  selectedCategory: CategoryId;
  onSelectCategory: (cat) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onToggleFilterDrawer?: () => void;
  announcementBn?: string;
  announcementEn?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  lang,
  onLanguageToggle,
  cartCount,
  wishlistCount,
  compareCount = 0,
  pendingOrdersCount = 0,
  onOpenCart,
  onOpenWishlist,
  onOpenCompare,
  onOpenAIStylist,
  onOpenTrackOrder,
  onOpenAdmin,
  onOpenCustomerProfile,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  announcementBn,
  announcementEn
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // 5-Click Rapid Easter Egg for Admin Panel
  const [clickCount, setClickCount] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);
  const [showSecretFeedback, setShowSecretFeedback] = useState(false);

  const handleLogoClick = () => {
    const now = Date.now();
    if (now - lastClickTime > 2000) {
      // If idle for more than 2 seconds, reset count
      setClickCount(1);
      setLastClickTime(now);
    } else {
      const newCount = clickCount + 1;
      setLastClickTime(now);
      setClickCount(newCount);
      
      if (newCount >= 5) {
        setClickCount(0);
        setShowSecretFeedback(true);
        setTimeout(() => setShowSecretFeedback(false), 2500);
        onOpenAdmin();
      }
    }
  };

  const categories: { id: CategoryId; bn: string; en: string; icon: string }[] = [
    { id: 'all', bn: '👶 সকল কিডস কালেকশন', en: 'All Kids Items', icon: '✨' },
    { id: 'combo', bn: '🎁 মেগা কম্বো প্যাকেজ', en: 'Combo Packages', icon: '🎁' },
    { id: 'babydress', bn: '👗 বেবি ফ্রক ও ড্রেস', en: 'Baby Frocks', icon: '👗' },
    { id: 'babyset', bn: '🍼 বেবি রোম্পার সেট', en: 'Romper Sets', icon: '🍼' },
    { id: 'frock', bn: '🎀 পার্টি ফ্রক ও গাউন', en: 'Party Frocks', icon: '🎀' },
    { id: 'panjabi', bn: '👔 বয়েজ পাঞ্জাবি ও ফতুয়া', en: 'Boys Panjabi', icon: '👔' },
    { id: 'footwear', bn: '👟 কিউট জুতো ও স্যান্ডেল', en: 'Cute Shoes', icon: '👟' },
    { id: 'accessories', bn: '👑 হেয়ার ব্যান্ড ও ক্রাউন', en: 'Accessories', icon: '👑' },
    { id: 'toys', bn: '🧸 খেলনা ও গিফট আইটেম', en: 'Toys & Gifts', icon: '🧸' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-gradient-to-r from-rose-950 via-rose-900 to-amber-950 text-amber-50 border-b-2 border-amber-400/30 shadow-lg">
      {/* Secret Admin Mode Toast Notification */}
      {showSecretFeedback && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-stone-900 text-amber-300 px-5 py-2.5 rounded-2xl shadow-2xl border-2 border-amber-400 font-bold text-xs flex items-center gap-2 animate-bounce">
          <span>✨</span>
          <span>{lang === 'bn' ? '🎉 সিক্রেট এডমিন প্যানেল মোড আনলক হয়েছে!' : '🎉 Secret Admin Panel Unlocked!'}</span>
        </div>
      )}

      {/* Top Banner Notice */}
      <div className="bg-gradient-to-r from-pink-700 via-rose-900 to-amber-700 text-amber-100 text-xs py-1.5 px-4 text-center font-medium tracking-wide flex justify-between items-center max-w-7xl mx-auto">
        <div className="hidden md:flex items-center gap-2 text-pink-100">
          <PhoneCall size={12} className="text-amber-300 animate-pulse" />
          <span>{lang === 'bn' ? 'হটলাইন: ০১৭৯২৭৬৫৬৯৩ (সকাল ৯টা - রাত ১০টা)' : 'Hotline: +880 01792765693'}</span>
        </div>
        
        <div className="mx-auto md:mx-0 font-semibold flex items-center gap-1.5 text-[11px] sm:text-xs">
          <span className="bg-amber-400 text-rose-950 text-[10px] px-2 py-0.5 rounded-full font-black uppercase shadow-xs">
            {lang === 'bn' ? '🎈 বেবি স্পেশাল' : '🎈 BABY SPECIAL'}
          </span>
          <span className="text-amber-100">
            {lang === 'bn' 
              ? (announcementBn || 'স্পেশাল অফার: "RONGILA20" কুপনে ২০% ছাড়! সারাদেশে ক্যাশ অন ডেলিভারি') 
              : (announcementEn || 'Special Offer: 20% OFF with "RONGILA20"! Cash on Delivery Nationwide')}
          </span>
        </div>

        <div className="hidden md:flex items-center gap-3">
          {onOpenCustomerProfile && (
            <button 
              onClick={onOpenCustomerProfile}
              className="hover:text-amber-300 transition-colors flex items-center gap-1 text-xs text-amber-200 cursor-pointer bg-white/10 px-2.5 py-0.5 rounded-full hover:bg-white/20"
            >
              <User size={12} />
              <span>{lang === 'bn' ? 'লগইন / মাই অ্যাকাউন্ট' : 'Login / Account'}</span>
            </button>
          )}
          <button 
            onClick={onOpenTrackOrder}
            className="hover:text-amber-300 transition-colors flex items-center gap-1 text-xs cursor-pointer text-amber-200"
          >
            <Truck size={12} />
            <span>{lang === 'bn' ? 'অর্ডার ট্র্যাক' : 'Track Order'}</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-3">
        {/* Brand Logo with 5-Click Easter Egg */}
        <div className="flex items-center gap-2.5">
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-amber-200 hover:text-white rounded-xl bg-rose-900/60"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* Logo with 5-Click Secret Admin trigger */}
          <div 
            onClick={handleLogoClick}
            className="flex items-center gap-2.5 group shrink-0 cursor-pointer select-none relative"
            title={lang === 'bn' ? 'রঙিলা রূপ কিডস - শিশুদের প্রিমিয়াম পোশাক' : 'Rongila Rup Kids'}
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 via-pink-400 to-rose-500 p-0.5 shadow-md group-hover:rotate-6 transition-all shrink-0 relative">
              <div className="w-full h-full bg-rose-950 rounded-[14px] flex items-center justify-center border border-amber-300/40">
                <span className="text-xl font-serif font-black text-amber-300">র</span>
              </div>
              {pendingOrdersCount > 0 && (
                <span 
                  className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-600 border-2 border-rose-950 rounded-full animate-ping" 
                  title={`${pendingOrdersCount} pending orders`}
                />
              )}
            </div>
            <div className="flex flex-col shrink-0">
              <div className="flex items-center gap-1">
                <span className="text-xl sm:text-2xl font-serif font-black tracking-tight bg-gradient-to-r from-amber-200 via-amber-300 to-pink-200 bg-clip-text text-transparent whitespace-nowrap">
                  {lang === 'bn' ? 'রঙিলা রূপ' : 'Rongila Rup'}
                </span>
                <span className="text-[10px] bg-pink-500/80 text-white font-extrabold px-1.5 py-0.2 rounded-full uppercase tracking-tighter">
                  KIDS
                </span>
              </div>
              <span className="text-[9.5px] tracking-wider text-amber-200/80 font-sans -mt-0.5 whitespace-nowrap flex items-center gap-1">
                <span>🌸</span>
                <span>{lang === 'bn' ? 'কিউট বেবি & কিডস বুটিক' : 'Cute Baby & Kids Boutique'}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="hidden md:flex flex-1 max-w-md mx-3 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={
              lang === 'bn' 
                ? 'বাচ্চাদের ফ্রক, সুতি রম্পার, বেবি সেট বা জুতা খুঁজুন...' 
                : 'Search baby frocks, rompers, baby sets, cute shoes...'
            }
            className="w-full pl-10 pr-8 py-2 bg-rose-900/70 border border-amber-400/40 rounded-full text-amber-100 placeholder-amber-200/50 text-xs focus:outline-none focus:ring-2 focus:ring-amber-300 focus:bg-rose-900 transition-all shadow-inner"
          />
          <Search size={16} className="absolute left-3.5 top-2.5 text-amber-300/80" />
          {searchQuery && (
            <button 
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-2 text-amber-300/80 hover:text-white text-xs p-1"
            >
              ✕
            </button>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* AI Stylist Button */}
          <button
            onClick={onOpenAIStylist}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-400 via-pink-400 to-rose-500 text-rose-950 font-black text-xs hover:scale-105 transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <Sparkles size={14} className="animate-spin text-rose-950" />
            <span className="hidden sm:inline">
              {lang === 'bn' ? 'AI স্টাইলিস্ট' : 'AI Stylist'}
            </span>
          </button>

          {/* User Profile / Login */}
          {onOpenCustomerProfile && (
            <button
              onClick={onOpenCustomerProfile}
              className="p-2 rounded-full bg-rose-900/80 hover:bg-rose-800 text-amber-200 hover:text-white transition-colors cursor-pointer border border-amber-400/20"
              title={lang === 'bn' ? 'গ্রাহক লগইন ও প্রোফাইল' : 'Customer Account'}
            >
              <User size={18} />
            </button>
          )}

          {/* Language Switcher */}
          <button
            onClick={onLanguageToggle}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-rose-900/80 border border-amber-400/30 text-amber-200 hover:text-white text-xs font-bold transition-colors cursor-pointer"
            title="Switch Language"
          >
            <Globe size={13} className="text-amber-300" />
            <span>{lang === 'bn' ? 'EN' : 'বাংলা'}</span>
          </button>

          {/* Wishlist Button */}
          <button
            onClick={onOpenWishlist}
            className="relative p-2 rounded-full bg-rose-900/80 hover:bg-rose-800 text-amber-200 hover:text-white transition-colors cursor-pointer border border-amber-400/20"
            aria-label="Wishlist"
            title={lang === 'bn' ? 'পছন্দের তালিকা' : 'Wishlist'}
          >
            <Heart size={18} className="text-pink-300" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* Product Compare Button */}
          {onOpenCompare && (
            <button
              onClick={onOpenCompare}
              className="relative p-2 rounded-full bg-rose-900/80 hover:bg-rose-800 text-amber-200 hover:text-white transition-colors cursor-pointer border border-amber-400/20 hidden sm:flex"
              aria-label="Compare"
              title={lang === 'bn' ? 'পণ্য তুলনা করুন' : 'Product Compare'}
            >
              <ArrowLeftRight size={18} />
              {compareCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-400 text-rose-950 text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {compareCount}
                </span>
              )}
            </button>
          )}

          {/* Cart Button */}
          <button
            onClick={onOpenCart}
            className="relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-rose-950 font-black text-xs transition-all shadow-md active:scale-95 cursor-pointer"
            aria-label="Cart"
          >
            <ShoppingBag size={16} />
            <span>{cartCount}</span>
          </button>
        </div>
      </div>

      {/* Categories Desktop Bar */}
      <div className="hidden lg:block border-t border-amber-500/20 bg-rose-950/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <nav className="flex space-x-1 py-1.5 overflow-x-auto">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                  selectedCategory === cat.id
                    ? 'bg-amber-400 text-rose-950 shadow-xs'
                    : 'text-amber-100/90 hover:text-white hover:bg-rose-900/60'
                }`}
              >
                <span>{cat.bn}</span>
              </button>
            ))}
          </nav>

          <button
            onClick={onOpenTrackOrder}
            className="text-xs font-bold text-amber-300 hover:text-amber-100 flex items-center gap-1.5 py-1"
          >
            <Truck size={14} />
            <span>{lang === 'bn' ? 'অর্ডার ট্র্যাকিং' : 'Track Order'}</span>
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-amber-500/20 bg-rose-950 px-4 pt-3 pb-6 space-y-3">
          {/* Mobile Search */}
          <div className="relative mb-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={lang === 'bn' ? 'বাচ্চাদের ফ্রক, সুতি রম্পার বা জুতা খুঁজুন...' : 'Search items...'}
              className="w-full pl-10 pr-4 py-2 bg-rose-900/80 border border-amber-400/30 rounded-xl text-amber-100 text-xs focus:outline-none"
            />
            <Search size={16} className="absolute left-3 top-2.5 text-amber-300/80" />
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  onSelectCategory(cat.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-amber-400 text-rose-950'
                    : 'text-amber-100 hover:bg-rose-900/60 bg-rose-900/30'
                }`}
              >
                {cat.bn}
              </button>
            ))}
          </div>

          <div className="pt-3 border-t border-amber-500/20 flex flex-col gap-2">
            {onOpenCustomerProfile && (
              <button
                onClick={() => {
                  onOpenCustomerProfile();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-amber-200 bg-rose-900/40 flex items-center gap-2"
              >
                <User size={15} />
                <span>{lang === 'bn' ? 'কাস্টমার লগইন / মাই অ্যাকাউন্ট' : 'Customer Login / Account'}</span>
              </button>
            )}
            <button
              onClick={() => {
                onOpenTrackOrder();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-amber-200 bg-rose-900/40 flex items-center gap-2"
            >
              <Truck size={15} />
              <span>{lang === 'bn' ? 'অর্ডার ট্র্যাক করুন' : 'Track Order'}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

