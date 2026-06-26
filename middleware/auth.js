/* ============================================================
   TE-DEUM L'AUDAMUS — JWT Auth Middleware
   ============================================================ */
const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const header = req.headers.authorization || '';
  const token  = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ success: false, message: 'No token provided. Please login.' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tedeum_secret_key_change_this_in_production_2026');
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token. Please login again.' });
  }
}

module.exports = authMiddleware;
