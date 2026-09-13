import React, { useState } from 'react';
import { X, Sparkles, Ruler, CheckCircle2, Heart } from 'lucide-react';
import { Language } from '../types';

interface BabySizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const BabySizeGuideModal: React.FC<BabySizeGuideModalProps> = ({
  isOpen,
  onClose,
  lang
}) => {
  const [selectedAge, setSelectedAge] = useState<string>('6-12M');
  const [babyGender, setBabyGender] = useState<'girl' | 'boy'>('girl');

  if (!isOpen) return null;

  const sizeChart = [
    { age: '0-3 মাস (Newborn)', size: '0-3M / Newborn', chest: '16-18 ইঞ্চি', length: '14-16 ইঞ্চি', weight: '3 - 5.5 কেজি' },
    { age: '3-6 মাস', size: '3-6M', chest: '18-19 ইঞ্চি', length: '16-18 ইঞ্চি', weight: '5.5 - 7.5 কেজি' },
    { age: '6-12 মাস', size: '6-12M', chest: '19-20 ইঞ্চি', length: '18-20 ইঞ্চি', weight: '7.5 - 10 কেজি' },
    { age: '1-2 বছর', size: '1-2 Yrs / 22', chest: '21-22 ইঞ্চি', length: '21-23 ইঞ্চি', weight: '10 - 13 কেজি' },
    { age: '2-3 বছর', size: '2-3 Yrs / 24', chest: '22-23 ইঞ্চি', length: '23-25 ইঞ্চি', weight: '13 - 15 কেজি' },
    { age: '3-4 বছর', size: '3-4 Yrs / 26', chest: '23-24 ইঞ্চি', length: '25-27 ইঞ্চি', weight: '15 - 17 কেজি' },
    { age: '4-5 বছর', size: '4-5 Yrs / 28', chest: '25-26 ইঞ্চি', length: '27-29 ইঞ্চি', weight: '17 - 20 কেজি' },
    { age: '5-7 বছর', size: '6-7 Yrs / 30', chest: '27-28 ইঞ্চি', length: '30-32 ইঞ্চি', weight: '20 - 24 কেজি' },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border-2 border-pink-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-950 via-pink-900 to-amber-950 p-4 text-amber-50 flex items-center justify-between border-b border-pink-400/30">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-pink-500/20 text-pink-300 rounded-2xl border border-pink-400/30">
              <Ruler size={20} />
            </div>
            <div>
              <h3 className="font-serif font-extrabold text-base text-amber-100 flex items-center gap-1.5">
                <span>📏 শিশুদের সঠিক সাইজ চার্ট ও গাইড</span>
              </h3>
              <p className="text-[11px] text-amber-200/80">
                {lang === 'bn' ? 'বাচ্চার বয়স ও ওজন অনুযায়ী সঠিক সাইজ নির্বাচন করুন' : 'Baby & Kids Size Recommendation Guide'}
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 rounded-full text-amber-200 hover:bg-rose-900 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          
          {/* Gender Selector */}
          <div className="flex gap-2">
            <button
              onClick={() => setBabyGender('girl')}
              className={`flex-1 py-2 px-3 rounded-2xl font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                babyGender === 'girl'
                  ? 'bg-pink-100 border-pink-400 text-pink-900 shadow-xs'
                  : 'bg-stone-50 border-stone-200 text-stone-600'
              }`}
            >
              <span>👧 বেবি গার্ল (Baby Girl)</span>
            </button>
            <button
              onClick={() => setBabyGender('boy')}
              className={`flex-1 py-2 px-3 rounded-2xl font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                babyGender === 'boy'
                  ? 'bg-sky-100 border-sky-400 text-sky-900 shadow-xs'
                  : 'bg-stone-50 border-stone-200 text-stone-600'
              }`}
            >
              <span>👦 বেবি বয় (Baby Boy)</span>
            </button>
          </div>

          {/* Quick Recommendation Box */}
          <div className="p-3.5 bg-gradient-to-br from-amber-50 to-pink-50 rounded-2xl border border-amber-200 text-stone-800 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-rose-950 text-xs">
              <Sparkles size={15} className="text-amber-500 fill-amber-400" />
              <span>রঙিলা রূপ সাইজ টিপস:</span>
            </div>
            <p className="text-[11px] text-stone-600 leading-relaxed">
              💡 বাচ্চার বর্তমান বয়সের চেয়ে যদি স্বাস্থ্য বা উচ্চতা একটু বেশি হয়, তবে <strong>১ সাইজ বড়</strong> নেওয়ার পরামর্শ দেওয়া হচ্ছে। শিশুদের আরামদায়ক সুতি কাপড় দিয়ে আমাদের প্রতিটি পোশাক তৈরি।
            </p>
          </div>

          {/* Size Table */}
          <div className="border border-stone-200 rounded-2xl overflow-hidden shadow-xs">
            <table className="w-full text-left border-collapse text-[11px]">
              <thead>
                <tr className="bg-rose-950 text-amber-200 font-bold border-b border-rose-900">
                  <th className="p-2.5">বাচ্চার বয়স</th>
                  <th className="p-2.5">স্ট্যান্ডার্ড সাইজ</th>
                  <th className="p-2.5">বুকের মাপ</th>
                  <th className="p-2.5">লম্বা (ইঞ্চি)</th>
                  <th className="p-2.5">আনুমানিক ওজন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {sizeChart.map((row, idx) => (
                  <tr 
                    key={idx} 
                    className={`hover:bg-pink-50/70 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-stone-50/50'}`}
                  >
                    <td className="p-2.5 font-bold text-rose-950 flex items-center gap-1">
                      <Heart size={10} className="text-pink-500 fill-pink-400" />
                      <span>{row.age}</span>
                    </td>
                    <td className="p-2.5 font-mono font-bold text-amber-900 bg-amber-50/50">{row.size}</td>
                    <td className="p-2.5 font-mono">{row.chest}</td>
                    <td className="p-2.5 font-mono">{row.length}</td>
                    <td className="p-2.5 text-stone-600">{row.weight}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer Assistance */}
          <div className="pt-2 flex items-center justify-between text-[11px] text-stone-500">
            <span>সরাসরি সাইজ সংক্রান্ত পরামর্শের জন্য:</span>
            <a
              href="https://wa.me/8801792765693?text=Hello%20Rongila%20Rup,%20I%20need%20help%20with%20baby%20size"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-emerald-700 bg-emerald-50 border border-emerald-300 px-3 py-1 rounded-full hover:bg-emerald-100 transition-colors flex items-center gap-1"
            >
              <span>💬 হোয়াটসঅ্যাপ সহায়তা</span>
            </a>
          </div>

        </div>

      </div>
    </div>
  );
};
