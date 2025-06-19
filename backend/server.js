const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Логирование
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    app: "Мама, мне скучно!",
    version: '1.0.0'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    app_name: "Мама, мне скучно!",
    status: 'running',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      activities: '/api/activities',
      categories: '/api/categories'
    }
  });
});

// API Routes - временные статические endpoints
app.get('/api/activities', (req, res) => {
  res.json({ 
    success: true, 
    data: [], 
    message: 'API endpoint working, Supabase integration coming soon' 
  });
});

app.get('/api/categories', (req, res) => {
  const categories = [
    { id: "active_games", title: "Активная игра", emoji: "🏃‍♂️" },
    { id: "creativity", title: "Творчество", emoji: "🎨" },
    { id: "learn_new", title: "Узнать новое", emoji: "🧠" },
    { id: "cooking", title: "Кулинария", emoji: "👨‍🍳" },
    { id: "gifts", title: "Подарки", emoji: "🎁" },
    { id: "experiments", title: "Эксперименты", emoji: "🔬" },
    { id: "reading_stories", title: "Чтение", emoji: "📚" },
    { id: "surprise_me", title: "Удиви меня!", emoji: "🎲" }
  ];
  
  res.json({ 
    success: true, 
    data: categories, 
    count: categories.length 
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
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server "Мама, мне скучно!" running on port ${PORT}`);
  console.log(`🌐 Health: http://0.0.0.0:${PORT}/health`);
  console.log(`📊 Status: Minimal version, ready for Supabase integration`);
});

module.exports = app;