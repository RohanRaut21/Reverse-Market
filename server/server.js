import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';
import path from 'path';

// Route files
import authRoutes from './routes/authRoutes.js';
import requestRoutes from './routes/requestRoutes.js';
import bidRoutes from './routes/bidRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import amazonRoutes from './routes/amazonRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';


// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Trust proxy headers (for https protocol behind Render/load balancers)
app.set('trust proxy', true);

// Body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

// Enable CORS
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'], // Vite dev server
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/bids', bidRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/amazon', amazonRoutes);
app.use('/api/upload', uploadRoutes);

// Serve static assets in production or on Render
if (process.env.NODE_ENV === 'production' || process.env.RENDER === 'true') {
  const __dirname = path.resolve();
  app.use(express.static(path.join(__dirname, 'client/dist')));

  app.get('*', (req, res) =>
    res.sendFile(path.resolve(__dirname, 'client', 'dist', 'index.html'))
  );
} else {
  // Base route
  app.get('/', (req, res) => {
    res.send('ReverseMarket API is running...');
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    success: false,
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
