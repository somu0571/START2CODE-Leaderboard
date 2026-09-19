const { verifyFirebaseToken } = require('./auth');

async function requireAdmin(req, res, next) {
  await verifyFirebaseToken(req, res, async (err) => {
    if (err) return;

    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!req.user.admin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    next();
  });
}

module.exports = { requireAdmin };
