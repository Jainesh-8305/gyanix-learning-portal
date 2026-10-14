// backend/server.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { connectDB, getDBStatus } = require('./src/config/db');
const seedDatabase = require('./src/utils/seedData');
const errorHandler = require('./src/middleware/errorHandler');

// Route imports
const authRoutes = require('./src/routes/auth.routes');
const userRoutes = require('./src/routes/user.routes');
const courseRoutes = require('./src/routes/course.routes');
const enrollmentRoutes = require('./src/routes/enrollment.routes');
const quizRoutes = require('./src/routes/quiz.routes');
const assignmentRoutes = require('./src/routes/assignment.routes');
const aiRoutes = require('./src/routes/ai.routes');
const paymentRoutes = require('./src/routes/payment.routes');
const adminRoutes = require('./src/routes/admin.routes');
const discussionRoutes = require('./src/routes/discussion.routes');

// Connect to database & auto-seed
connectDB().then(() => {
  seedDatabase();
});

const app = express();

// ─── Security Middleware ────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https://res.cloudinary.com', 'https://images.unsplash.com'],
      connectSrc: ["'self'", '*'],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'", 'https://res.cloudinary.com'],
      frameSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// ─── Flexible CORS Configuration (Allows Vercel & Localhost) ─
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://gyanix-academy.vercel.app',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (
      allowedOrigins.includes(origin) ||
      origin.endsWith('.vercel.app') ||
      origin.includes('localhost')
    ) {
      return callback(null, true);
    }
    return callback(null, true); // Permissive fallback for seamless live client connections
  },
  credentials: true,
}));

// ─── Global Rate Limiter (all /api/* routes) ─────────────────
const isDev = process.env.NODE_ENV !== 'production';
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 3000 : 1000,
  message: { success: false, message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', globalLimiter);

// ─── Body Parsing ───────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// ─── Routes ─────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/courses/:courseId/discussions', discussionRoutes);

// Database Seed Endpoint
app.get('/api/seed', async (req, res) => {
  await seedDatabase();
  res.json({ success: true, message: 'Database successfully seeded with official users & courses' });
});

// Root & Health check with DB diagnostics
app.get('/', (req, res) => res.json({
  success: true,
  service: 'Gyanix Academy API Server',
  version: '0.3.0',
  status: 'Online',
  database: getDBStatus(),
  timestamp: new Date(),
}));

app.get('/health', (req, res) => res.json({
  status: 'OK',
  database: getDBStatus(),
  timestamp: new Date(),
}));

// ─── Error Handler (must be last) ───────────────────────────
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server running on port ${PORT} [0.0.0.0]`));

module.exports = app;