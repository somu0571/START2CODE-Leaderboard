const { auth } = require('../config/firebase');

async function verifyFirebaseToken(req, res, next) {
  try {
    let token = null;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split('Bearer ')[1];
    }

    if (!token && req.cookies && req.cookies.__session) {
      token = req.cookies.__session;
    }

    if (!token) {
      if (req.accepts('html') && !req.xhr && !req.headers.authorization) {
        return res.redirect('/admin/login');
      }
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = await auth.verifyIdToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    if (req.accepts('html') && !req.xhr && !req.headers.authorization) {
      return res.redirect('/admin/login');
    }
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = { verifyFirebaseToken };
