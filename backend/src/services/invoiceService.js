const PDFDocument = require('pdfkit');
const Order = require('../models/Order');
const emailService = require('./emailService');
const telegramService = require('./telegramService');
const logger = require('../utils/logger');
const fs = require('fs');
const path = require('path');

// ─── Brand Palette ────────────────────────────────────────────────────────────
const COLORS = {
  brand:        '#5C3317',
  brandLight:   '#7B4A2D',
  brandBg:      '#FDF6F0',
  accent:       '#C8956C',
  accentLight:  '#EDD5BE',
  text:         '#2C1A0E',
  textMuted:    '#7A6055',
  divider:      '#D9C4B5',
  white:        '#FFFFFF',
  grandTotalBg: '#5C3317',
};

// ─── Layout constants ─────────────────────────────────────────────────────────
const PAGE_W    = 595.28;
const PAGE_H    = 841.89;
const MARGIN    = 45;
const CONTENT_W = PAGE_W - MARGIN * 2;   // 505.28 pt

// Table columns — QTY(40) + DESC(270) + UNIT PRICE(100) + AMOUNT(95) = 505 ✓
const COL = {
  qty:       MARGIN,
  desc:      MARGIN + 40,
  unitPrice: MARGIN + 310,
  amount:    MARGIN + 410,
};
const COL_W = {
  qty:       40,
  desc:      270,
  unitPrice: 100,
  amount:    95,   // right edge = 45 + 410 + 95 = 550 ≤ 550.28 ✓
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function hRule(doc, y, color, thickness) {
  color     = color     || '#D9C4B5';
  thickness = thickness || 0.75;
  doc.save()
     .moveTo(MARGIN, y).lineTo(PAGE_W - MARGIN, y)
     .lineWidth(thickness).strokeColor(color).stroke()
     .restore();
}

exports.generateInvoiceBuffer = async (orderId) => {
  try {
    const order = await Order.findById(orderId).populate('userId');
    if (!order) throw new Error('Order not found');

    if (!order.invoiceNumber) {
      order.invoiceNumber = `INV-${Date.now()}`;
      await order.save();
    }

    const doc = new PDFDocument({ margin: 0, size: 'A4', bufferPages: true });
    const buffers = [];
    doc.on('data', buffers.push.bind(buffers));

    // ── Cream background ──────────────────────────────────────────────────────
    doc.rect(0, 0, PAGE_W, PAGE_H).fill(COLORS.brandBg);

    // ── Top brand bar ─────────────────────────────────────────────────────────
    doc.rect(0, 0, PAGE_W, 7).fill(COLORS.brand);

    // ─────────────────────────────────────────────────────────────────────────
    //  HEADER  (logo + name LEFT  |  INVOICE meta RIGHT)
    // ─────────────────────────────────────────────────────────────────────────
    const HEADER_TOP = 24;

    // Logo — search standard location first, then sibling of this file
    const candidatePaths = [
      path.join(process.cwd(), 'public', 'logo.png'),
      path.join(__dirname, 'logo.png'),
    ];
    const logoPath = candidatePaths.find(function(p){ return fs.existsSync(p); });
    if (logoPath) {
      doc.image(logoPath, MARGIN, HEADER_TOP, { width: 58, height: 58 });
    }

    const brandX = logoPath ? MARGIN + 68 : MARGIN;
    doc.font('Helvetica-Bold').fontSize(17).fillColor(COLORS.brand)
       .text('THE CHOCOLATE MINE', brandX, HEADER_TOP + 6, { lineBreak: false });
    doc.font('Helvetica').fontSize(8.5).fillColor(COLORS.textMuted)
       .text('Premium Artisan Bakery',         brandX, HEADER_TOP + 28, { lineBreak: false })
       .text('Freshly baked with love & care', brandX, HEADER_TOP + 41, { lineBreak: false });

    // Right: large INVOICE label
    const INV_W = 170;
    const INV_X = PAGE_W - MARGIN - INV_W;
    doc.font('Helvetica-Bold').fontSize(30).fillColor(COLORS.brand)
       .text('INVOICE', INV_X, HEADER_TOP, { width: INV_W, align: 'right', lineBreak: false });

    const invoiceDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'long', year: 'numeric',
    });
    doc.font('Helvetica-Bold').fontSize(8.5).fillColor(COLORS.textMuted)
       .text('Invoice No.', INV_X, HEADER_TOP + 44, { width: INV_W, align: 'right', lineBreak: false });
    doc.font('Helvetica').fontSize(8.5).fillColor(COLORS.text)
       .text(order.invoiceNumber, INV_X, HEADER_TOP + 56, { width: INV_W, align: 'right', lineBreak: false });
    doc.font('Helvetica-Bold').fontSize(8.5).fillColor(COLORS.textMuted)
       .text('Date', INV_X, HEADER_TOP + 70, { width: INV_W, align: 'right', lineBreak: false });
    doc.font('Helvetica').fontSize(8.5).fillColor(COLORS.text)
       .text(invoiceDate, INV_X, HEADER_TOP + 82, { width: INV_W, align: 'right', lineBreak: false });

    // Divider
    hRule(doc, 108, COLORS.brand, 1.5);

    // ─────────────────────────────────────────────────────────────────────────
    //  BILL TO
    // ─────────────────────────────────────────────────────────────────────────
    const BILL_TOP = 122;

    doc.font('Helvetica-Bold').fontSize(8).fillColor(COLORS.accent)
       .text('BILL TO', MARGIN, BILL_TOP);

    var addrLine = [
      order.address && order.address.houseNo,
      order.address && order.address.street,
      order.address && order.address.city,
      order.address && order.address.pincode,
    ].filter(Boolean).join(', ');

    const BILL_NAME_Y  = BILL_TOP + 13;
    const BILL_TEXT_W  = 280;

    doc.font('Helvetica-Bold').fontSize(12).fillColor(COLORS.text)
       .text((order.address && order.address.fullName) || '—', MARGIN, BILL_NAME_Y, { width: BILL_TEXT_W });

    var nameH = doc.heightOfString((order.address && order.address.fullName) || '—',
                  { font: 'Helvetica-Bold', fontSize: 12, width: BILL_TEXT_W });

    doc.font('Helvetica').fontSize(9.5).fillColor(COLORS.textMuted)
       .text((order.address && order.address.phone) || '—', MARGIN, BILL_NAME_Y + nameH + 2,  { width: BILL_TEXT_W })
       .text(addrLine || '—',                               MARGIN, BILL_NAME_Y + nameH + 16, { width: BILL_TEXT_W });

    // Payment badge
    const BADGE_W = 155;
    const BADGE_X = PAGE_W - MARGIN - BADGE_W;
    doc.roundedRect(BADGE_X, BILL_TOP + 10, BADGE_W, 24, 4).fill(COLORS.accentLight);
    doc.font('Helvetica-Bold').fontSize(9).fillColor(COLORS.brandLight)
       .text('Payment: ' + (order.paymentMethod || '—'), BADGE_X, BILL_TOP + 18,
             { width: BADGE_W, align: 'center', lineBreak: false });

    hRule(doc, 206, COLORS.divider);

    // ─────────────────────────────────────────────────────────────────────────
    //  TABLE HEADER
    // ─────────────────────────────────────────────────────────────────────────
    const TABLE_TOP = 220;
    const HEADER_H  = 28;

    doc.rect(MARGIN, TABLE_TOP, CONTENT_W, HEADER_H).fill(COLORS.brand);

    var HL_Y = TABLE_TOP + 9;
    doc.font('Helvetica-Bold').fontSize(8.5).fillColor(COLORS.white);
    doc.text('QTY',         COL.qty,       HL_Y, { width: COL_W.qty,       align: 'center', lineBreak: false });
    doc.text('DESCRIPTION', COL.desc,      HL_Y, { width: COL_W.desc,      align: 'left',   lineBreak: false });
    doc.text('UNIT PRICE',  COL.unitPrice, HL_Y, { width: COL_W.unitPrice, align: 'right',  lineBreak: false });
    doc.text('AMOUNT',      COL.amount,    HL_Y, { width: COL_W.amount,    align: 'right',  lineBreak: false });

    // ─────────────────────────────────────────────────────────────────────────
    //  PRODUCT ROWS
    // ─────────────────────────────────────────────────────────────────────────
    var rowY   = TABLE_TOP + HEADER_H;
    var ROW_PAD = 8;

    order.items.forEach(function(item, idx) {
      var qty   = Number(item.qty   || 0);
      var price = Number(item.price || 0);
      var total = qty * price;

      var nameText = item.name || '—';
      var descH = doc.heightOfString(nameText,
                    { font: 'Helvetica', fontSize: 9.5, width: COL_W.desc });
      var rowH = Math.max(descH + ROW_PAD * 2, 28);

      doc.rect(MARGIN, rowY, CONTENT_W, rowH)
         .fill(idx % 2 === 0 ? COLORS.white : COLORS.accentLight);

      var cy = rowY + ROW_PAD;
      doc.font('Helvetica').fontSize(9.5).fillColor(COLORS.text);
      doc.text(qty.toString(),              COL.qty,       cy, { width: COL_W.qty,       align: 'center', lineBreak: false });
      doc.text(nameText,                    COL.desc,      cy, { width: COL_W.desc,      align: 'left'   });
      doc.text('Rs. ' + price.toFixed(2),   COL.unitPrice, cy, { width: COL_W.unitPrice, align: 'right',  lineBreak: false });
      doc.text('Rs. ' + total.toFixed(2),   COL.amount,    cy, { width: COL_W.amount,    align: 'right',  lineBreak: false });

      rowY += rowH;
    });

    hRule(doc, rowY, COLORS.brand, 1.5);

    // ─────────────────────────────────────────────────────────────────────────
    //  TOTALS  (right-side summary, values right-aligned inside safe bounds)
    // ─────────────────────────────────────────────────────────────────────────
    var TOT_LBL_X  = PAGE_W - MARGIN - 230;   // label column start
    var TOT_LBL_W  = 130;
    var TOT_VAL_X  = TOT_LBL_X + TOT_LBL_W;
    var TOT_VAL_W  = 100;                      // right edge = TOT_VAL_X + 100 ≤ PAGE_W-MARGIN ✓
    var LINE_H     = 22;

    var ty = rowY + 18;

    function summaryLine(label, value) {
      doc.font('Helvetica').fontSize(9.5).fillColor(COLORS.textMuted)
         .text(label, TOT_LBL_X, ty, { width: TOT_LBL_W, align: 'left',  lineBreak: false })
         .text(value, TOT_VAL_X, ty, { width: TOT_VAL_W, align: 'right', lineBreak: false });
      ty += LINE_H;
    }

    summaryLine('Subtotal',        'Rs. ' + Number(order.subtotal       || 0).toFixed(2));
    if (order.discount > 0) {
      summaryLine('Discount',      '-Rs. ' + Number(order.discount      || 0).toFixed(2));
    }
    summaryLine('Delivery',        'Rs. ' + Number(order.deliveryCharge || 0).toFixed(2));
    summaryLine('Convenience Fee', 'Rs. ' + Number(order.convenienceFee || 0).toFixed(2));
    summaryLine('GST',             'Rs. ' + Number(order.gst            || 0).toFixed(2));

    hRule(doc, ty, COLORS.divider);
    ty += 6;

    // Grand total — full content width, impossible to clip
    var GT_H = 34;
    doc.rect(MARGIN, ty, CONTENT_W, GT_H).fill(COLORS.grandTotalBg);

    doc.font('Helvetica-Bold').fontSize(11).fillColor(COLORS.white)
       .text('GRAND TOTAL',
             MARGIN + 12, ty + 11,
             { width: CONTENT_W * 0.55, align: 'left',  lineBreak: false })
       .text('Rs. ' + Number(order.total || 0).toFixed(2),
             MARGIN + CONTENT_W * 0.55, ty + 11,
             { width: CONTENT_W * 0.45 - 12, align: 'right', lineBreak: false });

    // ─────────────────────────────────────────────────────────────────────────
    //  FOOTER
    // ─────────────────────────────────────────────────────────────────────────
    var FOOTER_TOP = PAGE_H - 68;
    hRule(doc, FOOTER_TOP, COLORS.divider);

    doc.font('Helvetica-Bold').fontSize(11).fillColor(COLORS.brand)
       .text('Thank you for choosing The Chocolate Mine!',
             MARGIN, FOOTER_TOP + 12, { width: CONTENT_W, align: 'center' });
    doc.font('Helvetica').fontSize(8.5).fillColor(COLORS.textMuted)
       .text('Freshly baked with care  ·  Every bite tells a story',
             MARGIN, FOOTER_TOP + 30, { width: CONTENT_W, align: 'center' });

    // Bottom brand bar
    doc.rect(0, PAGE_H - 7, PAGE_W, 7).fill(COLORS.brand);

    doc.end();

    return new Promise(function(resolve) {
      doc.on('end', function(){ resolve(Buffer.concat(buffers)); });
    });

  } catch (err) {
    logger.error('Invoice Buffer Error:', err.message);
    throw err;
  }
};

exports.sendInvoiceAfterDelivery = async (orderId, forceResend) => {
  forceResend = forceResend || false;
  try {
    const order = await Order.findById(orderId).populate('userId');

    if (!order) return false;

    if (order.invoiceSent && !forceResend) return true;

    const pdfBuffer = await exports.generateInvoiceBuffer(orderId);

    const emailInfo = await emailService.sendInvoiceEmail(
      order.userId.email,
      order,
      pdfBuffer
    );

    if (emailInfo) {
      await telegramService.sendInvoiceReady(
        order.userId.phone,
        order.orderNumber,
        'Email Sent'
      );

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