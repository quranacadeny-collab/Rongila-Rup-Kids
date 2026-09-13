import React, { useState } from 'react';
import { MessageCircle, X, Send, Sparkles, Heart } from 'lucide-react';
import { Language } from '../types';

interface WhatsAppSupportWidgetProps {
  lang: Language;
}

export const WhatsAppSupportWidget: React.FC<WhatsAppSupportWidgetProps> = ({ lang }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customMsg, setCustomMsg] = useState('');

  const quickQuestions = [
    '👶 ২ বছরের বাচ্চার জন্য কোন সাইজ ভালো হবে?',
    '🚚 ডেলিভারি পেতে কতদিন সময় লাগবে?',
    '🎁 গিফট প্যাকিং ও কার্ড সুবিধা আছে কি?',
    '💳 ক্যাশ অন ডেলিভারিতে অর্ডার করতে চাই',
  ];

  const handleSendMessage = (text: string) => {
    const message = encodeURIComponent(text);
    window.open(`https://wa.me/8801792765693?text=${message}`, '_blank');
  };

  return (
    <div className="fixed bottom-20 right-4 sm:right-6 z-40 flex flex-col items-end">
      {/* Pop-up Mini Chat Card */}
      {isOpen && (
        <div className="mb-3 w-72 sm:w-80 bg-white rounded-3xl shadow-2xl border-2 border-emerald-300 overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 p-3.5 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-white text-emerald-700 flex items-center justify-center font-bold shadow-xs">
                  <MessageCircle size={18} />
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-white animate-pulse" />
              </div>
              <div>
                <h5 className="font-bold text-xs">রঙিলা রূপ WhatsApp 💬</h5>
                <span className="text-[10px] text-emerald-200">সরাসরি কথা বলুন: 01792765693</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* Body */}
          <div className="p-3.5 space-y-3 text-xs bg-emerald-50/20">
            <div className="bg-white border border-emerald-200 p-2.5 rounded-2xl rounded-tl-xs text-stone-800 text-[11px] leading-relaxed shadow-2xs">
              👋 আসসালামু আলাইকুম! রঙিলা রূপ কাস্টমার কেয়ারে স্বাগতম। বাচ্চার কাপড়, সাইজ বা ডেলিভারি নিয়ে সরাসরি WhatsApp-এ কথা বলতে ক্লিক করুন:
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">দ্রুত প্রশ্ন নির্বাচন করুন:</span>
              <div className="flex flex-col gap-1.5">
                {quickQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(q)}
                    className="p-2 bg-white hover:bg-emerald-50 text-stone-700 hover:text-emerald-900 text-left rounded-xl border border-stone-200 text-[10.5px] font-medium transition-colors shadow-2xs flex items-center justify-between cursor-pointer"
                  >
                    <span>{q}</span>
                    <Send size={11} className="text-emerald-600 shrink-0 ml-1" />
                  </button>
                ))}
              </div>
            </div>

            {/* Direct Open WhatsApp Button */}
            <button
              onClick={() => handleSendMessage('আসসালামু আলাইকুম! আমি রঙিলা রূপ ওয়েবসাইট থেকে যোগাযোগ করছি।')}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition-all"
            >
              <MessageCircle size={15} />
              <span>সরাসরি WhatsApp-এ চ্যাট করুন</span>
            </button>

            {/* Custom Input */}
            <div className="flex gap-1.5 pt-1 border-t border-stone-200">
              <input
                type="text"
                value={customMsg}
                onChange={(e) => setCustomMsg(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && customMsg.trim()) {
                    handleSendMessage(customMsg);
                    setCustomMsg('');
                  }
                }}
                placeholder="এখানে মেসেজ লিখে পাঠান..."
                className="flex-1 px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 text-stone-900"
              />
              <button
                onClick={() => {
                  if (customMsg.trim()) {
                    handleSendMessage(customMsg);
                    setCustomMsg('');
                  }
                }}
                className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl cursor-pointer"
                title="Send"
              >
                <Send size={14} />
              </button>
            </div>
          </div>

        </div>
      )}

      {/* Floating WhatsApp Toggle Button (Icon only without text, positioned directly above AI Stylist) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white rounded-full shadow-2xl flex items-center justify-center font-bold cursor-pointer border-2 border-white hover:scale-105 transition-all group relative"
        title="WhatsApp: 01792765693"
        aria-label="WhatsApp Support"
      >
        <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-300 border-2 border-white rounded-full animate-ping" />
        <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 border-2 border-white rounded-full" />
        <MessageCircle size={24} className="group-hover:scale-110 transition-transform" />
      </button>
    </div>
  );
};
