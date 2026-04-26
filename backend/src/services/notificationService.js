const twilio = require('twilio');
const logger = require('../utils/logger');
const Notification = require('../models/Notification');

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const sendWhatsApp = async (phone, template, params) => {
  try {
    const body = formatTemplate(template, params);
    
    const message = await client.messages.create({
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_FROM}`,
      to: `whatsapp:${phone}`,
      body: body,
    });

    await Notification.create({
      userId: params.userId || null,
      type: template,
      message: body,
      channel: 'WHATSAPP',
      status: 'SENT',
    });

    logger.info(`WhatsApp sent to ${phone}: ${message.sid}`);
  } catch (error) {
    logger.error(`WhatsApp failed to ${phone}:`, error);
    if (params.userId) {
      await Notification.create({
        userId: params.userId,
        type: template,
        message: `Failed to send: ${error.message}`,
        channel: 'WHATSAPP',
        status: 'FAILED',
      });
    }
  }
};

const formatTemplate = (template, params) => {
  const templates = {
    OTP: `Your Chocolate Mine OTP is ${params.otp}. Valid for 5 minutes.`,
    ORDER_CONFIRM: `Hi ${params.name}, your order #${params.orderId} for ₹${params.amount} is confirmed!`,
    STATUS_UPDATE: `Your order #${params.orderId} status updated to: ${params.status}`,
    PAYMENT_FAILED: `Payment for your order #${params.orderId} failed. Please try again.`,
  };
  return templates[template] || 'New notification from The Chocolate Mine';
};

module.exports = { sendWhatsApp };
