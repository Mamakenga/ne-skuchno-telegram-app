const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const { Telegraf } = require('telegraf');

const Activity = require('./models/Activity');
const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 3000;

// Подключение к MongoDB
async function connectToDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

// CORS настройки
app.use(cors({
  origin: ['http://localhost:3001', 'http://127.0.0.1:3001', 'http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

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
      '👶 Для ребят от 3 до 17 лет', 
      '📝 Пошаговые инструкции',
      '⏱️ От 10 минут до 2 часов'
    ],
    database: 'Connected to MongoDB Atlas'
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

// Получение категорий
app.get('/api/categories', async (req, res) => {
  try {
    const categories = [
      { id: 'active_games', title: 'Активная игра', emoji: '🏃‍♂️', description: 'Спорт, движение, танцы', color: '#FF6B6B' },
      { id: 'creativity', title: 'Творчество', emoji: '🎨', description: 'Рисование, поделки, музыка', color: '#4ECDC4' },
      { id: 'learn_new', title: 'Узнать что-то новое', emoji: '🧠', description: 'Эксперименты, изучение', color: '#45B7D1' },
      { id: 'cooking', title: 'Кулинария', emoji: '👨‍🍳', description: 'Готовка, выпечка', color: '#96CEB4' },
      { id: 'gifts', title: 'Сделать подарок', emoji: '🎁', description: 'Для друзей, семьи', color: '#FFEAA7' },
      { id: 'experiments', title: 'Эксперименты', emoji: '🔬', description: 'Наука, опыты', color: '#DDA0DD' },
      { id: 'reading_stories', title: 'Чтение и истории', emoji: '📚', description: 'Книги, сказки, письмо', color: '#98D8C8' },
      { id: 'surprise_me', title: 'Удиви меня!', emoji: '🎲', description: 'Случайная активность', color: '#F7DC6F' }
    ];
    
    res.json({
      success: true,
      data: categories,
      count: categories.length
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Получение активностей с фильтрацией
app.get('/api/activities', async (req, res) => {
  try {
    const { 
      age, 
      category, 
      duration, 
      difficulty, 
      location, 
      premium, 
      limit = 10,
      random 
    } = req.query;
    
    let filter = {};
    
    if (age) {
      filter.age_groups = age;
    }
    
    if (category && category !== 'surprise_me') {
      filter.category = category;
    }
    
    if (duration) {
      switch (duration) {
        case 'short':
          filter.duration_minutes = { $lte: 20 };
          break;
        case 'medium':
          filter.duration_minutes = { $gte: 20, $lte: 45 };
          break;
        case 'long':
          filter.duration_minutes = { $gte: 45 };
          break;
      }
    }
    
    if (difficulty) {
      filter.difficulty = difficulty;
    }
    
    if (location) {
      filter.location = { $in: [location, 'any'] };
    }
    
    if (premium !== undefined) {
      filter.premium = premium === 'true';
    }
    
    let activities;
    
    if (random === 'true' || category === 'surprise_me') {
      activities = await Activity.aggregate([
        { $match: filter },
        { $sample: { size: parseInt(limit) } }
      ]);
    } else {
      activities = await Activity.find(filter)
        .sort({ rating: -1, times_completed: -1 })
        .limit(parseInt(limit));
    }
    
    res.json({
      success: true,
      data: activities,
      count: activities.length,
      filters_applied: {
        age,
        category,
        duration,
        difficulty,
        location,
        premium,
        random
      }
    });
    
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

// Получение конкретной активности по ID
app.get('/api/activities/:id', async (req, res) => {
  try {
    const activity = await Activity.findOne({ id: req.params.id });
    
    if (!activity) {
      return res.status(404).json({ 
        success: false,
        error: 'Activity not found' 
      });
    }
    
    res.json({
      success: true,
      data: activity
    });
  } catch (error) {
    console.error('Error fetching activity:', error);
    res.status(500).json({ error: 'Failed to fetch activity' });
  }
});

// Получение возрастных групп
app.get('/api/age-groups', (req, res) => {
  try {
    const ageGroups = [
      { id: '3-5', title: '3-5 лет', emoji: '👶', description: 'Дошкольники' },
      { id: '6-8', title: '6-8 лет', emoji: '🧒', description: 'Младшие школьники' },
      { id: '9-12', title: '9-12 лет', emoji: '👦', description: 'Средние школьники' },
      { id: '13-16', title: '13-16 лет', emoji: '👨‍🎓', description: 'Подростки' },
      { id: '17+', title: '17+ лет', emoji: '👨', description: 'Старшие подростки' },
      { id: 'adult', title: 'Взрослый', emoji: '👨‍💼', description: 'Для родителей' }
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

// Статистика базы данных
app.get('/api/stats', async (req, res) => {
  try {
    const totalActivities = await Activity.countDocuments();
    const categories = await Activity.distinct('category');
    
    const categoryStats = await Activity.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);
    
    res.json({
      success: true,
      data: {
        total_activities: totalActivities,
        total_categories: categories.length,
        categories: categoryStats
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Telegram Bot
let bot;
if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_BOT_TOKEN.length > 20) {
  bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
  
  bot.start(async (ctx) => {
    const user = ctx.from;
    
    try {
      await User.findOneAndUpdate(
        { telegram_id: user.id.toString() },
        {
          telegram_id: user.id.toString(),
          username: user.username,
          first_name: user.first_name,
          last_name: user.last_name
        },
        { upsert: true, new: true }
      );
      console.log('✅ Пользователь создан/обновлен:', user.first_name);
    } catch (error) {
      console.error('Error creating user:', error);
    }
    
    const welcomeMessage = `👋 Привет, ${user.first_name}!

😩 **Знакомо?**
- "Мне скучно!" - каждые 5 минут
- Ребенок висит в телефоне
- Не знаешь, чем занять дома
- Покупаешь дорогие игрушки, а интерес пропадает за час

🎯 **Есть решение!** 

Наше **БЕСПЛАТНОЕ** приложение поможет:
✅ Занять ребенка надолго
✅ Развить творческие способности  
✅ Укрепить связь с семьей
✅ Забыть про капризы "мне скучно"

🎁 **Без затрат:** используй то, что есть дома!

👇 **Жми кнопку ≡ (меню) → "Чем заняться?"**
Выбирай возраст - и получай 3 идеи прямо сейчас! 🚀`;

    await ctx.reply(welcomeMessage);
  });
  
  bot.command('random', async (ctx) => {
    try {
      const randomActivity = await Activity.aggregate([{ $sample: { size: 1 } }]);
      
      if (randomActivity.length > 0) {
        const activity = randomActivity[0];
        
        const activityMessage = `🎲 **${activity.title}**

📝 **Категория:** ${activity.category}
👶 **Возраст:** ${activity.age_groups.join(', ')} лет
⏱️ **Время:** ${activity.duration_minutes} минут
📊 **Сложность:** ${activity.difficulty}

**Материалы:**
${activity.materials.map(m => `• ${m}`).join('\n')}

**Инструкции:**
${activity.instructions.map((inst, i) => `${i + 1}. ${inst}`).join('\n')}

Попробуй и оцени! ⭐`;

        await ctx.reply(activityMessage);
      } else {
        await ctx.reply('Пока нет активностей в базе 😔');
      }
    } catch (error) {
      console.error('Error fetching random activity:', error);
      await ctx.reply('Ошибка при получении активности 😔');
    }
  });
  
  bot.launch();
  console.log('🤖 Telegraf Bot "Мама, мне скучно!" запущен');
} else {
  console.log('⚠️ Telegram Bot token не настроен');
}

// Запуск сервера
async function startServer() {
  await connectToDatabase();
  
  app.listen(PORT, '0.0.0.0', () => {
    console.log('🚀 Server running on port', PORT);
    console.log('📊 API готов для Telegram Mini App');
    console.log('Ready for testing!');
  });
}

startServer().catch(error => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});