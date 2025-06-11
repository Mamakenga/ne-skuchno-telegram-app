const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Базовый middleware
app.use(cors());
app.use(express.json());

// Простые маршруты
app.get('/', (req, res) => {
  res.json({
    message: 'Activity Telegram App API',
    version: '1.0.0',
    status: 'running'
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString()
  });
});

// Простые API endpoints без внешних файлов
app.get('/api/categories', (req, res) => {
  res.json({
    success: true,
    data: [
      { id: 'creativity', title: 'Творчество', emoji: '🎨' },
      { id: 'active_games', title: 'Активная игра', emoji: '🏃‍♂️' }
    ]
  });
});

app.get('/api/activities', (req, res) => {
  res.json({
    success: true,
    data: [],
    message: 'Activities endpoint ready'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
  console.log(`📋 Categories: http://localhost:${PORT}/api/categories`);
});

module.exports = app;