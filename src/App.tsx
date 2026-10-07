import React, { useState, useEffect, useMemo } from 'react';
import { 
  Language, 
  CategoryId, 
  Product, 
  CartItem, 
  FilterState, 
  Review,
  Order,
  StoreSettings
} from './types';
import { PRODUCTS, INITIAL_REVIEWS, INITIAL_ORDERS } from './data/products';

import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { AIStylistWidget } from './components/AIStylistWidget';
import { TrackOrderModal } from './components/TrackOrderModal';
import { AdminPanel } from './components/AdminPanel';
import { GoogleDriveModal } from './components/GoogleDriveModal';
import { DiscountSlider } from './components/DiscountSlider';
import { BottomNav } from './components/BottomNav';
import { CustomerProfileModal } from './components/CustomerProfileModal';
import { Footer } from './components/Footer';
import { ProductComparisonModal } from './components/ProductComparisonModal';
import { ComparisonBar } from './components/ComparisonBar';
import { BabySizeGuideModal } from './components/BabySizeGuideModal';
import { WhatsAppSupportWidget } from './components/WhatsAppSupportWidget';
import { ShareProductModal } from './components/ShareProductModal';
import { initMetaPixel, trackPixelEvent } from './utils/pixel';
import { getSafeTimestamp } from './utils/format';
import { 
  subscribeProducts, 
  subscribeOrders, 
  subscribeStoreSettings,
  saveProductToFirestore,
  deleteProductFromFirestore,
  saveOrderToFirestore,
  updateOrderStatusInFirestore,
  saveStoreSettingsToFirestore,
  seedInitialProductsToFirestore,
  clearAllOrdersFromFirestore
} from './services/firebaseDb';

import { 
  Sparkles, 
  SlidersHorizontal, 
  Search, 
  X, 
  Heart, 
  ShoppingBag,
  Filter,
  RotateCcw
} from 'lucide-react';

export default function App() {
  // Language toggle (Default Bengali)
  const [lang, setLang] = useState<Language>('bn');

  // Store Settings (Announcements, Hero Banner Badges & Promo Coupons)
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(() => {
    const saved = localStorage.getItem('rr_store_settings');
    return saved ? JSON.parse(saved) : {
      announcementBn: 'স্পেশাল অফার: "RONGILA20" কুপনে ২০% ছাড়! সারাদেশে ক্যাশ অন ডেলিভারি',
      announcementEn: 'Special Offer: 20% OFF with "RONGILA20"! Cash on Delivery All Over Bangladesh',
      heroBadgeBn: 'প্রিমিয়াম বাচ্ছাদের ফ্যাশন ও কিউট কালেকশন ২০২৬',
      heroBadgeEn: 'Premium Kids & Baby Fashion Collection 2026',
      discountCouponCode: 'RONGILA20',
      discountPercent: 20
    };
  });

  useEffect(() => {
    localStorage.setItem('rr_store_settings', JSON.stringify(storeSettings));
    const currentTheme = storeSettings.themeColor || localStorage.getItem('rr_theme_color') || 'crimson';
    document.documentElement.setAttribute('data-theme', currentTheme);
    document.body.className = `theme-${currentTheme}`;
  }, [storeSettings]);

  // Products state with LocalStorage
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('rr_products');
    return saved ? JSON.parse(saved) : PRODUCTS;
  });

  // Orders state with LocalStorage
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('rr_orders');
    return saved ? JSON.parse(saved) : [];
  });

  const [reviews, setReviews] = useState<Review[]>(() => {
    const saved = localStorage.getItem('rr_reviews');
    return saved ? JSON.parse(saved) : INITIAL_REVIEWS;
  });

  // Cart State with LocalStorage
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('rr_cart');
    return saved ? JSON.parse(saved) : [];
  });

  // Wishlist State with LocalStorage
  const [wishlistIds, setWishlistIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('rr_wishlist');
    return saved ? JSON.parse(saved) : ['rr-kids-001'];
  });

  // Comparison State with LocalStorage
  const [comparedProductIds, setComparedProductIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('rr_compared');
    return saved ? JSON.parse(saved) : ['rr-kids-001', 'rr-kids-002'];
  });

  // Modals & Drawers state
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [directBuyItem, setDirectBuyItem] = useState<CartItem | null>(null);
  const [isAIStylistOpen, setIsAIStylistOpen] = useState(false);
  const [isTrackOrderOpen, setIsTrackOrderOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const urlParams = new URLSearchParams(window.location.search);
    const hash = window.location.hash;
    const isUrlAdmin = urlParams.get('admin') === 'true' || urlParams.get('admin') === '1' || hash === '#admin';
    const isSavedAdmin = sessionStorage.getItem('rr_admin_open') === 'true' || localStorage.getItem('rr_admin_open') === 'true';
    return isUrlAdmin || isSavedAdmin;
  });
  const [isDriveOpen, setIsDriveOpen] = useState(false);
  const [isCustomerProfileOpen, setIsCustomerProfileOpen] = useState(false);
  const [isBabySizeGuideOpen, setIsBabySizeGuideOpen] = useState(false);
  const [shareProduct, setShareProduct] = useState<Product | null>(null);
  const [trackOrderIdParam, setTrackOrderIdParam] = useState<string | null>(null);

  // Checkout Amounts
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [shippingFee, setShippingFee] = useState(80);

  // Filters State
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [priceMax, setPriceMax] = useState<number>(30000);
  const [selectedFabric, setSelectedFabric] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'rating' | 'newest'>('newest');

  // Synchronize admin open state with URL hash and browser storage
  useEffect(() => {
    if (isAdminOpen) {
      sessionStorage.setItem('rr_admin_open', 'true');
      localStorage.setItem('rr_admin_open', 'true');
      if (window.location.hash !== '#admin') {
        window.history.replaceState(null, '', window.location.pathname + window.location.search + '#admin');
      }
    } else {
      sessionStorage.removeItem('rr_admin_open');
      localStorage.removeItem('rr_admin_open');
      if (window.location.hash === '#admin') {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }
    }
  }, [isAdminOpen]);

  // Save to LocalStorage on changes
  useEffect(() => {
    localStorage.setItem('rr_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    if (orders && orders.length > 0) {
      localStorage.setItem('rr_orders', JSON.stringify(orders));
    }
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('rr_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem('rr_wishlist', JSON.stringify(wishlistIds));
  }, [wishlistIds]);

  useEffect(() => {
    localStorage.setItem('rr_compared', JSON.stringify(comparedProductIds));
  }, [comparedProductIds]);

  useEffect(() => {
    localStorage.setItem('rr_reviews', JSON.stringify(reviews));
  }, [reviews]);

  // Real-time Firestore & REST API Cloud Synchronization
  useEffect(() => {
    // 1. Seed initial products to Firestore if empty
    seedInitialProductsToFirestore(PRODUCTS);

    // 2. Fetch server-side baby products store to ensure products never vanish
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data.products) && data.products.length > 0) {
          setProducts(prev => {
            const map = new Map<string, Product>();
            PRODUCTS.forEach(p => map.set(p.id, p));
            data.products.forEach((p: Product) => map.set(p.id, p));
            prev.forEach(p => map.set(p.id, p));
            return Array.from(map.values()).filter(p => {
              const text = `${p.category || ''} ${p.nameBn || ''} ${p.nameEn || ''}`.toLowerCase();
              return !text.includes('saree') && !text.includes('শাড়ি') && !text.includes('শাড়ি');
            });
          });
        }
      })
      .catch(err => console.warn('Server products load warning:', err));

    // 3. Subscribe to live Firestore products
    const unsubscribeProducts = subscribeProducts((firestoreProducts) => {
      if (firestoreProducts && firestoreProducts.length > 0) {
        setProducts(firestoreProducts);
      }
    });

    // Helper to merge orders preserving delivered status
    const mergeOrdersSafely = (currentOrders: Order[], incomingOrders: Order[]): Order[] => {
      const map = new Map<string, Order>();
      currentOrders.forEach(o => { if (o && o.id) map.set(o.id, o); });
      incomingOrders.forEach(o => {
        if (!o || !o.id) return;
        const existing = map.get(o.id);
        if (existing && existing.status === 'delivered' && o.status !== 'delivered') {
          // Protect confirmed delivery status from being overwritten
          map.set(o.id, { ...o, status: 'delivered', paymentStatus: 'VERIFIED_PAID', courierStatus: 'Delivered' });
        } else {
          map.set(o.id, o);
        }
      });
      return Array.from(map.values()).sort((a, b) => {
        const timeA = getSafeTimestamp(a.createdAt) || 0;
        const timeB = getSafeTimestamp(b.createdAt) || 0;
        return timeB - timeA;
      });
    };

    // 3. Subscribe to live Firestore orders without wiping existing cached orders
    const unsubscribeOrders = subscribeOrders((firestoreOrders) => {
      if (Array.isArray(firestoreOrders) && firestoreOrders.length > 0) {
        setOrders(prev => {
          const merged = mergeOrdersSafely(prev, firestoreOrders);
          try {
            localStorage.setItem('rr_orders', JSON.stringify(merged));
          } catch (e) {}
          return merged;
        });
      }
    });

    // 4. Also poll server REST API (/api/orders) to guarantee cross-device & cross-session sync
    const fetchServerOrders = async () => {
      try {
        const res = await fetch('/api/orders');
        if (res.ok) {
          const data = await res.json();
          const serverOrders = Array.isArray(data) ? data : (Array.isArray(data?.orders) ? data.orders : []);
          if (serverOrders.length > 0) {
            setOrders(prev => {
              const merged = mergeOrdersSafely(prev, serverOrders);
              try {
                localStorage.setItem('rr_orders', JSON.stringify(merged));
              } catch (e) {}
              return merged;
            });
          }
        }
      } catch (err) {
        console.warn('Order sync check:', err);
      }
    };

    fetchServerOrders();
    const interval = setInterval(fetchServerOrders, 8000);

    // 5. Subscribe to live Store Settings
    const unsubscribeSettings = subscribeStoreSettings((firestoreSettings) => {
      if (firestoreSettings) {
        setStoreSettings(firestoreSettings);
      }
    });

    return () => {
      unsubscribeProducts();
      unsubscribeOrders();
      unsubscribeSettings();
      clearInterval(interval);
    };
  }, []);

  // Check URL query parameters for deep linking (?product=ID or ?orderProduct=ID / ?buy=ID or ?orderId=ID)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('product') || urlParams.get('productId');
    const buyId = urlParams.get('buy') || urlParams.get('orderProduct') || urlParams.get('orderNow') || urlParams.get('directBuy');
    const orderId = urlParams.get('orderId') || urlParams.get('trackOrder');

    if (buyId && products.length > 0) {
      const found = products.find(p => p.id === buyId);
      if (found) {
        // Direct 1-click checkout modal for customers arriving from Facebook "Order now" button
        setDirectBuyItem({ product: found, quantity: 1, selectedSize: found.sizes?.[0] });
        setIsCheckoutOpen(true);
      }
    } else if (productId && products.length > 0) {
      const found = products.find(p => p.id === productId);
      if (found) {
        setQuickViewProduct(found);
      }
    }

    if (orderId) {
      setTrackOrderIdParam(orderId);
      setIsTrackOrderOpen(true);
    }

    // Check for admin activation link
    const hash = window.location.hash || '';
    const isActivate = hash.includes('admin-activate') || urlParams.get('adminInvite') || urlParams.get('activateToken');
    if (isActivate) {
      const token = urlParams.get('token') || urlParams.get('adminInvite') || urlParams.get('activateToken') || (hash.split('token=')[1] ? hash.split('token=')[1].split('&')[0] : '');
      const email = urlParams.get('email') || (hash.split('email=')[1] ? decodeURIComponent(hash.split('email=')[1].split('&')[0]) : '');

      if (token || email) {
        fetch('/api/admin/activate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, email })
        })
          .then(res => res.json())
          .then(data => {
            if (data.success) {
              sessionStorage.setItem('rr_admin_token', 'staff_activated_' + Date.now());
              alert(data.message || '🎉 আপনার এডমিন অ্যাকাউন্ট সফলভাবে অ্যাক্টিভ হয়েছে!');
              setIsAdminOpen(true);
              window.history.replaceState({}, document.title, window.location.pathname);
            }
          })
          .catch(err => console.error('Admin activation error:', err));
      }
    }
  }, [products]);

  // Comparison Handlers
  const handleToggleCompare = (product: Product) => {
    setComparedProductIds(prev => {
      if (prev.includes(product.id)) {
        return prev.filter(id => id !== product.id);
      }
      if (prev.length >= 3) {
        alert(lang === 'bn' 
          ? 'আপনি একসাথে সর্বোচ্চ ৩টি পণ্য তুলনা করতে পারেন!' 
          : 'You can compare up to 3 products at a time!');
        return prev;
      }
      return [...prev, product.id];
    });
  };

  const handleRemoveFromCompare = (productId: string) => {
    setComparedProductIds(prev => prev.filter(id => id !== productId));
  };

  const handleAddToCompare = (product: Product) => {
    setComparedProductIds(prev => {
      if (prev.includes(product.id)) return prev;
      if (prev.length >= 3) {
        alert(lang === 'bn' 
          ? 'আপনি একসাথে সর্বোচ্চ ৩টি পণ্য তুলনা করতে পারেন!' 
          : 'You can compare up to 3 products at a time!');
        return prev;
      }
      return [...prev, product.id];
    });
  };

  const handleClearCompare = () => {
    setComparedProductIds([]);
  };

  const comparedProducts = useMemo(() => {
    return products.filter(p => comparedProductIds.includes(p.id));
  }, [products, comparedProductIds]);

  // Initialize Meta (Facebook) Pixel & Secret Admin Listeners
  useEffect(() => {
    initMetaPixel();

    // 1. Secret URL Query Param Check (?admin=true or #admin)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('admin') === 'true' || urlParams.get('admin') === '1' || window.location.hash === '#admin') {
      setIsAdminOpen(true);
    }

    // 2. Secret Keyboard Shortcut (Ctrl + Shift + A)
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        setIsAdminOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Admin Product Handlers
  const handleAddProduct = (newProduct: Product) => {
    const now = Date.now();
    const productWithTimestamp: Product = {
      ...newProduct,
      createdAt: now
    };
    // Put newly added product at top of array
    setProducts(prev => [productWithTimestamp, ...prev.filter(p => p.id !== productWithTimestamp.id)]);
    saveProductToFirestore(productWithTimestamp).catch(err => console.error('Save product error:', err));
    // Reset filters and ensure newest first so newly added product is immediately visible at the top of the store catalog
    setSelectedCategory('all');
    setSearchQuery('');
    setSelectedFabric('all');
    setPriceMax(30000);
    setSortBy('newest');
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
    saveProductToFirestore(updatedProduct).catch(err => console.error('Update product error:', err));
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
    deleteProductFromFirestore(productId).catch(err => console.error('Delete product error:', err));
  };

  // Admin & Customer Order Handlers with Server Sync & Persistence Protection
  const handleUpdateOrderStatus = (orderId: string, newStatus: Order['status']) => {
    setOrders(prev => {
      const updated = prev.map(o => {
        if (o.id !== orderId) return o;
        return {
          ...o,
          status: newStatus,
          paymentStatus: newStatus === 'delivered' ? 'VERIFIED_PAID' : o.paymentStatus,
          courierStatus: newStatus === 'delivered' ? 'Delivered' : o.courierStatus
        };
      });
      try { localStorage.setItem('rr_orders', JSON.stringify(updated)); } catch(e) {}
      return updated;
    });

    updateOrderStatusInFirestore(orderId, newStatus).catch(err => console.error('Update order status error:', err));

    // Instant server-side sync so revenue calculation never reverts on refresh or polling
    fetch(`/api/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: newStatus,
        paymentStatus: newStatus === 'delivered' ? 'VERIFIED_PAID' : undefined,
        courierStatus: newStatus === 'delivered' ? 'Delivered' : undefined
      })
    }).catch(err => console.error('Server sync error:', err));
  };

  const handleUpdateFullOrder = (updatedOrder: Order) => {
    setOrders(prev => {
      const updated = prev.map(o => o.id === updatedOrder.id ? updatedOrder : o);
      try { localStorage.setItem('rr_orders', JSON.stringify(updated)); } catch(e) {}
      return updated;
    });
    saveOrderToFirestore(updatedOrder).catch(err => console.error('Update full order error:', err));
    fetch(`/api/orders/${updatedOrder.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedOrder)
    }).catch(err => console.error('Server sync full order error:', err));
  };

  const handleOrderPlaced = (newOrder: Order) => {
    setOrders(prev => {
      const filtered = prev.filter(o => o.id !== newOrder.id);
      const updated = [newOrder, ...filtered];
      try {
        localStorage.setItem('rr_orders', JSON.stringify(updated));
        localStorage.setItem('rr_last_order_id', newOrder.id);
        localStorage.setItem('rr_last_order', JSON.stringify(newOrder));
      } catch (e) {}
      return updated;
    });

    // Dual persist: Firestore + Server file store
    saveOrderToFirestore(newOrder).catch(err => console.error('Save new order to Firestore error:', err));
    fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newOrder)
    }).catch(err => console.error('Direct server order save error:', err));

    trackPixelEvent('Purchase', {
      value: newOrder.totalAmount,
      currency: 'BDT',
      order_id: newOrder.id,
      content_name: newOrder.items.map(i => i.product.nameBn || i.product.nameEn).join(', ')
    });
  };

  // Wishlist Toggle
  const handleToggleWishlist = (product: Product) => {
    setWishlistIds(prev => 
      prev.includes(product.id)
        ? prev.filter(id => id !== product.id)
        : [...prev, product.id]
    );
  };

  // Add to Cart
  const handleAddToCart = (product: Product, size?: string, openCart = true) => {
    setCartItems(prev => {
      const chosenSize = size || product.sizes?.[0];
      const existing = prev.find(item => item.product.id === product.id && item.selectedSize === chosenSize);
      if (existing) {
        return prev.map(item => 
          item === existing
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1, selectedSize: chosenSize }];
    });
    if (openCart) {
      setIsCartOpen(true);
    }
    trackPixelEvent('AddToCart', {
      content_name: product.nameBn || product.nameEn,
      value: product.price,
      currency: 'BDT'
    });
  };

  // Buy Now Trigger (Direct single-product checkout without polluting general cart)
  const handleBuyNow = (product: Product, size?: string) => {
    const chosenSize = size || product.sizes?.[0];
    setDirectBuyItem({ product, quantity: 1, selectedSize: chosenSize });
    if (quickViewProduct) setQuickViewProduct(null);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
    trackPixelEvent('InitiateCheckout', {
      content_name: product.nameBn || product.nameEn,
      value: product.price,
      currency: 'BDT'
    });
  };

  // Update Cart Item Quantity
  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCartItems(prev => 
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
  };

  // Remove item from Cart
  const handleRemoveItem = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.product.id !== productId));
  };

  // Add New Customer Review
  const handleAddReview = (newRev: Omit<Review, 'id' | 'date'>) => {
    const rev: Review = {
      ...newRev,
      id: `rev-${Date.now()}`,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    };
    setReviews(prev => [rev, ...prev]);
  };

  // Filtered Products Calculation
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // Category filter
      if (selectedCategory !== 'all' && p.category !== selectedCategory) {
        if (selectedCategory === 'festive' && !p.isFestiveSpecial) return false;
        if (selectedCategory !== 'festive') return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchNameBn = p.nameBn.toLowerCase().includes(q);
        const matchNameEn = p.nameEn.toLowerCase().includes(q);
        const matchFabric = (p.fabricBn || '').toLowerCase().includes(q) || (p.fabricEn || '').toLowerCase().includes(q);
        if (!matchNameBn && !matchNameEn && !matchFabric) return false;
      }

      // Price filter
      if (p.price > priceMax) return false;

      // Fabric filter
      if (selectedFabric !== 'all' && !(p.fabricBn || '').includes(selectedFabric) && !(p.fabricEn || '').includes(selectedFabric)) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return (a.price || 0) - (b.price || 0);
      if (sortBy === 'price-high') return (b.price || 0) - (a.price || 0);
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      // Default: newest first (newest product with highest timestamp appears first)
      const timeA = getSafeTimestamp(a.createdAt);
      const timeB = getSafeTimestamp(b.createdAt);
      if (timeB !== timeA) return timeB - timeA;
      return 0; // featured default
    });
  }, [products, selectedCategory, searchQuery, priceMax, selectedFabric, sortBy]);

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const pendingOrdersCount = orders.filter(o => o.status === 'processing' || (o.status as string) === 'pending').length;

  const handleClearAllOrders = async () => {
    try {
      await clearAllOrdersFromFirestore();
      setOrders([]);
      localStorage.removeItem('rr_orders');
    } catch (err) {
      console.error('Error clearing orders:', err);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans flex flex-col selection:bg-amber-500 selection:text-rose-950">
      
      {/* Navbar */}
      <Navbar
        lang={lang}
        onLanguageToggle={() => setLang(l => l === 'bn' ? 'en' : 'bn')}
        cartCount={totalCartCount}
        wishlistCount={wishlistIds.length}
        compareCount={comparedProductIds.length}
        pendingOrdersCount={pendingOrdersCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onOpenCompare={() => setIsCompareOpen(true)}
        onOpenAIStylist={() => setIsAIStylistOpen(true)}
        onOpenTrackOrder={() => setIsTrackOrderOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenDrive={() => setIsDriveOpen(true)}
        onOpenCustomerProfile={() => setIsCustomerProfileOpen(true)}
        selectedCategory={selectedCategory}
        onSelectCategory={(cat) => setSelectedCategory(cat)}
        searchQuery={searchQuery}
        onSearchChange={(q) => setSearchQuery(q)}
        announcementBn={storeSettings.announcementBn}
        announcementEn={storeSettings.announcementEn}
      />

      {/* Hero Banner Showcase */}
      <HeroBanner
        lang={lang}
        onOpenAIStylist={() => setIsAIStylistOpen(true)}
        heroBadgeBn={storeSettings.heroBadgeBn}
        heroBadgeEn={storeSettings.heroBadgeEn}
      />

      {/* Main Content Catalog Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6 pb-24">
        
        {/* 1. DISCOUNT PRODUCTS SLIDER */}
        <DiscountSlider
          products={products}
          lang={lang}
          onAddToCart={handleAddToCart}
          onQuickView={(prod) => setQuickViewProduct(prod)}
        />

        {/* 2. SEARCH BAR & CATEGORY SYSTEM (Pure White Card Background) */}
        <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-sm space-y-4">
          
          {/* SEARCH BAR & SORT */}
          <div className="flex flex-col md:flex-row gap-3 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-3 text-stone-400" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={lang === 'bn' ? 'বাচ্ছাদের ফ্রক, রম্পার, পাঞ্জাবি, ড্রেস বা বয়স লিখে সার্চ করুন...' : 'Search kids frocks, rompers, panjabi, toys or age...'}
                className="w-full pl-10 pr-10 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-xs font-semibold text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-3 text-stone-400 hover:text-stone-700"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
              <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 px-3 py-2 rounded-2xl text-xs w-full md:w-auto text-stone-700">
                <Filter size={14} className="text-amber-600" />
                <span className="font-bold text-stone-900">{lang === 'bn' ? 'সাজান:' : 'Sort:'}</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent font-bold text-stone-900 focus:outline-none cursor-pointer text-xs"
                >
                  <option value="featured">{lang === 'bn' ? 'জনপ্রিয় (Featured)' : 'Featured'}</option>
                  <option value="price-low">{lang === 'bn' ? 'কম মূল্য থেকে বেশি' : 'Price: Low to High'}</option>
                  <option value="price-high">{lang === 'bn' ? 'বেশি মূল্য থেকে কম' : 'Price: High to Low'}</option>
                  <option value="rating">{lang === 'bn' ? 'সর্বোচ্চ রেটিং' : 'Top Rated'}</option>
                </select>
              </div>

              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchQuery('');
                  setPriceMax(30000);
                  setSelectedFabric('all');
                  setSortBy('featured');
                }}
                className="p-2.5 rounded-2xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 font-bold transition-colors cursor-pointer shrink-0"
                title="Reset Filters"
              >
                <RotateCcw size={16} />
              </button>
            </div>
          </div>

          {/* CATEGORY TABS (Kids Focused Categories) */}
          <div className="pt-3 border-t border-stone-100 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-serif font-extrabold text-stone-900 flex items-center gap-2">
                <span>{lang === 'bn' ? 'বাচ্ছাদের কালেকশন ক্যাটাগরি' : 'Kids Collection Categories'}</span>
              </h3>
              <span className="text-xs text-stone-500 font-semibold">
                {lang === 'bn' ? `${filteredProducts.length} টি পণ্য পাওয়া গেছে` : `${filteredProducts.length} items`}
              </span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {[
                { id: 'all', bn: 'সকল পণ্য', en: 'All Items', icon: '✨' },
                { id: 'combo', bn: '🎁 মেগা কম্বো প্যাকেজ', en: 'Combo Packages', icon: '🎁' },
                { id: 'babydress', bn: 'বেবি ফ্রক ও ড্রেস (০-৮ বছর)', en: 'Baby Frocks (0-8Y)', icon: '👗' },
                { id: 'babyset', bn: 'রোম্পার ও ২-পিস সেট', en: 'Rompers & Sets', icon: '🍼' },
                { id: 'frock', bn: 'পার্টি ফ্রক ও গাউন', en: 'Party Frocks & Gowns', icon: '🎀' },
                { id: 'panjabi', bn: 'বয়েজ পাঞ্জাবি ও ফতুয়া', en: 'Boys Panjabi', icon: '👔' },
                { id: 'footwear', bn: 'কিউট জুতো ও স্যান্ডেল', en: 'Baby Shoes', icon: '👟' },
                { id: 'accessories', bn: 'হেয়ার ব্যান্ড ও ক্রাউন', en: 'Baby Accessories', icon: '👑' },
                { id: 'toys', bn: 'খেলনা ও গিফট আইটেম', en: 'Toys & Gifts', icon: '🧸' },
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id as CategoryId)}
                  className={`px-3.5 py-2 rounded-2xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                    selectedCategory === cat.id
                      ? 'bg-rose-950 text-amber-200 font-extrabold shadow-md ring-2 ring-amber-400'
                      : 'bg-stone-100 text-stone-700 border border-stone-200 hover:bg-stone-200'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{lang === 'bn' ? cat.bn : cat.en}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 3. BABY SIZE GUIDE & ASSISTANT STRIP */}
        <div className="flex items-center justify-between bg-gradient-to-r from-rose-50 via-amber-50 to-pink-50 border border-rose-200/80 rounded-3xl p-4 shadow-sm">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 bg-white rounded-2xl border border-rose-200 text-xl shrink-0 shadow-xs">
              📏
            </div>
            <div className="min-w-0">
              <span className="font-extrabold text-xs sm:text-sm text-rose-950 block truncate">
                {lang === 'bn' ? 'শিশুদের সঠিক সাইজ ও বয়স নিয়ে কোনো জিজ্ঞাসা?' : 'Need Help Choosing the Right Baby Size?'}
              </span>
              <span className="text-[11px] text-stone-600 hidden sm:block">
                {lang === 'bn' ? '০ মাস থেকে ৮ বছর বয়সী বাচ্চাদের চার্ট ও ওজন অনুযায়ী সাইজ গাইড' : '0 Month to 8 Years size chart with age & weight guide'}
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsBabySizeGuideOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-rose-950 font-extrabold text-xs rounded-xl shadow-md transition-transform hover:scale-105 cursor-pointer shrink-0 flex items-center gap-1.5"
          >
            <span>{lang === 'bn' ? 'সাইজ গাইড চার্ট' : 'View Size Chart'}</span>
            <Sparkles size={14} />
          </button>
        </div>

        {/* 4. PRODUCT GRID */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center space-y-4 border border-stone-200 text-stone-800 shadow-sm">
            <div className="w-16 h-16 bg-rose-50 text-rose-800 rounded-full flex items-center justify-center mx-auto">
              <Search size={28} />
            </div>
            <h3 className="text-lg font-serif font-bold text-stone-900">
              {lang === 'bn' ? 'কোনো পণ্য পাওয়া যায়নি!' : 'No matching products found!'}
            </h3>
            <p className="text-xs text-stone-500 max-w-md mx-auto">
              {lang === 'bn' 
                ? 'আপনার সার্চ ফিল্টার বা ক্যাটাগরি পরিবর্তন করে আবার চেষ্টা করুন।' 
                : 'Try adjusting your search criteria, price range, or category filter.'}
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
                setPriceMax(30000);
                setSelectedFabric('all');
              }}
              className="px-6 py-2.5 rounded-full bg-rose-950 text-amber-100 font-bold text-xs hover:bg-rose-900"
            >
              {lang === 'bn' ? 'সকল পণ্য দেখুন' : 'Show All Products'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-3 sm:gap-6">
            {filteredProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                lang={lang}
                isWishlisted={wishlistIds.includes(p.id)}
                onToggleWishlist={handleToggleWishlist}
                onAddToCart={(prod) => handleAddToCart(prod)}
                onBuyNow={(prod) => handleBuyNow(prod)}
                onQuickView={(prod) => setQuickViewProduct(prod)}
                isCompared={comparedProductIds.includes(p.id)}
                onToggleCompare={handleToggleCompare}
                onOpenShareModal={(prod) => setShareProduct(prod)}
              />
            ))}
          </div>
        )}

      </main>

      {/* Wishlist Drawer Modal */}
      {isWishlistOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-md bg-stone-50 h-full shadow-2xl flex flex-col justify-between border-l border-amber-500/20">
            <div className="px-6 py-4 bg-rose-950 text-amber-50 flex items-center justify-between border-b border-amber-500/20">
              <div className="flex items-center gap-2">
                <Heart className="text-rose-500 fill-rose-500" size={20} />
                <h3 className="text-lg font-serif font-bold text-amber-100">
                  {lang === 'bn' ? 'পছন্দের তালিকা (উইশলিস্ট)' : 'Your Saved Wishlist'}
                </h3>
              </div>
              <button onClick={() => setIsWishlistOpen(false)} className="p-1 rounded-full text-amber-200 hover:bg-rose-900">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {wishlistIds.length === 0 ? (
                <p className="text-center text-xs text-stone-500 italic py-12">
                  {lang === 'bn' ? 'উইশলিস্টে কোনো পণ্য নেই' : 'No items saved in wishlist'}
                </p>
              ) : (
                products.filter(p => wishlistIds.includes(p.id)).map(item => (
                  <div key={item.id} className="p-3 bg-white rounded-2xl border border-stone-200 flex items-center gap-3">
                    <img src={item.image} alt={item.nameEn} className="w-14 h-16 object-cover rounded-xl shrink-0" referrerPolicy="no-referrer" />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-serif font-bold text-stone-900 truncate">
                        {lang === 'bn' ? item.nameBn : item.nameEn}
                      </h4>
                      <span className="text-xs font-bold text-rose-900">৳{item.price.toLocaleString()}</span>
                    </div>
                    <button
                      onClick={() => handleAddToCart(item)}
                      className="p-2 bg-rose-950 text-amber-200 rounded-xl hover:bg-rose-900 text-xs font-bold"
                    >
                      <ShoppingBag size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Product Quick View Detail Modal */}
      <ProductDetailModal
        product={quickViewProduct}
        lang={lang}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={handleAddToCart}
        onToggleWishlist={handleToggleWishlist}
        isWishlisted={quickViewProduct ? wishlistIds.includes(quickViewProduct.id) : false}
        reviews={reviews}
        onAddReview={handleAddReview}
        onBuyNow={handleBuyNow}
        isCompared={quickViewProduct ? comparedProductIds.includes(quickViewProduct.id) : false}
        onToggleCompare={handleToggleCompare}
        onOpenShareModal={(prod) => setShareProduct(prod)}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        lang={lang}
        cartItems={cartItems}
        storeSettings={storeSettings}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onProceedToCheckout={(disc, ship) => {
          setDirectBuyItem(null);
          setAppliedDiscount(disc);
          setShippingFee(ship);
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => {
          setIsCheckoutOpen(false);
          setDirectBuyItem(null);
        }}
        lang={lang}
        cartItems={directBuyItem ? [directBuyItem] : cartItems}
        discountAmount={appliedDiscount}
        shippingFee={shippingFee}
        onClearCart={() => {
          if (directBuyItem) {
            setDirectBuyItem(null);
          } else {
            setCartItems([]);
          }
        }}
        onOrderPlaced={handleOrderPlaced}
        onUpdateQuantity={(productId, delta) => {
          if (directBuyItem && directBuyItem.product.id === productId) {
            const nextQ = directBuyItem.quantity + delta;
            if (nextQ <= 0) {
              setDirectBuyItem(null);
            } else {
              setDirectBuyItem({ ...directBuyItem, quantity: nextQ });
            }
          } else {
            handleUpdateQuantity(productId, delta);
          }
        }}
        onRemoveItem={(productId) => {
          if (directBuyItem && directBuyItem.product.id === productId) {
            setDirectBuyItem(null);
          } else {
            handleRemoveItem(productId);
          }
        }}
      />

      {/* Admin Panel Modal */}
      <AdminPanel
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        lang={lang}
        products={products}
        onAddProduct={handleAddProduct}
        onUpdateProduct={handleUpdateProduct}
        onDeleteProduct={handleDeleteProduct}
        orders={orders}
        onAddOrder={handleOrderPlaced}
        onUpdateOrderStatus={handleUpdateOrderStatus}
        onUpdateFullOrder={handleUpdateFullOrder}
        onClearOrders={handleClearAllOrders}
        onOpenDrive={() => setIsDriveOpen(true)}
        storeSettings={storeSettings}
        onUpdateStoreSettings={setStoreSettings}
      />

      {/* Google Drive Workspace Modal */}
      <GoogleDriveModal
        isOpen={isDriveOpen}
        onClose={() => setIsDriveOpen(false)}
        lang={lang}
        products={products}
        orders={orders}
      />

      {/* Floating AI Stylist Button at bottom right (positioned below WhatsApp button) */}
      <button
        onClick={() => setIsAIStylistOpen(true)}
        className="fixed bottom-5 right-4 sm:right-6 z-40 px-3.5 py-2.5 rounded-full bg-rose-950 text-amber-200 hover:bg-rose-900 font-bold text-xs shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 border-2 border-amber-400 cursor-pointer group"
        title={lang === 'bn' ? 'রঙিলা রূপ AI সহকারী চ্যাট' : 'Rongila Rup AI Assistant'}
      >
        <Sparkles size={16} className="text-amber-400 group-hover:rotate-12 transition-transform" />
        <span className="font-bold tracking-wide">{lang === 'bn' ? 'AI সহকারী' : 'AI Assistant'}</span>
      </button>

      {/* AI Stylist Drawer */}
      <AIStylistWidget
        isOpen={isAIStylistOpen}
        onClose={() => setIsAIStylistOpen(false)}
        lang={lang}
        products={products}
        onQuickViewProduct={(prod) => {
          setIsAIStylistOpen(false);
          setQuickViewProduct(prod);
        }}
      />

      {/* Order Tracking Modal */}
      <TrackOrderModal
        isOpen={isTrackOrderOpen}
        onClose={() => {
          setIsTrackOrderOpen(false);
          setTrackOrderIdParam(null);
        }}
        lang={lang}
        orders={orders}
        initialOrderId={trackOrderIdParam}
        onUpdateOrderStatus={handleUpdateOrderStatus}
      />

      {/* Product Multi-Platform Share Modal */}
      <ShareProductModal
        isOpen={!!shareProduct}
        onClose={() => setShareProduct(null)}
        product={shareProduct}
        lang={lang}
      />

      {/* Customer Profile & Sign In Modal */}
      <CustomerProfileModal
        isOpen={isCustomerProfileOpen}
        onClose={() => setIsCustomerProfileOpen(false)}
        lang={lang}
        orders={orders}
        onOpenTrackOrder={() => setIsTrackOrderOpen(true)}
        onUpdateOrderStatus={handleUpdateOrderStatus}
      />

      {/* Footer */}
      <Footer
        lang={lang}
        onSelectCategory={(cat) => setSelectedCategory(cat)}
        onOpenTrackOrder={() => setIsTrackOrderOpen(true)}
        onOpenAIStylist={() => setIsAIStylistOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      {/* Product Comparison Side-by-Side Modal */}
      <ProductComparisonModal
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        lang={lang}
        comparedProducts={comparedProducts}
        allProducts={products}
        onRemoveFromCompare={handleRemoveFromCompare}
        onAddToCompare={handleAddToCompare}
        onClearCompare={handleClearCompare}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
      />

      {/* Floating Comparison Dock / Bar */}
      <ComparisonBar
        comparedProducts={comparedProducts}
        lang={lang}
        onOpenCompareModal={() => setIsCompareOpen(true)}
        onRemoveProduct={handleRemoveFromCompare}
        onClearAll={handleClearCompare}
      />

      {/* Baby Size Guide Modal */}
      <BabySizeGuideModal
        isOpen={isBabySizeGuideOpen}
        onClose={() => setIsBabySizeGuideOpen(false)}
        lang={lang}
      />

      {/* WhatsApp Live Support Widget */}
      <WhatsAppSupportWidget lang={lang} />

      {/* Bottom Sticky Navigation Bar (Home, Cart, Profile) */}
      <BottomNav
        lang={lang}
        cartCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
        onGoHome={() => {
          setSelectedCategory('all');
          setSearchQuery('');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenProfile={() => setIsCustomerProfileOpen(true)}
      />

    </div>
  );
}
