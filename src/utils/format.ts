/**
 * Safe formatting utilities to prevent crashes from Firestore Timestamp objects,
 * null/undefined values, or non-string phones.
 */

export function getSafeTimestamp(val: any): number {
  if (!val) return 0;
  if (typeof val === 'number') {
    // If it's in seconds (10 digits), convert to ms
    return val < 10000000000 ? val * 1000 : val;
  }
  if (typeof val === 'string') {
    const num = Number(val);
    if (!isNaN(num) && num > 100000000) {
      return num < 10000000000 ? num * 1000 : num;
    }
    const parsed = Date.parse(val);
    return isNaN(parsed) ? 0 : parsed;
  }
  if (typeof val === 'object') {
    if (typeof val.toMillis === 'function') {
      try { return val.toMillis(); } catch { /* ignore */ }
    }
    if (typeof val.toDate === 'function') {
      try { return val.toDate().getTime(); } catch { /* ignore */ }
    }
    if (typeof val.seconds === 'number') {
      return val.seconds * 1000 + Math.floor((val.nanoseconds || 0) / 1000000);
    }
  }
  return 0;
}

export function formatSafeDate(val: any, fallback = 'সাম্প্রতিক'): string {
  if (!val) return fallback;
  if (typeof val === 'string') {
    // If it's already a clean string representation, return it
    if (val.trim()) return val;
    return fallback;
  }
  if (typeof val === 'number') {
    try {
      const ms = val < 10000000000 ? val * 1000 : val;
      return new Date(ms).toLocaleDateString('bn-BD', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return new Date(val).toLocaleDateString();
    }
  }
  if (typeof val === 'object') {
    try {
      if (typeof val.toDate === 'function') {
        return val.toDate().toLocaleDateString('bn-BD', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
      if (typeof val.seconds === 'number') {
        return new Date(val.seconds * 1000).toLocaleDateString('bn-BD', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
    } catch {
      return fallback;
    }
  }
  return String(val) || fallback;
}

export function cleanPhoneNumber(phone: any): string {
  if (!phone) return '';
  return String(phone).replace(/[^0-9]/g, '');
}

export function formatSafePrice(amount: any): string {
  const num = Number(amount);
  if (isNaN(num)) return '0';
  return num.toLocaleString();
}
