import React from 'react';
import { Home, ShoppingBag, User } from 'lucide-react';
import { Language } from '../types';

interface BottomNavProps {
  lang: Language;
  cartCount: number;
  onGoHome: () => void;
  onOpenCart: () => void;
  onOpenProfile: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  lang,
  cartCount,
  onGoHome,
  onOpenCart,
  onOpenProfile
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-rose-950/95 backdrop-blur-md text-amber-100 border-t-2 border-amber-500/40 shadow-2xl py-2 px-6 flex justify-around items-center">
      
      {/* 1. Home Button */}
      <button
        onClick={onGoHome}
        className="flex flex-col items-center gap-1 text-amber-200 hover:text-amber-400 transition-colors cursor-pointer group"
      >
        <div className="p-1.5 rounded-xl group-hover:bg-amber-500/20 transition-colors">
          <Home size={22} className="text-amber-300" />
        </div>
        <span className="text-[11px] font-bold tracking-wide">
          {lang === 'bn' ? 'হোম' : 'Home'}
        </span>
      </button>

      {/* 2. Cart / Chart Button */}
      <button
        onClick={onOpenCart}
        className="flex flex-col items-center gap-1 text-amber-200 hover:text-amber-400 transition-colors cursor-pointer group relative"
      >
        <div className="p-1.5 rounded-xl group-hover:bg-amber-500/20 transition-colors relative">
          <ShoppingBag size={22} className="text-amber-300" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-amber-500 text-rose-950 font-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-rose-950 animate-bounce shadow-md">
              {cartCount}
            </span>
          )}
        </div>
        <span className="text-[11px] font-bold tracking-wide">
          {lang === 'bn' ? 'কার্ট' : 'Cart'}
        </span>
      </button>

      {/* 3. Customer Profile Button */}
      <button
        onClick={onOpenProfile}
        className="flex flex-col items-center gap-1 text-amber-200 hover:text-amber-400 transition-colors cursor-pointer group"
      >
        <div className="p-1.5 rounded-xl group-hover:bg-amber-500/20 transition-colors">
          <User size={22} className="text-amber-300" />
        </div>
        <span className="text-[11px] font-bold tracking-wide">
          {lang === 'bn' ? 'প্রোফাইল' : 'Profile'}
        </span>
      </button>

    </div>
  );
};
