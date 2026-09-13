import React from 'react';
import { ArrowLeftRight, X, Trash2, Scale } from 'lucide-react';
import { Product, Language } from '../types';

interface ComparisonBarProps {
  comparedProducts: Product[];
  lang: Language;
  onOpenCompareModal: () => void;
  onRemoveProduct: (productId: string) => void;
  onClearAll: () => void;
}

export const ComparisonBar: React.FC<ComparisonBarProps> = ({
  comparedProducts,
  lang,
  onOpenCompareModal,
  onRemoveProduct,
  onClearAll,
}) => {
  if (comparedProducts.length === 0) return null;

  return (
    <div className="fixed bottom-16 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-2xl bg-rose-950/95 text-amber-50 rounded-2xl border-2 border-amber-500/50 shadow-2xl p-2.5 sm:p-3 backdrop-blur-md flex items-center justify-between gap-3 animate-slide-up">
      {/* Thumbnails & Count */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <div className="flex items-center gap-1.5 shrink-0">
          {comparedProducts.map((p) => (
            <div key={p.id} className="relative group shrink-0">
              <img
                src={p.image}
                alt={p.nameEn}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl object-cover border border-amber-500/40"
                referrerPolicy="no-referrer"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveProduct(p.id);
                }}
                className="absolute -top-1.5 -right-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-full p-0.5 shadow transition-colors"
                title={lang === 'bn' ? 'সরান' : 'Remove'}
              >
                <X size={12} />
              </button>
            </div>
          ))}

          {/* Empty slot indicators */}
          {Array.from({ length: 3 - comparedProducts.length }).map((_, i) => (
            <div
              key={i}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl border-2 border-dashed border-amber-500/30 flex items-center justify-center text-[10px] text-amber-300/40 shrink-0"
            >
              +
            </div>
          ))}
        </div>

        <div className="hidden xs:block min-w-0">
          <p className="text-xs font-serif font-bold text-amber-100 truncate">
            {lang === 'bn' ? 'তুলনা করার তালিকা' : 'Comparison List'}
          </p>
          <p className="text-[10px] text-amber-300/70 font-medium">
            {lang === 'bn' ? `${comparedProducts.length}/৩টি সিলেক্টেড` : `${comparedProducts.length}/3 selected`}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onClearAll}
          className="p-2 rounded-xl bg-rose-900/60 hover:bg-rose-900 text-amber-300/80 hover:text-amber-100 text-xs transition-colors cursor-pointer"
          title={lang === 'bn' ? 'সব মুছুন' : 'Clear All'}
        >
          <Trash2 size={16} />
        </button>

        <button
          onClick={onOpenCompareModal}
          className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-rose-600 to-amber-500 text-rose-950 font-extrabold text-xs shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer border border-amber-300"
        >
          <ArrowLeftRight size={16} />
          <span>{lang === 'bn' ? 'তুলনা করুন' : 'Compare Now'}</span>
          <span className="bg-rose-950 text-amber-300 px-1.5 py-0.5 rounded-full text-[10px] font-black">
            {comparedProducts.length}
          </span>
        </button>
      </div>
    </div>
  );
};
