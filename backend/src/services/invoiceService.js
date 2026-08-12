const PDFDocument = require('pdfkit');
const Order = require('../models/Order');
const InShopOrder = require('../models/InShopOrder');
const emailService = require('./emailService');
const telegramService = require('./telegramService');
const logger = require('../utils/logger');
const fs = require('fs');
const path = require('path');

// ─── Original Brand Palette (Restored from theme.css) ─────────────────────────
const COLORS = {
  brandBg: '#EBDEDA', // Soft Rose Cream
  brandCard: '#F1E6E2', // Card Surface
  brandPrimary: '#4E2820', // Deep Cocoa
  brandText: '#2D1B17', // Main Foreground Text
  brandMuted: '#7C6660', // Muted Text
  brandAccent: '#C98F45', // Caramel Gold Accent
  border: '#D5C0BA', // Border Dividers
  white: '#FFFFFF',
};

// ─── Layout Constants ─────────────────────────────────────────────────────────
const PAGE_W = 595.28; // A4 Width
const PAGE_H = 841.89; // A4 Height
const MARGIN = 40;
const CONTENT_W = PAGE_W - MARGIN * 2; // 515.28 pt

// Table Columns configuration
const COL = {
  qty: MARGIN + 10,
  desc: MARGIN + 60,
  unitPrice: MARGIN + 310,
  amount: MARGIN + 410,
};
const COL_W = {
  qty: 40,
  desc: 240,
  unitPrice: 90,
  amount: 95,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function hRule(doc, y, color = COLORS.border, thickness = 1) {
  doc.save()
    .moveTo(MARGIN, y)
    .lineTo(PAGE_W - MARGIN, y)
    .lineWidth(thickness)
    .strokeColor(color)
    .stroke()
    .restore();
}

function getDisplayFlavor(item) {
  if (!item) return 'Standard';
  if (item.isCustomCake) return item.selectedFlavor || 'Custom';
  const flavor = item.selectedFlavor;
  if (!flavor || flavor.toLowerCase() === 'standard') {
    const cat = Array.isArray(item.category) ? item.category.join(' ').toLowerCase() : String(item.category || '').toLowerCase();
    const name = String(item.name || '').toLowerCase();
    if (cat.includes('chocolate') || name.includes('chocolate') || name.includes('forest') || name.includes('fudge') || name.includes('truffle') || name.includes('oreo') || name.includes('caramel')) return 'Chocolate';
    if (cat.includes('vanilla') || name.includes('vanilla') || name.includes('pineapple') || name.includes('butterscotch') || name.includes('strawberry') || name.includes('blueberry') || name.includes('biscoff') || name.includes('jamun') || name.includes('gulkand') || name.includes('rasmalai') || name.includes('honey') || name.includes('almond') || name.includes('lychee') || name.includes('rose')) return 'Vanilla';
    if (cat.includes('red-velvet') || cat.includes('red velvet') || name.includes('red-velvet') || name.includes('red velvet')) return 'Red Velvet';
    if (cat.includes('bento') || name.includes('bento')) return 'Bento';
    return 'Standard';
  }
  return flavor;
}

exports.generateInvoiceBuffer = async (orderId) => {
  try {
    let order = await Order.findById(orderId).populate('userId');
    if (!order) {
      order = await InShopOrder.findById(orderId).populate('userId');
    }
    if (!order) throw new Error('Order not found');

    if (!order.invoiceNumber) {
      order.invoiceNumber = `INV-${Date.now()}`;
      try {
        await order.save();
      } catch (err) {
        // Ignore background save error
      }
    }

    const doc = new PDFDocument({ margin: 0, size: 'A4', bufferPages: true });
    const buffers = [];
    doc.on('data', buffers.push.bind(buffers));

    // ── Soft Rose Cream Canvas Fill ───────────────────────────────────────────
    doc.rect(0, 0, PAGE_W, PAGE_H).fill(COLORS.brandBg);

    // Top Accent Border Bar
    doc.rect(MARGIN, 20, CONTENT_W, 4).fill(COLORS.brandPrimary);

    // ── 1. HEADER SECTION ────────────────────────────────────────────────────
    const HEADER_TOP = 38;

    // Resolve 'light logo.png' image file
    const logoPaths = [
      path.join(__dirname, '../assets/light logo.png'),
      path.join(__dirname, '../../../frontend/src/assets/light logo.png'),
      path.join(__dirname, '../../frontend/src/assets/light logo.png'),
      path.join(__dirname, '../assets/logo.png')
    ];

    let activeLogo = null;
    for (const p of logoPaths) {
      if (fs.existsSync(p)) {
        activeLogo = p;
        break;
      }
    }

    // Render image with strict fit constraints to prevent text overlap
    if (activeLogo) {
      doc.image(activeLogo, MARGIN, HEADER_TOP, { fit: [150, 50] });
    } else {
      doc.font('Helvetica-Bold').fontSize(16).fillColor(COLORS.brandPrimary).text('THE CHOCOLATE MINE', MARGIN, HEADER_TOP);
      doc.font('Helvetica').fontSize(9).fillColor(COLORS.brandAccent).text('PREMIUM ARTISAN BAKERY', MARGIN, HEADER_TOP + 18);
    }

    // Right Side Metadata
    const INV_W = 180;
    const INV_X = PAGE_W - MARGIN - INV_W;

    doc.font('Helvetica-Bold').fontSize(24).fillColor(COLORS.brandPrimary)
      .text('INVOICE', INV_X, HEADER_TOP, { width: INV_W, align: 'right' });

    const invoiceDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    });

    doc.font('Helvetica-Bold').fontSize(8.5).fillColor(COLORS.brandMuted)
      .text('Invoice No:', INV_X, HEADER_TOP + 32, { width: 65, align: 'left' });
    doc.font('Helvetica').fontSize(8.5).fillColor(COLORS.brandText)
      .text(order.invoiceNumber, INV_X + 65, HEADER_TOP + 32, { width: INV_W - 65, align: 'right' });

    doc.font('Helvetica-Bold').fontSize(8.5).fillColor(COLORS.brandMuted)
      .text('Date:', INV_X, HEADER_TOP + 46, { width: 65, align: 'left' });
    doc.font('Helvetica').fontSize(8.5).fillColor(COLORS.brandText)
      .text(invoiceDate, INV_X + 65, HEADER_TOP + 46, { width: INV_W - 65, align: 'right' });

    // Divider line below header
    hRule(doc, 105, COLORS.brandPrimary, 1.25);

    // ── 2. BILLED TO & PAYMENT DETAILS ───────────────────────────────────────
    const BILL_TOP = 118;
    const COL_WIDTH = (CONTENT_W - 20) / 2;

    // Left Column: Bill To
    doc.font('Helvetica-Bold').fontSize(8.5).fillColor(COLORS.brandAccent)
      .text('BILL TO', MARGIN, BILL_TOP);

    const clientName = (order.address && order.address.fullName) || (order.userId && order.userId.name) || order.customerName || 'Walk-in Customer';
    const clientPhone = (order.address && order.address.phone) || (order.userId && order.userId.phone) || order.customerPhone || '—';

    // Deduplicate address string parts
    const rawAddrParts = [
      order.address && order.address.houseNo,
      order.address && order.address.street,
      order.address && order.address.city,
      order.address && order.address.state,
      order.address && order.address.pincode,
    ].filter(Boolean);
    const uniqueAddr = [...new Set(rawAddrParts)].join(', ');

    doc.font('Helvetica-Bold').fontSize(10.5).fillColor(COLORS.brandText)
      .text(clientName, MARGIN, BILL_TOP + 14, { width: COL_WIDTH });

    doc.font('Helvetica').fontSize(8.5).fillColor(COLORS.brandMuted)
      .text('Phone: ' + clientPhone, MARGIN, BILL_TOP + 28, { width: COL_WIDTH })
      .text(uniqueAddr || 'Counter Sale', MARGIN, BILL_TOP + 40, { width: COL_WIDTH, height: 32, lineGap: 2 });

    // Right Column: Payment Badge Container
    const BADGE_X = MARGIN + COL_WIDTH + 20;

    doc.font('Helvetica-Bold').fontSize(8.5).fillColor(COLORS.brandAccent)
      .text('PAYMENT DETAILS', BADGE_X, BILL_TOP);

    doc.font('Helvetica-Bold').fontSize(8.5).fillColor(COLORS.brandMuted)
      .text('Payment Method:', BADGE_X, BILL_TOP + 14);
    doc.font('Helvetica').fontSize(8.5).fillColor(COLORS.brandText)
      .text((order.paymentMethod || '—').toUpperCase(), BADGE_X + 90, BILL_TOP + 14);

    doc.font('Helvetica-Bold').fontSize(8.5).fillColor(COLORS.brandMuted)
      .text('Order Ref ID:', BADGE_X, BILL_TOP + 28);
    doc.font('Helvetica').fontSize(8.5).fillColor(COLORS.brandText)
      .text(order.orderNumber || order._id.toString().slice(-8).toUpperCase(), BADGE_X + 90, BILL_TOP + 28);

    hRule(doc, 190, COLORS.border, 1);

    // ── 3. ITEMIZED TABLE ─────────────────────────────────────────────────────
    const TABLE_TOP = 205;
    const HEADER_H = 24;

    doc.rect(MARGIN, TABLE_TOP, CONTENT_W, HEADER_H).fill(COLORS.brandPrimary);

    const HL_Y = TABLE_TOP + 7;
    doc.font('Helvetica-Bold').fontSize(8.5).fillColor(COLORS.white);
    doc.text('QTY', COL.qty, HL_Y, { width: COL_W.qty, align: 'center' });
    doc.text('DESCRIPTION', COL.desc, HL_Y, { width: COL_W.desc, align: 'left' });
    doc.text('UNIT PRICE', COL.unitPrice, HL_Y, { width: COL_W.unitPrice, align: 'right' });
    doc.text('AMOUNT', COL.amount, HL_Y, { width: COL_W.amount, align: 'right' });

    let rowY = TABLE_TOP + HEADER_H;
    const ROW_PAD = 8;

    order.items.forEach(function (item, idx) {
      const qty = Number(item.qty || 0);
      const finalUnitPrice = Number(item.finalPrice ?? item.price ?? 0);
      let addonTotal = 0;
      if (item.addons && Array.isArray(item.addons)) {
        addonTotal = item.addons.reduce((sum, a) => sum + (Number(a.price || 0) * (a.qty || 1)), 0) * qty;
      }
      const total = (qty * finalUnitPrice) + addonTotal;
      const nameText = item.name || '—';

      const colorDisp = item.selectedColor ? `Color: ${item.selectedColor}` : '';
      const weightDisp = item.selectedWeight ? `Weight: ${item.selectedWeight}` : ((item.isCustomCake && item.customDetails && item.customDetails.weight) ? `Weight: ${item.customDetails.weight}` : '');
      const flavorDisp = item.selectedFlavor ? `Flavor: ${item.selectedFlavor}` : (getDisplayFlavor(item) !== 'Standard' ? `Flavor: ${getDisplayFlavor(item)}` : '');

      const subParts = [colorDisp, weightDisp, flavorDisp].filter(Boolean);
      if (Number(item.price) > finalUnitPrice) {
        subParts.push(`Original: Rs. ${Number(item.price).toFixed(2)}`);
      }
      let subtitle = subParts.length > 0 ? subParts.join(' · ') : '';

      if (item.addons && Array.isArray(item.addons) && item.addons.length > 0) {
        const addonStr = item.addons.map(a => `+ Addon: ${a.name} (x${a.qty || 1}) - Rs. ${(a.price * (a.qty || 1)).toFixed(2)}`).join('\n');
        subtitle = subtitle ? `${subtitle}\n${addonStr}` : addonStr;
      }

      const nameH = doc.heightOfString(nameText, { font: 'Helvetica-Bold', fontSize: 9, width: COL_W.desc });
      const subH = subtitle ? doc.heightOfString(subtitle, { font: 'Helvetica-Oblique', fontSize: 7.5, width: COL_W.desc }) + 2 : 0;
      const rowH = Math.max(nameH + subH + ROW_PAD * 2, 26);

      // Alternating row card background
      doc.rect(MARGIN, rowY, CONTENT_W, rowH)
        .fill(idx % 2 === 0 ? COLORS.white : COLORS.brandCard);

      // Row outline border
      doc.rect(MARGIN, rowY, CONTENT_W, rowH).lineWidth(0.5).strokeColor(COLORS.border).stroke();

      const cy = rowY + ROW_PAD;
      doc.font('Helvetica').fontSize(9).fillColor(COLORS.brandText);
      doc.text(qty.toString(), COL.qty, cy, { width: COL_W.qty, align: 'center' });

      doc.font('Helvetica-Bold').fontSize(9).fillColor(COLORS.brandText);
      doc.text(nameText, COL.desc, cy, { width: COL_W.desc, align: 'left' });

      if (subtitle) {
        doc.font('Helvetica-Oblique').fontSize(7.5).fillColor(COLORS.brandMuted);
        doc.text(subtitle, COL.desc, cy + nameH + 2, { width: COL_W.desc, align: 'left' });
      }

      doc.font('Helvetica').fontSize(9).fillColor(COLORS.brandText);
      doc.text('Rs. ' + finalUnitPrice.toFixed(2), COL.unitPrice, cy, { width: COL_W.unitPrice, align: 'right' });
      doc.text('Rs. ' + total.toFixed(2), COL.amount, cy, { width: COL_W.amount, align: 'right' });

      rowY += rowH;
    });

    // ── 4. SUMMARY CALCULATIONS & TOTALS ─────────────────────────────────────
    const TOT_LBL_X = PAGE_W - MARGIN - 240;
    const TOT_LBL_W = 130;
    const TOT_VAL_X = TOT_LBL_X + TOT_LBL_W;
    const TOT_VAL_W = 110;
    const LINE_H = 18;

    let ty = rowY + 15;

    function summaryLine(label, value) {
      doc.font('Helvetica').fontSize(8.5).fillColor(COLORS.brandMuted)
        .text(label, TOT_LBL_X, ty, { width: TOT_LBL_W, align: 'left' });
      doc.font('Helvetica-Bold').fontSize(8.5).fillColor(COLORS.brandText)
        .text(value, TOT_VAL_X, ty, { width: TOT_VAL_W, align: 'right' });
      ty += LINE_H;
    }

    summaryLine('Subtotal:', 'Rs. ' + Number(order.subtotal || 0).toFixed(2));

    if (order.discount > 0) {
      summaryLine('Discount:', '-Rs. ' + Number(order.discount || 0).toFixed(2));
    }

    summaryLine('Delivery Charges:', 'Rs. ' + Number(order.deliveryCharge || 0).toFixed(2));

    if (order.convenienceFee > 0) {
      summaryLine('Convenience Fee:', 'Rs. ' + Number(order.convenienceFee || 0).toFixed(2));
    }

    summaryLine('Tax (GST 5% Included):', 'Included');

    ty += 4;
    hRule(doc, ty, COLORS.brandPrimary, 1);
    ty += 6;

    // Grand Total Deep Cocoa Bar
    const GT_H = 30;
    doc.rect(MARGIN, ty, CONTENT_W, GT_H).fill(COLORS.brandPrimary);

    doc.font('Helvetica-Bold').fontSize(10).fillColor(COLORS.white)
      .text('GRAND TOTAL', MARGIN + 12, ty + 10, { width: CONTENT_W * 0.5, align: 'left' })
      .text('Rs. ' + Number(order.total || 0).toFixed(2), MARGIN + CONTENT_W * 0.5, ty + 10, { width: CONTENT_W * 0.5 - 24, align: 'right' });

    // ── 5. FOOTER ────────────────────────────────────────────────────────────
    const FOOTER_TOP = PAGE_H - 65;
    hRule(doc, FOOTER_TOP, COLORS.border, 1);

    doc.font('Helvetica-Bold').fontSize(9.5).fillColor(COLORS.brandPrimary)
      .text('Thank you for choosing The Chocolate Mine!', MARGIN, FOOTER_TOP + 12, { width: CONTENT_W, align: 'center' });
    doc.font('Helvetica').fontSize(8).fillColor(COLORS.brandMuted)
      .text('Freshly baked with care  ·  Every bite tells a story', MARGIN, FOOTER_TOP + 26, { width: CONTENT_W, align: 'center' });

    doc.rect(MARGIN, PAGE_H - 20, CONTENT_W, 4).fill(COLORS.brandPrimary);

    doc.end();

    return new Promise(function (resolve) {
      doc.on('end', function () { resolve(Buffer.concat(buffers)); });
    });

  } catch (err) {
    logger.error('Invoice Buffer Error:', err.message);
    throw err;
  }
};

exports.sendInvoiceAfterDelivery = async (orderId, forceResend = false) => {
  try {
    const order = await Order.findById(orderId).populate('userId');
    if (!order) return false;
    if (order.invoiceSent && !forceResend) return true;

    const pdfBuffer = await exports.generateInvoiceBuffer(orderId);
    const emailInfo = await emailService.sendInvoiceEmail(order.userId.email, order, pdfBuffer);

    if (emailInfo) {
      await telegramService.sendInvoiceReady(order.userId.phone, order.orderNumber, 'Email Sent');
      order.invoiceSent = true;
      order.invoiceSentAt = new Date();
      await order.save();
      return true;
    }
    return false;
  } catch (err) {
    logger.error('Send Invoice Error:', err.message);
    return false;
  }
};