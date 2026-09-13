export type Language = 'bn' | 'en';

export type CategoryId = 'all' | 'combo' | 'babydress' | 'babyset' | 'frock' | 'panjabi' | 'accessories' | 'footwear' | 'toys' | 'saree' | 'salwar' | 'jewelry' | 'festive' | 'threepiece' | 'lehenga' | 'kids';

export interface Product {
  id: string;
  sku?: string;
  nameBn: string;
  nameEn: string;
  category: CategoryId | string;
  price: number;
  originalPrice?: number;
  stockQuantity?: number;
  discountTag?: string;
  rating: number;
  reviewsCount: number;
  image: string;
  images: string[];
  fabricBn: string;
  fabricEn: string;
  colorBn: string;
  colorEn: string;
  descriptionBn: string;
  descriptionEn: string;
  inStock: boolean;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  isFestiveSpecial?: boolean;
  isFlashSale?: boolean;
  isBoosted?: boolean;
  boostStatus?: 'Active' | 'Paused' | 'None';
  boostBudget?: number;
  boostReach?: number;
  sizes?: string[];
  tags?: string[];
  detailsBn: string[];
  detailsEn: string[];
  createdAt?: number | string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

export interface FilterState {
  category: CategoryId;
  searchQuery: string;
  minPrice: number;
  maxPrice: number;
  color: string;
  fabric: string;
  sortBy: 'featured' | 'price-low' | 'price-high' | 'rating' | 'newest';
  inStockOnly: boolean;
}

export interface Review {
  id: string;
  productId: string;
  userName: string;
  rating: number;
  date: string;
  commentBn: string;
  commentEn: string;
  verifiedPurchase: boolean;
}

export interface Order {
  id: string;
  items: CartItem[];
  totalAmount: number;
  shippingFee: number;
  discount: number;
  customerName: string;
  phone: string;
  address: string;
  city: string;
  paymentMethod: 'cod' | 'bkash' | 'nagad' | 'rocket';
  paymentStatus: 'PAID' | 'UNPAID' | 'VERIFIED_PAID' | 'PENDING_VERIFICATION' | 'FAILED';
  amountPaid?: number;
  amountDue: number;
  trxId?: string;
  paymentPhone?: string;
  paymentSenderPhone?: string;
  paymentReceiverNumber?: string;
  paymentScreenshot?: string;
  status: 'processing' | 'confirmed' | 'on_hold' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled';
  courierName?: 'Steadfast Courier' | 'Pathao Courier' | 'RedX Logistics' | 'Paperfly';
  courierTrackingId?: string;
  courierStatus?: 'Pending Entry' | 'Dispatched' | 'In Transit' | 'Delivered' | 'Returned';
  adminNotes?: string;
  notes?: string;
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  type: 'percent' | 'fixed';
  discountValue: number;
  minOrderAmount?: number;
  expiryDate?: string;
  usageLimit?: number;
  usedCount: number;
  active: boolean;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
  status: 'active' | 'blocked' | 'vip';
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'Super Admin' | 'Store Manager' | 'Order Specialist' | 'Editor';
  status: 'Active' | 'Inactive';
  lastLogin?: string;
}

export interface StoreSettings {
  storeNameBn?: string;
  storeNameEn?: string;
  phone?: string;
  email?: string;
  addressBn?: string;
  topAnnouncementBn?: string;
  topAnnouncementEn?: string;
  announcementBn?: string;
  announcementEn?: string;
  couponCode?: string;
  couponDiscountPercent?: number;
  discountCouponCode?: string;
  discountPercent?: number;
  heroBadgeBn?: string;
  heroBadgeEn?: string;
  heroHeadlineBn?: string;
  heroHeadlineEn?: string;
  heroSubBn?: string;
  heroSubEn?: string;
  shippingInsideDhaka?: number;
  shippingOutsideDhaka?: number;
  bkashNumber?: string;
  nagadNumber?: string;
  rocketNumber?: string;
  enableBkash?: boolean;
  enableNagad?: boolean;
  enableRocket?: boolean;
  enableCOD?: boolean;
  themeColor?: 'crimson' | 'emerald' | 'ochre' | 'sapphire';
  bannerImages?: string[];
  supportEmail?: string;
  gmailAppPassword?: string;
}

export interface AIStylistMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  recommendedProductIds?: string[];
  timestamp: string;
}
