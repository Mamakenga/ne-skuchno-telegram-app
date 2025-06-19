const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ===== MIDDLEWARE =====
app.use(helmet({
  contentSecurityPolicy: false // Отключаем для разработки
}));
app.use(compression());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Логирование запросов в development
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// ===== ROUTES =====
// Базовые API routes
app.use('/api/activities', require('./routes/activities'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/users', require('./routes/users'));

// Telegram webhook (если нужен)
// app.use('/webhook', require('./routes/telegram'));

// Статичные файлы (для будущего frontend)
app.use(express.static('public'));

// ===== HEALTH CHECK =====
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    supabase_connected: !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY)
  });
});

// Базовый маршрут
app.get('/', (req, res) => {
  res.json({
    message: 'Activity Telegram App API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      activities: '/api/activities',
      categories: '/api/categories', 
      users: '/api/users'
    },
    database: 'Supabase PostgreSQL'
  });
});

// ===== ERROR HANDLING =====
// Обработка ошибок 404
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Общий обработчик ошибок
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  
  // Не показываем stack trace в production
  const error = process.env.NODE_ENV === 'production' 
    ? { message: 'Internal server error' }
    : { message: err.message, stack: err.stack };
  
  res.status(500).json({ error });
});

// ===== SERVER START =====
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API base: http://localhost:${PORT}/api`);
  
  // Проверяем наличие Supabase конфигурации
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY) {
    console.log('✅ Supabase configuration found');
  } else {
    console.log('⚠️ Supabase configuration missing');
  }
});

// Обработка завершения процесса
process.on('SIGINT', () => {
  console.log('\n⏹️ Shutting down server...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n⏹️ Server terminated');
  process.exit(0);
});

module.exports = app;