import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Share2, MessageCircle, Send, QrCode } from 'lucide-react';
import QRCode from 'qrcode';
import { Product, Language } from '../types';

interface ShareProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  lang: Language;
}

export const ShareProductModal: React.FC<ShareProductModalProps> = ({
  isOpen,
  onClose,
  product,
  lang
}) => {
  const [copied, setCopied] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [showQr, setShowQr] = useState(false);

  useEffect(() => {
    if (product && isOpen) {
      const shareUrl = `${window.location.origin}${window.location.pathname}?product=${product.id}`;
      QRCode.toDataURL(shareUrl, {
        width: 220,
        margin: 1,
        color: {
          dark: '#1c1917',
          light: '#ffffff'
        }
      })
      .then(url => setQrCodeDataUrl(url))
      .catch(err => console.error('QR code error:', err));
    }
  }, [product, isOpen]);

  if (!isOpen || !product) return null;

  const productName = lang === 'bn' ? product.nameBn : product.nameEn;
  const shareUrl = `${window.location.origin}${window.location.pathname}?product=${product.id}`;
  const shareText = `রঙিলা রূপ কিডস - ${productName} (মূল্য: ৳${product.price.toLocaleString()})`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: productName,
          text: shareText,
          url: shareUrl
        });
      } catch {
        // User dismissed share sheet
      }
    } else {
      handleCopyLink();
    }
  };

  const shareLinks = [
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'bg-[#25D366] hover:bg-[#20bd5a] text-white',
      url: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`
    },
    {
      name: 'Facebook',
      icon: Share2,
      color: 'bg-[#1877F2] hover:bg-[#1464cc] text-white',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
    },
    {
      name: 'Messenger',
      icon: Send,
      color: 'bg-gradient-to-r from-[#00B2FF] to-[#006AFF] text-white hover:opacity-95',
      url: `https://www.facebook.com/dialog/send?link=${encodeURIComponent(shareUrl)}&app_id=291494419107518&redirect_uri=${encodeURIComponent(shareUrl)}`
    },
    {
      name: 'Telegram',
      icon: Send,
      color: 'bg-[#229ED9] hover:bg-[#1d8cc2] text-white',
      url: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`
    },
    {
      name: 'Twitter / X',
      icon: Share2,
      color: 'bg-black hover:bg-stone-800 text-white',
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`
    }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-stone-200 my-auto animate-scale-up">
        
        {/* Header */}
        <div className="px-5 py-3.5 bg-rose-950 text-amber-50 flex items-center justify-between border-b border-amber-500/20">
          <div className="flex items-center gap-2">
            <Share2 size={18} className="text-amber-400" />
            <h3 className="font-serif font-bold text-sm text-amber-100">
              {lang === 'bn' ? 'পণ্য শেয়ার করুন' : 'Share Product'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-rose-900 text-amber-200 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          {/* Product Mini Preview */}
          <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-2xl border border-stone-200">
            <img
              src={product.image}
              alt={productName}
              className="w-14 h-14 object-cover rounded-xl border border-stone-200 shrink-0"
              referrerPolicy="no-referrer"
            />
            <div className="min-w-0 flex-1">
              <h4 className="font-serif font-bold text-stone-900 text-xs truncate">
                {productName}
              </h4>
              <p className="font-bold text-rose-950 text-sm mt-0.5">
                ৳{product.price.toLocaleString()}
                {product.originalPrice && (
                  <span className="text-stone-400 line-through text-[11px] ml-1.5 font-normal">
                    ৳{product.originalPrice.toLocaleString()}
                  </span>
                )}
              </p>
              <span className="text-[10px] text-amber-900 font-medium">
                রঙিলা রূপ কিডস এক্সক্লুসিভ
              </span>
            </div>
          </div>

          {/* Social Share Buttons */}
          <div>
            <label className="block text-[11px] font-bold text-stone-600 mb-2">
              {lang === 'bn' ? 'সোশ্যাল মিডিয়ায় সরাসরি শেয়ার করুন:' : 'Share directly to social platforms:'}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {shareLinks.map((platform, idx) => (
                <a
                  key={idx}
                  href={platform.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-transform active:scale-95 cursor-pointer ${platform.color}`}
                >
                  <platform.icon size={15} />
                  <span>{platform.name}</span>
                </a>
              ))}

              {/* Native Share button for mobile browsers */}
              {typeof navigator !== 'undefined' && 'share' in navigator && (
                <button
                  onClick={handleNativeShare}
                  className="py-2.5 px-3 bg-rose-950 hover:bg-rose-900 text-amber-300 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-transform active:scale-95 cursor-pointer"
                >
                  <Share2 size={15} />
                  <span>অন্যান্য অ্যাপ</span>
                </button>
              )}
            </div>
          </div>

          {/* Copy Direct Link Section */}
          <div className="pt-2 border-t border-stone-100">
            <label className="block text-[11px] font-bold text-stone-600 mb-1.5">
              {lang === 'bn' ? 'সরাসরি প্রোডাক্ট লিংক কপি করুন:' : 'Copy Direct Product Link:'}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono text-stone-700 select-all focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
              <button
                onClick={handleCopyLink}
                className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  copied
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-stone-900 hover:bg-black text-white shadow-xs active:scale-95'
                }`}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                <span>{copied ? 'কপি হয়েছে!' : 'কপি করুন'}</span>
              </button>
            </div>
          </div>

          {/* Product Scannable QR Code */}
          <div className="pt-2 border-t border-stone-100">
            <button
              onClick={() => setShowQr(!showQr)}
              className="text-[11px] font-bold text-rose-950 hover:text-rose-800 flex items-center gap-1.5 cursor-pointer"
            >
              <QrCode size={14} className="text-amber-600" />
              <span>{showQr ? 'QR কোড লুকান' : 'মোবাইল থেকে স্ক্যান করার QR কোড দেখুন'}</span>
            </button>

            {showQr && qrCodeDataUrl && (
              <div className="mt-2.5 p-3 bg-stone-50 rounded-2xl border border-stone-200 flex flex-col items-center justify-center text-center space-y-1.5 animate-fade-in">
                <img src={qrCodeDataUrl} alt="Product QR" className="w-36 h-36 rounded-xl border border-stone-200 bg-white p-1" />
                <p className="text-[10px] text-stone-500 max-w-xs">
                  যেকোনো মোবাইলের ক্যামেরা দিয়ে এই QR কোড স্ক্যান করলে সরাসরি এই পণ্যের পেজ ওপেন হবে।
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
