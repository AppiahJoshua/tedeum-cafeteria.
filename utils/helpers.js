/* ============================================================
   TE-DEUM L'AUDAMUS — Utility Helpers
   SMS (Hubtel), ID generators
   ============================================================ */
const axios = require('axios');

/* ── ID Generators ──────────────────────────────────────────── */
function generateOrderNumber() {
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `#TDC-${rand}`;
}
function generateRefNumber() {
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `#RES-${rand}`;
}

/* ── Hubtel SMS ─────────────────────────────────────────────── */
async function sendSMS(to, message) {
  const enabled = (process.env.HUBTEL_ENABLED || 'false').toLowerCase() === 'true';
  if (!enabled) {
    console.log(`📱  [SMS DISABLED] Would send to ${to}: ${message}`);
    return { success: true, simulated: true };
  }
  try {
    const clientId     = process.env.HUBTEL_CLIENT_ID;
    const clientSecret = process.env.HUBTEL_CLIENT_SECRET;
    const senderId      = process.env.HUBTEL_SENDER_ID || 'TeDeum';
    const url = `https://smsc.hubtel.com/v1/messages/send?clientid=${clientId}&clientsecret=${clientSecret}&from=${encodeURIComponent(senderId)}&to=${encodeURIComponent(to)}&content=${encodeURIComponent(message)}`;
    const res = await axios.get(url);
    console.log(`📱  SMS sent to ${to}`);
    return { success: true, data: res.data };
  } catch (err) {
    console.error('📱  SMS send failed:', err.message);
    return { success: false, error: err.message };
  }
}

/* ── SMS Templates ──────────────────────────────────────────── */
const SMS = {
  orderConfirmed: (name, orderNumber, total) =>
    `Hi ${name}! Your Te-Deum order ${orderNumber} (GHS ${total.toFixed(2)}) has been received. We'll notify you when it's ready. Thank you for choosing Te-Deum L'Audamus Cafeteria!`,

  orderStatusUpdate: (name, orderNumber, status) => {
    const messages = {
      preparing:  `Hi ${name}! Your order ${orderNumber} is now being prepared. 🔥`,
      on_the_way: `Hi ${name}! Your order ${orderNumber} is on the way! 🚚`,
      delivered:  `Hi ${name}! Your order ${orderNumber} has been delivered. Enjoy your meal! Thank you for choosing Te-Deum.`,
    };
    return messages[status] || `Hi ${name}! Your order ${orderNumber} status has been updated to: ${status}.`;
  },

  reservationConfirmed: (name, refNumber, date, time) =>
    `Hi ${name}! Your Te-Deum reservation ${refNumber} for ${date} at ${time} has been received. We look forward to seeing you!`,

  reservationStatusUpdate: (name, refNumber, status) => {
    if (status === 'confirmed') return `Hi ${name}! Your reservation ${refNumber} has been confirmed. See you soon at Te-Deum L'Audamus Cafeteria!`;
    if (status === 'cancelled') return `Hi ${name}! Your reservation ${refNumber} has been cancelled. Please contact us if you'd like to rebook.`;
    return `Hi ${name}! Your reservation ${refNumber} status: ${status}.`;
  },
};

module.exports = { generateOrderNumber, generateRefNumber, sendSMS, SMS };
