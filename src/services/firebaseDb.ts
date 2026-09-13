import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db, COLLECTIONS } from '../firebase';
import { Product, Order, Review, StoreSettings } from '../types';
import { getSafeTimestamp, formatSafeDate } from '../utils/format';

// Subscribe to real-time products
export const subscribeProducts = (
  callback: (products: Product[]) => void, 
  onError?: (err: Error) => void
) => {
  const q = query(collection(db, COLLECTIONS.PRODUCTS));
  return onSnapshot(
    q, 
    (snapshot) => {
      if (!snapshot.empty) {
        const prods = snapshot.docs.map((doc, idx) => {
          const data = doc.data();
          const safeCreated = getSafeTimestamp(data.createdAt);
          return {
            id: doc.id,
            ...data,
            createdAt: safeCreated || (1680000000000 - idx * 100000)
          } as Product;
        });
        prods.sort((a, b) => {
          const timeA = getSafeTimestamp(a.createdAt);
          const timeB = getSafeTimestamp(b.createdAt);
          return timeB - timeA;
        });
        callback(prods);
      } else {
        callback([]);
      }
    },
    (err) => {
      console.warn('Firestore products subscription error (using fallback):', err);
      if (onError) onError(err);
    }
  );
};

// Save or Update Product in Firestore
export const saveProductToFirestore = async (product: Product): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTIONS.PRODUCTS, product.id);
    const createdTimestamp = product.createdAt ? getSafeTimestamp(product.createdAt) : Date.now();
    await setDoc(docRef, {
      ...product,
      createdAt: createdTimestamp,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    console.error('Error saving product to Firestore:', error);
    throw error;
  }
};

// Delete Product from Firestore
export const deleteProductFromFirestore = async (productId: string): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTIONS.PRODUCTS, productId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting product from Firestore:', error);
    throw error;
  }
};

// Seed initial products to Firestore if empty
export const seedInitialProductsToFirestore = async (initialProducts: Product[]): Promise<void> => {
  try {
    const snapshot = await getDocs(collection(db, COLLECTIONS.PRODUCTS));
    if (snapshot.empty) {
      console.log('Seeding initial products into Firestore...');
      const batch = writeBatch(db);
      initialProducts.forEach((prod, idx) => {
        const ref = doc(db, COLLECTIONS.PRODUCTS, prod.id);
        batch.set(ref, {
          ...prod,
          createdAt: prod.createdAt || (1680000000000 - idx * 100000)
        });
      });
      await batch.commit();
      console.log('Successfully seeded initial products to Firestore!');
    }
  } catch (error) {
    console.error('Error seeding initial products to Firestore:', error);
  }
};

// Subscribe to Orders in real-time
export const subscribeOrders = (
  callback: (orders: Order[]) => void,
  onError?: (err: Error) => void
) => {
  const q = query(collection(db, COLLECTIONS.ORDERS));
  return onSnapshot(
    q,
    (snapshot) => {
      const ordersList = snapshot.docs.map(doc => {
        const data = doc.data();
        const totalAmount = Number(data.totalAmount) || 0;
        const pStatus = data.paymentStatus || 'UNPAID';
        const isPaid = pStatus === 'PAID' || pStatus === 'VERIFIED_PAID';
        const amountPaid = typeof data.amountPaid === 'number' ? data.amountPaid : (isPaid ? totalAmount : 0);
        const amountDue = typeof data.amountDue === 'number' ? data.amountDue : Math.max(0, totalAmount - amountPaid);

        return {
          id: doc.id,
          ...data,
          createdAt: formatSafeDate(data.createdAt, 'আজকের অর্ডার'),
          customerName: data.customerName || 'সম্মানিত কাস্টমার',
          phone: String(data.phone || ''),
          address: data.address || '',
          city: data.city || 'ঢাকা',
          items: Array.isArray(data.items) ? data.items : [],
          totalAmount,
          shippingFee: Number(data.shippingFee) || 80,
          discount: Number(data.discount) || 0,
          paymentMethod: data.paymentMethod || 'cod',
          paymentStatus: pStatus,
          amountPaid,
          amountDue,
          trxId: data.trxId || '',
          paymentPhone: data.paymentPhone || data.phone || '',
          paymentSenderPhone: data.paymentSenderPhone || data.paymentPhone || data.phone || '',
          paymentReceiverNumber: data.paymentReceiverNumber || '01792765693',
          paymentScreenshot: data.paymentScreenshot || '',
          status: data.status || 'processing'
        } as Order;
      });
      callback(ordersList);
    },
    (err) => {
      console.warn('Firestore orders subscription error:', err);
      if (onError) onError(err);
    }
  );
};

// Fetch orders from server API
export const fetchOrdersFromServer = async (): Promise<Order[]> => {
  try {
    const res = await fetch('/api/orders');
    if (res.ok) {
      const data = await res.json();
      return data.orders || [];
    }
  } catch (e) {
    console.warn('Could not fetch orders from /api/orders:', e);
  }
  return [];
};

// Create new Order in Firestore and sync to server
export const saveOrderToFirestore = async (order: Order): Promise<void> => {
  // 1. Sync to server-side orders store
  try {
    fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order)
    }).catch(err => console.warn('Server order save err:', err));
  } catch (e) {
    console.warn('Failed to call /api/orders POST:', e);
  }

  // 2. Save to Firestore
  try {
    const docRef = doc(db, COLLECTIONS.ORDERS, order.id);
    await setDoc(docRef, {
      ...order,
      createdAt: order.createdAt || serverTimestamp(),
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    console.error('Error saving order to Firestore:', error);
    // Even if Firestore fails, server has received it
  }
};

// Update existing Order status in Firestore and server
export const updateOrderStatusInFirestore = async (orderId: string, status: Order['status']): Promise<void> => {
  // 1. Sync to server
  try {
    fetch(`/api/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    }).catch(err => console.warn('Server order patch err:', err));
  } catch (e) {
    console.warn('Failed to call /api/orders PATCH:', e);
  }

  // 2. Update in Firestore
  try {
    const docRef = doc(db, COLLECTIONS.ORDERS, orderId);
    await updateDoc(docRef, {
      status,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating order status in Firestore:', error);
  }
};

// Subscribe to Store Settings
export const subscribeStoreSettings = (
  callback: (settings: StoreSettings) => void
) => {
  const docRef = doc(db, COLLECTIONS.SETTINGS, 'main_store');
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data() as StoreSettings);
    }
  });
};

// Save Store Settings to Firestore
export const saveStoreSettingsToFirestore = async (settings: StoreSettings): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTIONS.SETTINGS, 'main_store');
    await setDoc(docRef, {
      ...settings,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    console.error('Error saving store settings to Firestore:', error);
    throw error;
  }
};

// Clear All Orders from Firestore, Server, and Local Storage
export const clearAllOrdersFromFirestore = async (): Promise<void> => {
  // 1. Wipe server-side orders
  try {
    await fetch('/api/orders/clear', { method: 'DELETE' });
  } catch (e) {
    console.warn('Failed to call /api/orders/clear:', e);
  }

  // 2. Wipe local storage
  try {
    localStorage.removeItem('rr_orders');
  } catch (e) {}

  // 3. Wipe all documents in Firestore 'orders' collection
  try {
    const q = query(collection(db, COLLECTIONS.ORDERS));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const batch = writeBatch(db);
      snapshot.docs.forEach((d) => {
        batch.delete(doc(db, COLLECTIONS.ORDERS, d.id));
      });
      await batch.commit();
    }
  } catch (err) {
    console.error('Error batch deleting orders from Firestore:', err);
  }
};
