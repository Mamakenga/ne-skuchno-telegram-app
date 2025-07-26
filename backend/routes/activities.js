const express = require('express');
const { Pool } = require('pg');
const router = express.Router();

// Инициализация PostgreSQL клиента
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Проверка подключения при старте
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ PostgreSQL connection error:', err);
  } else {
    console.log('✅ Connected to Railway PostgreSQL');
    release();
  }
});

// Получение активностей с фильтрами
router.get('/', async (req, res) => {
  try {
    const { age, category, duration, difficulty, limit = 10 } = req.query;
    
    let query = 'SELECT * FROM activities WHERE 1=1';
    const values = [];
    let valueIndex = 1;
    
    // Фильтр по возрасту
    if (age) {
      query += ` AND $${valueIndex} = ANY(age_groups)`;
      values.push(age);
      valueIndex++;
    }
    
    // Фильтр по категории
    if (category && category !== 'surprise_me') {
      query += ` AND category = $${valueIndex}`;
      values.push(category);
      valueIndex++;
    }
    
    // Фильтр по длительности
    if (duration) {
      switch (duration) {
        case 'short':
          query += ` AND duration_minutes <= 20`;
          break;
        case 'medium':
          query += ` AND duration_minutes >= 20 AND duration_minutes <= 45`;
          break;
        case 'long':
          query += ` AND duration_minutes >= 45`;
          break;
      }
    }
    
    // Фильтр по сложности
    if (difficulty) {
      query += ` AND difficulty = $${valueIndex}`;
      values.push(difficulty);
      valueIndex++;
    }
    
    // Сортировка и лимит
    query += ` ORDER BY rating DESC, times_completed DESC LIMIT $${valueIndex}`;
    values.push(parseInt(limit));
    
    const result = await pool.query(query, values);
    let activities = result.rows;
    
    // Если запрос "surprise_me" - возвращаем случайные активности
    if (category === 'surprise_me' && activities.length > 0) {
      activities = activities.sort(() => 0.5 - Math.random()).slice(0, 3);
    }
    
    res.json({
      success: true,
      data: activities,
      count: activities.length
    });
    
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ 
      error: 'Failed to fetch activities',
      message: error.message 
    });
  }
});

// Получение конкретной активности
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM activities WHERE id = $1',
      [req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Activity not found',
        id: req.params.id 
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
    
  } catch (error) {
    console.error('Error fetching activity:', error);
    res.status(500).json({ 
      error: 'Failed to fetch activity',
      message: error.message 
    });
  }
});

// Health check для PostgreSQL
router.get('/health/db', async (req, res) => {
  try {
    const result = await pool.query('SELECT COUNT(*) as total FROM activities');
    const statsResult = await pool.query(`
      SELECT category, COUNT(*) as count 
      FROM activities 
      GROUP BY category 
      ORDER BY count DESC
    `);
    
    res.json({
      status: 'OK',
      database: 'Railway PostgreSQL',
      total_activities: result.rows[0].total,
      categories: statsResult.rows,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      database: 'Railway PostgreSQL',
      error: error.message
    });
  }
});

module.exports = router;