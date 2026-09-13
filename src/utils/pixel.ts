// Meta (Facebook) Pixel helper utility

export const DEFAULT_PIXEL_ID = '4595345874045944';

export function getStoredPixelId(): string {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('rr_fb_pixel_id') || DEFAULT_PIXEL_ID;
  }
  return DEFAULT_PIXEL_ID;
}

export function savePixelId(id: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('rr_fb_pixel_id', id.trim());
    initMetaPixel(id.trim());
  }
}

export function initMetaPixel(pixelId?: string): void {
  const activeId = pixelId || getStoredPixelId();
  if (!activeId || typeof window === 'undefined') return;

  const w = window as any;
  if (w.fbq) {
    w.fbq('init', activeId);
    w.fbq('track', 'PageView');
    return;
  }

  w.fbq = function (...args: any[]) {
    if (w.fbq.callMethod) {
      w.fbq.callMethod(...args);
    } else {
      w.fbq.queue.push(args);
    }
  };
  if (!w._fbq) w._fbq = w.fbq;
  w.fbq.push = w.fbq;
  w.fbq.loaded = true;
  w.fbq.version = '2.0';
  w.fbq.queue = [];

  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://connect.facebook.net/en_US/fbevents.js';
  const firstScript = document.getElementsByTagName('script')[0];
  if (firstScript && firstScript.parentNode) {
    firstScript.parentNode.insertBefore(script, firstScript);
  } else {
    document.head.appendChild(script);
  }

  w.fbq('init', activeId);
  w.fbq('track', 'PageView');
}

export function trackPixelEvent(eventName: string, data?: Record<string, any>): void {
  if (typeof window === 'undefined') return;
  const w = window as any;
  if (w.fbq) {
    w.fbq('track', eventName, data);
    console.log(`[Meta Pixel ${getStoredPixelId()}] Event tracked: ${eventName}`, data);
  }
}
