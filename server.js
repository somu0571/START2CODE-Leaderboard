require('dotenv').config();

const express = require('express');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const { captureRawBody } = require('./middleware/webhook');
const { notFoundHandler, globalErrorHandler } = require('./middleware/errorHandler');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('trust proxy', 1);

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://www.gstatic.com", "https://apis.google.com", "https://cdn.jsdelivr.net"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdn.jsdelivr.net"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "https://avatars.githubusercontent.com", "https://github.com", "data:"],
      connectSrc: ["'self'", "https://identitytoolkit.googleapis.com", "https://securetoken.googleapis.com", "https://www.googleapis.com"],
      frameSrc: ["'self'", "https://apis.google.com"]
    }
  },
  crossOriginEmbedderPolicy: false
}));

app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.ALLOWED_ORIGINS?.split(',') || false
    : true,
  credentials: true
}));

app.use(compression());

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('short'));
}

app.use(cookieParser(process.env.SESSION_SECRET));

app.use('/api/github', express.json({ verify: captureRawBody, limit: '1mb' }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: process.env.NODE_ENV === 'production' ? '1d' : 0
}));

const githubRoutes = require('./routes/github');
const leaderboardRoutes = require('./routes/leaderboard');
const pageRoutes = require('./routes/pages');
const adminRoutes = require('./routes/admin');

app.use('/api/github', githubRoutes);
app.use('/api', leaderboardRoutes);
app.use('/admin', adminRoutes);
app.use('/', pageRoutes);

app.use(notFoundHandler);
app.use(globalErrorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`START2CODE running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
});

module.exports = app;
