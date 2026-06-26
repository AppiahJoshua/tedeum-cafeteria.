/* ============================================================
   TE-DEUM L'AUDAMUS — Other Routes
   Reservations · Reviews · Contact · Payments · Dashboard
   ============================================================ */
const express = require('express');
const axios   = require('axios');
const { getDB } = require('../db/database');
const authMiddleware = require('../middleware/auth');
const { generateRefNumber, sendSMS, SMS } = require('../utils/helpers');

const router = express.Router();

/* ============================================================
   RESERVATIONS
   ============================================================ */
router.post('/reservations', (req, res) => {
  const { customerName, customerPhone, date, time, guests, occasion, specialRequests } = req.body;
  if (!customerName || !customerPhone || !date) return res.status(400).json({ success: false, message: 'Name, phone and date are required.' });

  const db  = getDB();
  const ref = generateRefNumber();
  db.prepare(`
    INSERT INTO reservations (ref_number, customer_name, customer_phone, date, time, guests, occasion, special_requests)
    VALUES (?,?,?,?,?,?,?,?)
  `).run(ref, customerName, customerPhone, date, time || '6:00 PM', guests || 2, occasion || 'dining', specialRequests || null);

  sendSMS(customerPhone, SMS.reservationConfirmed(customerName, ref, date, time || '6:00 PM')).catch(()=>{});

  res.status(201).json({ success: true, message: 'Reservation submitted.', data: { ref_number: ref } });
});

router.get('/reservations', authMiddleware, (req, res) => {
  const db = getDB();
  const { status, limit } = req.query;
  let sql = 'SELECT * FROM reservations';
  const params = [];
  if (status && status !== 'all') { sql += ' WHERE status = ?'; params.push(status); }
  sql += ' ORDER BY created_at DESC';
  if (limit) { sql += ' LIMIT ?'; params.push(parseInt(limit)); }
  res.json({ success: true, data: db.prepare(sql).all(...params) });
});

router.put('/reservations/:id/status', authMiddleware, (req, res) => {
  const { status } = req.body;
  if (!['pending','confirmed','cancelled'].includes(status)) return res.status(400).json({ success: false, message: 'Invalid status.' });

  const db  = getDB();
  const r   = db.prepare('SELECT * FROM reservations WHERE id = ?').get(req.params.id);
  if (!r) return res.status(404).json({ success: false, message: 'Reservation not found.' });

  db.prepare("UPDATE reservations SET status = ?, updated_at = datetime('now') WHERE id = ?").run(status, r.id);
  sendSMS(r.customer_phone, SMS.reservationStatusUpdate(r.customer_name, r.ref_number, status)).catch(()=>{});
  res.json({ success: true, message: 'Reservation updated.' });
});

/* ============================================================
   REVIEWS
   ============================================================ */
router.post('/reviews', (req, res) => {
  const { customerName, rating, reviewText, favouriteDish } = req.body;
  if (!customerName || !rating || !reviewText) return res.status(400).json({ success: false, message: 'Name, rating and review text are required.' });
  if (rating < 1 || rating > 5) return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5.' });

  const db = getDB();
  db.prepare('INSERT INTO reviews (customer_name, rating, review_text, favourite_dish, status) VALUES (?,?,?,?,?)')
    .run(customerName, rating, reviewText, favouriteDish || null, 'pending');

  res.status(201).json({ success: true, message: 'Review submitted for approval.' });
});

router.get('/reviews', (req, res) => {
  const db  = getDB();
  const all = req.query.all === 'true';
  let sql = 'SELECT * FROM reviews';
  if (!all) sql += " WHERE status = 'approved'";
  sql += ' ORDER BY created_at DESC';
  res.json({ success: true, data: db.prepare(sql).all() });
});

router.put('/reviews/:id/approve', authMiddleware, (req, res) => {
  const db = getDB();
  const r  = db.prepare('SELECT * FROM reviews WHERE id = ?').get(req.params.id);
  if (!r) return res.status(404).json({ success: false, message: 'Review not found.' });
  db.prepare("UPDATE reviews SET status = 'approved' WHERE id = ?").run(r.id);
  res.json({ success: true, message: 'Review approved.' });
});

router.delete('/reviews/:id', authMiddleware, (req, res) => {
  const db = getDB();
  const r  = db.prepare('SELECT * FROM reviews WHERE id = ?').get(req.params.id);
  if (!r) return res.status(404).json({ success: false, message: 'Review not found.' });
  db.prepare('DELETE FROM reviews WHERE id = ?').run(r.id);
  res.json({ success: true, message: 'Review deleted.' });
});

/* ============================================================
   CONTACT
   ============================================================ */
router.post('/contact', (req, res) => {
  const { name, phone, subject, message } = req.body;
  if (!name || !phone || !message) return res.status(400).json({ success: false, message: 'Name, phone and message are required.' });

  const db = getDB();
  db.prepare('INSERT INTO contacts (name, phone, subject, message, status) VALUES (?,?,?,?,?)')
    .run(name, phone, subject || 'General Enquiry', message, 'unread');

  res.status(201).json({ success: true, message: 'Message sent successfully.' });
});

router.get('/contact', authMiddleware, (req, res) => {
  const db = getDB();
  res.json({ success: true, data: db.prepare('SELECT * FROM contacts ORDER BY created_at DESC').all() });
});

/* ============================================================
   PAYSTACK PAYMENTS
   ============================================================ */
router.post('/payments/initialize', async (req, res) => {
  const { orderId, email } = req.body;
  if (!orderId || !email) return res.status(400).json({ success: false, message: 'orderId and email are required.' });

  const db    = getDB();
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey || secretKey.includes('xxxx')) {
    // Paystack not configured — return a stub so dev/testing isn't blocked
    return res.json({ success: true, data: { accessCode: 'stub', reference: order.order_number, authorizationUrl: '#' }, note: 'Paystack not configured.' });
  }

  try {
    const amountKobo = Math.round(order.total * 100);
    const resp = await axios.post('https://api.paystack.co/transaction/initialize', {
      email, amount: amountKobo, currency: 'GHS',
      reference: order.order_number.replace('#',''),
      callback_url: `${process.env.FRONTEND_URL || ''}/order.html`,
      metadata: { orderId: order.id, orderNumber: order.order_number },
    }, { headers: { Authorization: `Bearer ${secretKey}` } });

    const { authorization_url, access_code, reference } = resp.data.data;
    db.prepare("UPDATE orders SET payment_reference = ? WHERE id = ?").run(reference, order.id);

    res.json({ success: true, data: { accessCode: access_code, reference, authorizationUrl: authorization_url } });
  } catch (err) {
    console.error('Paystack init error:', err.response?.data || err.message);
    res.status(500).json({ success: false, message: 'Could not initialize payment.' });
  }
});

router.get('/payments/verify/:reference', async (req, res) => {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  const db = getDB();

  if (!secretKey || secretKey.includes('xxxx')) {
    return res.json({ success: true, status: 'success', note: 'Paystack not configured — auto-verified for dev.' });
  }

  try {
    const resp = await axios.get(`https://api.paystack.co/transaction/verify/${req.params.reference}`, {
      headers: { Authorization: `Bearer ${secretKey}` },
    });
    const status = resp.data.data.status; // success | failed | abandoned
    const order  = db.prepare('SELECT * FROM orders WHERE payment_reference = ?').get(req.params.reference);
    if (order) db.prepare("UPDATE orders SET payment_status = ? WHERE id = ?").run(status === 'success' ? 'paid' : status, order.id);

    res.json({ success: true, status });
  } catch (err) {
    console.error('Paystack verify error:', err.response?.data || err.message);
    res.status(500).json({ success: false, message: 'Could not verify payment.' });
  }
});

router.post('/payments/webhook', express.json(), (req, res) => {
  // Paystack webhook handler — verify signature in production
  const event = req.body;
  if (event?.event === 'charge.success') {
    const db  = getDB();
    const ref = event.data?.reference;
    const order = db.prepare('SELECT * FROM orders WHERE payment_reference = ?').get(ref);
    if (order) db.prepare("UPDATE orders SET payment_status = 'paid' WHERE id = ?").run(order.id);
  }
  res.sendStatus(200);
});

/* ============================================================
   DASHBOARD STATS
   ============================================================ */
router.get('/dashboard/stats', authMiddleware, (req, res) => {
  const db = getDB();

  const today = db.prepare(`
    SELECT COUNT(*) as orders, COALESCE(SUM(total),0) as revenue
    FROM orders WHERE date(created_at) = date('now')
  `).get();

  const todayRes = db.prepare(`SELECT COUNT(*) as c FROM reservations WHERE date = date('now')`).get();

  const ordersByStatus = db.prepare(`
    SELECT order_status, COUNT(*) as c FROM orders
    WHERE date(created_at) = date('now') GROUP BY order_status
  `).all();
  const statusMap = { pending:0, preparing:0, on_the_way:0, delivered:0, cancelled:0 };
  ordersByStatus.forEach(r => statusMap[r.order_status] = r.c);

  const resByStatus = db.prepare(`SELECT status, COUNT(*) as c FROM reservations GROUP BY status`).all();
  const resMap = { pending:0, confirmed:0, cancelled:0 };
  resByStatus.forEach(r => resMap[r.status] = r.c);

  const month = db.prepare(`
    SELECT COUNT(*) as orders, COALESCE(SUM(total),0) as revenue, COUNT(DISTINCT customer_phone) as customers
    FROM orders WHERE strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')
  `).get();

  const reviewStats = db.prepare(`SELECT COALESCE(AVG(rating),0) as avg, COUNT(*) as c FROM reviews WHERE status='approved'`).get();

  const topDishes = db.prepare(`
    SELECT item_name, SUM(quantity) as total_sold
    FROM order_items GROUP BY item_name ORDER BY total_sold DESC LIMIT 5
  `).all();

  const weeklyRevenue = db.prepare(`
    SELECT date(created_at) as day, COALESCE(SUM(total),0) as revenue
    FROM orders WHERE created_at >= date('now','-6 days')
    GROUP BY date(created_at) ORDER BY day ASC
  `).all();
  // Fill missing days with 0
  const days = [];
  for (let i=6;i>=0;i--) {
    const d = new Date(); d.setDate(d.getDate()-i);
    const key = d.toISOString().split('T')[0];
    const found = weeklyRevenue.find(w=>w.day===key);
    days.push({ day:key, revenue: found ? found.revenue : 0 });
  }

  res.json({
    success: true,
    data: {
      today: { orders: today.orders, revenue: today.revenue, reservations: todayRes.c },
      orders: { pending: statusMap.pending, preparing: statusMap.preparing, on_the_way: statusMap.on_the_way, delivered: statusMap.delivered },
      reservations: { pending: resMap.pending, confirmed: resMap.confirmed },
      month: { orders: month.orders, revenue: month.revenue, customers: month.customers },
      reviews: { avgRating: Math.round(reviewStats.avg*10)/10, count: reviewStats.c },
      topDishes,
      weeklyRevenue: days,
    },
  });
});

module.exports = router;
