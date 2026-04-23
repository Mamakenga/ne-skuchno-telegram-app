// server-railway.js - Railway Backend с PostgreSQL
console.log('🚀 Starting server with Railway PostgreSQL...');

const express = require('express');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

console.log('📦 Express and PostgreSQL loaded');

// Инициализация PostgreSQL
let pool = null;
if (process.env.DATABASE_URL) {
  try {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
    console.log('✅ PostgreSQL pool initialized');
    console.log('🔗 DATABASE_URL configured');
  } catch (error) {
    console.error('❌ PostgreSQL initialization failed:', error);
  }
} else {
  console.log('⚠️ DATABASE_URL missing');
}

// Middleware
app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Logging middleware
app.use((req, res, next) => {
  console.log(`🌐 ${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Health check
app.get('/health', async (req, res) => {
  console.log('Health check requested');
  
  let dbStatus = 'not configured';
  let dbCount = 0;
  
  if (pool) {
    try {
      const client = await pool.connect();
      const result = await client.query('SELECT COUNT(*) as count FROM activities');
      dbCount = result.rows[0].count;
      client.release();
      dbStatus = 'connected';
    } catch (error) {
      console.error('DB health check failed:', error);
      dbStatus = 'error';
    }
  }
  
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    app: 'Мама, мне скучно!',
    database_status: dbStatus,
    activities_count: dbCount,
    environment: process.env.NODE_ENV || 'development'
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Railway backend with PostgreSQL!',
    app: 'Мама, мне скучно!',
    version: '2.0.0',
    database_status: pool ? 'configured' : 'not configured'
  });
});

// Categories API
app.get('/api/categories', (req, res) => {
  console.log('Categories API requested');
  
  const categories = [
    { id: "active_games", title: "Активная игра", emoji: "🏃‍♂️", description: "Спорт, движение", color: "#FF6B6B" },
    { id: "creativity", title: "Творчество", emoji: "🎨", description: "Рисование, поделки", color: "#4ECDC4" },
    { id: "learn_new", title: "Узнать новое", emoji: "🧠", description: "Эксперименты", color: "#45B7D1" },
    { id: "cooking", title: "Кулинария", emoji: "👨‍🍳", description: "Готовка", color: "#96CEB4" },
    { id: "gifts", title: "Подарки", emoji: "🎁", description: "Для друзей", color: "#FFEAA7" },
    { id: "experiments", title: "Эксперименты", emoji: "🔬", description: "Наука", color: "#DDA0DD" },
    { id: "reading_stories", title: "Чтение", emoji: "📚", description: "Книги, сказки", color: "#98D8C8" },
    { id: "surprise_me", title: "Удиви меня!", emoji: "🎲", description: "Случайно", color: "#F7DC6F" }
  ];
  
  res.json({ 
    success: true, 
    data: categories,
    count: categories.length
  });
});

// Activities API с PostgreSQL
app.get('/api/activities', async (req, res) => {
  console.log('Activities API requested with params:', req.query);
  
  try {
    if (!pool) {
      console.log('⚠️ PostgreSQL not available, returning empty array');
      return res.json({ 
        success: true, 
        data: [],
        count: 0,
        message: 'Database not configured'
      });
    }

    const { age, category, limit = 10 } = req.query;
    console.log('Querying PostgreSQL with filters:', { age, category, limit });
    
    const client = await pool.connect();
    
    let query = 'SELECT * FROM activities WHERE 1=1';
    const params = [];
    let paramIndex = 1;
    
    // Фильтры
    if (age) {
      console.log('Filtering by age:', age);
      query += ` AND age_groups @> $${paramIndex}`;
      params.push([age]);
      paramIndex++;
    }
    
    if (category && category !== 'surprise_me') {
      console.log('Filtering by category:', category);
      query += ` AND category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }
    
    // Если "surprise_me" - случайный порядок, иначе по рейтингу
    if (category === 'surprise_me') {
      query += ' ORDER BY RANDOM()';
    } else {
      query += ' ORDER BY rating DESC, title ASC';
    }
    
    query += ` LIMIT $${paramIndex}`;
    params.push(parseInt(limit));
    
    console.log('Executing query:', query);
    console.log('With params:', params);
    
    const result = await client.query(query, params);
    client.release();
    
    const activities = result.rows || [];
    console.log(`✅ Found ${activities.length} activities`);
    
    // Преобразуем массивы из JSON строк обратно в массивы
    const processedActivities = activities.map(activity => ({
      ...activity,
      age_groups: Array.isArray(activity.age_groups) ? activity.age_groups : JSON.parse(activity.age_groups || '[]'),
      materials: Array.isArray(activity.materials) ? activity.materials : JSON.parse(activity.materials || '[]'),
      instructions: Array.isArray(activity.instructions) ? activity.instructions : JSON.parse(activity.instructions || '[]'),
      skills_developed: Array.isArray(activity.skills_developed) ? activity.skills_developed : JSON.parse(activity.skills_developed || '[]'),
      tags: Array.isArray(activity.tags) ? activity.tags : JSON.parse(activity.tags || '[]')
    }));
    
    res.json({ 
      success: true, 
      data: processedActivities, 
      count: processedActivities.length 
    });
    
  } catch (error) {
    console.error('❌ Activities API error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// Single activity
app.get('/api/activities/:id', async (req, res) => {
  console.log('Single activity requested:', req.params.id);
  
  try {
    if (!pool) {
      return res.status(404).json({ error: 'Database not configured' });
    }

    const client = await pool.connect();
    const result = await client.query('SELECT * FROM activities WHERE id = $1', [req.params.id]);
    client.release();
    
    if (result.rows.length === 0) {
      console.log('❌ Activity not found:', req.params.id);
      return res.status(404).json({ 
        error: 'Activity not found',
        id: req.params.id 
      });
    }
    
    const activity = result.rows[0];
    
    // Преобразуем массивы из JSON строк обратно в массивы
    const processedActivity = {
      ...activity,
      age_groups: Array.isArray(activity.age_groups) ? activity.age_groups : JSON.parse(activity.age_groups || '[]'),
      materials: Array.isArray(activity.materials) ? activity.materials : JSON.parse(activity.materials || '[]'),
      instructions: Array.isArray(activity.instructions) ? activity.instructions : JSON.parse(activity.instructions || '[]'),
      skills_developed: Array.isArray(activity.skills_developed) ? activity.skills_developed : JSON.parse(activity.skills_developed || '[]'),
      tags: Array.isArray(activity.tags) ? activity.tags : JSON.parse(activity.tags || '[]')
    };
    
    console.log('✅ Activity found:', processedActivity.title);
    res.json({ success: true, data: processedActivity });
    
  } catch (error) {
    console.error('❌ Single activity error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// Debug endpoint
app.get('/debug', async (req, res) => {
  console.log('🐛 Debug endpoint called');
  
  let dbInfo = { status: 'not configured' };
  
  if (pool) {
    try {
      const client = await pool.connect();
      const result = await client.query('SELECT COUNT(*) as count FROM activities');
      const sample = await client.query('SELECT id, title, category FROM activities LIMIT 3');
      client.release();
      
      dbInfo = {
        status: 'connected',
        total_activities: result.rows[0].count,
        sample_activities: sample.rows
      };
    } catch (error) {
      dbInfo = {
        status: 'error',
        error: error.message
      };
    }
  }
  
  res.json({
    message: 'Debug endpoint works!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    port: PORT,
    database: dbInfo,
    url: req.url
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found', 
    path: req.originalUrl,
    available_routes: ['/', '/health', '/api/categories', '/api/activities', '/debug']
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on 0.0.0.0:${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🗄️ Database: ${pool ? 'PostgreSQL Connected' : 'Not configured'}`);
  console.log(`🎯 Railway deployment ready!`);
  console.log(`🔗 Test URLs:`);
  console.log(`   - Health: http://localhost:${PORT}/health`);
  console.log(`   - Debug: http://localhost:${PORT}/debug`);
  console.log(`   - API: http://localhost:${PORT}/api/categories`);

  // Запускаем импорт CSV асинхронно ПОСЛЕ старта сервера, чтобы не блокировать health check
  if (pool) {
    const path = require('path');
    const fs = require('fs');
    const csvImportPath = path.join(__dirname, 'scripts', 'import-from-csv.js');
    if (fs.existsSync(csvImportPath)) {
      console.log('📥 Triggering async CSV import...');
      const importFromCSV = require('./scripts/import-from-csv');
      importFromCSV().then(() => {
        console.log('✅ CSV import completed');
      }).catch((err) => {
        console.error('⚠️ CSV import failed (non-fatal):', err.message);
      });
    } else {
      console.log('⚠️ import-from-csv.js not found, skipping import');
    }
  } else {
    console.log('⚠️ No DB pool, skipping CSV import');
  }
});

// Heartbeat
setInterval(() => {
  console.log(`💓 Server heartbeat - ${new Date().toISOString()}`);
}, 60000);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  if (pool) {
    pool.end();
  }
  server.close(() => {
    console.log('👋 Server closed');
  });
});

module.exports = app;