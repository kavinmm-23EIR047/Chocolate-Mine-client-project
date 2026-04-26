const PDFDocument = require('pdfkit');
const Order = require('../models/Order');
const emailService = require('./emailService');
const telegramService = require('./telegramService');
const logger = require('../utils/logger');
const fs = require('fs');
const path = require('path');

exports.generateInvoiceBuffer = async (orderId) => {
  try {
    const order = await Order.findById(orderId).populate('userId');

    if (!order) {
      throw new Error('Order not found');
    }

    // Generate invoice number once
    if (!order.invoiceNumber) {
      order.invoiceNumber = `INV-${Date.now()}`;
      await order.save();
    }

    const doc = new PDFDocument({
      margin: 50,
      size: 'A4'
    });

    const buffers = [];

    doc.on('data', buffers.push.bind(buffers));

    const logoPath = path.join(process.cwd(), 'public', 'logo.png');

    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 50, 40, { width: 50 });
    }

    // Header
    doc
      .font('Helvetica-Bold')
      .fontSize(26)
      .fillColor('#000')
      .text('THE CHOCOLATE MINE', 120, 45);

    doc
      .font('Helvetica')
      .fontSize(13)
      .fillColor('#444')
      .text('Premium Bakery Invoice', 120, 78);

    doc.moveTo(50, 115).lineTo(550, 115).stroke();

    // Invoice Info
    doc
      .fontSize(12)
      .fillColor('#000')
      .font('Helvetica')
      .text(`Invoice No: ${order.invoiceNumber}`, 50, 135)
      .text(
        `Date: ${new Date(order.createdAt).toLocaleDateString()}`,
        420,
        135
      );

    // Billing
    doc
      .font('Helvetica-Bold')
      .fontSize(13)
      .text('Bill To:', 50, 180);

    doc
      .font('Helvetica')
      .fontSize(12)
      .text(order.address?.fullName || '-', 50, 205)
      .text(order.address?.phone || '-', 50, 225)
      .text(
        `${order.address?.houseNo || ''}, ${order.address?.street || ''}, ${order.address?.city || ''}`,
        50,
        245
      )
      .text(order.address?.pincode || '-', 50, 265);

    // Table Header
    const tableTop = 330;

    doc
      .rect(50, tableTop, 500, 28)
      .fill('#1f77b4');

    doc
      .fillColor('white')
      .font('Helvetica-Bold')
      .fontSize(11)
      .text('Item', 60, tableTop + 8)
      .text('Qty', 260, tableTop + 8)
      .text('Price', 350, tableTop + 8)
      .text('Total', 470, tableTop + 8);

    let y = tableTop + 40;

    doc.fillColor('black').font('Helvetica');

    order.items.forEach((item) => {
      const qty = Number(item.qty || 0);
      const price = Number(item.price || 0);
      const total = qty * price;

      doc.text(item.name || '-', 60, y);
      doc.text(qty.toString(), 260, y);
      doc.text(`Rs. ${price.toFixed(2)}`, 350, y);
      doc.text(`Rs. ${total.toFixed(2)}`, 470, y);

      y += 25;
    });

    // Totals
    y += 20;

    const totalsX = 340;

    doc.text(`Subtotal: Rs. ${Number(order.subtotal || 0).toFixed(2)}`, totalsX, y);
    y += 22;

    if (order.discount > 0) {
      doc.text(`Discount: -Rs. ${Number(order.discount).toFixed(2)}`, totalsX, y);
      y += 22;
    }

    doc.text(`Delivery: Rs. ${Number(order.deliveryCharge || 0).toFixed(2)}`, totalsX, y);
    y += 22;

    doc.text(
      `Convenience Fee: Rs. ${Number(order.convenienceFee || 0).toFixed(2)}`,
      totalsX,
      y
    );
    y += 22;

    doc.text(`GST: Rs. ${Number(order.gst || 0).toFixed(2)}`, totalsX, y);
    y += 30;

    doc
      .font('Helvetica-Bold')
      .fontSize(14)
      .text(`Grand Total: Rs. ${Number(order.total || 0).toFixed(2)}`, totalsX, y);

    // Footer
    y += 60;

    doc
      .font('Helvetica')
      .fontSize(12)
      .text(`Payment Mode: ${order.paymentMethod}`, 50, y);

    y += 35;

    doc
      .fontSize(10)
      .fillColor('#666')
      .text(
        'Thank you for ordering with The Chocolate Mine.',
        50,
        y
      );

    doc.end();

    return new Promise((resolve) => {
      doc.on('end', () => resolve(Buffer.concat(buffers)));
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