/* ============================================================
   TE-DEUM L'AUDAMUS CAFETERIA — Express Server
   ============================================================ */
require('dotenv').config();

const express     = require('express');
const cors        = require('cors');
const morgan      = require('morgan');
const path        = require('path');
const rateLimit   = require('express-rate-limit');

const { initDB }   = require('./db/database');
const authRoutes   = require('./routes/auth');
const menuRoutes   = require('./routes/menu');
const orderRoutes  = require('./routes/orders');
const otherRoutes  = require('./routes/other');

const app  = express();
const PORT = process.env.PORT || 3000;

/* ── Init Database ──────────────────────────────────────────── */
initDB();

/* ── Middleware ──────────────────────────────────────────────── */
app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

const apiLimiter = rateLimit({ windowMs: 15*60*1000, max: 300, standardHeaders: true, legacyHeaders: false });
app.use('/api', apiLimiter);

/* ── API Routes ──────────────────────────────────────────────── */
app.use('/api/auth',   authRoutes);
app.use('/api/menu',   menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api', otherRoutes); // reservations, reviews, contact, payments, dashboard

/* ── Serve Uploaded Food Images ─────────────────────────────── */
const uploadPath = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadPath));

/* ── Serve Frontend Static Files ─────────────────────────────── */
const FRONTEND_DIR = path.join(__dirname, '..');
app.use(express.static(FRONTEND_DIR));

/* ── Fallback for SPA-style routes (serve index for unknown GET) ─ */
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) return next();
  const filePath = path.join(FRONTEND_DIR, req.path);
  res.sendFile(filePath, err => { if (err) res.sendFile(path.join(FRONTEND_DIR, 'index.html')); });
});

/* ── Error Handler ───────────────────────────────────────────── */
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal server error.' });
});

/* ── Start Server ────────────────────────────────────────────── */
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════╗
║   🍽️   TE-DEUM L'AUDAMUS CAFETERIA SERVER         ║
╚══════════════════════════════════════════════════╝

  🟢  Server running at http://localhost:${PORT}
  📂  Serving frontend from: ${FRONTEND_DIR}
  🗄️   Database: tedeum.db
  🌍  Environment: ${process.env.NODE_ENV || 'development'}

  API Endpoints:
  ├── POST /api/auth/login
  ├── GET  /api/menu
  ├── POST /api/orders
  ├── POST /api/reservations
  ├── POST /api/reviews
  ├── POST /api/contact
  └── POST /api/payments/initialize

  Admin: http://localhost:${PORT}/admin.html
  Login: ${process.env.ADMIN_USERNAME || 'admin'} / ${process.env.ADMIN_PASSWORD || 'tedeum@admin2026'}
`);
});
