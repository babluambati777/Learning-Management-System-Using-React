const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Initialize express
const app = express();

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  })
);

// Import routes
const authRoutes = require('./routes/authRoutes');  // ADD THIS
const batchRoutes = require('./routes/batchRoutes');
const studentRoutes = require('./routes/studentRoutes');
const markRoutes = require('./routes/markRoutes');

// Mount routes
app.use('/api/auth', authRoutes);  // ADD THIS
app.use('/api/batches', batchRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/marks', markRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Simple LMS API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',  // ADD THIS
      batches: '/api/batches',
      students: '/api/students',
      marks: '/api/marks',
    },
  });
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// Error handler middleware (should be last)
app.use(errorHandler);

// Handle 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`
    ╔════════════════════════════════════════╗
    ║   Simple LMS Server is running on      ║
    ║   Port: ${PORT}                           ║
    ║   Environment: ${process.env.NODE_ENV || 'development'}              ║
    ╚════════════════════════════════════════╝
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});

module.exports = app;