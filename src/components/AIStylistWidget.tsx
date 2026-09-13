import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, Bot, User, ArrowRight, ShoppingBag } from 'lucide-react';
import { Language, AIStylistMessage, Product } from '../types';

interface AIStylistWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  products: Product[];
  onQuickViewProduct: (p: Product) => void;
}

export const AIStylistWidget: React.FC<AIStylistWidgetProps> = ({
  isOpen,
  onClose,
  lang,
  products,
  onQuickViewProduct
}) => {
  const [messages, setMessages] = useState<AIStylistMessage[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: lang === 'bn'
        ? 'নমস্কার/সালাম! আমি "রঙিলা রূপ কিডস AI স্টাইলিস্ট"। বাচ্ছাদের যেকোনো বয়সের কিউট ফ্রক, ড্রেস, রম্পার, জুতা বা গিফট সেট নির্বাচনে আপনাকে সাহায্য করতে প্রস্তুত। আপনি আপনার বাচ্চার জন্য কি ধরণের পোশাক খুঁজছেন?'
        : 'Welcome! I am your "Rongila Rup Kids AI Stylist". I can help you find cute frocks, boys sets, newborn rompers, shoes, or gift sets for children. What are you looking for today?',
      recommendedProductIds: ['rr-kids-001', 'rr-kids-002'],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const presetQuestions = lang === 'bn' ? [
    '🚚 ডেলিভারি চার্জ ও সময় কত?',
    '📏 সাইজ ও বয়স গাইড দেখাও',
    '🔄 সাইজ না মিললে এক্সচেঞ্জ নিয়ম',
    '💳 ক্যাশ অন ডেলিভারিতে চেক করার সুযোগ?',
    '🌿 কাপড় কি ১০০% সুতি ও আরামদায়ক?',
    '🎉 কুপন কোড ও বিশেষ ছাড়',
    '📞 হটলাইন ও শপের ঠিকানা',
    '👶 ১-২ বছরের বাচ্চার কিউট ড্রেস'
  ] : [
    'Delivery charge and delivery time?',
    'Show baby size guide',
    'Return & exchange policy',
    'Cash on Delivery & open parcel?',
    'Is the fabric 100% pure organic cotton?',
    'Coupon discount & special offers',
    'Hotline & store location',
    'Cute dresses for 1-2 years baby'
  ];

  const getSmartAnswer = (query: string): { reply: string; recIds: string[] } => {
    const lower = query.toLowerCase().trim();

    const isGreeting = ['hi', 'hello', 'hey', 'হ্যালো', 'হাই', 'সালাম', 'assalamu alaikum', 'assalamualaikum', 'কেমন আছেন', 'kemon achen', 'namaskar', 'নমস্কার'].some(
      g => lower === g || lower.startsWith(g + ' ') || lower.endsWith(' ' + g)
    );

    if (isGreeting) {
      return {
        reply: lang === 'bn'
          ? 'আসসালামু আলাইকুম! "রঙিলা রূপ কিডস" ভার্চুয়াল অ্যাসিস্ট্যান্টে আপনাকে স্বাগতম। 🌸\n\nবাচ্চার বয়স বা সাইজ নির্বাচন, ডেলিভারি নিয়মাবলী, কুপন ডিসকাউন্ট, রিটার্ন পলিসি বা যেকোনো ড্রেস সম্পর্কে জানতে প্রশ্ন করতে পারেন।'
          : 'Hello! Welcome to "Rongila Rup Kids" Virtual Assistant. How may I assist you today? Feel free to ask about baby dresses, sizes, delivery charges, or ordering!',
        recIds: []
      };
    }

    // Delivery / Charge query
    if (lower.includes('ডেলিভারি') || lower.includes('চার্জ') || lower.includes('delivery') || lower.includes('charge') || lower.includes('কতদিন') || lower.includes('সময়')) {
      return {
        reply: lang === 'bn'
          ? '🚚 রঙিলা রূপ ডেলিভারি তথ্য:\n• ঢাকা সিটির ভেতরে: মাত্র ৳৮০ (২৪ থেকে ৪৮ ঘণ্টার মধ্যে হোম ডেলিভারি)\n• ঢাকা সিটির বাইরে (সারাদেশে): ৳১৫০ (২ থেকে ৩ কার্যদিবসের মধ্যে হোম ডেলিভারি)\n• সারাদেশে ১০০% ক্যাশ অন ডেলিভারি (Cash on Delivery) সুবিধা রয়েছে।\n• কুরিয়ার রাইডারের সামনে পার্সেল খুলে চেক করে টাকা দিতে পারবেন।'
          : '🚚 Delivery Information:\n• Inside Dhaka: BDT 80 (Within 24-48 hours)\n• Outside Dhaka: BDT 150 (Within 2-3 business days)\n• Nationwide Cash on Delivery with open-box verification before payment.',
        recIds: []
      };
    }

    // Return & Exchange Policy
    if (lower.includes('রিটার্ন') || lower.includes('ফেরত') || lower.includes('এক্সচেঞ্জ') || lower.includes('বদল') || lower.includes('return') || lower.includes('exchange') || lower.includes('নষ্ট') || lower.includes('মিললে')) {
      return {
        reply: lang === 'bn'
          ? '🔄 সহজ রিটার্ন ও সাইজ এক্সচেঞ্জ পলিসি:\n• ডেলিভারিম্যানের সামনে ড্রেস চেক করার পূর্ণ সুযোগ রয়েছে।\n• সাইজ যদি ঢিলে বা আঁটসাঁট হয়, ডেলিভারি পাওয়ার ৭ দিনের মধ্যে আমাদের কল বা হোয়াটসঅ্যাপ করলেই ফ্রেশ সাইজ এক্সচেঞ্জ করে দেওয়া হবে।\n• হটলাইন/WhatsApp: 01792765693 (সকাল ৯টা - রাত ১০টা)।'
          : '🔄 7-Day Easy Return & Exchange:\n• Inspect the garment in front of the courier rider.\n• If size does not fit, call us within 7 days for a quick size replacement.\n• Hotline/WhatsApp: 01792765693.',
        recIds: []
      };
    }

    // Sizing & Age Guide
    if (lower.includes('সাইজ') || lower.includes('size') || lower.includes('বয়স') || lower.includes('বছর') || lower.includes('মাস') || lower.includes('age') || lower.includes('মাপ') || lower.includes('গাইড')) {
      return {
        reply: lang === 'bn'
          ? '📏 শিশুদের সাইজ ও বয়স গাইড:\n• ০-৬ মাস: Size 0 (নিউবর্ন/ইনফ্যান্ট)\n• ৬-১২ মাস: Size 12M\n• ১-২ বছর: Size 2Y\n• ২-৩ বছর: Size 3Y\n• ৪-৫ বছর: Size 4-5Y\n• ৬+ বছর: Size 6-8Y\n💡 পরামর্শ: বাচ্চার স্বাস্থ্য ভালো হলে ১ সাইজ বড় অর্ডার করা নিরাপদ।'
          : '📏 Size & Age Guide:\n• 0-6 Months: Size 0 (Newborn)\n• 6-12 Months: Size 12M\n• 1-2 Years: Size 2Y\n• 2-3 Years: Size 3Y\n• 4-5 Years: Size 4-5Y\n• 6+ Years: Size 6-8Y\nTip: If the baby is chubby, selecting one size larger is recommended.',
        recIds: []
      };
    }

    // Fabric & Material Quality
    if (lower.includes('সুতি') || lower.includes('কাপড়') || lower.includes('ফেব্রিক') || lower.includes('কটন') || lower.includes('রং') || lower.includes('fabric') || lower.includes('cotton') || lower.includes('গুণগত')) {
      return {
        reply: lang === 'bn'
          ? '🌿 কাপড়ের ফেব্রিক ও মান:\n• আমাদের প্রতিটি ফ্রক ও ড্রেস ১০০% প্রিমিয়াম কম্বড পিওর অর্গানিক কটন দিয়ে তৈরি।\n• শিশুদের নরম ত্বকের জন্য অত্যন্ত আরামদায়ক, কোনো চুলকানি বা র‍্যাশ হয় না।\n• ১০০% রঙের পাকা গ্যারান্টি।'
          : '🌿 Fabric & Quality:\n• 100% premium combed organic pure cotton fabrics.\n• Hypoallergenic and ultra-soft for sensitive baby skin.\n• Fade-resistant colorfast guarantee.',
        recIds: []
      };
    }

    // Payment / COD / bKash
    if (lower.includes('ক্যাশ') || lower.includes('পেমেন্ট') || lower.includes('বিকাশ') || lower.includes('নগদ') || lower.includes('cod') || lower.includes('payment') || lower.includes('bkash') || lower.includes('টাকা')) {
      return {
        reply: lang === 'bn'
          ? '💳 পেমেন্ট পদ্ধতিসমূহ:\n১. ক্যাশ অন ডেলিভারি (COD): পার্সেল হাতে পেয়ে চেক করে মূল্য পরিশোধ করতে পারেন।\n২. বিকাশ / নগদ: ফুল পেমেন্ট অথবা ডেলিভারি চার্জ অগ্রিম দিতে পারেন।\n• বিকাশ/নগদ নম্বর: 01792765693।'
          : '💳 Payment Methods:\n1. Cash on Delivery (COD) nationwide.\n2. bKash & Nagad instant mobile banking (Phone: 01792765693).',
        recIds: []
      };
    }

    // Discount / Coupon
    if (lower.includes('কুপন') || lower.includes('ডিসকাউন্ট') || lower.includes('off') || lower.includes('coupon') || lower.includes('discount') || lower.includes('ছাড়') || lower.includes('অফার')) {
      return {
        reply: lang === 'bn'
          ? '🎉 বিশেষ ছাড় ও কুপন কোড:\nচেকআউট পেজে "RONGILA20" প্রোমোকোড লিখলে সরাসরি ২০% ক্যাশ ছাড় পাবেন! এছাড়া ৩টি বা তার বেশি ড্রেস অর্ডার করলে উপভোগ করুন ফ্রি ডেলিভারি।'
          : '🎉 Special Promo:\nUse coupon code "RONGILA20" at checkout for instant 20% discount!',
        recIds: []
      };
    }

    // Owner / Hotline / Address
    if (lower.includes('অনার') || lower.includes('মালিক') || lower.includes('owner') || lower.includes('ফোন') || lower.includes('নাম্বার') || lower.includes('phone') || lower.includes('contact') || lower.includes('যোগাযোগ') || lower.includes('হটলাইন') || lower.includes('ঠিকানা') || lower.includes('দোকান') || lower.includes('address')) {
      return {
        reply: lang === 'bn'
          ? '👤 রঙিলা রূপ অনার ও যোগাযোগ তথ্য:\n• স্বত্বাধিকারী: আতাউর রহমান (Ataur Rahman)\n• মোবাইল ও অফিসিয়াল WhatsApp: 01792765693\n• ঠিকানা: সেক্টর ৭, উত্তরা, ঢাকা ১২৩০\n• সেবা সময়: সকাল ৯:০০ - রাত ১০:০০ (প্রতিদিন)'
          : '👤 Rongila Rup Owner & Contact:\n• Store Owner: Ataur Rahman\n• Hotline & WhatsApp: 01792765693\n• Location: Sector 7, Uttara, Dhaka 1230',
        recIds: []
      };
    }

    // How to order
    if (lower.includes('অর্ডার') && (lower.includes('কিভাবে') || lower.includes('করব') || lower.includes('নিয়ম') || lower.includes('how'))) {
      return {
        reply: lang === 'bn'
          ? '🛒 সহজে অর্ডার করার নিয়ম:\n১. যেকোনো ড্রেসের নিচে থাকা "অর্ডার করুন" বাটনে ক্লিক করুন।\n২. বাচ্চার বয়স অনুযায়ী সাইজ সিলেক্ট করুন।\n৩. আপনার নাম, ১১ ডিজিটের মোবাইল নম্বর ও ডেলিভারির ঠিকানা দিয়ে "অর্ডার কনফার্ম করুন" চাপলেই অর্ডার চূড়ান্ত হয়ে যাবে!'
          : '🛒 How to Order:\n1. Click "Order Now" on any dress.\n2. Select child size.\n3. Enter your name, phone number, and address to confirm order in 1-click!',
        recIds: []
      };
    }

    // Matching products from catalog
    const matchedProducts = products.filter(p => {
      const text = (p.nameBn + ' ' + p.nameEn + ' ' + p.category + ' ' + (p.tags || []).join(' ')).toLowerCase();
      return lower.split(' ').some(k => k.length > 2 && text.includes(k));
    });

    if (matchedProducts.length > 0) {
      return {
        reply: lang === 'bn'
          ? 'আপনার খোঁজা বিষয়ের সাথে সামঞ্জস্যপূর্ণ সেরা কিছু ড্রেস নিচে দেওয়া হলো। সরাসরি ক্লিক করে দেখতে ও অর্ডার করতে পারেন:'
          : 'Here are matching recommended outfits from our boutique collection:',
        recIds: matchedProducts.slice(0, 3).map(p => p.id)
      };
    }

    return {
      reply: lang === 'bn'
        ? 'ধন্যবাদ আপনার জিজ্ঞাসার জন্য! আপনি কোন বয়সের বাচ্চার জন্য ড্রেস খুঁজছেন (যেমন: ০-৬ মাস, ১-২ বছর বা ৩-৫ বছর) তা জানালে সেরা কালেকশন প্রদর্শন করতে পারব। এছাড়া ডেলিভারি, সাইজ বা অফার নিয়েও প্রশ্ন করতে পারেন।'
        : 'Thank you! Please let us know your baby\'s age group (e.g. 0-6 months, 1-2 years, 3-5 years) so we can show the most suitable outfits.',
      recIds: []
    };
  };

  const handleSendMessage = async (textToSend?: string) => {
    const queryText = textToSend || input;
    if (!queryText.trim() || loading) return;

    const userMsg: AIStylistMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/ai/stylist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: queryText,
          lang,
          catalog: products
        })
      });

      const data = await response.json();

      let replyText = data.reply;
      let recIds = data.recommendedProductIds || [];

      // Smart fallback auto-answering if API gives empty or error string
      if (!replyText || replyText.includes('Unable to generate') || replyText.length < 5) {
        const smartRes = getSmartAnswer(queryText);
        replyText = smartRes.reply;
        recIds = smartRes.recIds;
      }

      const assistantMsg: AIStylistMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: replyText,
        recommendedProductIds: recIds,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);

      // Smart client auto-answer on network error
      const smartRes = getSmartAnswer(queryText);

      setMessages(prev => [
        ...prev,
        {
          id: `ai-offline-${Date.now()}`,
          sender: 'assistant',
          text: smartRes.reply,
          recommendedProductIds: smartRes.recIds,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-sm flex justify-end items-end p-2 sm:p-4">
      <div className="w-full max-w-lg bg-stone-50 rounded-3xl shadow-2xl h-[85vh] flex flex-col overflow-hidden border border-amber-500/30">
        
        {/* Header */}
        <div className="px-5 py-3.5 bg-rose-950 text-amber-50 flex items-center justify-between border-b border-amber-500/20">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-400 to-rose-500 p-0.5 flex items-center justify-center shadow-md">
              <Bot size={20} className="text-rose-950" />
            </div>
            <div>
              <h3 className="text-sm font-serif font-bold text-amber-100 flex items-center gap-1">
                <span>{lang === 'bn' ? 'রঙিলা রূপ AI স্টাইলিস্ট' : 'Rongila Rup AI Stylist'}</span>
                <Sparkles size={14} className="text-amber-400 animate-pulse" />
              </h3>
              <span className="text-[10px] text-amber-300/80">
                {lang === 'bn' ? 'অনলাইন ফ্যাশন অ্যাডভাইজর' : 'Online Fashion Advisor'}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-rose-900 text-amber-200 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Chat Message List */}
        <div className="p-4 overflow-y-auto flex-1 space-y-4 text-xs">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-3 shadow-sm ${
                  msg.sender === 'user'
                    ? 'bg-rose-950 text-amber-100 rounded-br-none'
                    : 'bg-white text-stone-800 border border-stone-200 rounded-bl-none space-y-2'
                }`}
              >
                <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>

                {/* Recommended Product Cards inside chat */}
                {msg.recommendedProductIds && msg.recommendedProductIds.length > 0 && (
                  <div className="pt-2 border-t border-stone-100 space-y-2">
                    <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
                      {lang === 'bn' ? 'সাজেস্টেড কালেকশন:' : 'Suggested Products:'}
                    </span>
                    <div className="grid grid-cols-1 gap-2">
                      {msg.recommendedProductIds.map(id => {
                        const matched = products.find(p => p.id === id);
                        if (!matched) return null;
                        return (
                          <div 
                            key={matched.id}
                            className="flex items-center gap-2.5 p-2 bg-amber-50/70 hover:bg-amber-100/80 rounded-xl border border-amber-200 transition-colors"
                          >
                            <img 
                              src={matched.image} 
                              alt={matched.nameEn} 
                              onClick={() => onQuickViewProduct(matched)}
                              className="w-12 h-14 object-cover rounded-lg shrink-0 cursor-pointer shadow-xs hover:opacity-90" 
                              referrerPolicy="no-referrer" 
                            />
                            <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onQuickViewProduct(matched)}>
                              <h5 className="font-serif font-bold text-[11.5px] text-stone-900 truncate">
                                {lang === 'bn' ? matched.nameBn : matched.nameEn}
                              </h5>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs font-extrabold text-rose-950">৳{matched.price.toLocaleString()}</span>
                                {matched.originalPrice && (
                                  <span className="text-[10px] text-stone-400 line-through">৳{matched.originalPrice.toLocaleString()}</span>
                                )}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => onQuickViewProduct(matched)}
                              className="px-2.5 py-1.5 bg-rose-950 hover:bg-rose-900 text-amber-300 rounded-lg font-bold text-[10px] flex items-center gap-1 shrink-0 shadow-xs cursor-pointer active:scale-95 transition-transform"
                            >
                              <span>অর্ডার করুন</span>
                              <ArrowRight size={11} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
              <span className="text-[9px] text-stone-400 mt-1 px-1">{msg.timestamp}</span>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-stone-500 text-xs italic p-2 bg-white rounded-2xl border border-stone-200 w-max">
              <Bot size={14} className="animate-spin text-amber-600" />
              <span>{lang === 'bn' ? 'স্টাইলিস্ট সাজেশন তৈরি করছে...' : 'AI Stylist is thinking...'}</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Preset Prompt Pills */}
        <div className="p-2.5 bg-amber-50/80 border-t border-stone-200 overflow-x-auto flex gap-2">
          {presetQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              className="px-2.5 py-1 rounded-full bg-white border border-amber-300 text-[11px] font-medium text-amber-950 hover:bg-amber-50 shrink-0 transition-colors cursor-pointer"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-stone-200 flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={lang === 'bn' ? 'স্টাইলিস্টকে যেকোনো প্রশ্ন জিজ্ঞেস করুন...' : 'Ask your style question...'}
            className="flex-1 px-3.5 py-2 bg-stone-100 border border-stone-200 rounded-full text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={loading || !input.trim()}
            className="p-2 rounded-full bg-rose-950 hover:bg-rose-900 text-amber-300 disabled:opacity-50 transition-colors cursor-pointer"
          >
            <Send size={16} />
          </button>
        </div>

      </div>
    </div>
  );
};
