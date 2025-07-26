const express = require('express');
const { Pool } = require('pg');
const router = express.Router();

// Инициализация PostgreSQL клиента
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Статические данные категорий
const CATEGORIES = [
  {
    id: "active_games",
    title: "Активная игра",
    emoji: "🏃‍♂️",
    description: "Спорт, движение, танцы",
    color: "#FF6B6B"
  },
  {
    id: "creativity", 
    title: "Творчество",
    emoji: "🎨",
    description: "Рисование, поделки, музыка",
    color: "#4ECDC4"
  },
  {
    id: "learn_new",
    title: "Узнать что-то новое", 
    emoji: "🧠",
    description: "Эксперименты, изучение",
    color: "#45B7D1"
  },
  {
    id: "cooking",
    title: "Кулинария",
    emoji: "👨‍🍳", 
    description: "Готовка, выпечка",
    color: "#96CEB4"
  },
  {
    id: "gifts",
    title: "Сделать подарок",
    emoji: "🎁",
    description: "Для друзей, семьи",
    color: "#FFEAA7"
  },
  {
    id: "experiments",
    title: "Эксперименты", 
    emoji: "🔬",
    description: "Наука, опыты",
    color: "#DDA0DD"
  },
  {
    id: "reading_stories",
    title: "Чтение и истории",
    emoji: "📚", 
    description: "Книги, сказки, письмо",
    color: "#98D8C8"
  },
  {
    id: "surprise_me",
    title: "Удиви меня!",
    emoji: "🎲",
    description: "Случайная активность", 
    color: "#F7DC6F"
  }
];

// Получение всех категорий
router.get('/', async (req, res) => {
  try {
    // Получаем статистику из PostgreSQL
    const { rows: stats } = await pool.query(`
      SELECT category, COUNT(*) as activity_count 
      FROM activities 
      GROUP BY category
    `);
    
    // Добавляем статистику к категориям
    const categoriesWithStats = CATEGORIES.map(category => {
      const stat = stats.find(s => s.category === category.id);
      return {
        ...category,
        activity_count: stat ? parseInt(stat.activity_count) : 0
      };
    });
    
    res.json({
      success: true,
      data: categoriesWithStats,
      count: categoriesWithStats.length
    });
  } catch (error) {
    console.error('Error loading categories:', error);
    // Fallback - возвращаем статические данные
    res.json({
      success: true,
      data: CATEGORIES,
      count: CATEGORIES.length
    });
  }
});

// Получение конкретной категории
router.get('/:id', async (req, res) => {
  try {
    const category = CATEGORIES.find(cat => cat.id === req.params.id);
    
    if (!category) {
      return res.status(404).json({ 
        error: 'Category not found',
        id: req.params.id 
      });
    }
    
    // Добавляем статистику для конкретной категории
    const { rows } = await pool.query(
      'SELECT COUNT(*) as activity_count FROM activities WHERE category = $1',
      [req.params.id]
    );
    
    res.json({
      success: true,
      data: {
        ...category,
        activity_count: parseInt(rows[0].activity_count)
      }
    });
  } catch (error) {
    console.error('Error loading category:', error);
    res.status(500).json({ 
      error: 'Failed to load category',
      message: error.message 
    });
  }
});

module.exports = router;