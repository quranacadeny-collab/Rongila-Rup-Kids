/**
 * Print & Invoice Utility for Rongila Rup
 * Supports iframe-safe printing, opening printable view in a fresh new tab,
 * and downloading stand-alone HTML invoices that print cleanly on any printer.
 */

import { Order } from '../types';

/**
 * Builds a pixel-perfect, beautifully designed A4 / POS printable e-commerce invoice.
 */
export function generateProfessionalInvoiceHtml(
  order: Order,
  qrCodeUrl: string = '',
  storeInfo: { phone?: string; name?: string; address?: string } = {}
): string {
  const storeName = storeInfo.name || 'রঙিলা রূপ কিডস';
  const storePhone = storeInfo.phone || '01792765693';
  const storeAddress = storeInfo.address || 'ঢাকা, বাংলাদেশ';
  
  const isPaidInFull = (order.amountDue === 0) || (order.paymentStatus === 'VERIFIED_PAID') || (order.paymentStatus === 'PAID');
  const codDue = isPaidInFull ? 0 : (order.amountDue !== undefined ? order.amountDue : order.totalAmount);
  
  const items = order.items || [];
  const itemsTotal = items.reduce((sum, it) => sum + ((it.product?.price || 0) * (it.quantity || 1)), 0);
  const shippingFee = order.shippingFee !== undefined ? order.shippingFee : (order.totalAmount - itemsTotal > 0 ? order.totalAmount - itemsTotal : 80);
  const discount = order.discount || 0;
  const paidAmount = order.amountPaid || (isPaidInFull ? order.totalAmount : 0);

  const paymentMethodBangla = 
    order.paymentMethod === 'bkash' ? 'বিকাশ (bKash)' :
    order.paymentMethod === 'nagad' ? 'নগদ (Nagad)' :
    order.paymentMethod === 'rocket' ? 'রকেট (Rocket)' : 'ক্যাশ অন ডেলিভারি (COD)';

  return `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Invoice #${order.id} - ${storeName}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 8mm 10mm;
    }
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      background-color: #f8fafc;
      color: #0f172a;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      padding: 16px;
      display: flex;
      flex-direction: column;
      align-items: center;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .print-actions-bar {
      width: 100%;
      max-width: 740px;
      margin-bottom: 14px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #831843;
      color: #fef08a;
      padding: 12px 18px;
      border-radius: 10px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.12);
    }
    .print-btn {
      background: #fef08a;
      color: #831843;
      border: none;
      padding: 9px 20px;
      font-weight: 800;
      font-size: 13px;
      border-radius: 7px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: background 0.15s ease;
    }
    .print-btn:hover {
      background: #ffffff;
    }
    .invoice-card {
      background: #ffffff;
      width: 100%;
      max-width: 740px;
      border: 1px solid #cbd5e1;
      border-radius: 10px;
      padding: 24px 28px;
      box-shadow: 0 2px 12px rgba(0,0,0,0.06);
    }
    /* Header layout */
    .header-table {
      width: 100%;
      border-bottom: 2.5px solid #831843;
      padding-bottom: 14px;
      margin-bottom: 16px;
    }
    .store-title {
      font-size: 22px;
      font-weight: 900;
      color: #831843;
      letter-spacing: 0.5px;
      margin-bottom: 2px;
    }
    .store-sub {
      font-size: 11px;
      color: #475569;
      line-height: 1.4;
    }
    .invoice-badge {
      background: #831843;
      color: #fef08a;
      padding: 4px 10px;
      border-radius: 5px;
      font-size: 12px;
      font-weight: 800;
      font-family: monospace, sans-serif;
      display: inline-block;
    }
    .order-date {
      font-size: 11px;
      color: #64748b;
      margin-top: 4px;
    }

    /* 2 Columns: Customer & Courier */
    .columns-row {
      display: flex;
      gap: 14px;
      margin-bottom: 16px;
    }
    .customer-panel {
      flex: 1.1;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 12px 14px;
    }
    .courier-panel {
      flex: 0.9;
      background: #fffbeb;
      border: 1.5px dashed #d97706;
      border-radius: 8px;
      padding: 10px 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
    }
    .panel-header {
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.7px;
      color: #831843;
      margin-bottom: 6px;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 3px;
    }
    .cust-name {
      font-size: 14px;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 2px;
    }
    .cust-phone {
      font-size: 13px;
      font-weight: 800;
      color: #9f1239;
      font-family: monospace, sans-serif;
      margin-bottom: 2px;
    }
    .cust-address {
      font-size: 11px;
      color: #334155;
      line-height: 1.35;
    }

    .courier-left {
      flex: 1;
    }
    .courier-tag {
      font-size: 10px;
      font-weight: 800;
      color: #b45309;
      text-transform: uppercase;
      margin-bottom: 3px;
    }
    .cod-amount-big {
      font-size: 16px;
      font-weight: 900;
      font-family: monospace, sans-serif;
      color: ${isPaidInFull ? '#047857' : '#991b1b'};
    }
    .courier-note {
      font-size: 10px;
      font-weight: 700;
      color: #475569;
      margin-top: 3px;
    }

    /* Strict QR Code Box */
    .qr-container {
      width: 76px;
      height: 76px;
      min-width: 76px;
      min-height: 76px;
      max-width: 76px;
      max-height: 76px;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .qr-container img {
      width: 68px !important;
      height: 68px !important;
      max-width: 68px !important;
      max-height: 68px !important;
      object-fit: contain;
      display: block;
    }

    /* Products Table */
    .products-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 16px;
    }
    .products-table th {
      background: #831843;
      color: #ffffff;
      font-size: 11px;
      font-weight: 800;
      padding: 7px 10px;
      text-align: left;
      border: 1px solid #831843;
    }
    .products-table th.center, .products-table td.center {
      text-align: center;
    }
    .products-table th.right, .products-table td.right {
      text-align: right;
    }
    .products-table td {
      padding: 8px 10px;
      font-size: 11px;
      border: 1px solid #e2e8f0;
      color: #1e293b;
    }
    .products-table tbody tr:nth-child(even) {
      background: #f8fafc;
    }
    .item-name {
      font-weight: 700;
      color: #0f172a;
    }
    .size-badge {
      display: inline-block;
      margin-left: 6px;
      background: #fef08a;
      color: #831843;
      font-size: 10px;
      font-weight: 800;
      padding: 1px 6px;
      border-radius: 4px;
      border: 1px solid #fde047;
    }

    /* Financial Summary Breakdown */
    .summary-wrap {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;
      gap: 16px;
    }
    .instructions-box {
      flex: 1;
      background: #f1f5f9;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 10px 12px;
      font-size: 11px;
      color: #475569;
      line-height: 1.4;
    }
    .summary-table {
      width: 280px;
      border-collapse: collapse;
    }
    .summary-table td {
      padding: 4px 8px;
      font-size: 12px;
      color: #334155;
    }
    .summary-table td.sum-num {
      text-align: right;
      font-weight: 700;
      font-family: monospace, sans-serif;
    }
    .summary-table tr.total-row td {
      border-top: 1.5px solid #cbd5e1;
      font-size: 13px;
      font-weight: 800;
      color: #0f172a;
      padding-top: 6px;
    }
    .summary-table tr.cod-row {
      background: #fef2f2;
    }
    .summary-table tr.cod-row td {
      border: 1.5px solid #f87171;
      font-size: 14px;
      font-weight: 900;
      color: #991b1b;
      padding: 6px 8px;
    }

    /* Signatures */
    .signatures-row {
      display: flex;
      justify-content: space-between;
      margin-top: 32px;
      padding-top: 10px;
    }
    .sig-col {
      text-align: center;
      width: 170px;
    }
    .sig-dash {
      border-top: 1px dashed #64748b;
      margin-bottom: 4px;
    }
    .sig-text {
      font-size: 10px;
      color: #64748b;
      font-weight: 700;
    }

    .footer-bar {
      margin-top: 16px;
      text-align: center;
      font-size: 10px;
      color: #64748b;
      border-top: 1px solid #e2e8f0;
      padding-top: 8px;
    }

    /* Print-specific Rules */
    @media print {
      body {
        background: #ffffff !important;
        padding: 0 !important;
      }
      .print-actions-bar {
        display: none !important;
      }
      .invoice-card {
        border: none !important;
        box-shadow: none !important;
        max-width: 100% !important;
        padding: 0 !important;
        border-radius: 0 !important;
      }
      .products-table th {
        background: #831843 !important;
        color: #ffffff !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .summary-table tr.cod-row {
        background: #fef2f2 !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .courier-panel {
        background: #fffbeb !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    }
  </style>
</head>
<body>
  <div class="print-actions-bar">
    <div style="font-weight: 800; font-size: 14px;">
      🛒 ${storeName} - অফিসিয়াল ইনভয়েস ও কুরিয়ার মেমো
    </div>
    <button class="print-btn" onclick="window.print()">
      🖨️ প্রিন্ট / Save as PDF
    </button>
  </div>

  <div class="invoice-card" id="invoice-body">
    <!-- Header -->
    <table class="header-table">
      <tr>
        <td style="vertical-align: top;">
          <h1 class="store-title">${storeName}</h1>
          <p class="store-sub">📞 হটলাইন: ${storePhone} | 📍 ${storeAddress}</p>
          <p class="store-sub">🌐 শপ ক্যাটাগরি: বেবি ও কিডস ফ্যাশন, ডায়াপার ও খেলনা সামগ্রী</p>
        </td>
        <td style="text-align: right; vertical-align: top;">
          <div class="invoice-badge">INVOICE #${order.id}</div>
          <div class="order-date">তারিখ: ${order.createdAt || new Date().toLocaleDateString('bn-BD')}</div>
          <div class="order-date">পেমেন্ট: <strong>${paymentMethodBangla}</strong></div>
        </td>
      </tr>
    </table>

    <!-- 2 Columns: Customer Info & Courier Slip -->
    <div class="columns-row">
      <!-- Customer Info -->
      <div class="customer-panel">
        <div class="panel-header">গ্রাহক / প্রাপক তথ্য (Bill To & Ship To)</div>
        <div class="cust-name">${order.customerName}</div>
        <div class="cust-phone">📞 ${order.phone}</div>
        <div class="cust-address">📍 ${order.address}, ${order.city}</div>
        ${order.notes ? `<div style="font-size:10px; color:#64748b; margin-top:4px;">নোট: ${order.notes}</div>` : ''}
      </div>

      <!-- Courier & COD Box -->
      <div class="courier-panel">
        <div class="courier-left">
          <div class="courier-tag">কুরিয়ার ডেলিভারি স্লিপ (${order.courierName || 'Steadfast Courier'})</div>
          <div class="cod-amount-big">
            ${isPaidInFull ? '৳০ (পরিশোধিত)' : `COD: ৳${codDue.toLocaleString()}`}
          </div>
          <div class="courier-note">
            ${isPaidInFull 
              ? '⚠️ সম্পূর্ণ পেইড: কোনো টাকা আদায় করবেন না' 
              : `কুরিয়ারে আদায়যোগ্য: ৳${codDue.toLocaleString()}`}
          </div>
          ${order.courierTrackingId ? `
            <div style="font-size: 10px; font-family: monospace; font-weight: bold; color: #b45309; margin-top: 3px;">
              ট্র্যাকিং আইডি: ${order.courierTrackingId}
            </div>
          ` : ''}
        </div>

        <div class="qr-container">
          ${qrCodeUrl ? `
            <img src="${qrCodeUrl}" alt="Order QR" width="68" height="68" />
          ` : `
            <div style="font-size: 9px; text-align: center; color: #94a3b8; font-weight: bold;">
              QR Code
            </div>
          `}
        </div>
      </div>
    </div>

    <!-- Items Table -->
    <table class="products-table">
      <thead>
        <tr>
          <th style="width: 32px;" class="center">নং</th>
          <th>পণ্যের বিবরণ</th>
          <th style="width: 70px;" class="center">পরিমাণ</th>
          <th style="width: 90px;" class="right">দর (৳)</th>
          <th style="width: 100px;" class="right">মোট (৳)</th>
        </tr>
      </thead>
      <tbody>
        ${items.map((it, idx) => `
          <tr>
            <td class="center">${idx + 1}</td>
            <td>
              <span class="item-name">${it.product?.nameBn || it.product?.nameEn || 'প্রোডাক্ট'}</span>
              ${it.selectedSize ? `<span class="size-badge">সাইজ: ${it.selectedSize}</span>` : ''}
            </td>
            <td class="center" style="font-weight: bold;">${it.quantity}</td>
            <td class="right">৳${(it.product?.price || 0).toLocaleString()}</td>
            <td class="right" style="font-weight: bold;">৳${((it.product?.price || 0) * it.quantity).toLocaleString()}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <!-- Financial Breakdown & Notice -->
    <div class="summary-wrap">
      <div class="instructions-box">
        <strong>⚠️ ডেলিভারি নির্দেশিকা:</strong><br />
        • ডেলিভারি কর্মীর উপস্থিতিতে পার্সেল চেক করে বুঝে নিন।<br />
        • কোনো সমস্যা হলে হটলাইনে সরাসরি যোগাযোগ করুন: <strong>${storePhone}</strong><br />
        • আপনার সন্তানের কেনাকাটায় পাশে থাকার জন্য রঙিলা রূপ-কে ধন্যবাদ!
      </div>

      <table class="summary-table">
        <tr>
          <td>পণ্যের উপমোট (Subtotal):</td>
          <td class="sum-num">৳${itemsTotal.toLocaleString()}</td>
        </tr>
        <tr>
          <td>ডেলিভারি চার্জ (Delivery Fee):</td>
          <td class="sum-num">৳${shippingFee.toLocaleString()}</td>
        </tr>
        ${discount > 0 ? `
          <tr>
            <td>ডিসকাউন্ট (Discount):</td>
            <td class="sum-num" style="color: #16a34a;">-৳${discount.toLocaleString()}</td>
          </tr>
        ` : ''}
        <tr class="total-row">
          <td>সর্বমোট বিল (Total):</td>
          <td class="sum-num">৳${order.totalAmount.toLocaleString()}</td>
        </tr>
        ${paidAmount > 0 ? `
          <tr>
            <td style="color: #047857; font-weight: bold;">অগ্রিম পরিশোধিত (Paid):</td>
            <td class="sum-num" style="color: #047857;">-৳${paidAmount.toLocaleString()}</td>
          </tr>
        ` : ''}
        <tr class="cod-row">
          <td>ক্যাশ অন ডেলিভারি (COD Due):</td>
          <td class="sum-num">৳${codDue.toLocaleString()}</td>
        </tr>
      </table>
    </div>

    <!-- Signatures -->
    <div class="signatures-row">
      <div class="sig-col">
        <div class="sig-dash"></div>
        <div class="sig-text">গ্রাহকের স্বাক্ষর</div>
      </div>
      <div class="sig-col">
        <div class="sig-dash"></div>
        <div class="sig-text">অনুমোদিত প্রতিনিধি (রঙিলা রূপ)</div>
      </div>
    </div>

    <div class="footer-bar">
      This is a computer generated invoice by Rongila Rup Kids Ecommerce. System Verified.
    </div>
  </div>

  <script>
    window.addEventListener('load', () => {
      setTimeout(() => {
        try { window.print(); } catch(e) {}
      }, 400);
    });
  </script>
</body>
</html>`;
}

/**
 * Fallback generator that safely wraps arbitrary innerContent and applies
 * strict QR code sizing & table formatting so it never looks stretched or deformed.
 */
function generateFallbackInvoiceHtml(innerContent: string, invoiceTitle: string = 'Rongila Rup Invoice'): string {
  return `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${invoiceTitle}</title>
  <style>
    @page {
      margin: 8mm;
      size: A4 portrait;
    }
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      background-color: #f8fafc;
      color: #0f172a;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
      padding: 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .print-controls {
      width: 100%;
      max-width: 680px;
      margin-bottom: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #831843;
      color: #fef08a;
      padding: 12px 18px;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    .print-btn {
      background: #fef08a;
      color: #831843;
      border: none;
      padding: 8px 18px;
      font-weight: 800;
      font-size: 14px;
      border-radius: 8px;
      cursor: pointer;
    }
    .invoice-card {
      background: #ffffff;
      width: 100%;
      max-width: 680px;
      border: 1px solid #cbd5e1;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    }
    /* CRITICAL: Constrain any QR code or image inside the invoice */
    img {
      max-width: 80px !important;
      max-height: 80px !important;
      width: 80px !important;
      height: 80px !important;
      object-fit: contain !important;
      display: inline-block !important;
    }
    /* Layout helpers */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 12px 0;
    }
    th, td {
      padding: 8px 10px;
      text-align: left;
    }
    th {
      border-bottom: 2px solid #cbd5e1;
      font-size: 11px;
      color: #64748b;
    }
    td {
      border-bottom: 1px solid #f1f5f9;
      font-size: 12px;
    }
    /* Hide buttons and interactive controls on paper */
    button, [role="button"], .no-print, .print-hidden {
      display: none !important;
    }
    @media print {
      body {
        background: transparent !important;
        padding: 0 !important;
      }
      .print-controls {
        display: none !important;
      }
      .invoice-card {
        border: none !important;
        box-shadow: none !important;
        max-width: 100% !important;
        padding: 0 !important;
      }
    }
  </style>
</head>
<body>
  <div class="print-controls">
    <div style="font-weight: bold; font-size: 14px;">রঙিলা রূপ কিডস - অফিসিয়াল মেমো ও ইনভয়েস</div>
    <button class="print-btn" onclick="window.print()">🖨️ প্রিন্ট / Save as PDF</button>
  </div>
  <div class="invoice-card" id="invoice-body">
    ${innerContent}
  </div>
  <script>
    window.addEventListener('load', () => {
      setTimeout(() => {
        try { window.print(); } catch(e) {}
      }, 350);
    });
  </script>
</body>
</html>`;
}

/**
 * Standard print function: handles iframe constraints by injecting print CSS
 * and triggering window.print(), falling back to a clean new window.
 */
export function printInvoiceElement(elementId: string = 'printable-area') {
  const elem = document.getElementById(elementId);
  if (!elem) {
    window.print();
    return;
  }

  let printStyle = document.getElementById('dynamic-print-style');
  if (!printStyle) {
    printStyle = document.createElement('style');
    printStyle.id = 'dynamic-print-style';
    document.head.appendChild(printStyle);
  }

  printStyle.innerHTML = `
    @media print {
      body > * {
        display: none !important;
      }
      #${elementId}, #${elementId} * {
        visibility: visible !important;
      }
      #${elementId} {
        display: block !important;
        position: absolute !important;
        left: 0 !important;
        top: 0 !important;
        width: 100% !important;
        max-width: 100% !important;
        background: white !important;
        color: black !important;
        border: none !important;
        margin: 0 !important;
        padding: 8mm 12mm !important;
        z-index: 999999 !important;
        box-shadow: none !important;
      }
      #${elementId} img {
        width: 70px !important;
        height: 70px !important;
        max-width: 70px !important;
        max-height: 70px !important;
        object-fit: contain !important;
      }
      .no-print, .print-hidden, button, [role="button"] {
        display: none !important;
        visibility: hidden !important;
      }
    }
  `;

  try {
    window.print();
  } catch (e) {
    console.warn('Direct print failed, opening in clean new window:', e);
    openInvoiceInNewTab(elementId);
  }
}

/**
 * Opens invoice in a pristine new browser tab where window.print() is 100% unrestricted.
 */
export function openInvoiceInNewTab(elementId: string = 'printable-area', title: string = 'Rongila-Rup-Invoice') {
  const elem = document.getElementById(elementId);
  if (!elem) return;

  const html = generateFallbackInvoiceHtml(elem.innerHTML, title);
  openHtmlInTab(html);
}

/**
 * Directly opens the dedicated professional invoice for an Order in a clean tab.
 */
export function openOrderInvoiceInNewTab(order: Order, qrCodeUrl: string = '', storePhone?: string) {
  const html = generateProfessionalInvoiceHtml(order, qrCodeUrl, { phone: storePhone });
  openHtmlInTab(html);
}

/**
 * Downloads the dedicated professional invoice as an offline HTML file.
 */
export function downloadOrderInvoiceHtml(order: Order, qrCodeUrl: string = '', storePhone?: string) {
  const html = generateProfessionalInvoiceHtml(order, qrCodeUrl, { phone: storePhone });
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const blobUrl = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = `Rongila-Rup-Invoice-${order.id}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
}

/**
 * Downloads arbitrary printable element as a standalone HTML document.
 */
export function downloadInvoiceHtml(elementId: string = 'printable-area', invoiceNumber: string = 'order') {
  const elem = document.getElementById(elementId);
  if (!elem) return;

  const html = generateFallbackInvoiceHtml(elem.innerHTML, `Invoice #${invoiceNumber} - Rongila Rup`);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const blobUrl = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = `Rongila-Rup-Invoice-${invoiceNumber}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
}

function openHtmlInTab(html: string) {
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const blobUrl = URL.createObjectURL(blob);

  const newWin = window.open(blobUrl, '_blank');
  if (!newWin) {
    const a = document.createElement('a');
    a.href = blobUrl;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}
