/* ============================================================
   TE-DEUM L'AUDAMUS — Orders Routes
   ============================================================ */
const express = require('express');
const { getDB } = require('../db/database');
const authMiddleware = require('../middleware/auth');
const { generateOrderNumber, sendSMS, SMS } = require('../utils/helpers');

const router = express.Router();

/* POST /api/orders — place an order (public) */
router.post('/', (req, res) => {
  const { customerName, customerPhone, orderType, deliveryAddress, deliveryNotes, paymentMethod, items } = req.body;

  if (!customerName || !customerPhone) return res.status(400).json({ success: false, message: 'Name and phone number are required.' });
  if (!items || !Array.isArray(items) || !items.length) return res.status(400).json({ success: false, message: 'Cart is empty.' });

  const db = getDB();

  // Resolve menu items & compute totals
  let subtotal = 0;
  const resolvedItems = [];
  for (const it of items) {
    const menuItem = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(it.menuItemId);
    if (!menuItem) return res.status(400).json({ success: false, message: `Menu item ${it.menuItemId} not found.` });
    const qty = Math.max(1, parseInt(it.quantity) || 1);
    const lineTotal = menuItem.price * qty;
    subtotal += lineTotal;
    resolvedItems.push({ menuItemId: menuItem.id, name: menuItem.name, price: menuItem.price, qty, lineTotal });
  }

  const deliveryFee = (orderType === 'delivery' && subtotal < parseFloat(process.env.FREE_DELIVERY_MINIMUM || 100))
    ? parseFloat(process.env.DELIVERY_FEE || 10) : 0;
  const total = subtotal + deliveryFee;
  const orderNumber = generateOrderNumber();

  const insertOrder = db.prepare(`
    INSERT INTO orders (order_number, customer_name, customer_phone, order_type, delivery_address, delivery_notes, payment_method, subtotal, delivery_fee, total)
    VALUES (?,?,?,?,?,?,?,?,?,?)
  `);
  const insertItem = db.prepare(`INSERT INTO order_items (order_id, menu_item_id, item_name, item_price, quantity, subtotal) VALUES (?,?,?,?,?,?)`);

  let orderId;
  db.transaction(() => {
    const result = insertOrder.run(orderNumber, customerName, customerPhone, orderType || 'delivery', deliveryAddress || null, deliveryNotes || null, paymentMethod || 'cash', subtotal, deliveryFee, total);
    orderId = result.lastInsertRowid;
    resolvedItems.forEach(it => insertItem.run(orderId, it.menuItemId, it.name, it.price, it.qty, it.lineTotal));
  })();

  // Fire-and-forget SMS
  sendSMS(customerPhone, SMS.orderConfirmed(customerName, orderNumber, total)).catch(()=>{});

  res.status(201).json({ success: true, message: 'Order placed successfully.', data: { orderId, orderNumber, total, subtotal, deliveryFee } });
});

/* GET /api/orders — list orders (admin) */
router.get('/', authMiddleware, (req, res) => {
  const db = getDB();
  const { status, limit } = req.query;
  let sql = 'SELECT * FROM orders';
  const params = [];
  if (status && status !== 'all') { sql += ' WHERE order_status = ?'; params.push(status); }
  sql += ' ORDER BY created_at DESC';
  if (limit) { sql += ' LIMIT ?'; params.push(parseInt(limit)); }

  const orders = db.prepare(sql).all(...params);
  const itemsStmt = db.prepare('SELECT item_name, item_price, quantity, subtotal FROM order_items WHERE order_id = ?');
  orders.forEach(o => { o.items = itemsStmt.all(o.id); });

  res.json({ success: true, data: orders });
});

/* GET /api/orders/:id — single order */
router.get('/:id', authMiddleware, (req, res) => {
  const db = getDB();
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
  order.items = db.prepare('SELECT item_name, item_price, quantity, subtotal FROM order_items WHERE order_id = ?').all(order.id);
  res.json({ success: true, data: order });
});

/* PUT /api/orders/:id/status — update order status (admin) */
router.put('/:id/status', authMiddleware, (req, res) => {
  const { status } = req.body;
  const valid = ['pending','preparing','on_the_way','delivered','cancelled'];
  if (!valid.includes(status)) return res.status(400).json({ success: false, message: 'Invalid status.' });

  const db = getDB();
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

  db.prepare("UPDATE orders SET order_status = ?, updated_at = datetime('now') WHERE id = ?").run(status, order.id);

  if (['preparing','on_the_way','delivered'].includes(status)) {
    sendSMS(order.customer_phone, SMS.orderStatusUpdate(order.customer_name, order.order_number, status)).catch(()=>{});
  }
  res.json({ success: true, message: 'Order status updated.' });
});

module.exports = router;
