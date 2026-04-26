/**
 * Formats a phone number to E.164 format for India (+91XXXXXXXXXX).
 * @param {string} phone - Raw phone number from DB
 * @returns {string|null} - Formatted phone or null if invalid
 */
const formatPhone = (phone) => {
  if (!phone) return null;

  // Remove all non-digit characters
  let digits = phone.replace(/\D/g, '');

  // Already has country code (e.g., 919876543210)
  if (digits.length === 12 && digits.startsWith('91')) {
    return `+${digits}`;
  }

  // Raw 10-digit Indian number
  if (digits.length === 10) {
    return `+91${digits}`;
  }

  // Already has + prefix with country code
  if (phone.startsWith('+') && digits.length > 10) {
    return `+${digits}`;
  }

  return null;
};

module.exports = { formatPhone };
