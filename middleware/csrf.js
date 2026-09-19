const { doubleCsrf } = require('csrf-csrf');
const cookieParser = require('cookie-parser');

const { generateToken, doubleCsrfProtection } = doubleCsrf({
  getSecret: () => process.env.SESSION_SECRET || 'dev-csrf-secret',
  cookieName: '_csrf',
  cookieOptions: {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production'
  },
  size: 64,
  getTokenFromRequest: (req) => req.body._csrf || req.headers['x-csrf-token']
});

module.exports = { generateToken, doubleCsrfProtection };
