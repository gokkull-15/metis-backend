const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const connectDB = require('./config/db');

// Import routes
const postRoutes = require('./routes/postRoutes');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');

// Import controllers for legacy routes
const { saveUser, getUserByWallet } = require('./controllers/userController');
const { createPostLegacy } = require('./controllers/postController');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' })); // Increased limit for IPFS hashes

// Database Connection
connectDB();

// Routes
app.use('/auth', authRoutes); // Authentication routes
app.use('/api/posts', postRoutes); // Post routes
app.use('/api/users', userRoutes); // User routes

// Legacy routes (for backward compatibility)
app.post('/api/save-user', saveUser);
app.get('/api/get-user', getUserByWallet);
app.post('/api/savePost', createPostLegacy); // Use legacy create post function

// Basic health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
