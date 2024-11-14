const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const scheduleRoutes = require('./routes/schedules');
const emojiRoutes = require('./routes/emoji');
const userRoutes = require('./routes/user');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://your-production-domain.com' 
    : 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Routes - Update the auth route to use /auth prefix
app.use('/api/auth', authRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/emoji-libraries', emojiRoutes);
app.use('/api', userRoutes);

if (process.env.NODE_ENV !== 'production') {
  app.use('/api/admin', require('./routes/admin'));
}

// Debug middleware to log requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, {
    body: req.body,
    headers: req.headers
  });
  next();
});

// Error handling middleware
app.use((req, res, next) => {
  res.status(404).json({ 
    error: { 
      message: 'Resource not found', 
      status: 404 
    } 
  });
});

app.use((err, req, res, next) => {
  console.error('Server error:', err);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    error: {
      message,
      status: statusCode
    }
  });
});

module.exports = app;
