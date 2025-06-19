const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Инициализация Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// CORS
app.use(cors({
  origin: '*',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Логирование
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', async (req, res) => {
  console.log('Health check called');
  
  try {
    // Тест Supabase подключения
    const { data, error } = await supabase
      .from('activities')
      .select('count')
      .limit(1);
    
    res.json({ 
      status: 'OK',
      timestamp: new Date().toISOString(),
      supabase_connected: !error,
      app_name: 'Мама, мне скучно!',
      port: PORT
    });
  } catch (err) {
    console.error('Health check error:', err);
    res.status(500).json({ 
      status: 'ERROR',
      error: err.message 
    });
  }
});

// Главная страница
app.get('/', (req, res) => {
  res.json({
    app_name: "Мама, мне скучно!",
    status: 'running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.get('/api/activities', async (req, res) => {
  try {
    const { age, category, limit = 10 } = req.query;
    
    let query = supabase.from('activities').select('*');
    
    if (age) query = query.contains('age_groups', [age]);
    if (category && category !== 'surprise_me') query = query.eq('category', category);
    
    query = query.limit(parseInt(limit)).order('rating', { ascending: false });
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: 'Failed to fetch activities' });
    }
    
    res.json({ success: true, data: data || [], count: data ? data.length : 0 });
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
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
  
  res.json({ success: true, data: categories });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found', path: req.originalUrl });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// КРИТИЧНО: Bind to 0.0.0.0 для Railway
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server "Мама, мне скучно!" running on port ${PORT}`);
  console.log(`🌐 Health: http://0.0.0.0:${PORT}/health`);
  console.log(`🗄️ Supabase URL: ${process.env.SUPABASE_URL ? 'Connected' : 'Not configured'}`);
});

module.exports = app;