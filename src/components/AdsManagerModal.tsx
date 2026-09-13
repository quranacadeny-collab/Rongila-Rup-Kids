import React, { useState, useMemo } from 'react';
import { 
  X, 
  Rocket, 
  Globe, 
  Copy,
  Check,
  CreditCard,
  ExternalLink,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  ShoppingBag,
  CheckCircle2,
  Info,
  Layers,
  ArrowRight,
  Eye,
  MousePointerClick,
  Calculator,
  Gift,
  AlertCircle,
  TrendingUp,
  Users,
  DollarSign,
  Package,
  ShieldCheck,
  Target
} from 'lucide-react';
import { Language, Product } from '../types';

interface AdsManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  product?: Product | null;
  allProducts?: Product[];
  onLaunchCampaign?: (updatedProduct: Product) => void;
}

export const AdsManagerModal: React.FC<AdsManagerModalProps> = ({
  isOpen,
  onClose,
  lang,
  product,
  allProducts = [],
  onLaunchCampaign
}) => {
  // Tabs: 'carousel', 'bundle' (Combo/Package high margin), 'profit_calc' (Capital safety & profit calc), 'audience' (Targeting & fraud defense), 'single', 'guide'
  const [activeTab, setActiveTab] = useState<'carousel' | 'bundle' | 'profit_calc' | 'audience' | 'single' | 'guide'>('carousel');

  // Selected products for Carousel (default first 6 products)
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>(() => {
    if (allProducts && allProducts.length > 0) {
      return allProducts.slice(0, 6).map(p => p.id);
    }
    return product ? [product.id] : [];
  });

  // Selected products for Combo / Bundle (default first 2 or 3 products)
  const [bundleProductIds, setBundleProductIds] = useState<string[]>(() => {
    if (allProducts && allProducts.length >= 2) {
      return [allProducts[0].id, allProducts[1].id];
    }
    return product ? [product.id] : [];
  });
  const [bundleSpecialPrice, setBundleSpecialPrice] = useState<number>(0);
  const [bundleOfferType, setBundleOfferType] = useState<'free_delivery' | 'extra_discount'>('free_delivery');

  // Profit & Budget Calculator States (for 20,000 tk capital safety)
  const [calcDailySpendUsd, setCalcDailySpendUsd] = useState<number>(3); // $3/day
  const [calcWholesaleCost, setCalcWholesaleCost] = useState<number>(280); // wholesale buying cost in BDT
  const [calcSellingPrice, setCalcSellingPrice] = useState<number>(550); // selling price in BDT
  const [calcEstimatedOrders, setCalcEstimatedOrders] = useState<number>(4); // orders per day
  const [calcReturnRate, setCalcReturnRate] = useState<number>(10); // 10% expected return
  const [calcExchangeRate, setCalcExchangeRate] = useState<number>(125); // 1 USD = 125 BDT

  // Carousel Preview slider index
  const [previewIndex, setPreviewIndex] = useState(0);

  // Link Destination Type: 'direct_checkout' (?orderProduct=ID) vs 'product_page' (?product=ID)
  const [linkType, setLinkType] = useState<'direct_checkout' | 'product_page'>('direct_checkout');

  // Copy status
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [testOrderNotice, setTestOrderNotice] = useState<string | null>(null);

  // Fallback product if product prop is null
  const currentSingleProduct = product || (allProducts.length > 0 ? allProducts[0] : null);

  // Selected Product Objects for Carousel
  const selectedProducts = useMemo(() => {
    return allProducts.filter(p => selectedProductIds.includes(p.id));
  }, [allProducts, selectedProductIds]);

  // Selected Product Objects for Combo / Bundle
  const selectedBundleProducts = useMemo(() => {
    return allProducts.filter(p => bundleProductIds.includes(p.id));
  }, [allProducts, bundleProductIds]);

  const bundleOriginalTotal = selectedBundleProducts.reduce((sum, p) => sum + p.price, 0);
  const bundleFinalPrice = bundleSpecialPrice > 0 
    ? bundleSpecialPrice 
    : (bundleOfferType === 'free_delivery' ? bundleOriginalTotal : Math.max(100, bundleOriginalTotal - 100));

  // Profit Calculation computations (20,000 tk capital safety tool)
  const totalDailyAdSpendBdt = Math.round(calcDailySpendUsd * calcExchangeRate);
  const totalDailyRevenue = calcEstimatedOrders * calcSellingPrice;
  const totalWholesaleProductCost = calcEstimatedOrders * calcWholesaleCost;
  const expectedReturnOrders = Math.round(calcEstimatedOrders * (calcReturnRate / 100));
  const estimatedReturnLoss = expectedReturnOrders * 130; // approx 130 BDT return shipping charge loss
  const grossProfit = totalDailyRevenue - totalWholesaleProductCost;
  const netDailyProfit = grossProfit - totalDailyAdSpendBdt - estimatedReturnLoss;
  const netDeliveredOrders = Math.max(1, calcEstimatedOrders - expectedReturnOrders);
  const profitPerDeliveredOrder = Math.round(netDailyProfit / netDeliveredOrders);

  if (!isOpen) return null;

  const origin = window.location.origin;

  const getProductOrderUrl = (prodId: string) => {
    if (linkType === 'direct_checkout') {
      return `${origin}/?orderProduct=${prodId}`;
    }
    return `${origin}/?product=${prodId}`;
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleCopyAllCarouselData = () => {
    const lines = [
      `🌟 রঙিলা রূপ কিডস - ফেসবুক ক্যারোসেল অ্যাড ডাটা (Meta Carousel Ads)`,
      `=============================================================`,
      `অ্যাড ফরম্যাট: Carousel (ক্যারোসেল)`,
      `Call to Action (CTA) বাটন: "Order now" (বা "Shop now")`,
      `কনভার্শন ডেস্টিনেশন: Website\n`,
      `📦 নির্বাচিত প্রোডাক্ট সমূহ (${selectedProducts.length}টি কার্ড):`
    ];

    selectedProducts.forEach((p, idx) => {
      const url = getProductOrderUrl(p.id);
      lines.push(`\n--- [কার্ড #${idx + 1}] ---`);
      lines.push(`প্রোডাক্ট: ${p.nameBn || p.nameEn}`);
      lines.push(`হেডলাইন: ${p.nameBn || p.nameEn} - মাত্র ৳${p.price.toLocaleString()}`);
      lines.push(`ছবি URL: ${p.image}`);
      lines.push(`Order Now ডিরেক্ট লিংক: ${url}`);
    });

    lines.push(`\n📞 কাস্টমার হেল্পলাইন: 01792765693`);
    lines.push(`🚚 ক্যাশ অন ডেলিভারি সারাদেশে`);

    handleCopy(lines.join('\n'), 'all_carousel');
  };

  const toggleSelectProduct = (id: string) => {
    setSelectedProductIds(prev => {
      if (prev.includes(id)) {
        if (prev.length <= 2) {
          alert('ক্যারোসেল এডের জন্য কমপক্ষে ২টি প্রোডাক্ট সিলেক্ট রাখা প্রয়োজন (সেরা পারফর্মেন্সের জন্য ৫-৭টি)।');
          return prev;
        }
        return prev.filter(pId => pId !== id);
      } else {
        if (prev.length >= 10) {
          alert('ফেসবুক ক্যারোসেলে একসাথে সর্বোচ্চ ১০টি প্রোডাক্ট যুক্ত করা সেরা।');
          return prev;
        }
        return [...prev, id];
      }
    });
  };

  const selectPreset = (count: number) => {
    const ids = allProducts.slice(0, count).map(p => p.id);
    setSelectedProductIds(ids);
    setPreviewIndex(0);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden border border-amber-500/30 flex flex-col max-h-[94vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 p-4 sm:p-5 text-white flex items-center justify-between border-b border-blue-500/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600 text-white rounded-2xl font-black shadow-lg border border-blue-400">
              <Rocket size={22} />
            </div>
            <div>
              <h3 className="font-serif font-black text-base sm:text-lg text-blue-100 flex items-center gap-2">
                <span>{lang === 'bn' ? 'ফেসবুক বুস্ট ও ক্যারোসেল অ্যাড (Order now বাটন)' : 'Meta Carousel & Order Now Ads Builder'}</span>
                <span className="bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded-full font-sans uppercase font-black">Facebook Ads</span>
              </h3>
              <p className="text-xs text-blue-200/90 font-medium">
                {lang === 'bn' 
                  ? 'ছবিটির মতো নীল "Order now" বাটন ও ৫-১০টি প্রোডাক্ট ক্যারোসেল এড তৈরি করার স্বয়ংক্রিয় টুল' 
                  : 'Generate direct order links with "Order now" call-to-action button for 5-7+ products'}
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-full text-blue-200 hover:bg-white/10 transition-colors cursor-pointer">
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-stone-200 bg-stone-50 px-3 sm:px-6 gap-1 sm:gap-2 shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('carousel')}
            className={`py-3 px-3 sm:px-4 font-bold text-xs sm:text-sm border-b-2 flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'carousel'
                ? 'border-blue-600 text-blue-900 bg-white shadow-xs font-black'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Layers size={16} className={activeTab === 'carousel' ? 'text-blue-600' : 'text-stone-400'} />
            <span>{lang === 'bn' ? '🎠 ক্যারোসেল অ্যাড (৫-১০টি)' : 'Carousel (5-10)'}</span>
            <span className="bg-blue-100 text-blue-800 text-[10px] px-1.5 py-0.5 rounded-full font-bold">Best</span>
          </button>

          <button
            onClick={() => setActiveTab('bundle')}
            className={`py-3 px-3 sm:px-4 font-bold text-xs sm:text-sm border-b-2 flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'bundle'
                ? 'border-blue-600 text-blue-900 bg-white shadow-xs font-black'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Gift size={16} className={activeTab === 'bundle' ? 'text-purple-600' : 'text-stone-400'} />
            <span>{lang === 'bn' ? '🎁 হাই-মার্জিন কম্বো অ্যাড' : 'Combo Ad (High Margin)'}</span>
            <span className="bg-purple-100 text-purple-800 text-[10px] px-1.5 py-0.5 rounded-full font-bold">৳১৫০-৩০০ লাভ</span>
          </button>

          <button
            onClick={() => setActiveTab('profit_calc')}
            className={`py-3 px-3 sm:px-4 font-bold text-xs sm:text-sm border-b-2 flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'profit_calc'
                ? 'border-blue-600 text-blue-900 bg-white shadow-xs font-black'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Calculator size={16} className={activeTab === 'profit_calc' ? 'text-emerald-600' : 'text-stone-400'} />
            <span>{lang === 'bn' ? '📊 বাজেট ও নিট লাভ ক্যালকুলেটর' : 'Budget & Profit Calc'}</span>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.5 rounded-full font-bold">পুঁজি রক্ষা</span>
          </button>

          <button
            onClick={() => setActiveTab('audience')}
            className={`py-3 px-3 sm:px-4 font-bold text-xs sm:text-sm border-b-2 flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'audience'
                ? 'border-blue-600 text-blue-900 bg-white shadow-xs font-black'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Target size={16} className={activeTab === 'audience' ? 'text-rose-600' : 'text-stone-400'} />
            <span>{lang === 'bn' ? '🎯 অডিয়েন্স ও ফেক অর্ডার প্রতিরোধ' : 'Targeting & Fake Defense'}</span>
          </button>

          <button
            onClick={() => setActiveTab('single')}
            className={`py-3 px-3 sm:px-4 font-bold text-xs sm:text-sm border-b-2 flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'single'
                ? 'border-blue-600 text-blue-900 bg-white shadow-xs font-black'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <ShoppingBag size={16} className={activeTab === 'single' ? 'text-blue-600' : 'text-stone-400'} />
            <span>{lang === 'bn' ? '📱 ১টি প্রোডাক্ট বুস্ট' : 'Single Boost'}</span>
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`py-3 px-3 sm:px-4 font-bold text-xs sm:text-sm border-b-2 flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'guide'
                ? 'border-blue-600 text-blue-900 bg-white shadow-xs font-black'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Info size={16} className={activeTab === 'guide' ? 'text-blue-600' : 'text-stone-400'} />
            <span>{lang === 'bn' ? '📘 Order now সেটআপ গাইড' : 'Order Now Guide'}</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs">

          {/* Test Order Notice Toast */}
          {testOrderNotice && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-2xl flex items-center justify-between gap-2 animate-fade-in shadow-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <span className="font-bold">{testOrderNotice}</span>
              </div>
              <button onClick={() => setTestOrderNotice(null)} className="text-emerald-700 hover:text-emerald-900 text-xs font-bold">
                ✕
              </button>
            </div>
          )}

          {/* TAB 1: CAROUSEL AD BUILDER (5-10 PRODUCTS) */}
          {activeTab === 'carousel' && (
            <div className="space-y-6">

              {/* Quick Explanation Banner */}
              <div className="p-4 bg-gradient-to-r from-blue-50 via-indigo-50 to-amber-50 border border-blue-200 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-blue-950 font-black text-sm">
                    <Sparkles size={18} className="text-amber-600" />
                    <span>ক্যারোসেল অ্যাড (Carousel Ad) কী এবং কীভাবে কাজ করে?</span>
                  </div>
                  <p className="text-stone-700 text-xs leading-relaxed max-w-2xl font-medium">
                    ফেসবুক ক্যারোসেল অ্যাডে আপনি একসাথে ৫ থেকে ১০টি প্রোডাক্ট কার্ড পাশাপাশি যোগ করতে পারবেন। ফেসবুকে স্ক্রোল করার সময় প্রতিটি কার্ডের নিচে নীল <strong>"Order now"</strong> বাটন থাকবে। কাস্টমার যেটিতেই ক্লিক করবে, সরাসরি আপনার ওয়েবসাইটের সেই নির্দিষ্ট পণ্যের ক্যাশ অন ডেলিভারি (COD) চেকআউট ওপেন হয়ে যাবে!
                  </p>
                </div>

                <a
                  href="https://adsmanager.facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-colors text-xs shrink-0"
                >
                  <Rocket size={14} />
                  <span>Ads Manager এ যান</span>
                  <ExternalLink size={12} />
                </a>
              </div>

              {/* Step 1: Product Selector */}
              <div className="p-4 bg-white border border-stone-200 rounded-2xl space-y-3 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-2">
                  <div>
                    <h4 className="font-serif font-bold text-stone-900 text-sm flex items-center gap-2">
                      <span>১. এডের জন্য প্রোডাক্ট সিলেক্ট করুন ({selectedProductIds.length}টি নির্বাচিত)</span>
                      <span className="text-[11px] font-sans font-normal text-stone-500">(৫ থেকে ১০টি সিলেক্ট করা সেরা)</span>
                    </h4>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-stone-500 text-[11px] font-bold">কুইক সিলেক্ট:</span>
                    <button
                      type="button"
                      onClick={() => selectPreset(5)}
                      className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                    >
                      ৫টি প্রোডাক্ট
                    </button>
                    <button
                      type="button"
                      onClick={() => selectPreset(7)}
                      className="px-2.5 py-1 bg-blue-100 hover:bg-blue-200 text-blue-900 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                    >
                      ৭টি প্রোডাক্ট
                    </button>
                    <button
                      type="button"
                      onClick={() => selectPreset(10)}
                      className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                    >
                      ১০টি প্রোডাক্ট
                    </button>
                  </div>
                </div>

                {/* Product Checkbox Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5 max-h-56 overflow-y-auto p-1">
                  {allProducts.map(p => {
                    const isSelected = selectedProductIds.includes(p.id);
                    return (
                      <div
                        key={p.id}
                        onClick={() => toggleSelectProduct(p.id)}
                        className={`p-2 rounded-xl border transition-all cursor-pointer flex flex-col justify-between relative group ${
                          isSelected 
                            ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-500 shadow-xs' 
                            : 'border-stone-200 hover:border-stone-300 bg-white opacity-70 hover:opacity-100'
                        }`}
                      >
                        <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-stone-100 mb-1.5">
                          <img 
                            src={p.image} 
                            alt={p.nameBn || p.nameEn} 
                            className="w-full h-full object-cover" 
                            referrerPolicy="no-referrer"
                          />
                          <div className={`absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] shadow-sm ${
                            isSelected ? 'bg-blue-600 text-white' : 'bg-black/40 text-white'
                          }`}>
                            {isSelected ? '✓' : '+'}
                          </div>
                        </div>

                        <div className="space-y-0.5">
                          <p className="font-bold text-[11px] text-stone-900 truncate leading-tight">
                            {p.nameBn || p.nameEn}
                          </p>
                          <p className="font-extrabold text-blue-900 text-xs">৳{p.price.toLocaleString()}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Link Landing Behavior Options */}
              <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl space-y-2">
                <label className="font-serif font-bold text-stone-900 text-xs block">
                  ২. কাস্টমার ফেসবুকে "Order now" চাপলে কোন পেজটি খুলবে?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => setLinkType('direct_checkout')}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                      linkType === 'direct_checkout' 
                        ? 'border-blue-600 bg-white ring-2 ring-blue-500 shadow-xs' 
                        : 'border-stone-200 bg-white/60 hover:bg-white'
                    }`}
                  >
                    <input 
                      type="radio" 
                      name="linkType" 
                      checked={linkType === 'direct_checkout'} 
                      onChange={() => setLinkType('direct_checkout')} 
                      className="mt-1 accent-blue-600 cursor-pointer"
                    />
                    <div>
                      <span className="font-bold text-stone-900 text-xs block">
                        🚀 সরাসরি ক্যাশ অন ডেলিভারি (COD) চেকআউট ফরম (সেরা অপশন)
                      </span>
                      <span className="text-[11px] text-stone-500 leading-tight block mt-0.5">
                        ফেসবুকের "Order now" এ চাপ দেওয়া মাত্র ওয়েবসাইটের ১-ক্লিক অর্ডার ফরম খুলে যাবে যাতে নাম ও ঠিকানা লিখে সাথে সাথে অর্ডার কনফার্ম করতে পারে।
                      </span>
                    </div>
                  </div>

                  <div
                    onClick={() => setLinkType('product_page')}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                      linkType === 'product_page' 
                        ? 'border-blue-600 bg-white ring-2 ring-blue-500 shadow-xs' 
                        : 'border-stone-200 bg-white/60 hover:bg-white'
                    }`}
                  >
                    <input 
                      type="radio" 
                      name="linkType" 
                      checked={linkType === 'product_page'} 
                      onChange={() => setLinkType('product_page')} 
                      className="mt-1 accent-blue-600 cursor-pointer"
                    />
                    <div>
                      <span className="font-bold text-stone-900 text-xs block">
                        🛍️ প্রোডাক্ট ভিউ ও সাইজ সিলেকশন পেজ
                      </span>
                      <span className="text-[11px] text-stone-500 leading-tight block mt-0.5">
                        প্রোডাক্টের বড় ছবি, কাপড়ের বিবরণ ও সাইজ ড্রপডাউন সহ পেজ খুলবে, যেখান থেকে গ্রাহক সাইজ সিলেক্ট করে "অর্ডার করুন" চাপবে।
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3: REALISTIC FACEBOOK FEED CAROUSEL PREVIEW (Exactly like user's uploaded photo) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-serif font-bold text-stone-900 text-sm flex items-center gap-2">
                    <Eye size={16} className="text-blue-600" />
                    <span>ফেসবুকে কাস্টমারদের সামনে যেমন দেখাবে (লাইভ এড প্রিভিউ):</span>
                  </h4>
                  <span className="text-[11px] text-stone-500 font-medium">Facebook Sponsored Mobile Feed Mockup</span>
                </div>

                {/* Facebook Post Mockup Container */}
                <div className="max-w-md mx-auto bg-white border border-stone-300 rounded-3xl shadow-xl overflow-hidden font-sans">
                  {/* FB Header */}
                  <div className="p-3.5 flex items-center justify-between border-b border-stone-100">
                    <div className="flex items-center gap-2.5">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-rose-950 to-amber-700 flex items-center justify-center text-amber-200 font-serif font-black text-sm border-2 border-amber-400 shadow-xs">
                          RR
                        </div>
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-stone-900">রঙিলা রূপ কিডস - Rongila Rup Kids</span>
                          <span className="w-3.5 h-3.5 bg-blue-500 text-white rounded-full flex items-center justify-center text-[9px] font-bold">✓</span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-stone-500">
                          <span>Sponsored (বিজ্ঞাপন)</span>
                          <span>•</span>
                          <Globe size={11} />
                        </div>
                      </div>
                    </div>
                    <div className="text-stone-400 font-bold px-2 py-1">•••</div>
                  </div>

                  {/* Ad Post Text */}
                  <div className="px-3.5 py-2 text-xs text-stone-800 space-y-1">
                    <p className="leading-snug">
                      🌸 <strong>রঙিলা রূপ কিডস</strong> এর সকল প্রিমিয়াম বেবি ফ্রক, পাঞ্জাবি ও কিউট পোশাকের বিশাল কালেকশন! ১০০% সুতি ও আরামদায়ক ফেব্রিক।
                    </p>
                    <p className="text-stone-600 text-[11px]">
                      ডেলিভারির সময় দেখে নেওয়ার সুযোগ সহ সারাদেশে ক্যাশ অন ডেলিভারি! সরাসরি ওয়েবসাইট থেকে অর্ডার করতে নিচে ড্রেসে ক্লিক করুন 👇
                    </p>
                  </div>

                  {/* Swipeable Carousel Mockup */}
                  <div className="bg-stone-100 p-2 relative">
                    <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none snap-x">
                      {selectedProducts.map((p, index) => {
                        const directUrl = getProductOrderUrl(p.id);
                        return (
                          <div 
                            key={p.id} 
                            className="min-w-[240px] max-w-[240px] bg-white rounded-2xl overflow-hidden border border-stone-300 shadow-sm flex flex-col justify-between shrink-0 snap-center"
                          >
                            {/* Card Image */}
                            <div className="relative aspect-square w-full bg-stone-50 overflow-hidden">
                              <img 
                                src={p.image} 
                                alt={p.nameBn || p.nameEn} 
                                className="w-full h-full object-cover" 
                                referrerPolicy="no-referrer"
                              />
                              <div className="absolute top-2 left-2 bg-black/60 text-white text-[9px] font-bold px-2 py-0.5 rounded-md backdrop-blur-xs">
                                {index + 1}/{selectedProducts.length}
                              </div>
                            </div>

                            {/* Card Info Box (Exactly matching Ghorer Bazar format) */}
                            <div className="p-3 space-y-2 bg-white flex-1 flex flex-col justify-between">
                              <div>
                                <div className="flex items-center gap-1 text-[10px] text-stone-500 font-bold uppercase tracking-wider">
                                  <span>🌐 rongilarup.com</span>
                                </div>
                                <h5 className="font-bold text-xs text-stone-900 line-clamp-1 mt-0.5">
                                  {p.nameBn || p.nameEn}
                                </h5>
                                <div className="flex items-baseline gap-1.5 mt-0.5">
                                  <span className="text-sm font-black text-rose-950">৳{p.price.toLocaleString()}</span>
                                  {p.originalPrice && p.originalPrice > p.price && (
                                    <span className="text-[10px] text-stone-400 line-through">৳{p.originalPrice.toLocaleString()}</span>
                                  )}
                                </div>
                              </div>

                              {/* THE EXACT BLUE "Order now" BUTTON REQUESTED BY USER */}
                              <button
                                type="button"
                                onClick={() => {
                                  setTestOrderNotice(`🎉 আপনি "${p.nameBn || p.nameEn}" এর Order now বাটন টেস্ট করেছেন! কাস্টমার ফেসবুকে ক্লিক করলে সরাসরি এই ড্রেসের চেকআউট খুলে যাবে। লিংক কপি করতে নিচে দেওয়া বাটন চাপুন।`);
                                }}
                                className="w-full py-2.5 bg-[#1877F2] hover:bg-[#166fe5] text-white font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all active:scale-98 cursor-pointer"
                              >
                                <MousePointerClick size={14} />
                                <span>Order now</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="text-center pt-1 text-[10px] text-stone-500 font-medium">
                      👈 ডানে-বামে স্ক্রোল করে প্রতিটা প্রোডাক্ট কার্ড ও "Order now" বাটন দেখুন 👉
                    </div>
                  </div>

                  {/* FB Footer Social Counter */}
                  <div className="p-3 bg-white border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500 font-bold">
                    <div className="flex items-center gap-1">
                      <span className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center text-white text-[9px]">👍</span>
                      <span className="w-4 h-4 bg-rose-500 rounded-full flex items-center justify-center text-white text-[9px]">❤️</span>
                      <span className="ml-1">1.2K</span>
                    </div>
                    <div>184 Comments • 42 Shares</div>
                  </div>
                </div>
              </div>

              {/* Step 4: Card Links & Facebook Copy Table */}
              <div className="p-4 bg-white border border-stone-200 rounded-2xl space-y-3 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-2">
                  <div>
                    <h4 className="font-serif font-bold text-stone-900 text-sm flex items-center gap-2">
                      <Copy size={16} className="text-blue-600" />
                      <span>৩. প্রতিটি প্রোডাক্টের ডিরেক্ট "Order now" লিংক ও তথ্য</span>
                    </h4>
                    <p className="text-[11px] text-stone-500">
                      ফেসবুক অ্যাড ম্যানেজার বা পেজে ক্যারোসেল তৈরি করার সময় এই লিংকগুলো কার্ডে পেস্ট করুন
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyAllCarouselData}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${
                      copiedKey === 'all_carousel'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {copiedKey === 'all_carousel' ? <Check size={16} /> : <Copy size={16} />}
                    <span>{copiedKey === 'all_carousel' ? 'সব ডেটা কপি হয়েছে!' : 'সব কয়টি লিংক একসাথে কপি করুন'}</span>
                  </button>
                </div>

                {/* Cards List Table */}
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {selectedProducts.map((p, idx) => {
                    const orderUrl = getProductOrderUrl(p.id);
                    const isItemCopied = copiedKey === `card_${p.id}`;
                    return (
                      <div key={p.id} className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-900 font-bold flex items-center justify-center shrink-0 text-xs">
                            #{idx + 1}
                          </span>
                          <img 
                            src={p.image} 
                            alt={p.nameBn || p.nameEn} 
                            className="w-10 h-10 object-cover rounded-lg border border-stone-200 shrink-0" 
                            referrerPolicy="no-referrer"
                          />
                          <div className="min-w-0 flex-1 space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-stone-900 truncate">{p.nameBn || p.nameEn}</span>
                              <span className="text-blue-900 font-extrabold text-[11px]">৳{p.price}</span>
                            </div>
                            <div className="font-mono text-[10px] text-stone-500 truncate bg-white px-2 py-0.5 rounded border border-stone-200">
                              {orderUrl}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleCopy(orderUrl, `card_${p.id}`)}
                            className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1 transition-all cursor-pointer ${
                              isItemCopied ? 'bg-emerald-600 text-white' : 'bg-white border border-stone-300 text-stone-700 hover:bg-stone-100'
                            }`}
                          >
                            {isItemCopied ? <Check size={14} /> : <Copy size={14} />}
                            <span>{isItemCopied ? 'কপি হয়েছে' : 'লিংক কপি'}</span>
                          </button>

                          <a
                            href={orderUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg text-stone-500 hover:text-blue-600 hover:bg-white border border-stone-200 transition-colors"
                            title="ওয়েবসাইটে টেস্ট করুন"
                          >
                            <ExternalLink size={14} />
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* TAB: HIGH-MARGIN COMBO / BUNDLE AD BUILDER (৳150-300+ Profit Per Order) */}
          {activeTab === 'bundle' && (
            <div className="space-y-6 animate-fade-in">
              {/* Strategic Intro Banner */}
              <div className="p-4 sm:p-5 bg-gradient-to-r from-purple-900 via-indigo-950 to-slate-900 text-white rounded-3xl space-y-2 border border-purple-400/30 shadow-lg">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-purple-600 rounded-xl text-white font-bold">
                    <Gift size={20} />
                  </div>
                  <div>
                    <h4 className="font-serif font-black text-base text-purple-100 flex items-center gap-2">
                      <span>{lang === 'bn' ? 'হাই-মার্জিন কম্বো অ্যাড জেনারেটর (প্রতি অর্ডারে ১৫০-৩০০৳ নিশ্চিত লাভ)' : 'High-Margin Combo Ad Builder'}</span>
                      <span className="bg-purple-500 text-[10px] px-2 py-0.5 rounded-full uppercase font-bold">Recommended Strategy</span>
                    </h4>
                    <p className="text-xs text-purple-200">
                      {lang === 'bn' 
                        ? '১টি ড্রেসে ৫০ টাকা লাভে বিজ্ঞাপনের খরচ মেটানো কঠিন। কিন্তু ২টি বা ৩টি ড্রেস কম্বো অফারে বিক্রি করলে কাস্টমার আকর্ষণও বাড়ে এবং প্রতি অর্ডারে নিট লাভ ১৫০-৩০০ টাকা থাকে!'
                        : 'Bundle 2 or 3 dresses together into attractive sets to boost margins from ৳50 to ৳200-300+.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 1: Select 2-3 Products for the Bundle */}
              <div className="p-4 bg-white border border-stone-200 rounded-2xl space-y-3 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-2">
                  <div>
                    <h4 className="font-serif font-bold text-stone-900 text-sm flex items-center gap-2">
                      <Package size={16} className="text-purple-600" />
                      <span>{lang === 'bn' ? '১. কম্বোর জন্য ২টি বা ৩টি ড্রেস নির্বাচন করুন' : '1. Select 2 or 3 Dresses for the Bundle'}</span>
                    </h4>
                    <p className="text-[11px] text-stone-500">
                      {lang === 'bn' ? `বর্তমানে ${bundleProductIds.length}টি ড্রেস সিলেক্ট করা আছে` : `${bundleProductIds.length} dresses selected`}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setBundleProductIds(allProducts.slice(0, 2).map(p => p.id))}
                      className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold rounded-xl text-xs border border-purple-200 cursor-pointer"
                    >
                      {lang === 'bn' ? '২-পিস কম্বো সিলেক্ট' : 'Select 2-Piece Set'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setBundleProductIds(allProducts.slice(0, 3).map(p => p.id))}
                      className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold rounded-xl text-xs border border-purple-200 cursor-pointer"
                    >
                      {lang === 'bn' ? '৩-পিস মেগা কম্বো' : 'Select 3-Piece Set'}
                    </button>
                  </div>
                </div>

                {/* Product Selection Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-60 overflow-y-auto p-1">
                  {allProducts.map(p => {
                    const isSelected = bundleProductIds.includes(p.id);
                    return (
                      <div
                        key={p.id}
                        onClick={() => {
                          setBundleProductIds(prev => {
                            if (prev.includes(p.id)) {
                              if (prev.length <= 2) {
                                alert('কম্বো অফারের জন্য কমপক্ষে ২টি প্রোডাক্ট প্রয়োজন।');
                                return prev;
                              }
                              return prev.filter(id => id !== p.id);
                            } else {
                              if (prev.length >= 4) {
                                alert('কম্বোতে সর্বোচ্চ ৪টি প্রোডাক্ট রাখতে পারেন।');
                                return prev;
                              }
                              return [...prev, p.id];
                            }
                          });
                        }}
                        className={`p-2 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-2 ${
                          isSelected 
                            ? 'border-purple-600 bg-purple-50/80 shadow-xs' 
                            : 'border-stone-200 bg-white hover:border-stone-300'
                        }`}
                      >
                        <img 
                          src={p.image} 
                          alt={p.nameBn || p.nameEn} 
                          className="w-10 h-10 object-cover rounded-lg shrink-0 border border-stone-200" 
                          referrerPolicy="no-referrer"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-bold text-stone-900 truncate">{p.nameBn || p.nameEn}</p>
                          <p className="text-[10px] font-extrabold text-purple-900">৳{p.price}</p>
                        </div>
                        <div className={`w-4 h-4 rounded flex items-center justify-center text-[10px] shrink-0 ${isSelected ? 'bg-purple-600 text-white' : 'border border-stone-300'}`}>
                          {isSelected && '✓'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Bundle Pricing & Offer Config */}
              <div className="p-4 bg-purple-50/60 border border-purple-200 rounded-2xl space-y-4">
                <h4 className="font-serif font-bold text-purple-950 text-sm flex items-center gap-2">
                  <Sparkles size={16} className="text-purple-700" />
                  <span>{lang === 'bn' ? '২. কম্বো অফার টাইপ ও আকর্ষণীয় মূল্য নির্ধারণ' : '2. Set Bundle Offer & Pricing'}</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => setBundleOfferType('free_delivery')}
                    className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      bundleOfferType === 'free_delivery' 
                        ? 'border-purple-600 bg-white shadow-sm ring-2 ring-purple-400/20' 
                        : 'border-stone-200 bg-white/70'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-purple-950">🚚 ফ্রি ক্যাশ অন ডেলিভারি অফার</span>
                      {bundleOfferType === 'free_delivery' && <Check size={16} className="text-purple-600" />}
                    </div>
                    <p className="text-[11px] text-stone-600 mt-1">
                      "যেকোনো ২টি/৩টি ড্রেস একসাথে অর্ডার করলেই সারাদেশে ডেলিভারি চার্জ সম্পূর্ণ ফ্রি!"
                    </p>
                  </div>

                  <div
                    onClick={() => setBundleOfferType('extra_discount')}
                    className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      bundleOfferType === 'extra_discount' 
                        ? 'border-purple-600 bg-white shadow-sm ring-2 ring-purple-400/20' 
                        : 'border-stone-200 bg-white/70'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-purple-950">🏷️ স্পেশাল প্যাকেজ ডিসকাউন্ট</span>
                      {bundleOfferType === 'extra_discount' && <Check size={16} className="text-purple-600" />}
                    </div>
                    <p className="text-[11px] text-stone-600 mt-1">
                      নরমাল মূল্যের চেয়ে ৳১০০-১৫০ ছাড় দিয়ে স্পেশাল কম্বো অফার তৈরি করুন।
                    </p>
                  </div>
                </div>

                {/* Profit Math Breakdown Box */}
                <div className="p-3.5 bg-white rounded-xl border border-purple-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div>
                    <span className="text-[10px] text-stone-500 block uppercase font-bold">মোট সাধারণ মূল্য</span>
                    <span className="text-sm font-extrabold text-stone-700 line-through">৳{bundleOriginalTotal}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-500 block uppercase font-bold">কম্বো অফার মূল্য</span>
                    <span className="text-base font-extrabold text-purple-900">৳{bundleFinalPrice}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-500 block uppercase font-bold">আনুমানিক পাইকারি খরচ</span>
                    <span className="text-sm font-extrabold text-stone-600">৳{bundleProductIds.length * 280}</span>
                  </div>
                  <div className="bg-emerald-50 rounded-lg p-1 border border-emerald-200">
                    <span className="text-[10px] text-emerald-800 block uppercase font-bold">আপনার গ্রস প্রফিট</span>
                    <span className="text-base font-extrabold text-emerald-700">৳{bundleFinalPrice - (bundleProductIds.length * 280)}</span>
                  </div>
                </div>
              </div>

              {/* Step 3: Copy High-Converting Facebook Ad Caption */}
              <div className="p-4 bg-white border border-stone-200 rounded-2xl space-y-3 shadow-xs">
                <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                  <h4 className="font-serif font-bold text-stone-900 text-sm flex items-center gap-2">
                    <Copy size={16} className="text-purple-600" />
                    <span>{lang === 'bn' ? '৩. ফেসবুক পোস্ট ও বিজ্ঞাপনের আকর্ষণীয় ক্যাপশন (১-ক্লিকে কপি)' : '3. Ready Facebook Ad Caption'}</span>
                  </h4>

                  <button
                    type="button"
                    onClick={() => {
                      const primaryProd = selectedBundleProducts[0] || currentSingleProduct;
                      const orderUrl = primaryProd ? getProductOrderUrl(primaryProd.id) : origin;
                      const captionText = `👶 প্রিয় সোনামণির জন্য প্রিমিয়াম সুতি ${bundleProductIds.length}-পিস সুপার সেভার কম্বো কালেকশন! 🌸
✨ রঙিলা রূপ কিডস - কোমল ত্বকের জন্য ১০০% খাঁটি সুতি ফেব্রিক।

🎁 ধামাকা কম্বো অফার:
${selectedBundleProducts.map((p, i) => `👉 ড্রেস #${i+1}: ${p.nameBn || p.nameEn}`).join('\n')}

💰 নিয়মিত মূল্য: ৳${bundleOriginalTotal}
🔥 আজকের স্পেশাল কম্বো অফার: মাত্র ৳${bundleFinalPrice} টাকা!
${bundleOfferType === 'free_delivery' ? '🚚 [সীমিত সময়ের জন্য সারাদেশে ডেলিভারি চার্জ সম্পূর্ণ ফ্রি!]' : '🏷️ [কম্বোতে ফ্ল্যাট ১০০ টাকা বিশেষ ছাড়!]'}

✅ ১০০% নরম ও প্রিমিয়াম অর্গানিক সুতি ফেব্রিক
✅ সাইজ: ০-৬ মাস থেকে ৫-৬ বছর বয়সী বাচ্চাদের জন্য
✅ পার্সেল হাতে পেয়ে ডেলিভারিম্যানের সামনে চেক করে নেওয়ার পূর্ণ সুবিধা
✅ ক্যাশ অন ডেলিভারি (পণ্য হাতে পেয়ে টাকা পরিশোধ)

🛒 এখনই "Order now" বাটনে ক্লিক করে ওয়েবসাইট থেকে সহজে অর্ডার করুন:
👉 ${orderUrl}

📞 প্রয়োজনে কল বা WhatsApp করুন: 01792765693
(সীমিত স্টক! অফার শেষ হওয়ার আগেই আপনার সোনামণির সাইজ কনফার্ম করুন)`;
                      handleCopy(captionText, 'bundle_caption');
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${
                      copiedKey === 'bundle_caption' ? 'bg-emerald-600 text-white' : 'bg-purple-600 hover:bg-purple-700 text-white'
                    }`}
                  >
                    {copiedKey === 'bundle_caption' ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copiedKey === 'bundle_caption' ? 'ক্যাপশন কপি হয়েছে!' : 'সম্পূর্ণ ক্যাপশন কপি করুন'}</span>
                  </button>
                </div>

                <div className="p-3 bg-stone-900 text-stone-100 rounded-2xl font-mono text-[11px] leading-relaxed max-h-56 overflow-y-auto">
                  <pre className="whitespace-pre-wrap font-sans">
{`👶 প্রিয় সোনামণির জন্য প্রিমিয়াম সুতি ${bundleProductIds.length}-পিস সুপার সেভার কম্বো কালেকশন! 🌸
✨ রঙিলা রূপ কিডস - কোমল ত্বকের জন্য ১০০% খাঁটি সুতি ফেব্রিক।

🎁 ধামাকা কম্বো অফার:
${selectedBundleProducts.map((p, i) => `👉 ড্রেস #${i+1}: ${p.nameBn || p.nameEn}`).join('\n')}

💰 নিয়মিত মূল্য: ৳${bundleOriginalTotal}
🔥 আজকের স্পেশাল কম্বো অফার: মাত্র ৳${bundleFinalPrice} টাকা!
${bundleOfferType === 'free_delivery' ? '🚚 [সীমিত সময়ের জন্য সারাদেশে ডেলিভারি চার্জ সম্পূর্ণ ফ্রি!]' : '🏷️ [কম্বোতে ফ্ল্যাট ১০০ টাকা বিশেষ ছাড়!]'}

✅ ১০০% নরম ও প্রিমিয়াম অর্গানিক সুতি ফেব্রিক
✅ পার্সেল হাতে পেয়ে ডেলিভারিম্যানের সামনে চেক করে নেওয়ার পূর্ণ সুবিধা
✅ ক্যাশ অন ডেলিভারি সারাদেশে

🛒 এখনই "Order now" বাটনে ক্লিক করে ওয়েবসাইট থেকে সহজে অর্ডার করুন:
👉 ${selectedBundleProducts[0] ? getProductOrderUrl(selectedBundleProducts[0].id) : origin}

📞 প্রয়োজনে কল বা WhatsApp করুন: 01792765693`}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* TAB: DAILY PROFIT & CAPITAL SAFETY CALCULATOR (২০,০০০ টাকার পুঁজি রক্ষা ক্যালকুলেটর) */}
          {activeTab === 'profit_calc' && (
            <div className="space-y-6 animate-fade-in">
              {/* Strategic Intro Banner */}
              <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-900 via-teal-950 to-slate-900 text-white rounded-3xl space-y-2 border border-emerald-400/30 shadow-lg">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-emerald-500 rounded-xl text-white font-bold">
                    <Calculator size={20} />
                  </div>
                  <div>
                    <h4 className="font-serif font-black text-base text-emerald-100 flex items-center gap-2">
                      <span>{lang === 'bn' ? 'বিজ্ঞাপন বাজেট ও দৈনিক নিট লাভ ক্যালকুলেটর' : 'Ad Budget & Net Profit Calculator'}</span>
                      <span className="bg-emerald-500 text-[10px] px-2 py-0.5 rounded-full uppercase font-bold">২০,০০০৳ পুঁজি নিরাপত্তা টুল</span>
                    </h4>
                    <p className="text-xs text-emerald-200">
                      {lang === 'bn' 
                        ? 'আপনার পুঁজি যাতে কোনোভাবেই লোকসানে না পড়ে, তার জন্য ফেসবুক বিজ্ঞাপনের খরচ, পাইকারি ক্রয়মূল্য ও কুরিয়ার রিটার্ন হিসাব করে হাতে থাকা আসল নিট লাভ দেখুন।'
                        : 'Safeguard your 20,000 BDT capital by modeling exact ad spend, COGS, returns, and net margin.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Calculator Inputs */}
              <div className="p-4 sm:p-5 bg-white border border-stone-200 rounded-2xl space-y-4 shadow-xs">
                <h4 className="font-serif font-bold text-stone-900 text-sm border-b border-stone-100 pb-2 flex items-center gap-2">
                  <DollarSign size={16} className="text-emerald-600" />
                  <span>আপনার ব্যবসার বর্তমান ডাটা দিয়ে টেস্ট করুন:</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {/* Daily Ad Spend (USD) */}
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">
                      দৈনিক বিজ্ঞাপন বাজেট ($ USD)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        max="20"
                        step="0.5"
                        value={calcDailySpendUsd}
                        onChange={(e) => setCalcDailySpendUsd(Math.max(1, Number(e.target.value) || 1))}
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-mono font-bold text-sm text-stone-900 focus:ring-2 focus:ring-emerald-500"
                      />
                      <span className="text-xs font-bold text-stone-500 shrink-0">≈ ৳{totalDailyAdSpendBdt}</span>
                    </div>
                    <span className="text-[10px] text-stone-500">প্রস্তাবিত: $২ থেকে $৩ (প্রতিদিন ২৫০-৩৭৫ টাকা)</span>
                  </div>

                  {/* Wholesale Cost */}
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">
                      প্রতি ড্রেসের পাইকারি ক্রয়মূল্য (৳ BDT)
                    </label>
                    <input
                      type="number"
                      min="50"
                      max="2000"
                      value={calcWholesaleCost}
                      onChange={(e) => setCalcWholesaleCost(Number(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-mono font-bold text-sm text-stone-900 focus:ring-2 focus:ring-emerald-500"
                    />
                    <span className="text-[10px] text-stone-500">পাইকারি বাজার থেকে ড্রেস কেনার প্রকৃত খরচ</span>
                  </div>

                  {/* Selling Price */}
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">
                      ওয়েবসাইটে বিক্রয়মূল্য (৳ BDT)
                    </label>
                    <input
                      type="number"
                      min="100"
                      max="5000"
                      value={calcSellingPrice}
                      onChange={(e) => setCalcSellingPrice(Number(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-mono font-bold text-sm text-stone-900 focus:ring-2 focus:ring-emerald-500"
                    />
                    <span className="text-[10px] text-stone-500">কাস্টমারকে যে দামে বিক্রি করছেন</span>
                  </div>

                  {/* Expected Orders Per Day */}
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">
                      দৈনিক গড় অর্ডার সংখ্যা (Pieces)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={calcEstimatedOrders}
                      onChange={(e) => setCalcEstimatedOrders(Math.max(1, Number(e.target.value) || 1))}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-mono font-bold text-sm text-stone-900 focus:ring-2 focus:ring-emerald-500"
                    />
                    <span className="text-[10px] text-stone-500">শুরুতে দিনে ৩-৫টি অর্ডারই দারুণ শুরু</span>
                  </div>

                  {/* Return Rate % */}
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">
                      কুরিয়ার রিটার্ন রিস্ক বাফার (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={calcReturnRate}
                      onChange={(e) => setCalcReturnRate(Math.max(0, Number(e.target.value) || 0))}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-mono font-bold text-sm text-stone-900 focus:ring-2 focus:ring-emerald-500"
                    />
                    <span className="text-[10px] text-stone-500">১০% ধরে রাখা নিরাপদ (রিটার্ন কুরিয়ার ফি বাফার)</span>
                  </div>

                  {/* Dollar Exchange Rate */}
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">
                      ডলার রেট (1 USD = BDT)
                    </label>
                    <input
                      type="number"
                      min="100"
                      max="150"
                      value={calcExchangeRate}
                      onChange={(e) => setCalcExchangeRate(Number(e.target.value) || 125)}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-mono font-bold text-sm text-stone-900 focus:ring-2 focus:ring-emerald-500"
                    />
                    <span className="text-[10px] text-stone-500">ব্যাংক রেট সাধারণত ১২২-১২৬ টাকা</span>
                  </div>
                </div>
              </div>

              {/* Live Output Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200">
                  <span className="text-[11px] text-stone-500 uppercase font-bold block">মোট দৈনিক সেল</span>
                  <span className="text-xl font-bold font-mono text-stone-900">৳{totalDailyRevenue.toLocaleString()}</span>
                  <span className="text-[10px] text-stone-500 block mt-0.5">{calcEstimatedOrders}টি অর্ডার</span>
                </div>

                <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200">
                  <span className="text-[11px] text-rose-700 uppercase font-bold block">বিজ্ঞাপন খরচ (Ad Spend)</span>
                  <span className="text-xl font-bold font-mono text-rose-900">৳{totalDailyAdSpendBdt.toLocaleString()}</span>
                  <span className="text-[10px] text-rose-600 block mt-0.5">${calcDailySpendUsd} ডলার/দিন</span>
                </div>

                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200">
                  <span className="text-[11px] text-amber-800 uppercase font-bold block">রিটার্ন সেফটি বাফার</span>
                  <span className="text-xl font-bold font-mono text-amber-900">৳{estimatedReturnLoss.toLocaleString()}</span>
                  <span className="text-[10px] text-amber-700 block mt-0.5">সম্ভাব্য {expectedReturnOrders}টি রিটার্ন ফি</span>
                </div>

                <div className={`p-4 rounded-2xl border-2 ${netDailyProfit > 0 ? 'bg-emerald-50 border-emerald-500 text-emerald-950' : 'bg-rose-100 border-rose-500 text-rose-950'}`}>
                  <span className="text-[11px] uppercase font-extrabold block">হাতে থাকা আসল নিট লাভ</span>
                  <span className="text-2xl font-black font-mono">৳{netDailyProfit.toLocaleString()}</span>
                  <span className="text-[10px] font-bold block mt-0.5">
                    {netDailyProfit > 0 ? `মাসিক সম্ভাব্য লাভ: ৳${(netDailyProfit * 30).toLocaleString()}` : '⚠️ ক্ষতি হচ্ছে!'}
                  </span>
                </div>
              </div>

              {/* Capital Safety Strategic Guidance */}
              <div className={`p-4 rounded-2xl border-2 flex items-start gap-3 ${
                profitPerDeliveredOrder >= 120 
                  ? 'bg-emerald-50/90 border-emerald-300 text-emerald-900' 
                  : 'bg-rose-50/90 border-rose-400 text-rose-900'
              }`}>
                {profitPerDeliveredOrder >= 120 ? (
                  <CheckCircle2 size={24} className="text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle size={24} className="text-rose-600 shrink-0 mt-0.5" />
                )}
                <div className="space-y-1">
                  <h5 className="font-bold text-sm">
                    {profitPerDeliveredOrder >= 120 
                      ? '✅ আপনার ২০,০০০ টাকার পুঁজি নিরাপদ এবং লাভজনক মডেলে আছে!' 
                      : '⚠️ সতর্কবার্তা: প্রতি ড্রেসে নিট লাভ বাড়াতে হবে!'}
                  </h5>
                  <p className="text-xs leading-relaxed">
                    {profitPerDeliveredOrder >= 120
                      ? `প্রতি সফল ডেলিভারিতে আপনার নিট লাভ প্রায় ৳${profitPerDeliveredOrder} টাকা থাকছে। এই লাভ আপনার ২০,০০০ টাকার মূলধন না ভেঙে ব্যবসা ধীরে ধীরে বড় করতে সাহায্য করবে। লাভজনক হলে আস্তে আস্তে বিজ্ঞাপন বাজেট বাড়িয়ে দিনে ৮-১০ অর্ডারে যাবেন।`
                      : `প্রতি ড্রেসে মাত্র ৳৫০ লাভ থাকলে বিজ্ঞাপনের খরচ ও ২-১টা রিটার্নে মূলধনের ক্ষতি হতে পারে। সমাধান: একক ড্রেস কম দামে না বেচে ২-৩টি ড্রেসের কম্বো প্যাক বিক্রি করুন (উপরে "🎁 হাই-মার্জিন কম্বো অ্যাড" ট্যাব দেখুন) যাতে প্রতি অর্ডারে নিট লাভ ১৫০-২৫০ টাকা হয়।`}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB: AUDIENCE TARGETING & FAKE ORDER DEFENSE (অডিয়েন্স ও ফেক অর্ডার প্রতিরোধ) */}
          {activeTab === 'audience' && (
            <div className="space-y-6 animate-fade-in">
              {/* Header */}
              <div className="p-4 sm:p-5 bg-gradient-to-r from-rose-900 via-stone-900 to-indigo-950 text-white rounded-3xl space-y-2 border border-rose-400/30 shadow-lg">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-rose-600 rounded-xl text-white font-bold">
                    <Target size={20} />
                  </div>
                  <div>
                    <h4 className="font-serif font-black text-base text-rose-100 flex items-center gap-2">
                      <span>{lang === 'bn' ? 'ফেসবুক অডিয়েন্স টার্গেটিং ও ফেক অর্ডার প্রতিরোধ গাইড' : 'Targeting & Fake Order Defense'}</span>
                      <span className="bg-rose-500 text-[10px] px-2 py-0.5 rounded-full uppercase font-bold">High ROI Setup</span>
                    </h4>
                    <p className="text-xs text-rose-200">
                      {lang === 'bn' 
                        ? 'কম ডলারে যাতে বেশি এবং আসল কাস্টমারের অর্ডার আসে এবং ভুয়া/ফেক অর্ডার থেকে কীভাবে নিজেকে শতভাগ সুরক্ষিত রাখবেন।'
                        : 'Exact demographic targeting cheat-sheet and 4 golden rules to eliminate fake orders.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Part 1: Meta Ads Exact Targeting Settings Cheat-Sheet */}
              <div className="p-4 sm:p-5 bg-white border border-stone-200 rounded-2xl space-y-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                  <h4 className="font-serif font-bold text-stone-900 text-sm flex items-center gap-2">
                    <Users size={16} className="text-blue-600" />
                    <span>১. ফেসবুক অ্যাড ম্যানেজারে হুবহু এই সেটিংসগুলো দিন (কপি চিটশিট)</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      const targetingText = `🎯 রঙিলা রূপ কিডস - মেটা অ্যাড অডিয়েন্স টার্গেটিং চিটশিট:
=====================================================
১. Location: Bangladesh (ঢাকা, চট্টগ্রাম, সিলেট, রাজশাহীসহ প্রধান শহরসমূহ)
২. Age: 22 - 38 years (যাদের ছোট বাচ্চা বা ভাগ্নে/ভাগ্নি আছে)
৩. Gender: Women (৮৫% বেবি কাপড় মায়েরাই কেনে)
৪. Placements: Manual Placements -> Mobile Feed Only (Facebook Feed & Instagram Feed)। "Audience Network" আনচেক রাখুন (এতে ৩০% ডলার বাঁচে ও বট ক্লিক বন্ধ হয়)।
৫. Detailed Targeting (Interests):
- Toddler clothing
- Baby & toddler clothing
- Motherhood / New Parents (0-12 months, 1-2 years)
- Cotton
- Online shopping
৬. Optimization for Ad Delivery: Conversions (Purchases) বা Link Clicks (Landing Page Views)`;
                      handleCopy(targetingText, 'targeting_copy');
                    }}
                    className="text-blue-600 hover:underline font-bold flex items-center gap-1 text-xs cursor-pointer"
                  >
                    <Copy size={13} />
                    <span>{copiedKey === 'targeting_copy' ? 'চিটশিট কপিড!' : 'টার্গেটিং কপি করুন'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
                    <span className="font-bold text-stone-900 block flex items-center gap-1 text-purple-900">
                      👩 জেন্ডার (Gender): <span className="text-rose-600 font-extrabold">Women (মহিলা)</span>
                    </span>
                    <p className="text-[11px] text-stone-600">
                      পুরুষদের চেয়ে মায়েরা বেবি ড্রেস কেনার ক্ষেত্রে ৮ গুণ বেশি রেসপন্স করে।
                    </p>
                  </div>

                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
                    <span className="font-bold text-stone-900 block flex items-center gap-1 text-blue-900">
                      🎂 বয়স (Age): <span className="text-blue-700 font-extrabold">২২ থেকে ৩৮ বছর</span>
                    </span>
                    <p className="text-[11px] text-stone-600">
                      এই বয়সী মায়েদের ০ থেকে ৫-৬ বছর বয়সী বাচ্চা থাকে, যা আপনার ড্রেসের সাথে নিখুঁত মিল।
                    </p>
                  </div>

                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
                    <span className="font-bold text-stone-900 block flex items-center gap-1 text-emerald-900">
                      📱 প্লেসমেন্ট (Placements): <span className="text-emerald-700 font-extrabold">Mobile Feed Only</span>
                    </span>
                    <p className="text-[11px] text-stone-600">
                      Audience Network এবং Right Column বন্ধ রাখলে অহেতুক ডলার খরচ ও রোবট ক্লিক বন্ধ হয়ে যাবে।
                    </p>
                  </div>

                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
                    <span className="font-bold text-stone-900 block flex items-center gap-1 text-amber-900">
                      🎯 ইন্টারেস্ট (Interests): <span className="text-amber-700 font-extrabold">Baby Clothing, Parents</span>
                    </span>
                    <p className="text-[11px] text-stone-600">
                      Toddler clothing, Motherhood, Online shopping সিলেক্ট করবেন।
                    </p>
                  </div>
                </div>
              </div>

              {/* Part 2: 4 Golden Rules to Prevent Fake Orders */}
              <div className="p-4 sm:p-5 bg-white border border-stone-200 rounded-2xl space-y-4 shadow-xs">
                <h4 className="font-serif font-bold text-stone-900 text-sm border-b border-stone-100 pb-2 flex items-center gap-2">
                  <ShieldCheck size={16} className="text-emerald-600" />
                  <span>২. ফেক অর্ডার ও রিটার্ন ঠেকানোর ৪টি গোল্ডেন নিয়ম (পুঁজি রক্ষার জন্য আবশ্যক)</span>
                </h4>

                <div className="space-y-3 text-xs">
                  <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                      ১
                    </div>
                    <div>
                      <h5 className="font-bold text-emerald-950 text-xs">পার্সেল ছাড়ার আগে ফোন কল কনফার্মেশন</h5>
                      <p className="text-stone-700 text-[11px] mt-0.5 leading-relaxed">
                        ওয়েবসাইটে কোনো অর্ডার আসার সাথে সাথে কখনোই সরাসরি কুরিয়ারে পাঠাবেন না। আগে কাস্টমারকে ফোন দিন: "আসসালামু আলাইকুম আপু, রঙিলা রূপ থেকে আপনার বাচ্চার ফ্রকের অর্ডারের ব্যাপারে কথা বলছি। আপনার বাচ্চার বয়স কত আর সাইজটা কি মিলিয়ে নিব?" কাস্টমার যদি কথা বলে সাইজ নিশ্চিত করে, তবেই সেই অর্ডার ৯৯% আসল। ফোন না ধরলে অর্ডার হোল্ডে রাখবেন।
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                      ২
                    </div>
                    <div>
                      <h5 className="font-bold text-blue-950 text-xs">ঢাকার বাইরে ১০০-১৫০ টাকা অগ্রিম ডেলিভারি চার্জ</h5>
                      <p className="text-stone-700 text-[11px] mt-0.5 leading-relaxed">
                        ঢাকার বাইরে দূরের জেলা বা উপজেলা থেকে অর্ডার আসলে কাস্টমারকে বলবেন: "আপু, ড্রেসের দাম ডেলিভারিম্যানকে দেবেন, কিন্তু কুরিয়ারের অগ্রিম চার্জ ৳১০০-১৫০ টাকা আমাদের বিকাশ নাম্বারে পাঠিয়ে অর্ডারটি ফাইনাল করে নিন।" যে কাস্টমার ১০০ টাকা অগ্রিম দেবে, সে কখনোই পার্সেল রিজেক্ট করবে না—রিটার্ন শূন্য হয়ে যাবে।
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 bg-purple-50/70 border border-purple-200 rounded-xl flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                      ৩
                    </div>
                    <div>
                      <h5 className="font-bold text-purple-950 text-xs">মেসেঞ্জারের চেয়ে ওয়েবসাইটে অর্ডার ৯০% রিয়েল</h5>
                      <p className="text-stone-700 text-[11px] mt-0.5 leading-relaxed">
                        ফেসবুক মেসেঞ্জারে মানুষ শুধুই "দাম কত", "ছবি দেন" বলে সময় নষ্ট করে। কিন্তু আপনার ওয়েবসাইটে যে কাস্টমার নিজের পুরো নাম, ফোন নাম্বার, জেলা ও বাসা নাম্বার টাইপ করে "অর্ডার নিশ্চিত করুন" বাটনে ক্লিক করে—সে একজন সিরিয়াস ক্রেতা। আমাদের তৈরি করা ডিরেক্ট চেকআউট সিস্টেম আপনার সময় ও ভুয়া অর্ডার ৯০% কমিয়ে দেয়।
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-amber-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                      ৪
                    </div>
                    <div>
                      <h5 className="font-bold text-amber-950 text-xs">Steadfast / RedX কুরিয়ারে "ওপেন বক্স" অনুমতি</h5>
                      <p className="text-stone-700 text-[11px] mt-0.5 leading-relaxed">
                        ডেলিভারি এন্ট্রির সময় ইনস্ট্রাকশনে লিখে দেবেন: "ডেলিভারিম্যানের সামনে কাপড় দেখে রিসিভ করতে পারবে।" এতে কাস্টমারের কোনো ভয় থাকে না এবং নিশ্চিন্তে রিসিভ করে।
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SINGLE PRODUCT BOOST */}
          {activeTab === 'single' && currentSingleProduct && (
            <div className="space-y-5">
              {/* Product Header Card */}
              <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl flex items-center gap-4">
                <img 
                  src={currentSingleProduct.image} 
                  alt={currentSingleProduct.nameEn} 
                  className="w-16 h-20 object-cover rounded-xl border border-stone-200 shadow-xs shrink-0" 
                  referrerPolicy="no-referrer"
                />
                <div className="min-w-0 flex-1 space-y-1">
                  <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block">
                    {currentSingleProduct.category}
                  </span>
                  <h4 className="font-serif font-bold text-base text-stone-900 truncate">
                    {lang === 'bn' ? currentSingleProduct.nameBn : currentSingleProduct.nameEn}
                  </h4>
                  <div className="flex items-baseline gap-2">
                    <span className="text-base font-extrabold text-rose-950">৳{currentSingleProduct.price.toLocaleString()}</span>
                    {currentSingleProduct.originalPrice && currentSingleProduct.originalPrice > currentSingleProduct.price && (
                      <span className="text-xs text-stone-400 line-through">৳{currentSingleProduct.originalPrice.toLocaleString()}</span>
                    )}
                  </div>
                </div>

                <div className="text-right space-y-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleCopy(getProductOrderUrl(currentSingleProduct.id), 'single_link')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${
                      copiedKey === 'single_link' ? 'bg-emerald-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {copiedKey === 'single_link' ? <Check size={16} /> : <Copy size={16} />}
                    <span>{copiedKey === 'single_link' ? 'কপি হয়েছে!' : 'Order now লিংক কপি'}</span>
                  </button>
                </div>
              </div>

              {/* Ready-made FB Post Caption */}
              <div className="space-y-1.5">
                <label className="font-serif font-bold text-stone-900 block text-xs flex items-center justify-between">
                  <span>ফেসবুক পেজ পোস্ট বা এডের জন্য রেডিমেড ক্যাপশন:</span>
                  <button
                    type="button"
                    onClick={() => {
                      const text = `🌸 ${currentSingleProduct.nameBn || currentSingleProduct.nameEn} 🌸
✨ রঙিলা রূপ কিডস - প্রিমিয়াম বেবি ফ্যাশন কালেকশন!

দাম: ৳${currentSingleProduct.price.toLocaleString()} ${currentSingleProduct.originalPrice ? `(পূর্বমূল্য ৳${currentSingleProduct.originalPrice.toLocaleString()})` : ''}
ফেব্রিক: ${currentSingleProduct.fabricBn || '১০০% প্রিমিয়াম সুতি'} | সাইজ: ০-৬ মাস থেকে ৬ বছর

🛒 সরাসরি ওয়েবসাইট থেকে ক্যাশ অন ডেলিভারিতে অর্ডার করুন:
👉 ${getProductOrderUrl(currentSingleProduct.id)}

📞 কল বা হোয়াটসঅ্যাপ করুন: 01792765693
🚚 সারা বাংলাদেশে হোম ডেলিভারি ও ডেলিভারির সময় পার্সেল দেখে নেওয়ার সুবিধা!`;
                      handleCopy(text, 'single_caption');
                    }}
                    className="text-blue-600 hover:underline font-bold flex items-center gap-1 text-[11px]"
                  >
                    <Copy size={12} />
                    <span>{copiedKey === 'single_caption' ? 'ক্যাপশন কপিড!' : 'ক্যাপশন কপি করুন'}</span>
                  </button>
                </label>

                <div className="p-3 bg-stone-900 text-stone-100 rounded-2xl font-mono text-[11px] leading-relaxed">
                  <pre className="whitespace-pre-wrap font-sans">
{`🌸 ${currentSingleProduct.nameBn || currentSingleProduct.nameEn} 🌸
✨ রঙিলা রূপ কিডস - প্রিমিয়াম বেবি ফ্যাশন কালেকশন!

দাম: ৳${currentSingleProduct.price.toLocaleString()} ${currentSingleProduct.originalPrice ? `(পূর্বমূল্য ৳${currentSingleProduct.originalPrice.toLocaleString()})` : ''}
ফেব্রিক: ${currentSingleProduct.fabricBn || '১০০% প্রিমিয়াম সুতি'} | সাইজ: ০-৬ মাস থেকে ৬ বছর

🛒 সরাসরি ওয়েবসাইট থেকে ক্যাশ অন ডেলিভারিতে অর্ডার করুন:
👉 ${getProductOrderUrl(currentSingleProduct.id)}

📞 কল বা হোয়াটসঅ্যাপ করুন: 01792765693
🚚 সারা বাংলাদেশে হোম ডেলিভারি ও ডেলিভারির সময় পার্সেল দেখে নেওয়ার সুবিধা!`}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: STEP-BY-STEP META ADS SETUP GUIDE (How to get the blue Order now button on Facebook) */}
          {activeTab === 'guide' && (
            <div className="space-y-5">
              
              {/* Core Guide Card */}
              <div className="p-5 bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-3xl space-y-3 shadow-lg border border-blue-400/30">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-blue-500 rounded-xl text-white font-bold">
                    <CheckCircle2 size={20} />
                  </div>
                  <div>
                    <h4 className="font-serif font-black text-base text-blue-100">
                      ফেসবুক বুস্টে এমন নীল "Order now" বাটন আনার পূর্ণাঙ্গ গাইড
                    </h4>
                    <p className="text-xs text-blue-200">
                      ফেসবুকে বুস্ট করার সময় ঠিক কোন কোন অপশন সিলেক্ট করলে এই বাটনটি চলে আসবে:
                    </p>
                  </div>
                </div>
              </div>

              {/* 5 Steps Breakdown */}
              <div className="space-y-3">
                {[
                  {
                    step: '১',
                    title: 'Facebook Ads Manager-এ যান বা পেজে পোস্ট বুস্ট করুন',
                    desc: 'আপনার কম্পিউটার বা মোবাইল ব্রাউজার থেকে adsmanager.facebook.com এ যান অথবা আপনার ফেসবুক পেজের পোস্টে Boost Post বাটনে ক্লিক করুন।',
                    badge: 'Step 1'
                  },
                  {
                    step: '২',
                    title: 'Campaign Objective: "Sales" অথবা "Traffic" সিলেক্ট করুন',
                    desc: 'বিজ্ঞাপনের উদ্দেশ্য (Objective) হিসেবে "Sales" (কনভার্শন) বা "Traffic" নির্বাচন করুন। এটি ওয়েবসাইট অর্ডারের জন্য সবচেয়ে বেশি কার্যকরী।',
                    badge: 'Campaign Level'
                  },
                  {
                    step: '৩',
                    title: 'Conversion Location এ "Website" সিলেক্ট করুন',
                    desc: 'কাস্টমাররা কোথায় কেনাকাটা করবে সেখানে "Website" অপশনটি টিক দিন। মেসেঞ্জার সিলেক্ট করবেন না, কারণ মেসেঞ্জারে অনেক ফেক ইনবক্স আসে, কিন্তু ওয়েবসাইটে আসল কাস্টমার অর্ডার করে।',
                    badge: 'Ad Set Level'
                  },
                  {
                    step: '৪',
                    title: 'Ad Setup এ Format: "Carousel" (ক্যারোসেল) সিলেক্ট করুন',
                    desc: 'আপনি যদি ৫ থেকে ৭টি বা ততোধিক প্রোডাক্ট একসাথে দিতে চান, তবে Format অপশনে "Carousel" সিলেক্ট করুন। আর যদি শুধু ১টি ভিডিও বা ছবি দেন তবে "Single image or video" সিলেক্ট করবেন।',
                    badge: 'Ad Creative Level'
                  },
                  {
                    step: '৫',
                    title: 'Call to action (CTA) বাটনে "Order now" সিলেক্ট করুন (সবচেয়ে গুরুত্বপূর্ণ)',
                    desc: 'Ad Creative এর নিচের দিকে "Call to action" ড্রপডাউন দেখতে পাবেন। ড্রপডাউনটি খুলে "Order now" সিলেক্ট করে দিন! আর Website URL বক্সে আমাদের জেনারেটর থেকে কপি করা লিংকটি পেস্ট করে দিন। সাথে সাথেই ফেসবুকের বিজ্ঞাপনে ছবির মতো বড় নীল "Order now" বাটন শো করবে!',
                    badge: 'Blue Button Magic',
                    highlight: true
                  }
                ].map((item, index) => (
                  <div 
                    key={index} 
                    className={`p-4 rounded-2xl border flex items-start gap-3.5 transition-all ${
                      item.highlight 
                        ? 'border-blue-500 bg-blue-50/80 shadow-md ring-1 ring-blue-400' 
                        : 'border-stone-200 bg-white'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black shrink-0 text-sm ${
                      item.highlight ? 'bg-blue-600 text-white shadow-md' : 'bg-stone-100 text-stone-700'
                    }`}>
                      {item.step}
                    </div>

                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <h5 className="font-bold text-stone-900 text-sm">{item.title}</h5>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          item.highlight ? 'bg-blue-600 text-white' : 'bg-stone-200 text-stone-700'
                        }`}>
                          {item.badge}
                        </span>
                      </div>
                      <p className="text-stone-700 text-xs leading-relaxed font-medium">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Direct Links to Facebook Ad Settings */}
              <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="font-bold text-stone-900 block text-xs">ফেসবুক অ্যাড ম্যানেজার ও বিলিং লিংক:</span>
                  <span className="text-[11px] text-stone-500">আপনার ডুয়েল কারেন্সি কার্ড দিয়ে সরাসরি ফেসবুককে পেমেন্ট করুন</span>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href="https://adsmanager.facebook.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center gap-1 text-xs shadow-sm transition-all"
                  >
                    <Rocket size={14} />
                    <span>Ads Manager এ যান</span>
                    <ExternalLink size={12} />
                  </a>

                  <a
                    href="https://adsmanager.facebook.com/billing"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-stone-800 hover:bg-stone-900 text-white font-bold rounded-xl flex items-center gap-1 text-xs shadow-sm transition-all"
                  >
                    <CreditCard size={14} />
                    <span>কার্ড ও বিলিং পেজ</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-stone-600 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>ওয়েবসাইট লিংক স্বয়ংক্রিয়ভাবে সরাসরি ক্যাশ অন ডেলিভারি (COD) চেকআউট ফরমের সাথে সংযুক্ত।</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold rounded-xl transition-colors cursor-pointer text-xs"
            >
              বন্ধ করুন
            </button>

            <button
              type="button"
              onClick={handleCopyAllCarouselData}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Copy size={14} />
              <span>ক্যারোসেল লিংক কপি করুন</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
