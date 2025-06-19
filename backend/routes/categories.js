const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// Инициализация Supabase клиента
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Статические данные категорий
const CATEGORIES = [
  {
    id: "active_games",
    title: "Активная игра",
    emoji: "🏃‍♂️",
    description: "Спорт, движение, танцы",
    color: "#FF6B6B",
    examples: "Танцы, игры с мячом, зарядка"
  },
  {
    id: "creativity", 
    title: "Творчество",
    emoji: "🎨",
    description: "Рисование, поделки, музыка",
    color: "#4ECDC4",
    examples: "Рисование, лепка, аппликации"
  },
  {
    id: "learn_new",
    title: "Узнать что-то новое", 
    emoji: "🧠",
    description: "Эксперименты, изучение",
    color: "#45B7D1",
    examples: "Изучение животных, стран, профессий"
  },
  {
    id: "cooking",
    title: "Кулинария",
    emoji: "👨‍🍳", 
    description: "Готовка, выпечка",
    color: "#96CEB4",
    examples: "Бутерброды, салаты, простая выпечка"
  },
  {
    id: "gifts",
    title: "Сделать подарок",
    emoji: "🎁",
    description: "Для друзей, семьи",
    color: "#FFEAA7",
    examples: "Открытки, браслеты, фотоальбомы"
  },
  {
    id: "experiments",
    title: "Эксперименты", 
    emoji: "🔬",
    description: "Наука, опыты",
    color: "#DDA0DD",
    examples: "Опыты с водой, магнитами, растениями"
  },
  {
    id: "reading_stories",
    title: "Чтение и истории",
    emoji: "📚", 
    description: "Книги, сказки, письмо",
    color: "#98D8C8",
    examples: "Чтение, сочинение историй, театр"
  },
  {
    id: "surprise_me",
    title: "Удиви меня!",
    emoji: "🎲",
    description: "Случайная активность", 
    color: "#F7DC6F",
    examples: "Микс из разных категорий"
  }
];

const AGE_GROUPS = [
  {
    id: "3-5",
    title: "3-5 лет", 
    emoji: "👶",
    description: "Дошкольники",
    characteristics: [
      "Развитие мелкой моторики",
      "Простые инструкции (3-4 шага)",
      "Яркие цвета и образы",
      "Короткие активности (10-20 минут)"
    ]
  },
  {
    id: "6-8",
    title: "6-8 лет",
    emoji: "🧒", 
    description: "Младшие школьники",
    characteristics: [
      "Умеют читать простые инструкции",
      "Больше самостоятельности",
      "Интерес к результату",
      "Активности 20-45 минут"
    ]
  },
  {
    id: "9-12", 
    title: "9-12 лет",
    emoji: "👦",
    description: "Средние школьники",
    characteristics: [
      "Сложные многоэтапные проекты",
      "Планирование и организация",
      "Командная работа",
      "Активности 30-90 минут"
    ]
  },
  {
    id: "13-16",
    title: "13-16 лет", 
    emoji: "👨‍🎓",
    description: "Подростки",
    characteristics: [
      "Творческое самовыражение",
      "Социальный аспект",
      "Практическая польза",
      "Проекты на несколько дней"
    ]
  },
  {
    id: "17+",
    title: "17+ лет",
    emoji: "👨",
    description: "Старшие подростки",
    characteristics: [
      "Подготовка к взрослой жизни",
      "Профессиональные навыки",
      "Серьезные проекты",
      "Долгосрочное планирование"
    ]
  },
  {
    id: "adult",
    title: "Взрослый", 
    emoji: "👨‍💼",
    description: "Для родителей",
    characteristics: [
      "Активности для родителей",
      "Семейные проекты",
      "Обучение детей",
      "Развитие родительских навыков"
    ]
  }
];

// Получение всех категорий
router.get('/', async (req, res) => {
  try {
    // Пытаемся получить статистику из Supabase
    const { data: stats, error } = await supabase
      .from('activities')
      .select('category')
      .not('category', 'is', null);
    
    // Добавляем статистику к категориям
    const categoriesWithStats = CATEGORIES.map(category => {
      const activityCount = stats ? stats.filter(s => s.category === category.id).length : 0;
      return {
        ...category,
        activity_count: activityCount
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

// Получение возрастных групп
router.get('/age-groups', async (req, res) => {
  try {
    // Пытаемся получить статистику из Supabase
    const { data: stats, error } = await supabase
      .from('activities')
      .select('age_groups')
      .not('age_groups', 'is', null);
    
    // Подсчитываем активности для каждой возрастной группы
    const ageGroupsWithStats = AGE_GROUPS.map(ageGroup => {
      let activityCount = 0;
      if (stats) {
        stats.forEach(activity => {
          if (activity.age_groups && activity.age_groups.includes(ageGroup.id)) {
            activityCount++;
          }
        });
      }
      
      return {
        ...ageGroup,
        activity_count: activityCount
      };
    });
    
    res.json({
      success: true,
      data: ageGroupsWithStats,
      count: ageGroupsWithStats.length
    });
  } catch (error) {
    console.error('Error loading age groups:', error);
    // Fallback - возвращаем статические данные
    res.json({
      success: true,
      data: AGE_GROUPS,
      count: AGE_GROUPS.length
    });
  }
});

// Получение статистики по категориям
router.get('/stats', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('activities')
      .select('category, difficulty, premium')
      .not('category', 'is', null);
    
    if (error) {
      throw error;
    }
    
    const stats = {
      total_activities: data.length,
      by_category: {},
      by_difficulty: {
        easy: 0,
        medium: 0,
        hard: 0
      },
      premium_count: 0,
      free_count: 0
    };
    
    // Подсчитываем статистику
    data.forEach(activity => {
      // По категориям
      stats.by_category[activity.category] = (stats.by_category[activity.category] || 0) + 1;
      
      // По сложности
      if (activity.difficulty) {
        stats.by_difficulty[activity.difficulty]++;
      }
      
      // Premium vs Free
      if (activity.premium) {
        stats.premium_count++;
      } else {
        stats.free_count++;
      }
    });
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error loading stats:', error);
    res.status(500).json({ 
      error: 'Failed to load statistics',
      message: error.message 
    });
  }
});

// Получение конкретной категории
router.get('/:id', (req, res) => {
  try {
    const category = CATEGORIES.find(cat => cat.id === req.params.id);
    
    if (!category) {
      return res.status(404).json({ 
        error: 'Category not found',
        id: req.params.id 
      });
    }
    
    res.json({
      success: true,
      data: category
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