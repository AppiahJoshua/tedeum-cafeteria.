/* ============================================================
   TE-DEUM L'AUDAMUS — Menu Routes (CRUD + Image Upload)
   ============================================================ */
const express = require('express');
const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');
const { getDB } = require('../db/database');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

/* ── Multer config for food image uploads ── */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'uploads', 'menu');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext  = path.extname(file.originalname).toLowerCase();
    cb(null, 'menu-' + req.params.id + '-' + Date.now() + ext);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
    cb(null, allowed.includes(path.extname(file.originalname).toLowerCase()));
  },
});

/* GET /api/menu — public list (only available items unless ?all=true with auth) */
router.get('/', (req, res) => {
  const db = getDB();
  const { category, all } = req.query;
  let sql = 'SELECT * FROM menu_items';
  const params = [];
  const conditions = [];

  if (!all) conditions.push('available = 1');
  if (category && category !== 'all') { conditions.push('category = ?'); params.push(category); }
  if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ');
  sql += ' ORDER BY category, name';

  const items = db.prepare(sql).all(...params);
  res.json({ success: true, data: items });
});

/* POST /api/menu — add item (admin) */
router.post('/', authMiddleware, (req, res) => {
  const { name, category, price, emoji, description, popular } = req.body;
  if (!name || !category || price === undefined) return res.status(400).json({ success: false, message: 'Name, category and price are required.' });

  const db = getDB();
  const result = db.prepare(`
    INSERT INTO menu_items (name, category, price, emoji, description, popular, available)
    VALUES (?,?,?,?,?,?,1)
  `).run(name, category, price, emoji || '🍽️', description || '', popular ? 1 : 0);

  res.status(201).json({ success: true, message: 'Menu item added.', id: result.lastInsertRowid });
});

/* PUT /api/menu/:id — update item (admin) */
router.put('/:id', authMiddleware, (req, res) => {
  const db   = getDB();
  const item = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(req.params.id);
  if (!item) return res.status(404).json({ success: false, message: 'Menu item not found.' });

  const fields = ['name','category','price','emoji','description','popular','available'];
  const updates = [];
  const values  = [];
  fields.forEach(f => {
    if (req.body[f] !== undefined) {
      updates.push(`${f} = ?`);
      values.push(typeof req.body[f] === 'boolean' ? (req.body[f] ? 1 : 0) : req.body[f]);
    }
  });
  if (!updates.length) return res.status(400).json({ success: false, message: 'No fields to update.' });

  updates.push("updated_at = datetime('now')");
  values.push(req.params.id);
  db.prepare(`UPDATE menu_items SET ${updates.join(', ')} WHERE id = ?`).run(...values);
  res.json({ success: true, message: 'Menu item updated.' });
});

/* PATCH /api/menu/:id/toggle — toggle availability (admin) */
router.patch('/:id/toggle', authMiddleware, (req, res) => {
  const db   = getDB();
  const item = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(req.params.id);
  if (!item) return res.status(404).json({ success: false, message: 'Menu item not found.' });

  const newVal = item.available ? 0 : 1;
  db.prepare("UPDATE menu_items SET available = ?, updated_at = datetime('now') WHERE id = ?").run(newVal, item.id);
  res.json({ success: true, available: !!newVal });
});

/* POST /api/menu/:id/image — upload food photo (admin) */
router.post('/:id/image', authMiddleware, (req, res, next) => {
  upload.single('image')(req, res, err => {
    if (err) return res.status(400).json({ success: false, message: err.message });
    next();
  });
}, (req, res) => {
  const db   = getDB();
  const item = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(req.params.id);
  if (!item) return res.status(404).json({ success: false, message: 'Menu item not found.' });
  if (!req.file) return res.status(400).json({ success: false, message: 'No image provided or invalid file type (jpg/png/webp only).' });

  if (item.image_url) {
    const oldPath = path.join(__dirname, '..', item.image_url.replace(/^\//, ''));
    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
  }

  const imageUrl = '/uploads/menu/' + req.file.filename;
  db.prepare("UPDATE menu_items SET image_url = ?, updated_at = datetime('now') WHERE id = ?").run(imageUrl, item.id);
  res.json({ success: true, message: 'Image uploaded.', imageUrl });
});

/* DELETE /api/menu/:id/image — remove food photo (admin) */
router.delete('/:id/image', authMiddleware, (req, res) => {
  const db   = getDB();
  const item = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(req.params.id);
  if (!item) return res.status(404).json({ success: false, message: 'Menu item not found.' });

  if (item.image_url) {
    const imgPath = path.join(__dirname, '..', item.image_url.replace(/^\//, ''));
    if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    db.prepare("UPDATE menu_items SET image_url = NULL, updated_at = datetime('now') WHERE id = ?").run(item.id);
  }
  res.json({ success: true, message: 'Image removed.' });
});

/* DELETE /api/menu/:id — delete item (admin) */
router.delete('/:id', authMiddleware, (req, res) => {
  const db   = getDB();
  const item = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(req.params.id);
  if (!item) return res.status(404).json({ success: false, message: 'Menu item not found.' });

  if (item.image_url) {
    const imgPath = path.join(__dirname, '..', item.image_url.replace(/^\//, ''));
    if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
  }
  db.prepare('DELETE FROM menu_items WHERE id = ?').run(req.params.id);
  res.json({ success: true, message: 'Menu item deleted.' });
});

module.exports = router;
