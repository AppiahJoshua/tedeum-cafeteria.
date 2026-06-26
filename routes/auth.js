/* ============================================================
   TE-DEUM L'AUDAMUS — Auth Routes
   ============================================================ */
const express  = require('express');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const { getDB } = require('../db/database');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

/* POST /api/auth/login */
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ success: false, message: 'Username and password are required.' });

  const db   = getDB();
  const user = db.prepare('SELECT * FROM admin_users WHERE username = ?').get(username);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ success: false, message: 'Invalid username or password.' });
  }

  const token = jwt.sign(
    { id: user.id, username: user.username },
    process.env.JWT_SECRET || 'tedeum_secret_key_change_this_in_production_2026',
    { expiresIn: '7d' }
  );

  res.json({ success: true, token, user: { id: user.id, username: user.username, email: user.email } });
});

/* GET /api/auth/verify */
router.get('/verify', authMiddleware, (req, res) => {
  res.json({ success: true, admin: req.admin });
});

/* POST /api/auth/change-password */
router.post('/change-password', authMiddleware, (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) return res.status(400).json({ success: false, message: 'Both passwords are required.' });
  if (newPassword.length < 6) return res.status(400).json({ success: false, message: 'New password must be at least 6 characters.' });

  const db   = getDB();
  const user = db.prepare('SELECT * FROM admin_users WHERE id = ?').get(req.admin.id);
  if (!bcrypt.compareSync(currentPassword, user.password_hash)) {
    return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
  }
  db.prepare('UPDATE admin_users SET password_hash = ? WHERE id = ?').run(bcrypt.hashSync(newPassword, 10), user.id);
  res.json({ success: true, message: 'Password updated successfully.' });
});

module.exports = router;
