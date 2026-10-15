// backend/server.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { connectDB, getDBStatus } = require('./src/config/db');

const errorHandler = require('./src/middleware/errorHandler');

// Route imports
const authRoutes = require('./src/routes/auth.routes');
const userRoutes = require('./src/routes/user.routes');
const courseRoutes = require('./src/routes/course.routes');
const enrollmentRoutes = require('./src/routes/enrollment.routes');
const quizRoutes = require('./src/routes/quiz.routes');
const assignmentRoutes = require('./src/routes/assignment.routes');
const aiRoutes = require('./src/routes/ai.routes');
const adminRoutes = require('./src/routes/admin.routes');
const discussionRoutes = require('./src/routes/discussion.routes');

const app = express();

// ─── Security Middleware ────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: [
          "'self'",
          'data:',
          'https://res.cloudinary.com',
          'https://images.unsplash.com',
        ],
        connectSrc: ["'self'", '*'],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'", 'https://res.cloudinary.com'],
        frameSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    crossOriginEmbedderPolicy: false,
  }),
);

// ─── Flexible CORS Configuration (Allows Vercel & Localhost) ─
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:3000')
  .split(',')
  .map((x) => x.trim());
app.use(
  cors({
    origin: (origin, callback) =>
      callback(null, !origin || allowedOrigins.includes(origin)),
  }),
);

// ─── Global Rate Limiter (all /api/* routes) ─────────────────
const isDev = process.env.NODE_ENV !== 'production';
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 3000 : 1000,
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', globalLimiter);
app.use('/api/', (req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });

// ─── Body Parsing ───────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// ─── Routes ─────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/ai/chat', require('./src/routes/chat.routes'));
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/dashboard', require('./src/routes/dashboard.routes'));
app.use('/api/courses/:courseId/discussions', discussionRoutes);

// Root & Health check with DB diagnostics
app.get('/', (req, res) =>
  res.json({
    success: true,
    service: 'Gyanix Academy API Server',
    version: '0.3.0',
    status: 'Online',
    database: getDBStatus(),
    timestamp: new Date(),
  }),
);

app.get('/health', (req, res) =>
  res.status(getDBStatus().isConnected ? 200 : 503).json({
    status: 'OK',
    database: getDBStatus(),
    timestamp: new Date(),
  }),
);

app.use((req, res) =>
  res.status(404).json({ success: false, message: 'Route not found' }),
);

// ─── Error Handler (must be last) ───────────────────────────
app.use(errorHandler);

if (require.main === module) {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32)
    throw new Error('JWT_SECRET must contain at least 32 characters');
  connectDB()
    .then(() => {
      const server = app.listen(
        process.env.PORT || 5000,
        process.env.HOST || '127.0.0.1',
        () => console.log('Gyanix API ready'),
      );
      for (const signal of ['SIGTERM', 'SIGINT'])
        process.on(signal, () =>
          server.close(() =>
            require('mongoose')
              .disconnect()
              .then(() => process.exit(0)),
          ),
        );
    })
    .catch((error) => {
      console.error('Startup failed:', error.message);
      process.exitCode = 1;
    });
}
module.exports = app;
