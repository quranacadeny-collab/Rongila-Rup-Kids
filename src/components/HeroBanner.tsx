import React from 'react';
import { Sparkles, ShieldCheck, Truck, RefreshCw, HeartHandshake } from 'lucide-react';
import { Language } from '../types';

interface HeroBannerProps {
  lang: Language;
  onOpenAIStylist: () => void;
  heroBadgeBn?: string;
  heroBadgeEn?: string;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  lang,
  onOpenAIStylist,
  heroBadgeBn,
  heroBadgeEn
}) => {
  return (
    <div className="relative bg-gradient-to-r from-rose-950 via-rose-900 to-amber-950 text-amber-50 overflow-hidden py-3 sm:py-4 border-b border-amber-500/20">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-3 sm:px-6 relative z-10 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-center sm:text-left">
        
        {/* Left: Headline & Compact Badge */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-[11px] font-semibold">
            <Sparkles size={12} className="text-amber-400" />
            <span>
              {lang === 'bn' ? (heroBadgeBn || 'প্রিমিয়াম বাচ্ছাদের ফ্যাশন ও কিউট কালেকশন ২০২৬') : (heroBadgeEn || 'Premium Kids & Baby Fashion Collection 2026')}
            </span>
          </div>

          <h1 className="text-sm sm:text-base md:text-lg font-serif font-bold text-amber-100 leading-snug">
            {lang === 'bn' ? (
              <span>
                কিউট বাচ্ছাদের প্রিমিয়াম পোশাক ও বেবি কেয়ার শপে স্বাগতম
              </span>
            ) : (
              <span>
                Adorable Baby & Kids Clothing — Welcome to Rongila Rup Kids
              </span>
            )}
          </h1>
        </div>

        {/* Right: AI Stylist & Courier Badges in compact format */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="hidden md:flex items-center gap-3 text-[11px] text-amber-200/90 font-medium pr-2 border-r border-amber-500/30">
            <span className="flex items-center gap-1">
              <ShieldCheck size={14} className="text-amber-400" />
              {lang === 'bn' ? '১০০% অরিজিনাল' : '100% Authentic'}
            </span>
            <span className="flex items-center gap-1">
              <Truck size={14} className="text-amber-400" />
              {lang === 'bn' ? 'ক্যাশ অন ডেলিভারি' : 'Cash on Delivery'}
            </span>
          </div>

          <button
            onClick={onOpenAIStylist}
            className="px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-rose-600 text-rose-950 font-extrabold text-xs hover:scale-105 transition-transform shadow-md border border-amber-300 flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles size={14} className="text-rose-950 fill-rose-950" />
            <span>{lang === 'bn' ? 'রঙিলা রূপ AI স্টাইলিস্ট' : 'Rongila Rup AI Stylist'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
