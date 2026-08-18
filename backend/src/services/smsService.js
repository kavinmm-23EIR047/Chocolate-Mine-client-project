const axios = require('axios');
const logger = require('../utils/logger');

/**
 * Read SMS credentials dynamically so env vars set on Render (or any
 * live host) are always picked up — even if they weren't present when
 * the module was first required.
 */
const getSmsConfig = () => ({
  url: process.env.SMS_GATEWAY_URL || 'https://api.textbee.dev/api/v1/gateway',
  apiKey: process.env.SMS_GATEWAY_API_KEY,
  deviceId: process.env.SMS_GATEWAY_DEVICE_ID,
});

// Log once at startup so you can immediately see in Render logs whether
// the credentials are loaded.
(() => {
  const { apiKey, deviceId } = getSmsConfig();
  if (!apiKey || !deviceId) {
    logger.warn('[SMS] ⚠️  SMS_GATEWAY_API_KEY or SMS_GATEWAY_DEVICE_ID is NOT set — SMS will not work!');
  } else {
    logger.info(`[SMS] ✅ SMS gateway configured (API key: ${apiKey.substring(0, 8)}…, Device: ${deviceId.substring(0, 8)}…)`);
  }
})();

/**
 * Normalize Indian phone numbers to +91XXXXXXXXXX format.
 * Handles: 9876543210, 919876543210, +919876543210, 09876543210
 */
const normalizeIndianPhone = (phone) => {
  if (!phone) return null;
  let cleaned = String(phone).replace(/[\s\-\(\)]/g, '');

  // Remove leading +
  if (cleaned.startsWith('+')) cleaned = cleaned.substring(1);
  // Remove leading 0
  if (cleaned.startsWith('0')) cleaned = cleaned.substring(1);

  // If starts with 91 and is 12 digits, strip 91
  if (cleaned.startsWith('91') && cleaned.length === 12) {
    cleaned = cleaned.substring(2);
  }

  // Must be exactly 10 digits now
  if (!/^\d{10}$/.test(cleaned)) return null;

  return `+91${cleaned}`;
};

/**
 * Send SMS via TextBee gateway.
 * @param {string} phone - Recipient phone number (any Indian format)
 * @param {string} message - SMS text content
 * @returns {Object} { success: boolean, error?: string }
 */
const sendSMS = async (phone, message) => {
  const normalizedPhone = normalizeIndianPhone(phone);
  if (!normalizedPhone) {
    logger.warn(`[SMS] Invalid phone number: ${phone}`);
    return { success: false, error: 'Invalid phone number format' };
  }

  // Read credentials fresh every time
  const { url: gatewayUrl, apiKey, deviceId } = getSmsConfig();

  if (!apiKey || !deviceId) {
    logger.warn('[SMS] SMS_GATEWAY_API_KEY or SMS_GATEWAY_DEVICE_ID not configured');
    logger.warn(`[SMS] Current env check → API_KEY present: ${!!apiKey}, DEVICE_ID present: ${!!deviceId}`);
    return { success: false, error: 'SMS gateway not configured' };
  }

  try {
    const url = `${gatewayUrl}/devices/${deviceId}/send-sms`;
    logger.info(`[SMS] Sending to ${normalizedPhone} via device ${deviceId.substring(0, 8)}…`);
    const response = await axios.post(
      url,
      { recipients: [normalizedPhone], message: message },
      {
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json',
        },
        timeout: 15000,
      }
    );

    if (response.data && (response.status === 200 || response.status === 201)) {
      logger.info(`[SMS] Sent successfully to ${normalizedPhone}: ${JSON.stringify(response.data)}`);
      return { success: true, data: response.data };
    }

    logger.warn(`[SMS] Unexpected response: ${JSON.stringify(response.data)}`);
    return { success: false, error: 'Unexpected SMS gateway response' };
  } catch (err) {
    const errMsg = err.response?.data?.message || err.response?.data?.error || err.message || 'Unknown SMS error';
    logger.error(`[SMS] Failed to send to ${normalizedPhone}: ${errMsg}`);
    if (err.response) {
      logger.error(`[SMS] Response status: ${err.response.status}, data: ${JSON.stringify(err.response.data)}`);
    }
    return { success: false, error: errMsg };
  }
};

/**
 * Send Delivery OTP SMS to customer.
 * @param {string} phone - Customer phone number
 * @param {string} otp - 6-digit OTP code
 * @returns {Object} { success: boolean, error?: string }
 */
const sendDeliveryOtpSMS = async (phone, otp) => {
  const message = `Chocolate Mine: Your delivery verification OTP is ${otp}. Share this OTP with the delivery agent only after receiving your order. Valid for 5 minutes.`;
  return sendSMS(phone, message);
};

module.exports = {
  sendSMS,
  sendDeliveryOtpSMS,
  normalizeIndianPhone,
};
