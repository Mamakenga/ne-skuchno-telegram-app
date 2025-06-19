const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// CORS настройки
app.use(cors({
  origin: [
    'http://localhost:3001', 
    'http://127.0.0.1:3001', 
    'http://localhost:3000', 
    'http://127.0.0.1:3000',
    'https://ne-skuchno-telegram-app.vercel.app',  // Vercel сайт
    'https://ne-skuchno-telegram-app-*.vercel.app', // Preview версии
    'https://ne-skuchno-telegram-app-git-main-mamakengas-projects.vercel.app' // Полный URL
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Логирование запросов
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// API Routes - подключение к отдельным файлам
app.use('/api/activities', require('./routes/activities'));
app.use('/api/categories', require('./routes/categories'));

// Главная страница
app.get('/', (req, res) => {
  res.json({
    app_name: "Мама, мне скучно!",
    slogan: "Тысяча и одна идея против скуки!",
    status: 'running',
    version: '1.0.0',
    bot_username: '@ne_skuchno_bot',
    description: 'Telegram Mini App для борьбы с детской скукой',
    features: [
      '🎨 8 категорий активностей',
      '👶 Для ребят от 3 до 17 лет и взрослых', 
      '📝 Пошаговые инструкции',
      '⏱️ От 10 минут до 2 часов'
    ],
    database: 'Connected to Supabase',
    endpoints: {
      activities: '/api/activities',
      categories: '/api/categories',
      health: '/health'
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    database: 'Supabase',
    supabase_configured: !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY)
  });
});

// Получение возрастных групп (статические данные)
app.get('/api/age-groups', (req, res) => {
  try {
    const ageGroups = [
      { id: '3-5', title: '3-5 лет', emoji: '👶', description: 'Дошкольники' },
      { id: '6-8', title: '6-8 лет', emoji: '🧒', description: 'Младшие школьники' },
      { id: '9-12', title: '9-12 лет', emoji: '👦', description: 'Средние школьники' },
      { id: '13-17', title: '13-17 лет', emoji: '👨‍🎓', description: 'Подростки' },
      { id: '18+', title: '18+ лет', emoji: '👨', description: 'Взрослые' },
    ];
    
    res.json({
      success: true,
      data: ageGroups,
      count: ageGroups.length
    });
  } catch (error) {
    console.error('Error fetching age groups:', error);
    res.status(500).json({ error: 'Failed to fetch age groups' });
  }
});

// 404 обработчик
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method,
    available_endpoints: [
      'GET /',
      'GET /health',
      'GET /api/activities',
      'GET /api/categories',
      'GET /api/age-groups'
    ]
  });
});

// Обработчик ошибок
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// ===== SERVER START =====
async function startServer() {
  console.log('✅ Using Supabase as database');
  console.log('🔧 Supabase URL configured:', !!process.env.SUPABASE_URL);
  console.log('🔑 Supabase keys configured:', !!process.env.SUPABASE_SERVICE_KEY);
  
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server "Мама, мне скучно!" running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 Health check: http://localhost:${PORT}/health`);
    console.log(`🔗 API base: http://localhost:${PORT}/api`);
    console.log(`🗄️ Database: Supabase PostgreSQL`);
  });
}

// Запуск сервера
startServer().catch(error => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});

module.exports = app;