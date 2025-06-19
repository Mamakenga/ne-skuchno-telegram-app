// server.js - Railway Backend с Supabase
console.log('🚀 Starting server with Supabase...');

const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const app = express();
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

console.log('📦 Express and Supabase loaded');

// Инициализация Supabase
let supabase = null;
if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY) {
  try {
    supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );
    console.log('✅ Supabase client initialized');
    console.log('🔗 URL:', process.env.SUPABASE_URL);
  } catch (error) {
    console.error('❌ Supabase initialization failed:', error);
  }
} else {
  console.log('⚠️ Supabase credentials missing');
  console.log('SUPABASE_URL:', !!process.env.SUPABASE_URL);
  console.log('SUPABASE_SERVICE_KEY:', !!process.env.SUPABASE_SERVICE_KEY);
}

// Middleware
app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Health check
app.get('/health', (req, res) => {
  console.log('Health check requested');
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    app: 'Мама, мне скучно!',
    supabase_connected: !!supabase,
    environment: process.env.NODE_ENV || 'development'
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Railway backend with Supabase!',
    app: 'Мама, мне скучно!',
    version: '1.0.0',
    supabase_status: supabase ? 'connected' : 'not configured'
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

// Activities API с Supabase
app.get('/api/activities', async (req, res) => {
  console.log('Activities API requested with params:', req.query);
  
  try {
    if (!supabase) {
      console.log('⚠️ Supabase not available, returning empty array');
      return res.json({ 
        success: true, 
        data: [],
        count: 0,
        message: 'Supabase not configured'
      });
    }

    const { age, category, limit = 10 } = req.query;
    console.log('Querying Supabase with filters:', { age, category, limit });
    
    let query = supabase.from('activities').select('*');
    
    // Фильтры
    if (age) {
      console.log('Filtering by age:', age);
      query = query.contains('age_groups', [age]);
    }
    
    if (category && category !== 'surprise_me') {
      console.log('Filtering by category:', category);
      query = query.eq('category', category);
    }
    
    query = query.limit(parseInt(limit)).order('rating', { ascending: false });
    
    const { data, error, count } = await query;
    
    if (error) {
      console.error('❌ Supabase query error:', error);
      return res.status(500).json({ 
        success: false,
        error: 'Failed to fetch activities',
        details: error.message 
      });
    }
    
    console.log(`✅ Found ${data ? data.length : 0} activities`);
    
    // Если "surprise_me" - возвращаем случайные
    if (category === 'surprise_me' && data && data.length > 0) {
      const shuffled = data.sort(() => 0.5 - Math.random());
      const result = shuffled.slice(0, 3);
      console.log(`🎲 Surprise me: returning ${result.length} random activities`);
      return res.json({ 
        success: true, 
        data: result, 
        count: result.length 
      });
    }
    
    res.json({ 
      success: true, 
      data: data || [], 
      count: data ? data.length : 0 
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
    if (!supabase) {
      return res.status(404).json({ error: 'Supabase not configured' });
    }

    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('id', req.params.id)
      .single();
    
    if (error || !data) {
      console.log('❌ Activity not found:', req.params.id);
      return res.status(404).json({ 
        error: 'Activity not found',
        id: req.params.id 
      });
    }
    
    console.log('✅ Activity found:', data.title);
    res.json({ success: true, data: data });
    
  } catch (error) {
    console.error('❌ Single activity error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found', 
    path: req.originalUrl,
    available_routes: ['/', '/health', '/api/categories', '/api/activities']
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
  console.log(`🗄️ Supabase: ${supabase ? 'Connected' : 'Not configured'}`);
  console.log(`🎯 Railway deployment with Supabase ready!`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('👋 Server closed');
  });
});

module.exports = app;