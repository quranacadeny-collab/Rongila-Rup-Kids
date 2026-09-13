import React, { useState, useEffect } from 'react';
import { X, Search, Truck, CheckCircle2, Clock, MapPin, PhoneCall, AlertCircle, AlertTriangle, RefreshCw, PackageCheck } from 'lucide-react';
import { Language, Order } from '../types';
import { db, COLLECTIONS } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

interface TrackOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  orders?: Order[];
  initialOrderId?: string | null;
  onUpdateOrderStatus?: (orderId: string, status: Order['status']) => void;
}

export const TrackOrderModal: React.FC<TrackOrderModalProps> = ({
  isOpen,
  onClose,
  lang,
  orders = [],
  initialOrderId = null,
  onUpdateOrderStatus
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [foundOrder, setFoundOrder] = useState<Order | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isConfirmingDelivery, setIsConfirmingDelivery] = useState(false);
  const [deliveryConfirmedSuccess, setDeliveryConfirmedSuccess] = useState(false);

  const handleCustomerConfirmDelivered = async (orderId: string) => {
    if (!orderId || isConfirmingDelivery) return;
    setIsConfirmingDelivery(true);
    try {
      if (onUpdateOrderStatus) {
        onUpdateOrderStatus(orderId, 'delivered');
      }

      setFoundOrder(prev => prev ? {
        ...prev,
        status: 'delivered',
        paymentStatus: 'VERIFIED_PAID',
        courierStatus: 'Delivered'
      } : null);

      setDeliveryConfirmedSuccess(true);

      // Direct Firestore sync
      try {
        await updateDoc(doc(db, COLLECTIONS.ORDERS, orderId), {
          status: 'delivered',
          paymentStatus: 'VERIFIED_PAID',
          courierStatus: 'Delivered'
        });
      } catch (e) {}

      // Server PATCH sync
      try {
        await fetch(`/api/orders/${orderId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'delivered',
            paymentStatus: 'VERIFIED_PAID',
            courierStatus: 'Delivered'
          })
        });
      } catch (e) {}
    } catch (err) {
      console.error('Confirm delivery error:', err);
    } finally {
      setIsConfirmingDelivery(false);
    }
  };

  const executeTrackSearch = (targetQuery: string) => {
    const rawQuery = (targetQuery || '').trim();
    if (!rawQuery) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setHasSearched(true);

    try {
      const cleanQ = rawQuery.toLowerCase().replace(/^#/, '');
      const cleanDigits = rawQuery.replace(/[^\d]/g, '');

      // 1. Gather all local state & localStorage orders safely
      let localOrders: Order[] = [];
      try {
        const stored = localStorage.getItem('rr_orders');
        if (stored) localOrders = JSON.parse(stored);
      } catch (err) {
        console.error('LocalStorage parse error in tracker:', err);
      }

      const combinedPool = [...(orders || []), ...localOrders];

      // Match by order ID, ID suffix, or phone number
      const match = combinedPool.find(o => {
        if (!o) return false;
        const oId = String(o.id || '').toLowerCase().replace(/^#/, '');
        if (oId === cleanQ || oId.endsWith(cleanQ)) return true;

        const oPhone = String(o.phone || '').replace(/[^\d]/g, '');
        if (cleanDigits && cleanDigits.length >= 4 && oPhone.endsWith(cleanDigits)) return true;

        return false;
      });

      if (match) {
        setFoundOrder(match);
        setLoading(false);
        return;
      }

      // 2. Query backend API with timeout, then fallback to Firestore
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      fetch('/api/orders/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: rawQuery }),
        signal: controller.signal
      })
      .then(res => res.json())
      .then(async data => {
        clearTimeout(timeoutId);
        if (data && !data.error && (data.found || data.order)) {
          setFoundOrder(data.order || data);
          setLoading(false);
        } else {
          // Direct Firestore fallback for QR scans
          try {
            const docSnap = await getDoc(doc(db, COLLECTIONS.ORDERS, rawQuery));
            if (docSnap.exists()) {
              setFoundOrder({ id: docSnap.id, ...docSnap.data() } as Order);
            } else {
              setFoundOrder(null);
            }
          } catch (e) {
            setFoundOrder(null);
          }
          setLoading(false);
        }
      })
      .catch(async () => {
        // Direct Firestore fallback on fetch error
        try {
          const docSnap = await getDoc(doc(db, COLLECTIONS.ORDERS, rawQuery));
          if (docSnap.exists()) {
            setFoundOrder({ id: docSnap.id, ...docSnap.data() } as Order);
          } else {
            setFoundOrder(null);
          }
        } catch (e) {
          setFoundOrder(null);
        }
        setLoading(false);
      });
    } catch (err) {
      console.error('Track error:', err);
      setFoundOrder(null);
      setLoading(false);
    }
  };

  // When modal opens or initialOrderId changes, populate and track automatically
  useEffect(() => {
    if (isOpen) {
      const lastId = initialOrderId || localStorage.getItem('rr_last_order_id');
      if (lastId) {
        setSearchQuery(lastId);
        executeTrackSearch(lastId);
      } else if (searchQuery) {
        executeTrackSearch(searchQuery);
      } else {
        setLoading(false);
        setHasSearched(false);
        setFoundOrder(null);
      }
    }
  }, [isOpen, initialOrderId]);

  if (!isOpen) return null;

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    executeTrackSearch(searchQuery);
  };

  const getStatusInfo = (status: Order['status']) => {
    switch (status) {
      case 'processing':
        return {
          titleBn: 'অর্ডার পেন্ডিং / পর্যালোচনায় আছে',
          titleEn: 'Order Received & Pending Review',
          color: 'bg-amber-100 text-amber-900 border-amber-300',
          courierTextBn: 'এডমিন ভেরিফিকেশনের পর কুরিয়ারে পাঠানো হবে',
          steps: [
            { labelBn: '১. অর্ডার সাবমিটেড', labelEn: '1. Order Submitted', done: true },
            { labelBn: '২. ফোন ভেরিফিকেশন ও কুরিয়ার বুকিং', labelEn: '2. Verification & Courier Entry', done: false, active: true },
            { labelBn: '৩. কুরিয়ারে পার্সেল প্রসেসিং', labelEn: '3. Courier Parcel Transit', done: false },
            { labelBn: '৪. গ্রাহকে ডেলিভারি সম্পন্ন', labelEn: '4. Delivered to Customer', done: false }
          ]
        };
      case 'confirmed':
        return {
          titleBn: 'অর্ডার কনফার্মড! প্রোডাক্ট প্যাকিং চলছে',
          titleEn: 'Order Confirmed! Packing in progress',
          color: 'bg-blue-100 text-blue-900 border-blue-300',
          courierTextBn: 'প্যাকেজিং শেষ করে কুরিয়ারে হস্তান্তর করা হচ্ছে',
          steps: [
            { labelBn: '১. অর্ডার সাবমিটেড', labelEn: '1. Order Submitted', done: true },
            { labelBn: '২. অর্ডার কনফার্মড ও প্যাকেজিং', labelEn: '2. Confirmed & Packaging', done: true },
            { labelBn: '৩. কুরিয়ারে হস্তান্তর', labelEn: '3. Handed to Courier', done: false, active: true },
            { labelBn: '৪. গ্রাহকে ডেলিভারি সম্পন্ন', labelEn: '4. Delivered to Customer', done: false }
          ]
        };
      case 'shipped':
      case 'out_for_delivery':
        return {
          titleBn: 'পার্সেল কুরিয়ারে ডেলিভারির জন্য বের হয়েছে 🚚',
          titleEn: 'Parcel Out for Delivery with Courier',
          color: 'bg-emerald-100 text-emerald-900 border-emerald-300',
          courierTextBn: 'আজ বা আগামী ২৪ ঘণ্টার মধ্যে ডেলিভারিম্যান আপনার সাথে যোগাযোগ করবেন',
          steps: [
            { labelBn: '১. অর্ডার সাবমিটেড', labelEn: '1. Order Submitted', done: true },
            { labelBn: '২. অর্ডার কনফার্মড ও প্যাকেজিং', labelEn: '2. Confirmed & Packaging', done: true },
            { labelBn: '৩. কুরিয়ারে ডেলিভারির জন্য রওনা', labelEn: '3. Courier Delivery Transit', done: true },
            { labelBn: '৪. পণ্য গ্রহণ ও ক্যাশ কালেকশন', labelEn: '4. Parcel Delivery & Collection', done: false, active: true }
          ]
        };
      case 'delivered':
        return {
          titleBn: 'পণ্য সফলভাবে ডেলিভারি সম্পন্ন হয়েছে ✅',
          titleEn: 'Parcel Successfully Delivered',
          color: 'bg-emerald-200 text-emerald-950 border-emerald-400',
          courierTextBn: 'গ্রাহক পণ্য বুঝে পেয়েছেন এবং অর্থ পরিশোধ করেছেন',
          steps: [
            { labelBn: '১. অর্ডার সাবমিটেড', labelEn: '1. Order Submitted', done: true },
            { labelBn: '২. অর্ডার কনফার্মড ও প্যাকেজিং', labelEn: '2. Confirmed & Packaging', done: true },
            { labelBn: '৩. কুরিয়ারে ডেলিভারির জন্য রওনা', labelEn: '3. Courier Delivery Transit', done: true },
            { labelBn: '৪. পণ্য গ্রহণ সম্পন্ন', labelEn: '4. Parcel Delivered', done: true }
          ]
        };
      case 'cancelled':
        return {
          titleBn: 'অর্ডারটি বাতিল করা হয়েছে ❌',
          titleEn: 'Order Cancelled',
          color: 'bg-red-100 text-red-900 border-red-300',
          courierTextBn: 'কাস্টমার বা সিস্টেমের অনুরোধে অর্ডারটি বাতিল করা হয়েছে',
          steps: [
            { labelBn: '১. অর্ডার সাবমিটেড', labelEn: '1. Order Submitted', done: true },
            { labelBn: '২. স্ট্যাটাস: বাতিল', labelEn: '2. Status: Cancelled', done: false }
          ]
        };
      default:
        return {
          titleBn: 'অর্ডার প্রসেসিংয়ে রয়েছে',
          titleEn: 'Order in Processing',
          color: 'bg-stone-100 text-stone-900 border-stone-300',
          courierTextBn: 'আপনার অর্ডারের নতুন তথ্যের জন্য অপেক্ষা করুন',
          steps: [
            { labelBn: '১. অর্ডার প্রাপ্তি', labelEn: '1. Order Placed', done: true },
            { labelBn: '২. যাচাইকরণ', labelEn: '2. Verification', done: false }
          ]
        };
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="relative w-full max-w-lg bg-stone-50 rounded-3xl shadow-2xl overflow-hidden border border-amber-500/20 my-auto">
        
        {/* Header */}
        <div className="px-6 py-4 bg-rose-950 text-amber-50 flex items-center justify-between border-b border-amber-500/20">
          <div className="flex items-center gap-2">
            <Truck className="text-amber-400" size={22} />
            <h3 className="text-base font-serif font-bold text-amber-100">
              {lang === 'bn' ? 'সঠিক অর্ডার ট্র্যাকিং সিস্টেম' : 'Live Order Tracking System'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-rose-900 text-amber-200 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6 text-xs">
          {/* Search Bar */}
          <form onSubmit={handleTrack} className="space-y-2">
            <label className="block text-xs font-bold text-stone-700">
              {lang === 'bn' ? 'আপনার অর্ডার আইডি বা ফোন নম্বর দিয়ে ট্র্যাকিং করুন:' : 'Search by Order ID or Mobile Phone Number:'}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g. RR-894212 or 01712345678"
                required
                className="flex-1 px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-xs font-mono font-bold text-stone-900 uppercase focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 bg-rose-950 hover:bg-rose-900 text-amber-300 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Search size={14} />
                <span>{loading ? 'খোঁজা হচ্ছে...' : (lang === 'bn' ? 'খুঁজুন' : 'Search')}</span>
              </button>
            </div>

            {/* Quick-track chips for recent orders */}
            {orders && orders.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <span className="text-[10px] text-stone-500 font-bold">সাম্প্রতিক অর্ডার:</span>
                {orders.slice(0, 3).map((ord) => (
                  <button
                    key={ord.id}
                    type="button"
                    onClick={() => {
                      setSearchQuery(ord.id);
                      executeTrackSearch(ord.id);
                    }}
                    className="px-2 py-0.5 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-950 font-mono font-bold text-[10px] rounded-lg transition-colors cursor-pointer"
                  >
                    #{ord.id}
                  </button>
                ))}
              </div>
            )}
          </form>

          {/* Result State */}
          {foundOrder ? (
            (() => {
              const info = getStatusInfo(foundOrder.status);
              return (
                <div className="p-4 bg-white rounded-2xl border border-stone-200 space-y-4 shadow-sm animate-fade-in">
                  <div className="flex justify-between items-start border-b border-stone-100 pb-3 gap-2">
                    <div>
                      <span className="text-[10px] text-stone-500 font-mono font-bold block">
                        অর্ডার নং: <strong className="text-rose-950">#{foundOrder.id}</strong>
                      </span>
                      <h4 className="text-sm font-serif font-bold text-stone-900 mt-0.5">
                        {lang === 'bn' ? info.titleBn : info.titleEn}
                      </h4>
                      <p className="text-[10px] text-stone-500 mt-0.5">
                        তারিখ: {foundOrder.createdAt} | ক্রেতা: {foundOrder.customerName}
                      </p>
                    </div>

                    <span className={`px-2.5 py-1 text-[11px] font-extrabold rounded-xl border shrink-0 ${info.color}`}>
                      {foundOrder.status.toUpperCase()}
                    </span>
                  </div>

                  {/* Parcel Items & Total */}
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1.5">
                    <div className="font-bold text-stone-800 text-[11px]">আইটেম সমূহের বিবরণ:</div>
                    <ul className="space-y-1 text-[11px] text-stone-700">
                      {foundOrder.items.map((it, idx) => (
                        <li key={idx} className="flex justify-between items-center">
                          <span>
                            • {lang === 'bn' ? it.product.nameBn : it.product.nameEn} ({it.quantity}টি) 
                            {it.selectedSize && <strong className="ml-1 text-rose-900 font-mono">[{it.selectedSize}]</strong>}
                          </span>
                          <span className="font-bold">৳{(it.product.price * it.quantity).toLocaleString()}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="border-t border-stone-200 pt-1.5 flex justify-between font-bold text-rose-950">
                      <span>মোট পরিশোধযোগ্য (COD Total):</span>
                      <span className="font-mono text-sm">৳{foundOrder.totalAmount.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Real Tracking Timeline Steps */}
                  <div className="space-y-3 pt-1">
                    <h5 className="font-bold text-stone-900 text-xs">ডেলিভারি ট্র্যাকিং ধাপসমূহ:</h5>
                    <div className="space-y-2.5">
                      {info.steps.map((st, idx) => (
                        <div key={idx} className="flex items-center gap-2.5 text-xs">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 ${
                            st.done ? 'bg-emerald-600' : st.active ? 'bg-amber-500 animate-pulse ring-2 ring-amber-300' : 'bg-stone-300 text-stone-600'
                          }`}>
                            {st.done ? '✓' : idx + 1}
                          </div>
                          <span className={`font-semibold ${st.done ? 'text-stone-900 font-bold' : st.active ? 'text-amber-900 font-extrabold' : 'text-stone-400'}`}>
                            {lang === 'bn' ? st.labelBn : st.labelEn}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Courier Tracking Info */}
                  <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-950">
                    <strong>কুরিয়ার স্ট্যাটাস:</strong> {info.courierTextBn}
                    {foundOrder.courierTrackingId && (
                      <div className="mt-1 font-mono font-bold text-rose-950">
                        কুরিয়ার ট্র্যাকিং আইডি: {foundOrder.courierTrackingId} ({foundOrder.courierName})
                      </div>
                    )}
                  </div>

                  {/* Customer Product Received / Delivery Confirmation */}
                  {foundOrder.status === 'delivered' || deliveryConfirmedSuccess ? (
                    <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center gap-2 text-emerald-950 text-xs font-semibold">
                      <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                      <div>
                        <div className="font-bold text-emerald-900">
                          {lang === 'bn' ? '✓ পার্সেল ডেলিভারি নিশ্চিত হয়েছে' : '✓ Delivery Confirmed'}
                        </div>
                        <div className="text-[10px] text-stone-600">
                          {lang === 'bn' ? 'রঙিলা রূপ কিডস-এর সাথে কেনাকাটা করার জন্য আন্তরিক ধন্যবাদ!' : 'Thank you for shopping with Rongila Rup Kids!'}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div className="text-left">
                        <div className="font-bold text-xs text-emerald-950 flex items-center gap-1.5">
                          <PackageCheck size={16} className="text-emerald-700 shrink-0" />
                          <span>{lang === 'bn' ? 'পণ্য হাতে পেয়ে গেছেন?' : 'Received your package?'}</span>
                        </div>
                        <p className="text-[10px] text-stone-600 mt-0.5">
                          {lang === 'bn' 
                            ? 'রাইডারের থেকে পার্সেল বুঝে পেয়ে থাকলে এখানে নিশ্চিত করুন।' 
                            : 'Click confirm once you receive your items.'}
                        </p>
                      </div>
                      <button
                        type="button"
                        disabled={isConfirmingDelivery}
                        onClick={() => handleCustomerConfirmDelivered(foundOrder.id)}
                        className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-60"
                      >
                        <CheckCircle2 size={14} />
                        <span>
                          {isConfirmingDelivery 
                            ? (lang === 'bn' ? 'কনফার্ম হচ্ছে...' : 'Confirming...') 
                            : (lang === 'bn' ? 'পণ্য পেয়েছি (কনফার্ম)' : 'Confirm Received')}
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })()
          ) : hasSearched && !loading ? (
            <div className="p-6 bg-rose-50 rounded-2xl border border-rose-200 text-center space-y-2 text-rose-900 animate-fade-in">
              <AlertCircle size={32} className="mx-auto text-rose-600" />
              <h4 className="font-bold text-sm">কোনো অর্ডার পাওয়া যায়নি!</h4>
              <p className="text-[11px] text-stone-600">
                "{searchQuery}" দিয়ে কোনো সক্রিয় অর্ডার আমাদের ডাটাবেজে পাওয়া যায়নি। অনুগ্রহ করে আপনার সঠিক অর্ডার আইডি (যেমন #RR-xxxxxx) বা ক্রয়ের সময় দেওয়া মোবাইল নম্বরটি লিখুন।
              </p>
            </div>
          ) : null}

          {/* Helpline Footer */}
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-950 flex items-center gap-3">
            <PhoneCall className="text-amber-700 shrink-0" size={18} />
            <div>
              <div className="font-bold">{lang === 'bn' ? 'সহায়তা প্রয়োজন?' : 'Need Delivery Assistance?'}</div>
              <div className="text-[11px] text-stone-600">
                {lang === 'bn' ? 'আমাদের কাস্টমার কেয়ার হটলাইন: 01792765693' : 'Customer Care Hotline: 01792765693'}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
