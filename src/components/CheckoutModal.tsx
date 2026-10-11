import React, { useState, useEffect } from 'react';
import { 
  X, 
  CheckCircle, 
  MapPin, 
  Phone, 
  User, 
  CreditCard, 
  Smartphone, 
  ShieldCheck, 
  Download,
  Copy,
  ShoppingBag,
  AlertTriangle,
  QrCode,
  Printer,
  Check,
  Truck,
  Building2,
  UploadCloud,
  Trash2,
  Image as ImageIcon,
  Receipt,
  Mail
} from 'lucide-react';
import QRCode from 'qrcode';
import { CartItem, Language, Order } from '../types';
import { BD_DISTRICTS } from '../data/districts';
import { printOrderInvoice, openOrderInvoiceInNewTab } from '../utils/printHelper';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  cartItems: CartItem[];
  discountAmount: number;
  shippingFee: number;
  onClearCart: () => void;
  onOrderPlaced?: (order: Order) => void;
  onUpdateQuantity?: (productId: string, delta: number) => void;
  onRemoveItem?: (productId: string) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  lang,
  cartItems,
  discountAmount,
  shippingFee: defaultShippingFee,
  onClearCart,
  onOrderPlaced,
  onUpdateQuantity,
  onRemoveItem
}) => {
  if (!isOpen) return null;

  // Local state for active items inside checkout
  const [orderItems, setOrderItems] = useState<CartItem[]>(cartItems);

  useEffect(() => {
    setOrderItems(cartItems);
  }, [cartItems]);

  const handleUpdateItemQty = (productId: string, delta: number) => {
    setOrderItems(prev =>
      prev
        .map(item => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
    if (onUpdateQuantity) {
      onUpdateQuantity(productId, delta);
    }
  };

  const handleRemoveCheckoutItem = (productId: string) => {
    setOrderItems(prev => prev.filter(item => item.product.id !== productId));
    if (onRemoveItem) {
      onRemoveItem(productId);
    }
  };

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [address, setAddress] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('dhaka');
  const [deliveryZone, setDeliveryZone] = useState<'inside_dhaka' | 'outside_dhaka'>('inside_dhaka');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bkash' | 'nagad' | 'rocket'>('cod');
  const [paymentType, setPaymentType] = useState<'full' | 'advance_delivery' | 'custom'>('full');
  const [customPaidAmount, setCustomPaidAmount] = useState('');
  const [paymentPhone, setPaymentPhone] = useState('');
  const [trxId, setTrxId] = useState('');
  const [paymentScreenshot, setPaymentScreenshot] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [copiedNumber, setCopiedNumber] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

  const STORE_BKASH_NUMBER = '01792765693';

  // Dynamic Shipping Fee based on Location: Inside Dhaka = ৳80, Outside Dhaka = ৳150
  const activeShippingFee = deliveryZone === 'inside_dhaka' ? 80 : 150;

  const subtotal = orderItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const totalAmount = Math.max(0, subtotal - discountAmount + activeShippingFee);

  // Real-time calculation of Amount Paid and COD Amount Due
  const calculatedAmountPaid = paymentMethod === 'cod'
    ? 0
    : paymentType === 'full'
      ? totalAmount
      : paymentType === 'advance_delivery'
        ? activeShippingFee
        : Math.min(totalAmount, Math.max(0, Number(customPaidAmount) || 0));

  const calculatedAmountDue = paymentMethod === 'cod'
    ? totalAmount
    : Math.max(0, totalAmount - calculatedAmountPaid);

  const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setValidationError(lang === 'bn' ? 'স্ক্রিনশটের সাইজ ৫ মেগাবাইট (5MB)-এর কম হতে হবে।' : 'Screenshot size must be under 5MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPaymentScreenshot(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // When district changes, automatically adjust delivery zone
  const handleDistrictChange = (districtId: string) => {
    setSelectedDistrict(districtId);
    if (districtId === 'dhaka') {
      setDeliveryZone('inside_dhaka');
    } else {
      setDeliveryZone('outside_dhaka');
    }
  };

  // Prefill customer details from localStorage if available
  useEffect(() => {
    try {
      const savedCustomer = localStorage.getItem('rr_customer');
      if (savedCustomer) {
        const parsed = JSON.parse(savedCustomer);
        if (parsed.name && !name) setName(parsed.name);
        if (parsed.phone && !phone) setPhone(parsed.phone);
        if (parsed.address && !address) setAddress(parsed.address);
        if (parsed.email && !customerEmail) setCustomerEmail(parsed.email);
      }
    } catch (e) {}
  }, []);

  // Generate real scannable QR Code when order is confirmed
  useEffect(() => {
    if (confirmedOrder) {
      // Must be a valid web URL so any smartphone camera or QR scanner immediately recognizes and opens it
      const baseOrigin = (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1')
        ? window.location.origin
        : 'https://rongila-rup.firebaseapp.com';
      const trackingUrl = `${baseOrigin}/?trackOrder=${encodeURIComponent(confirmedOrder.id)}`;
      
      QRCode.toDataURL(trackingUrl, {
        width: 250,
        margin: 1,
        errorCorrectionLevel: 'M',
        color: {
          dark: '#1c1917',
          light: '#ffffff'
        }
      })
      .then(url => setQrCodeDataUrl(url))
      .catch(err => console.error('QR code generation error:', err));
    }
  }, [confirmedOrder]);

  const copyStoreNumber = () => {
    navigator.clipboard.writeText(STORE_BKASH_NUMBER);
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2000);
  };

  // Bangladeshi Mobile Number Validation Helper (Supports 01... and +8801...)
  const isValidBdPhone = (p: string) => {
    const clean = p.replace(/[^0-9]/g, '');
    if (clean.length === 11 && /^01[3-9]\d{8}$/.test(clean)) return true;
    if (clean.length === 13 && clean.startsWith('8801') && /^8801[3-9]\d{8}$/.test(clean)) return true;
    return false;
  };

  // Detailed Address Validation Helper
  const isValidAddress = (addr: string) => {
    const trimmed = addr.trim();
    return trimmed.length >= 6;
  };

  // Strict bKash / Nagad / Rocket Transaction ID Validation Helper
  const validateTrxId = (trx: string): { valid: boolean; message: string } => {
    const clean = trx.trim().toUpperCase().replace(/\s+/g, '');
    if (!clean) {
      return { valid: false, message: 'Transaction ID দিন' };
    }
    if (clean.length < 8 || clean.length > 12) {
      return { valid: false, message: 'TrxID সাধারণত ৮ থেকে ১২ অক্ষরের হয় (যেমন: BL7A9X2M1K)' };
    }
    if (!/^[A-Z0-9]{8,12}$/.test(clean)) {
      return { valid: false, message: 'TrxID-তে কেবল ইংরেজি বর্ণ ও সংখ্যা গ্রহণযোগ্য' };
    }
    const hasLetter = /[A-Z]/.test(clean);
    const hasNumber = /[0-9]/.test(clean);
    if (!hasLetter || !hasNumber) {
      return { valid: false, message: 'সঠিক TrxID-তে অবশ্যই ইংরেজি অক্ষর ও সংখ্যা উভয়ই থাকে (শুধু সংখ্যা বা শুধু বর্ণ নয়)' };
    }
    if (/(.)\1{3,}/.test(clean)) {
      return { valid: false, message: 'একই অক্ষরের পুনরাবৃত্তি যুক্ত ভুয়া TrxID গ্রহণযোগ্য নয়' };
    }
    const fakes = [
      '12345678', '123456789', '1234567890', '00000000', '11111111',
      'XXXXXXXX', 'ABCDEFGH', 'TEST1234', 'TRXID1234', 'ASDFGHJK',
      'QWERTYUI', 'ZXCVBNM1', 'BKASH1234', 'NAGAD1234', 'ROCKET123'
    ];
    if (fakes.includes(clean)) {
      return { valid: false, message: 'ভুয়া বা ডামি TrxID গ্রহণযোগ্য নয়' };
    }
    return { valid: true, message: 'সঠিক TrxID ফরম্যাট' };
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // 1. Full Name Check
    if (!name || name.trim().length < 3) {
      const msg = lang === 'bn' 
        ? 'অনুগ্রহ করে আপনার সঠিক পূর্ণ নাম লিখুন (কমপক্ষে ৩ অক্ষর)।' 
        : 'Please enter a valid full name (at least 3 characters).';
      setValidationError(msg);
      return;
    }

    // 2. Mobile Number Check
    if (!isValidBdPhone(phone)) {
      const msg = lang === 'bn' 
        ? 'অনুগ্রহ করে ১১ ডিজিটের সঠিক সচল মোবাইল নম্বর দিন (যেমন: 01712345678 বা 01812345678)। ভুয়া নম্বর গ্রহণযোগ্য নয়।' 
        : 'Please enter a valid 11-digit Bangladeshi mobile number (e.g., 01712345678).';
      setValidationError(msg);
      return;
    }

    // 3. Address Check
    if (!isValidAddress(address)) {
      const msg = lang === 'bn' 
        ? 'অনুগ্রহ করে আপনার বিস্তারিত ডেলিভারি ঠিকানা লিখুন (বাসা/রোড নম্বর, এলাকা, থানা, জেলাসহ কমপক্ষে ১০ অক্ষর)।' 
        : 'Please enter a detailed delivery address (at least 10 characters with house/road/area).';
      setValidationError(msg);
      return;
    }

    // 4. Mobile Banking (bKash / Nagad / Rocket) Validation
    if (paymentMethod === 'bkash' || paymentMethod === 'nagad' || paymentMethod === 'rocket') {
      const senderNum = paymentPhone || phone;
      if (!isValidBdPhone(senderNum)) {
        const msg = lang === 'bn' 
          ? 'অনুগ্রহ করে পেমেন্ট করার সঠিক ১১ ডিজিটের বিকাশ/নগদ/রকেট সেন্ডার মোবাইল নম্বরটি দিন।' 
          : 'Please enter the valid 11-digit sender phone number used for payment.';
        setValidationError(msg);
        return;
      }

      const trxCheck = validateTrxId(trxId);
      if (!trxCheck.valid) {
        const msg = lang === 'bn' 
          ? `ভুল Transaction ID: ${trxCheck.message}। বিকাশ, নগদ বা রকেটের আসল TrxID ছাড়া অর্ডার সম্পন্ন করা সম্ভব নয়।` 
          : `Invalid Transaction ID: ${trxCheck.message}`;
        setValidationError(msg);
        return;
      }

      if (calculatedAmountPaid <= 0) {
        const msg = lang === 'bn'
          ? 'অনুগ্রহ করে পরিশোধিত টাকার পরিমাণ উল্লেখ করুন।'
          : 'Please enter a valid paid amount.';
        setValidationError(msg);
        return;
      }
    }

    if (orderItems.length === 0) {
      const msg = lang === 'bn' 
        ? 'আপনার ব্যাগে কোনো পণ্য নেই! অর্ডার করতে কমপক্ষে ১টি পণ্য নির্বাচন করুন।' 
        : 'Your cart is empty! Please select at least 1 item.';
      setValidationError(msg);
      return;
    }

    // Selected District Info
    const districtObj = BD_DISTRICTS.find(d => d.id === selectedDistrict) || BD_DISTRICTS[0];
    const districtDisplayName = lang === 'bn' ? districtObj.nameBn : districtObj.nameEn;
    const locationLabel = deliveryZone === 'inside_dhaka' 
      ? (lang === 'bn' ? 'ঢাকার ভেতরে (৳৮০)' : 'Inside Dhaka (৳80)')
      : (lang === 'bn' ? 'ঢাকার বাইরে (৳১৫০)' : 'Outside Dhaka (৳150)');

    // Payment Status Logic
    const isPaidOnline = paymentMethod === 'bkash' || paymentMethod === 'nagad' || paymentMethod === 'rocket';
    const paymentStatus: Order['paymentStatus'] = !isPaidOnline
      ? 'UNPAID'
      : (calculatedAmountDue === 0 ? 'PAID' : 'PENDING_VERIFICATION');

    const orderId = `RR-${Math.floor(100000 + Math.random() * 900000)}`;
    const newOrder: Order = {
      id: orderId,
      items: [...orderItems],
      totalAmount,
      shippingFee: activeShippingFee,
      discount: discountAmount,
      customerName: name.trim(),
      phone: phone.trim(),
      customerEmail: customerEmail.trim() || undefined,
      address: address.trim(),
      city: `${districtDisplayName} [${locationLabel}]`,
      paymentMethod,
      paymentStatus,
      amountPaid: calculatedAmountPaid,
      amountDue: calculatedAmountDue,
      paymentPhone: (paymentPhone || phone).trim(),
      paymentSenderPhone: (paymentPhone || phone).trim(),
      paymentReceiverNumber: STORE_BKASH_NUMBER,
      paymentScreenshot: paymentScreenshot || undefined,
      trxId: trxId.trim().toUpperCase(),
      status: 'processing',
      createdAt: new Date().toLocaleDateString('bn-BD', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    };

    setConfirmedOrder(newOrder);
    if (onOrderPlaced) {
      onOrderPlaced(newOrder);
    }
    onClearCart();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-stone-200 my-auto">
        
        {/* Header */}
        <div className="px-6 py-4 bg-rose-950 text-amber-50 flex items-center justify-between border-b border-amber-500/20">
          <h2 className="text-xl font-serif font-bold text-amber-100 flex items-center gap-2">
            <ShieldCheck className="text-amber-400" size={22} />
            <span>{lang === 'bn' ? 'অর্ডার সম্পন্ন করুন' : 'Complete Your Order'}</span>
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-rose-900 text-amber-200 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {!confirmedOrder ? (
          /* Order Form */
          <form onSubmit={handlePlaceOrder} className="p-6 space-y-6 max-h-[82vh] overflow-y-auto">
            
            {/* Validation Error Alert Box */}
            {validationError && (
              <div className="p-4 bg-rose-50 border-2 border-rose-500/30 rounded-2xl flex items-start gap-3 text-rose-900 animate-shake">
                <AlertTriangle size={20} className="text-rose-600 shrink-0 mt-0.5" />
                <div className="text-xs font-semibold leading-relaxed">
                  <p className="font-bold text-rose-950 mb-0.5">
                    {lang === 'bn' ? 'তথ্য সঠিক নয়!' : 'Invalid Information!'}
                  </p>
                  <p>{validationError}</p>
                </div>
              </div>
            )}

            {/* Delivery Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-serif font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5 border-b pb-2">
                <MapPin size={16} className="text-amber-600" />
                <span>{lang === 'bn' ? '১. ডেলিভারির তথ্য ও জেলা নির্বাচন' : '1. Delivery & District Info'}</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {lang === 'bn' ? 'আপনার পূর্ণ নাম *' : 'Full Name *'}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={lang === 'bn' ? 'যেমন: তানজিনা রহমান' : 'e.g. Tanjina Rahman'}
                      className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                    <User size={14} className="absolute left-3 top-3 text-stone-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {lang === 'bn' ? 'মোবাইল নম্বর *' : 'Mobile Number *'}
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="01792765693"
                      className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                    <Phone size={14} className="absolute left-3 top-3 text-stone-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center justify-between">
                    <span>{lang === 'bn' ? 'ইমেইল এড্রেস (ঐচ্ছিক)' : 'Email Address (Optional)'}</span>
                    <span className="text-[10px] text-amber-700 font-normal">{lang === 'bn' ? 'ইনভয়েস ও রসিদ পেতে' : 'For invoice & updates'}</span>
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="customer@gmail.com"
                      className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                    <Mail size={14} className="absolute left-3 top-3 text-stone-400" />
                  </div>
                </div>
              </div>

              {/* 64 DISTRICTS SELECTION */}
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  {lang === 'bn' ? 'আপনার জেলা নির্বাচন করুন (৬৪ জেলা) *' : 'Select Your District (64 Districts) *'}
                </label>
                <div className="relative">
                  <select
                    value={selectedDistrict}
                    onChange={(e) => handleDistrictChange(e.target.value)}
                    className="w-full px-3 py-2.5 bg-stone-50 border-2 border-amber-500/40 rounded-xl text-xs font-bold text-stone-900 focus:ring-2 focus:ring-amber-500 focus:outline-none cursor-pointer"
                  >
                    {BD_DISTRICTS.map((d) => (
                      <option key={d.id} value={d.id}>
                        {lang === 'bn' ? d.nameBn : d.nameEn}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* LOCATION DELIVERY CHARGE SELECTOR (ঢাকার ভেতরে ৳৬০ / ঢাকার বাইরে ৳১২০) */}
              <div className="space-y-1.5 pt-1">
                <label className="block text-xs font-bold text-stone-800">
                  {lang === 'bn' ? 'ডেলিভারি লোকেশন ও চার্জ নির্বাচন করুন *' : 'Select Delivery Location & Fee *'}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  
                  {/* Option 1: Inside Dhaka */}
                  <div
                    onClick={() => setDeliveryZone('inside_dhaka')}
                    className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                      deliveryZone === 'inside_dhaka'
                        ? 'border-amber-600 bg-amber-50/80 ring-2 ring-amber-500/20 shadow-sm'
                        : 'border-stone-200 bg-white hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${deliveryZone === 'inside_dhaka' ? 'bg-amber-500 text-rose-950' : 'bg-stone-100 text-stone-600'}`}>
                        <Building2 size={18} />
                      </div>
                      <div>
                        <div className="text-xs font-extrabold text-stone-900">
                          {lang === 'bn' ? '🏢 ঢাকার ভেতরে' : '🏢 Inside Dhaka'}
                        </div>
                        <div className="text-[11px] text-stone-500">
                          {lang === 'bn' ? '২৪-৪৮ ঘণ্টার মধ্যে ডেলিভারি' : 'Delivery in 24-48 Hours'}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-mono font-extrabold text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded-lg border border-amber-300">
                        ৳৮০
                      </span>
                    </div>
                  </div>

                  {/* Option 2: Outside Dhaka */}
                  <div
                    onClick={() => setDeliveryZone('outside_dhaka')}
                    className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                      deliveryZone === 'outside_dhaka'
                        ? 'border-rose-900 bg-rose-50/80 ring-2 ring-rose-900/20 shadow-sm'
                        : 'border-stone-200 bg-white hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${deliveryZone === 'outside_dhaka' ? 'bg-rose-900 text-white' : 'bg-stone-100 text-stone-600'}`}>
                        <Truck size={18} />
                      </div>
                      <div>
                        <div className="text-xs font-extrabold text-stone-900">
                          {lang === 'bn' ? '🚚 ঢাকার বাইরে (সারাদেশ)' : '🚚 Outside Dhaka'}
                        </div>
                        <div className="text-[11px] text-stone-500">
                          {lang === 'bn' ? '২-৩ দিনের মধ্যে হোম ডেলিভারি' : 'Delivery in 2-3 Days'}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-mono font-extrabold text-rose-900 bg-rose-200/80 px-2 py-0.5 rounded-lg border border-rose-300">
                        ৳১৫০
                      </span>
                    </div>
                  </div>

                </div>
              </div>

              {/* Full Address */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {lang === 'bn' ? 'পূর্ণাঙ্গ বিস্তারিত ঠিকানা (বাসা/রোড নম্বর, এলাকা, থানা) *' : 'Detailed Full Address (House/Road, Area, Thana) *'}
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder={lang === 'bn' ? 'যেমন: বাসা #১২, রোড #৪, সেক্টর #৭, উত্তরা, ঢাকা' : 'e.g. House #12, Road #4, Sector #7, Uttara'}
                  className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1">
                  {lang === 'bn' ? 'বিশেষ বার্তা বা নোট (অপশনাল)' : 'Special Delivery Notes (Optional)'}
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={lang === 'bn' ? 'যেমন: বিকেলে ডেলিভারি দিলে ভালো হয়' : 'e.g. Deliver preferably in afternoon'}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-700 focus:outline-none"
                />
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-3">
              <h3 className="text-sm font-serif font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5 border-b pb-2">
                <CreditCard size={16} className="text-amber-600" />
                <span>{lang === 'bn' ? '২. পেমেন্ট পদ্ধতি' : '2. Payment Method'}</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                    paymentMethod === 'cod'
                      ? 'border-rose-950 bg-rose-50 ring-2 ring-rose-950/20 shadow-xs'
                      : 'border-stone-200 hover:border-stone-300 bg-white'
                  }`}
                >
                  <ShieldCheck className="text-emerald-600" size={20} />
                  <div>
                    <div className="text-xs font-bold text-stone-900">{lang === 'bn' ? 'ক্যাশ অন ডেলিভারি' : 'Cash on Delivery'}</div>
                    <div className="text-[10px] text-stone-500">{lang === 'bn' ? 'পণ্য পেয়ে পেমেন্ট' : 'Pay on Receive'}</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('bkash')}
                  className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                    paymentMethod === 'bkash'
                      ? 'border-pink-600 bg-pink-50 ring-2 ring-pink-600/20 shadow-xs'
                      : 'border-stone-200 hover:border-stone-300 bg-white'
                  }`}
                >
                  <Smartphone className="text-pink-600" size={20} />
                  <div>
                    <div className="text-xs font-bold text-pink-700">bKash (বিকাশ)</div>
                    <div className="text-[10px] text-stone-500 font-mono">01792765693</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('nagad')}
                  className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                    paymentMethod === 'nagad'
                      ? 'border-orange-600 bg-orange-50 ring-2 ring-orange-600/20 shadow-xs'
                      : 'border-stone-200 hover:border-stone-300 bg-white'
                  }`}
                >
                  <Smartphone className="text-orange-600" size={20} />
                  <div>
                    <div className="text-xs font-bold text-orange-700">Nagad (নগদ)</div>
                    <div className="text-[10px] text-stone-500 font-mono">01792765693</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('rocket')}
                  className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                    paymentMethod === 'rocket'
                      ? 'border-purple-600 bg-purple-50 ring-2 ring-purple-600/20 shadow-xs'
                      : 'border-stone-200 hover:border-stone-300 bg-white'
                  }`}
                >
                  <Smartphone className="text-purple-600" size={20} />
                  <div>
                    <div className="text-xs font-bold text-purple-700">Rocket (রকেট)</div>
                    <div className="text-[10px] text-stone-500 font-mono">01792765693</div>
                  </div>
                </button>
              </div>

              {/* Mobile Banking (bKash / Nagad / Rocket) Step-by-Step Instructions, Payment Proof & Screenshot Upload */}
              {(paymentMethod === 'bkash' || paymentMethod === 'nagad' || paymentMethod === 'rocket') && (
                <div className="p-4 bg-gradient-to-br from-pink-50 via-amber-50 to-purple-50 border border-pink-200 rounded-2xl space-y-3.5 text-xs animate-fade-in">
                  <div className="flex items-center justify-between border-b border-pink-200/60 pb-2">
                    <span className="font-bold text-stone-900 flex items-center gap-1.5">
                      <Smartphone size={16} className={paymentMethod === 'bkash' ? 'text-pink-600' : paymentMethod === 'nagad' ? 'text-orange-600' : 'text-purple-600'} />
                      <span>{paymentMethod === 'bkash' ? 'বিকাশ সেন্ড মানি নির্দেশিকা:' : paymentMethod === 'nagad' ? 'নগদ সেন্ড মানি নির্দেশিকা:' : 'রকেট সেন্ড মানি নির্দেশিকা:'}</span>
                    </span>
                    <span className="text-[11px] font-bold text-rose-900 bg-white px-2 py-0.5 rounded-full border border-pink-200">
                      Send Money (Personal)
                    </span>
                  </div>

                  {/* Merchant Number Box */}
                  <div className="p-3 bg-white rounded-xl border border-pink-300 flex items-center justify-between shadow-xs">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-stone-500 font-bold block">
                        {paymentMethod === 'bkash' ? 'আমাদের bKash নম্বর' : paymentMethod === 'nagad' ? 'আমাদের Nagad নম্বর' : 'আমাদের Rocket নম্বর'}
                      </span>
                      <span className="text-base font-mono font-extrabold text-rose-950 tracking-wider">
                        {STORE_BKASH_NUMBER}
                      </span>
                      <span className="text-[10px] text-stone-500 block font-medium">
                        (রঙিলা রূপ কিডস - পার্সোনাল নম্বর)
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={copyStoreNumber}
                      className="px-3 py-1.5 bg-rose-950 hover:bg-rose-900 text-amber-200 font-bold rounded-lg flex items-center gap-1 transition-all cursor-pointer text-[11px]"
                    >
                      <Copy size={12} />
                      <span>{copiedNumber ? (lang === 'bn' ? 'কপি হয়েছে!' : 'Copied!') : (lang === 'bn' ? 'নম্বর কপি করুন' : 'Copy')}</span>
                    </button>
                  </div>

                  {/* Payment Amount Type Option */}
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-stone-800">
                      {lang === 'bn' ? 'টাকা প্রদানের ধরন নির্বাচন করুন:' : 'Select Payment Amount Type:'}
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentType('full')}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          paymentType === 'full'
                            ? 'border-pink-600 bg-white ring-2 ring-pink-600/30 text-rose-950 font-bold'
                            : 'border-stone-200 bg-white/70 text-stone-700'
                        }`}
                      >
                        <div className="text-[10px] text-stone-500">{lang === 'bn' ? 'সম্পূর্ণ মূল্য পরিশোধ' : 'Full Payment'}</div>
                        <div className="text-xs font-mono font-extrabold text-pink-700">৳{totalAmount.toLocaleString()}</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentType('advance_delivery')}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          paymentType === 'advance_delivery'
                            ? 'border-pink-600 bg-white ring-2 ring-pink-600/30 text-rose-950 font-bold'
                            : 'border-stone-200 bg-white/70 text-stone-700'
                        }`}
                      >
                        <div className="text-[10px] text-stone-500">{lang === 'bn' ? 'শুধু ডেলিভারি চার্জ' : 'Delivery Fee Only'}</div>
                        <div className="text-xs font-mono font-extrabold text-pink-700">৳{activeShippingFee.toLocaleString()}</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentType('custom')}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          paymentType === 'custom'
                            ? 'border-pink-600 bg-white ring-2 ring-pink-600/30 text-rose-950 font-bold'
                            : 'border-stone-200 bg-white/70 text-stone-700'
                        }`}
                      >
                        <div className="text-[10px] text-stone-500">{lang === 'bn' ? 'অন্য পরিমাণ (কাস্টম)' : 'Custom Amount'}</div>
                        <div className="text-xs font-mono font-extrabold text-pink-700">
                          {customPaidAmount ? `৳${customPaidAmount}` : (lang === 'bn' ? 'পরিমাণ লিখুন' : 'Enter Tk')}
                        </div>
                      </button>
                    </div>

                    {paymentType === 'custom' && (
                      <div className="mt-2">
                        <input
                          type="number"
                          value={customPaidAmount}
                          onChange={(e) => setCustomPaidAmount(e.target.value)}
                          placeholder="কত টাকা সেন্ড মানি করেছেন? যেমন: ৫০০"
                          min="1"
                          max={totalAmount}
                          className="w-full px-3 py-2 bg-white border border-pink-300 rounded-xl text-xs font-mono text-stone-900 focus:outline-none focus:ring-2 focus:ring-pink-500"
                        />
                      </div>
                    )}
                  </div>

                  {/* Customer TrxID and Sender Phone inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-pink-200">
                    <div>
                      <label className="block text-[11px] font-bold text-stone-800 mb-1">
                        {lang === 'bn' ? 'যে নম্বর থেকে টাকা পাঠিয়েছেন (Sender) *' : 'Sender Mobile Number *'}
                      </label>
                      <input
                        type="tel"
                        required
                        value={paymentPhone}
                        onChange={(e) => setPaymentPhone(e.target.value)}
                        placeholder="017xxxxxxxx"
                        className="w-full px-3 py-2 bg-white border border-pink-300 rounded-xl text-xs font-mono text-stone-900 focus:outline-none focus:ring-2 focus:ring-pink-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-stone-800 mb-1 flex items-center justify-between">
                        <span>{lang === 'bn' ? 'Transaction ID (TrxID) *' : 'Transaction ID (TrxID) *'}</span>
                        {trxId && (
                          <span className={`text-[10px] font-bold ${validateTrxId(trxId).valid ? 'text-emerald-700' : 'text-rose-700'}`}>
                            {validateTrxId(trxId).valid ? '✓ সঠিক ফরম্যাট' : '✕ ভুল ফরম্যাট'}
                          </span>
                        )}
                      </label>
                      <input
                        type="text"
                        required
                        value={trxId}
                        onChange={(e) => setTrxId(e.target.value.toUpperCase().replace(/\s+/g, ''))}
                        placeholder="যেমন: BL7A9X2M1K"
                        className={`w-full px-3 py-2 bg-white border rounded-xl text-xs font-mono font-bold text-stone-900 uppercase focus:outline-none focus:ring-2 ${
                          trxId 
                            ? (validateTrxId(trxId).valid ? 'border-emerald-500 focus:ring-emerald-500' : 'border-rose-500 focus:ring-rose-500')
                            : 'border-pink-300 focus:ring-pink-500'
                        }`}
                      />
                      {trxId && !validateTrxId(trxId).valid ? (
                        <p className="text-[10px] text-rose-700 font-medium mt-1">
                          ⚠️ {validateTrxId(trxId).message}
                        </p>
                      ) : (
                        <p className="text-[9px] text-stone-500 mt-1">
                          বিকাশ/নগদ অ্যাপের স্টেটমেন্ট বা SMS থেকে ৮-১২ অক্ষরের TrxID লিখুন
                        </p>
                      )}
                    </div>
                  </div>

                  {/* PAYMENT SCREENSHOT UPLOAD */}
                  <div className="pt-2 border-t border-pink-200">
                    <label className="block text-[11px] font-bold text-stone-800 mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <ImageIcon size={14} className="text-pink-600" />
                        <span>{lang === 'bn' ? 'পেমেন্ট স্ক্রিনশট আপলোড (পরামর্শযোগ্য)' : 'Payment Screenshot (Recommended)'}</span>
                      </span>
                      {paymentScreenshot && (
                        <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {lang === 'bn' ? '✓ যুক্ত হয়েছে' : '✓ Uploaded'}
                        </span>
                      )}
                    </label>

                    {paymentScreenshot ? (
                      <div className="p-2.5 bg-white rounded-xl border border-emerald-300 flex items-center justify-between gap-3 shadow-xs">
                        <div className="flex items-center gap-3">
                          <img
                            src={paymentScreenshot}
                            alt="Payment Proof"
                            className="w-14 h-14 object-cover rounded-lg border border-stone-200 shadow-2xs"
                          />
                          <div>
                            <span className="text-xs font-bold text-emerald-800 block">
                              {lang === 'bn' ? 'পেমেন্ট স্ক্রিনশট রেডি' : 'Payment Proof Ready'}
                            </span>
                            <span className="text-[10px] text-stone-500">
                              {lang === 'bn' ? 'অ্যাডমিন প্যানেলে এটি সরাসরি প্রদর্শিত হবে' : 'Visible directly in Admin Panel'}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setPaymentScreenshot('')}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="স্ক্রিনশট মুছুন"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ) : (
                      <label className="border-2 border-dashed border-pink-300 hover:border-pink-500 bg-white/60 hover:bg-white rounded-xl p-3 flex items-center justify-center gap-2 cursor-pointer transition-all">
                        <UploadCloud size={18} className="text-pink-600 shrink-0" />
                        <span className="text-stone-600 text-xs font-medium text-center">
                          {lang === 'bn' ? 'ক্লিক করে বিকাশ/নগদ পেমেন্টের স্ক্রিনশট দিন (সর্বোচ্চ ৫MB)' : 'Click to attach payment screenshot (Max 5MB)'}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleScreenshotUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>

                  {/* Payment Breakdown Pill */}
                  <div className="p-2.5 bg-white/80 rounded-xl border border-pink-200 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-stone-500 block">{lang === 'bn' ? 'পরিশোধ করছেন:' : 'Paid Online:'}</span>
                      <span className="font-bold text-pink-700 font-mono">৳{calculatedAmountPaid.toLocaleString()}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-stone-500 block">{lang === 'bn' ? 'ডেলিভারির সময় প্রদেয় বাকি (COD):' : 'Due on Delivery (COD):'}</span>
                      <span className={`font-bold font-mono ${calculatedAmountDue === 0 ? 'text-emerald-700' : 'text-rose-950'}`}>
                        {calculatedAmountDue === 0 ? (lang === 'bn' ? '৳০ (পরিশোধিত)' : '৳0 (Paid in Full)') : `৳${calculatedAmountDue.toLocaleString()}`}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Total Order Summary Box */}
            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
              <div className="pb-3 border-b border-stone-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-stone-600 uppercase tracking-wider block">
                    {lang === 'bn' ? 'অর্ডারের পণ্যসমূহ (প্রয়োজনে বাদ দিন বা সংখ্যা বাড়ান/কমান):' : 'Ordered Items (Edit quantity or remove):'}
                  </span>
                  <span className="text-[10px] text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full font-bold">
                    {orderItems.length} {lang === 'bn' ? 'টি আইটেম' : 'items'}
                  </span>
                </div>

                {orderItems.length === 0 ? (
                  <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-center text-xs text-rose-800 font-bold">
                    {lang === 'bn' ? 'আপনার ব্যাগে কোনো পণ্য নেই! অনুগ্রহ করে পণ্য নির্বাচন করুন।' : 'Your cart is empty! Please select a product.'}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {orderItems.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between gap-2 p-2 bg-white rounded-xl border border-stone-200 shadow-2xs">
                        <div className="flex items-center gap-2.5 min-w-0">
                          {item.product.images?.[0] && (
                            <img
                              src={item.product.images[0]}
                              alt={item.product.nameBn}
                              className="w-10 h-10 object-cover rounded-lg border border-stone-200 shrink-0"
                            />
                          )}
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-stone-900 block truncate max-w-[150px] sm:max-w-[220px]">
                              {lang === 'bn' ? item.product.nameBn : item.product.nameEn}
                            </span>
                            <div className="flex items-center gap-1 text-[10px] text-stone-500">
                              <span className="font-mono text-rose-900 font-bold">৳{item.product.price.toLocaleString()}</span>
                              {item.selectedSize && (
                                <span className="bg-stone-100 px-1.5 py-0.2 rounded font-bold text-stone-700">
                                  সাইজ: {item.selectedSize}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Quantity controls & Delete */}
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="flex items-center border border-stone-300 rounded-lg overflow-hidden bg-stone-50">
                            <button
                              type="button"
                              onClick={() => handleUpdateItemQty(item.product.id, -1)}
                              className="w-6 h-6 flex items-center justify-center text-stone-700 hover:bg-stone-200 text-xs font-bold cursor-pointer"
                              title="কমান"
                            >
                              -
                            </button>
                            <span className="px-2 text-xs font-mono font-bold text-stone-900">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleUpdateItemQty(item.product.id, 1)}
                              className="w-6 h-6 flex items-center justify-center text-stone-700 hover:bg-stone-200 text-xs font-bold cursor-pointer"
                              title="বাড়ান"
                            >
                              +
                            </button>
                          </div>

                          <span className="font-mono font-bold text-xs text-rose-950 w-16 text-right">
                            ৳{(item.product.price * item.quantity).toLocaleString()}
                          </span>

                          <button
                            type="button"
                            onClick={() => handleRemoveCheckoutItem(item.product.id)}
                            className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title={lang === 'bn' ? 'এই পণ্যটি অর্ডার থেকে বাদ দিন' : 'Remove this product'}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-between text-xs text-stone-600">
                <span>{lang === 'bn' ? 'মোট পণ্যের মূল্য:' : 'Subtotal:'}</span>
                <span className="font-bold">৳{subtotal.toLocaleString()}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-xs text-emerald-600 font-bold">
                  <span>{lang === 'bn' ? 'ডিসকাউন্ট:' : 'Discount:'}</span>
                  <span>-৳{discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-xs text-stone-700 font-medium">
                <span>{lang === 'bn' ? `ডেলিভারি চার্জ (${deliveryZone === 'inside_dhaka' ? 'ঢাকার ভেতরে' : 'ঢাকার বাইরে'}):` : `Shipping (${deliveryZone === 'inside_dhaka' ? 'Inside Dhaka' : 'Outside Dhaka'}):`}</span>
                <span className="font-bold font-mono text-stone-900">৳{activeShippingFee}</span>
              </div>
              <div className="flex justify-between text-base font-serif font-extrabold text-rose-950 pt-2 border-t border-stone-200">
                <span>{lang === 'bn' ? 'সর্বমোট প্রদেয়:' : 'Total Amount:'}</span>
                <span className="text-xl font-sans text-rose-900 font-bold">৳{totalAmount.toLocaleString()}</span>
              </div>

              {paymentMethod !== 'cod' && (
                <div className="pt-2 border-t border-dashed border-stone-300 space-y-1 text-xs">
                  <div className="flex justify-between text-pink-700 font-bold">
                    <span>{lang === 'bn' ? 'অগ্রিম পরিশোধিত:' : 'Paid Online:'}</span>
                    <span className="font-mono">৳{calculatedAmountPaid.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-stone-800 font-bold">
                    <span>{lang === 'bn' ? 'কুরিয়ারে প্রদেয় বাকি (COD Due):' : 'COD Amount Due:'}</span>
                    <span className={`font-mono text-sm ${calculatedAmountDue === 0 ? 'text-emerald-700 font-extrabold' : 'text-rose-900 font-extrabold'}`}>
                      {calculatedAmountDue === 0 ? (lang === 'bn' ? '৳০ (সম্পূর্ণ পরিশোধিত)' : '৳0 (Paid in Full)') : `৳${calculatedAmountDue.toLocaleString()}`}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* High-Converting Trust Badges (Eliminates Buying Anxiety & Reduces Fake Orders) */}
            <div className="p-3.5 bg-emerald-50/90 border border-emerald-200 rounded-2xl space-y-2 text-xs">
              <div className="flex items-center gap-2 text-emerald-950 font-bold">
                <ShieldCheck size={18} className="text-emerald-700 shrink-0" />
                <span>{lang === 'bn' ? 'রঙিলা রূপ কিডস - গ্রাহক সুরক্ষা ও বিশ্বাস:' : 'Customer Protection Guarantees:'}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-emerald-900 font-medium">
                <div className="flex items-center gap-1.5">
                  <Check size={14} className="text-emerald-600 shrink-0" />
                  <span>{lang === 'bn' ? 'ডেলিভারিম্যানের সামনে কাপড় চেক করে নেওয়ার সুযোগ' : 'Check parcel in front of delivery agent'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check size={14} className="text-emerald-600 shrink-0" />
                  <span>{lang === 'bn' ? 'অর্ডার পাঠানোর আগে ফোনে কথা বলে সাইজ নিশ্চিত করা হবে' : 'Size confirmed via phone call before dispatch'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check size={14} className="text-emerald-600 shrink-0" />
                  <span>{lang === 'bn' ? 'সাইজ সমস্যা হলে ৭ দিনের মধ্যে সহজ পরিবর্তন' : '7-day easy size exchange guarantee'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check size={14} className="text-emerald-600 shrink-0" />
                  <span>{lang === 'bn' ? '১০০% প্রিমিয়াম সুতি ও বেবি-স্কিন সেফ ফেব্রিক' : '100% skin-safe organic baby fabric'}</span>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 text-rose-950 font-extrabold text-base shadow-xl hover:from-amber-400 hover:to-amber-300 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98"
            >
              <ShoppingBag size={18} />
              <span>{lang === 'bn' ? 'অর্ডার নিশ্চিত করুন (ক্যাশ অন ডেলিভারি)' : 'Confirm Order Now (Cash on Delivery)'}</span>
            </button>
          </form>
        ) : (
          /* Confirmation Receipt Modal View */
          <div className="p-6 md:p-8 text-center space-y-6 max-h-[85vh] overflow-y-auto">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-lg animate-bounce">
              <CheckCircle size={36} />
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl font-serif font-extrabold text-rose-950">
                {lang === 'bn' ? 'অভিনন্দন! আপনার অর্ডারটি সফলভাবে গৃহীত হয়েছে' : 'Congratulations! Your Order is Placed'}
              </h3>
              <p className="text-xs text-stone-500 font-medium">
                {lang === 'bn' ? 'রঙিলা রূপ থেকে কেনাকাটার জন্য আপনাকে অশেষ ধন্যবাদ' : 'Thank you for shopping with Rongila Rup'}
              </p>
            </div>

            {/* Payment Status Banner */}
            {confirmedOrder.amountDue === 0 ? (
              <div className="p-4 bg-emerald-500 text-white rounded-2xl shadow-md space-y-1 border-2 border-emerald-400">
                <div className="flex items-center justify-center gap-2 font-bold text-sm uppercase tracking-wide">
                  <ShieldCheck size={20} />
                  <span>{lang === 'bn' ? 'সম্পূর্ণ পরিশোধিত (PAID IN FULL)' : 'PAID IN FULL (৳0 DUE)'}</span>
                </div>
                <p className="text-xs font-semibold text-emerald-100">
                  {lang === 'bn' 
                    ? `✅ আপনি সম্পূর্ণ মূল্য বিকাশ/নগদে পরিশোধ করেছেন (৳${(confirmedOrder.amountPaid || confirmedOrder.totalAmount).toLocaleString()})। ডেলিভারির সময় আপনাকে আর কোনো টাকা দিতে হবে না (প্রদেয়: ৳০)।` 
                    : '✅ Full payment received online. You do NOT need to pay anything to the delivery driver (Amount Due: ৳0).'}
                </p>
              </div>
            ) : confirmedOrder.paymentMethod !== 'cod' ? (
              <div className="p-4 bg-gradient-to-r from-amber-500 to-pink-500 text-white rounded-2xl shadow-md space-y-1">
                <div className="flex items-center justify-center gap-2 font-bold text-sm uppercase tracking-wide">
                  <Smartphone size={20} />
                  <span>{lang === 'bn' ? 'অগ্রিম পরিশোধিত (বাকি ক্যাশ অন ডেলিভারি)' : 'PARTIALLY PAID'}</span>
                </div>
                <p className="text-xs font-semibold text-white/95">
                  {lang === 'bn'
                    ? `অগ্রিম পরিশোধিত: ৳${(confirmedOrder.amountPaid || 0).toLocaleString()} | ডেলিভারির সময় প্রদেয় বাকি: ৳${confirmedOrder.amountDue.toLocaleString()}`
                    : `Paid Advance: ৳${(confirmedOrder.amountPaid || 0).toLocaleString()} | Due on Delivery: ৳${confirmedOrder.amountDue.toLocaleString()}`}
                </p>
              </div>
            ) : (
              <div className="p-4 bg-amber-500 text-rose-950 rounded-2xl shadow-md space-y-1 border-2 border-amber-400">
                <div className="flex items-center justify-center gap-2 font-extrabold text-sm uppercase tracking-wide">
                  <Smartphone size={20} />
                  <span>{lang === 'bn' ? 'ক্যাশ অন ডেলিভারি (Cash on Delivery)' : 'CASH ON DELIVERY'}</span>
                </div>
                <p className="text-xs font-bold text-rose-950">
                  {lang === 'bn'
                    ? `📦 পণ্য হাতে পাওয়ার পর ডেলিভারিম্যানকে প্রদেয়: ৳${confirmedOrder.totalAmount.toLocaleString()}`
                    : `📦 Amount to pay delivery driver upon arrival: ৳${confirmedOrder.totalAmount.toLocaleString()}`}
                </p>
              </div>
            )}

            {/* Order Invoice Details & Scannable QR Code */}
            <div id="printable-area" className="p-5 bg-stone-50 rounded-2xl border border-stone-200 text-left space-y-4 max-w-md mx-auto relative overflow-hidden">
              <div className="flex justify-between items-start border-b border-stone-200 pb-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">
                    {lang === 'bn' ? 'অর্ডার ট্র্যাকিং আইডি' : 'ORDER TRACKING ID'}
                  </span>
                  <span className="text-lg font-mono font-black text-rose-950">{confirmedOrder.id}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">
                    {lang === 'bn' ? 'তারিখ' : 'DATE'}
                  </span>
                  <span className="text-xs font-bold text-stone-700">{confirmedOrder.createdAt}</span>
                </div>
              </div>

              <div className="text-xs space-y-1.5 text-stone-800 font-medium">
                <p><strong className="text-stone-900">{lang === 'bn' ? 'গ্রাহকের নাম:' : 'Customer:'}</strong> {confirmedOrder.customerName}</p>
                <p><strong className="text-stone-900">{lang === 'bn' ? 'মোবাইল নম্বর:' : 'Phone:'}</strong> {confirmedOrder.phone}</p>
                <p><strong className="text-stone-900">{lang === 'bn' ? 'ডেলিভারি ঠিকানা:' : 'Address:'}</strong> {confirmedOrder.address}, {confirmedOrder.city}</p>
                <p><strong className="text-stone-900">{lang === 'bn' ? 'পেমেন্ট মেথড:' : 'Payment:'}</strong> <span className="uppercase font-bold">{confirmedOrder.paymentMethod}</span></p>
                
                {confirmedOrder.trxId && (
                  <p><strong className="text-stone-900">{lang === 'bn' ? 'Transaction ID (TrxID):' : 'TrxID:'}</strong> <span className="font-mono font-bold text-pink-700 bg-pink-50 px-1.5 py-0.5 rounded border border-pink-200">{confirmedOrder.trxId}</span></p>
                )}
                {confirmedOrder.paymentSenderPhone && (
                  <p><strong className="text-stone-900">{lang === 'bn' ? 'প্রেরক নম্বর:' : 'Sender Phone:'}</strong> <span className="font-mono">{confirmedOrder.paymentSenderPhone}</span></p>
                )}
                {confirmedOrder.paymentReceiverNumber && (
                  <p><strong className="text-stone-900">{lang === 'bn' ? 'দোকানের নম্বর:' : 'Received At:'}</strong> <span className="font-mono font-bold text-stone-700">{confirmedOrder.paymentReceiverNumber}</span></p>
                )}
                
                <div className="pt-2 border-t border-stone-200 grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-white p-2 rounded-lg border border-stone-200">
                    <span className="text-[10px] text-stone-500 block">{lang === 'bn' ? 'পরিশোধিত টাকা' : 'Amount Paid'}</span>
                    <span className="font-mono font-bold text-emerald-700 text-sm">৳{(confirmedOrder.amountPaid ?? (confirmedOrder.amountDue === 0 ? confirmedOrder.totalAmount : 0)).toLocaleString()}</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-stone-200">
                    <span className="text-[10px] text-stone-500 block">{lang === 'bn' ? 'কুরিয়ারে প্রদেয় বাকি' : 'COD Due'}</span>
                    <span className={`font-mono font-bold text-sm ${confirmedOrder.amountDue === 0 ? 'text-emerald-700' : 'text-rose-950'}`}>
                      {confirmedOrder.amountDue === 0 ? '৳০ (পরিশোধিত)' : `৳${confirmedOrder.amountDue.toLocaleString()}`}
                    </span>
                  </div>
                </div>

                {confirmedOrder.paymentScreenshot && (
                  <div className="pt-2">
                    <span className="text-[10px] font-bold text-stone-500 block mb-1">
                      {lang === 'bn' ? 'পেমেন্ট স্ক্রিনশট প্রুফ:' : 'Payment Screenshot Proof:'}
                    </span>
                    <img
                      src={confirmedOrder.paymentScreenshot}
                      alt="Payment Receipt"
                      className="w-full max-h-40 object-contain rounded-xl border border-stone-300 bg-white p-1"
                    />
                  </div>
                )}
              </div>

              {/* Real Scannable QR Code Box */}
              <div className="pt-3 border-t border-stone-200 flex items-center justify-between bg-white p-3 rounded-xl border border-stone-300">
                <div className="space-y-0.5 max-w-[220px]">
                  <p className="text-xs font-bold text-rose-950 flex items-center gap-1">
                    <QrCode size={14} className="text-amber-600" />
                    <span>{lang === 'bn' ? 'স্ক্যান করতে QR কোড' : 'Scannable QR Verification'}</span>
                  </p>
                  <p className="text-[10px] text-stone-500 leading-tight">
                    {lang === 'bn' 
                      ? 'যেকোনো মোবাইল ক্যামেরা দিয়ে এই QR কোড স্ক্যান করলে সরাসরি অরিজিনাল অর্ডার ভেরিফিকেশন দেখতে পাবেন।' 
                      : 'Scan with any phone camera to verify real order status.'}
                  </p>
                </div>
                {qrCodeDataUrl ? (
                  <img 
                    src={qrCodeDataUrl} 
                    alt={`QR Code for ${confirmedOrder.id}`} 
                    width={72}
                    height={72}
                    style={{ width: '72px', height: '72px', maxWidth: '72px', maxHeight: '72px', objectFit: 'contain' }}
                    className="w-20 h-20 border border-stone-300 rounded-lg p-1 bg-white shadow-xs shrink-0 block" 
                  />
                ) : (
                  <div className="w-20 h-20 bg-stone-100 rounded-lg flex items-center justify-center text-[10px] text-stone-400">
                    Generating...
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-center gap-3 print:hidden no-print">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(confirmedOrder.id);
                  alert(lang === 'bn' ? 'অর্ডার আইডি কপি করা হয়েছে!' : 'Order ID copied!');
                }}
                className="px-4 py-2.5 rounded-xl bg-stone-100 text-stone-800 text-xs font-bold flex items-center gap-1.5 hover:bg-stone-200 transition-colors cursor-pointer print:hidden no-print"
              >
                <Copy size={14} />
                <span>{lang === 'bn' ? 'আইডি কপি করুন' : 'Copy Order ID'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (confirmedOrder) {
                    printOrderInvoice(confirmedOrder, qrCodeDataUrl, '01792765693');
                  }
                }}
                className="px-4 py-2.5 rounded-xl bg-amber-500 text-rose-950 text-xs font-bold flex items-center gap-1.5 hover:bg-amber-400 transition-colors cursor-pointer print:hidden no-print shadow-xs"
                title="সরাসরি কম্পিউটারে পরিষ্কার প্রিন্ট ডায়ালগ খুলুন (কখনও ব্ল্যাঙ্ক হবে না)"
              >
                <Printer size={14} />
                <span>{lang === 'bn' ? 'ইনভয়েস প্রিন্ট' : 'Print Invoice'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (confirmedOrder) {
                    openOrderInvoiceInNewTab(confirmedOrder, qrCodeDataUrl, '01792765693');
                  }
                }}
                className="px-3 py-2.5 rounded-xl bg-stone-200 text-stone-800 text-xs font-bold flex items-center gap-1.5 hover:bg-stone-300 transition-colors cursor-pointer print:hidden no-print"
                title="নতুন ট্যাবে সম্পূর্ণ পেজে ইনভয়েস দেখুন"
              >
                <Receipt size={14} />
                <span>{lang === 'bn' ? 'নতুন ট্যাবে' : 'New Tab'}</span>
              </button>

              <button
                onClick={() => {
                  setConfirmedOrder(null);
                  onClose();
                }}
                className="px-6 py-2.5 rounded-xl bg-rose-950 text-amber-200 text-xs font-bold hover:bg-rose-900 transition-colors cursor-pointer print:hidden no-print"
              >
                {lang === 'bn' ? 'বন্ধ করুন' : 'Close'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

