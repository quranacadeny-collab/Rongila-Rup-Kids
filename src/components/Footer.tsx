import React from 'react';
import { 
  PhoneCall, 
  Mail, 
  MapPin, 
  Instagram, 
  Facebook, 
  Youtube, 
  ShieldCheck, 
  Truck, 
  RotateCcw,
  Sparkles,
  Download
} from 'lucide-react';
import { Language, CategoryId } from '../types';

interface FooterProps {
  lang: Language;
  onSelectCategory: (cat: CategoryId) => void;
  onOpenTrackOrder: () => void;
  onOpenAIStylist: () => void;
  onOpenAdmin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  lang,
  onSelectCategory,
  onOpenTrackOrder,
  onOpenAIStylist,
  onOpenAdmin
}) => {
  return (
    <footer className="bg-rose-950 text-amber-50 border-t border-amber-500/20 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Top Newsletter & Assurance Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 rounded-3xl bg-gradient-to-r from-amber-900/40 via-rose-900/60 to-amber-900/40 border border-amber-500/30">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500 text-rose-950 rounded-2xl font-bold shrink-0">
              <Truck size={24} />
            </div>
            <div>
              <h4 className="font-serif font-bold text-sm text-amber-100">
                {lang === 'bn' ? 'সারাদেশে হোম ডেলিভারি' : 'Nationwide Home Delivery'}
              </h4>
              <p className="text-xs text-amber-200/70">
                {lang === 'bn' ? 'ঢাকা শহরে ২৪-৪৮ ঘণ্টার মধ্যে এক্সপ্রেস ডেলিভারি' : 'Express delivery in Dhaka within 24-48 hrs'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500 text-rose-950 rounded-2xl font-bold shrink-0">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h4 className="font-serif font-bold text-sm text-amber-100">
                {lang === 'bn' ? '১০০% বেবি-সেফ ও কোমল সুতি ফেব্রিক' : '100% Kid-Safe & Soft Organic Fabric'}
              </h4>
              <p className="text-xs text-amber-200/70">
                {lang === 'bn' ? 'বাচ্ছাদের কোমল ত্বকের উপযোগী প্রিমিয়াম ও অ্যালার্জি-মুক্ত উপাদান' : 'Ultra-soft, skin-friendly & hypoallergenic for little ones'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500 text-rose-950 rounded-2xl font-bold shrink-0">
              <RotateCcw size={24} />
            </div>
            <div>
              <h4 className="font-serif font-bold text-sm text-amber-100">
                {lang === 'bn' ? 'ডেলিভারিতে দেখে নেওয়ার সুযোগ' : 'Check Product at Delivery'}
              </h4>
              <p className="text-xs text-amber-200/70">
                {lang === 'bn' ? 'ডেলিভারিম্যানের সামনে ড্রেস চেক করে রিসিভ করার পূর্ণ সুবিধা' : 'Inspect product in front of delivery person before receiving'}
              </p>
            </div>
          </div>
        </div>

        {/* 4 Columns Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-xs text-amber-200/80">
          
          {/* Col 1: Brand Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-amber-500 text-rose-950 font-bold flex items-center justify-center font-serif text-lg">
                র
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-2xl font-serif font-extrabold text-amber-200">
                  {lang === 'bn' ? 'রঙিলা রূপ' : 'Rongila Rup'}
                </span>
                <span className="text-[10px] bg-pink-500 text-white font-extrabold px-1.5 py-0.2 rounded-full uppercase tracking-tighter">
                  KIDS
                </span>
              </div>
            </div>
            <p className="leading-relaxed font-light">
              {lang === 'bn' 
                ? 'বাচ্ছাদের কোমলত্ব, রঙ ও আনন্দের মিশেলে গড়া বাংলাদেশের ১০০% সেফ ও সফট প্রিমিয়াম বেবি ফ্যাশন হাউস।' 
                : 'Premium kids & baby boutique delivering 100% safe, soft, and gentle organic clothing for little ones.'}
            </p>
            <div className="pt-2 flex items-center gap-3">
              <a href="#" className="p-2 rounded-full bg-rose-900 text-amber-300 hover:bg-amber-500 hover:text-rose-950 transition-colors">
                <Facebook size={16} />
              </a>
              <a href="#" className="p-2 rounded-full bg-rose-900 text-amber-300 hover:bg-amber-500 hover:text-rose-950 transition-colors">
                <Instagram size={16} />
              </a>
              <a href="#" className="p-2 rounded-full bg-rose-900 text-amber-300 hover:bg-amber-500 hover:text-rose-950 transition-colors">
                <Youtube size={16} />
              </a>
            </div>
          </div>

          {/* Col 2: Categories */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-sm text-amber-100 uppercase tracking-wider border-b border-amber-500/20 pb-1">
              {lang === 'bn' ? 'কালেকশনসমূহ' : 'Our Collections'}
            </h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => onSelectCategory('combo')} className="hover:text-amber-300 transition-colors font-bold text-amber-200">
                  {lang === 'bn' ? '🎁 মেগা কম্বো প্যাকেজ' : 'Mega Combo Packages'}
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('babydress')} className="hover:text-amber-300 transition-colors">
                  {lang === 'bn' ? '👗 বেবি ফ্রক ও ড্রেস কালেকশন' : 'Baby Frocks & Dresses'}
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('babyset')} className="hover:text-amber-300 transition-colors">
                  {lang === 'bn' ? '🍼 বেবি রোম্পার ও ২-পিস সেট' : 'Rompers & 2-Piece Sets'}
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('frock')} className="hover:text-amber-300 transition-colors">
                  {lang === 'bn' ? '🎀 পার্টি ফ্রক ও গাউন' : 'Party Frocks & Gowns'}
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('footwear')} className="hover:text-amber-300 transition-colors">
                  {lang === 'bn' ? '👟 বাচ্ছাদের জুতা ও কিউট স্যান্ডেল' : 'Baby Shoes & Booties'}
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Online Order & Delivery Support (No Showroom Address) */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-sm text-amber-100 uppercase tracking-wider border-b border-amber-500/20 pb-1">
              {lang === 'bn' ? 'অনলাইন অর্ডার সেবা' : 'Online Order & Delivery'}
            </h4>
            <div className="space-y-2">
              <p className="leading-relaxed">
                {lang === 'bn' 
                  ? 'আমরা সারাদেশের যেকোনো প্রান্তে ক্যাশ অন ডেলিভারিতে ২৪-৪৮ ঘণ্টার মধ্যে হোম ডেলিভারি প্রদান করি।' 
                  : 'Fast nationwide cash-on-delivery service delivered directly to your doorstep within 24-48 hours.'}
              </p>
              <div className="pt-1 text-amber-300 font-semibold flex items-center gap-1.5">
                <span>✓ {lang === 'bn' ? '২৪/৭ সরাসরি অনলাইন সার্ভিস' : '24/7 Direct Online Service'}</span>
              </div>
            </div>
          </div>

          {/* Col 4: Customer Help */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-sm text-amber-100 uppercase tracking-wider border-b border-amber-500/20 pb-1">
              {lang === 'bn' ? 'কাস্টমার কেয়ার' : 'Customer Care'}
            </h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <PhoneCall size={14} className="text-amber-400" />
                <span>+৮৮০ ১৭৯২৭৬৫৬৯৩ / 01792765693</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-amber-400" />
                <a href="mailto:supportrongilarup@gmail.com" className="hover:underline hover:text-amber-300 transition-colors">
                  supportrongilarup@gmail.com
                </a>
              </div>
              <button 
                onClick={onOpenTrackOrder}
                className="hover:text-amber-300 font-bold underline block pt-1"
              >
                {lang === 'bn' ? 'পার্সেল ট্র্যাকিং' : 'Track Your Parcel'}
              </button>
              <button 
                onClick={onOpenAIStylist}
                className="text-amber-400 font-bold flex items-center gap-1 hover:underline pt-1"
              >
                <Sparkles size={12} />
                <span>{lang === 'bn' ? 'AI কাস্টম স্টাইলিং হেল্প' : 'Ask AI Stylist'}</span>
              </button>
            </div>
          </div>

        </div>

        {/* Bottom Copyright */}
        <div className="pt-6 border-t border-amber-500/20 flex flex-col sm:flex-row items-center justify-between text-[11px] text-amber-300/60 gap-3">
          <p 
            onClick={() => {
              const clicks = Number(sessionStorage.getItem('footer_admin_clicks') || 0) + 1;
              sessionStorage.setItem('footer_admin_clicks', String(clicks));
              if (clicks >= 5) {
                sessionStorage.removeItem('footer_admin_clicks');
                if (onOpenAdmin) onOpenAdmin();
              } else {
                setTimeout(() => sessionStorage.removeItem('footer_admin_clicks'), 3000);
              }
            }}
            className="cursor-pointer select-none"
            title="© 2026 Rongila Rup Kids"
          >
            © 2026 {lang === 'bn' ? 'রঙিলা রূপ কিডস - সর্বস্বত্ব সংরক্ষিত।' : 'Rongila Rup Kids. All rights reserved.'}
          </p>
          <div className="flex items-center gap-3">
            <span className="font-semibold text-amber-200">{lang === 'bn' ? 'পেমেন্ট পার্টনারসমূহ:' : 'Accepted Payments:'}</span>
            <span className="px-2 py-0.5 bg-rose-900 text-pink-300 rounded font-bold font-mono">bKash</span>
            <span className="px-2 py-0.5 bg-rose-900 text-orange-300 rounded font-bold font-mono">Nagad</span>
            <span className="px-2 py-0.5 bg-rose-900 text-amber-200 rounded font-bold font-mono">COD</span>
            <span className="px-2 py-0.5 bg-rose-900 text-indigo-300 rounded font-bold font-mono">VISA</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
