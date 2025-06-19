// server.js - Telegram Mini App Backend
console.log('🚀 Starting server...');

const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

console.log('📦 Express loaded successfully');

// Basic middleware
app.use(express.json());
console.log('✅ Middleware configured');

// Simple health check
app.get('/health', (req, res) => {
  console.log('Health check requested');
  res.status(200).json({ 
    status: 'OK', 
    app: 'Telegram Mini App Backend',
    timestamp: new Date().toISOString()
  });
});

// Root route
app.get('/', (req, res) => {
  console.log('Root route requested');
  res.status(200).json({
    message: 'Railway backend is running!',
    app: 'Мама, мне скучно!',
    version: '1.0.0'
  });
});

// Categories API
app.get('/api/categories', (req, res) => {
  console.log('Categories API requested');
  
  const categories = [
    { id: 'active_games', title: 'Активная игра', emoji: '🏃‍♂️' },
    { id: 'creativity', title: 'Творчество', emoji: '🎨' },
    { id: 'learn_new', title: 'Узнать новое', emoji: '🧠' },
    { id: 'cooking', title: 'Кулинария', emoji: '👨‍🍳' }
  ];
  
  res.status(200).json({ 
    success: true, 
    data: categories,
    count: categories.length
  });
});

// Activities API (temporary)
app.get('/api/activities', (req, res) => {
  console.log('Activities API requested');
  res.status(200).json({ 
    success: true, 
    data: [],
    message: 'API working - no data yet'
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start the server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on 0.0.0.0:${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🎯 Railway deployment successful`);
});

// Handle shutdown gracefully
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('👋 Server closed');
  });
});

module.exports = app;