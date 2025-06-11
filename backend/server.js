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

// Получение категорий из MongoDB
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await Activity.distinct('category');
    
    res.json({
      success: true,
      data: categories,
      count: categories.length,
      message: 'Categories from MongoDB'
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Получение активностей из MongoDB
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
    
    // Строим фильтр
    let filter = {};
    
    // Фильтр по возрасту
    if (age) {
      filter.age_groups = age;
    }
    
    // Фильтр по категории
    if (category && category !== 'surprise_me') {
      filter.category = category;
    }
    
    // Фильтр по длительности
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
    
    // Фильтр по сложности
    if (difficulty) {
      filter.difficulty = difficulty;
    }
    
    // Фильтр по месту проведения
    if (location) {
      filter.location = { $in: [location, 'any'] };
    }
    
    // Фильтр по премиум
    if (premium !== undefined) {
      filter.premium = premium === 'true';
    }
    
    let activities;
    
    // Случайные активности для "Удиви меня!"
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

// Поиск активностей по ключевым словам
app.get('/api/activities/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const { limit = 10 } = req.query;
    
    const activities = await Activity.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { tags: { $regex: query, $options: 'i' } },
        { skills_developed: { $regex: query, $options: 'i' } }
      ]
    }).limit(parseInt(limit));
    
    res.json({
      success: true,
      data: activities,
      count: activities.length,
      query: query
    });
  } catch (error) {
    console.error('Error searching activities:', error);
    res.status(500).json({ error: 'Failed to search activities' });
  }
});

// Получение возрастных групп
app.get('/api/age-groups', async (req, res) => {
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

// ===== TELEGRAM BOT (TELEGRAF) БЕЗ WEB APP =====

let bot;
if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_BOT_TOKEN.length > 20) {
  bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
  
  // Команда /start
  bot.start(async (ctx) => {
    const user = ctx.from;
    
    // Создаем или обновляем пользователя в базе
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

🎯 Я помогаю родителям решить проблему детской скуки!

🎨 **8 категорий активностей:**
- Творчество  
- Активные игры
- Изучение нового
- Кулинария
- Подарки своими руками
- Эксперименты
- Чтение и истории
- Удиви меня!

👶 **Для ребят от 3 до 17 лет**  
📝 **Пошаговые инструкции**  
⏱️ **От 10 минут до 2 часов**

**Команды бота:**
/random - 🎲 Случайная активность
/creativity - 🎨 Творческие активности  
/active - 🏃‍♂️ Активные игры
/help - ❓ Помощь`;

    await ctx.reply(welcomeMessage);
  });
  
  // Команда /help
  bot.help(async (ctx) => {
    const helpMessage = `❓ **Доступные команды:**

🚀 /start - приветствие и список команд
🎲 /random - случайная активность
🎨 /creativity - творческие активности
🏃‍♂️ /active - активные игры
📊 /stats - твоя статистика
❓ /help - эта справка

**Скоро добавим:**
📱 Полноценное приложение с фильтрами
⭐ Систему рейтингов
💾 Избранные активности

Пока пользуйся командами выше! 😊`;
    
    await ctx.reply(helpMessage);
  });
  
  // Команда для случайной активности
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
  
  // Команда для творческих активностей
  bot.command('creativity', async (ctx) => {
    try {
      const activities = await Activity.find({ category: 'creativity' }).limit(3);
      
      if (activities.length > 0) {
        let message = '🎨 **Творческие активности:**\n\n';
        
        activities.forEach((activity, i) => {
          message += `${i + 1}. **${activity.title}**\n`;
          message += `⏱️ ${activity.duration_minutes} мин, 👶 ${activity.age_groups.join(', ')} лет\n`;
          message += `${activity.instructions[0]}...\n\n`;
        });
        
        message += 'Используй /random для случайной активности!';
        
        await ctx.reply(message);
      } else {
        await ctx.reply('Пока нет творческих активностей 😔');
      }
    } catch (error) {
      console.error('Error fetching creativity activities:', error);
      await ctx.reply('Ошибка при получении активностей 😔');
    }
  });
  
  // Команда для активных игр
  bot.command('active', async (ctx) => {
    try {
      const activities = await Activity.find({ category: 'active_games' }).limit(3);
      
      if (activities.length > 0) {
        let message = '🏃‍♂️ **Активные игры:**\n\n';
        
        activities.forEach((activity, i) => {
          message += `${i + 1}. **${activity.title}**\n`;
          message += `⏱️ ${activity.duration_minutes} мин, 👶 ${activity.age_groups.join(', ')} лет\n`;
          message += `${activity.instructions[0]}...\n\n`;
        });
        
        message += 'Используй /random для случайной активности!';
        
        await ctx.reply(message);
      } else {
        await ctx.reply('Пока нет активных игр 😔');
      }
    } catch (error) {
      console.error('Error fetching active games:', error);
      await ctx.reply('Ошибка при получении активностей 😔');
    }
  });
  
  // Команда /stats  
  bot.command('stats', async (ctx) => {
    const user = ctx.from;
    
    try {
      const userStats = await User.findOne({ telegram_id: user.id.toString() });
      
      if (!userStats) {
        await ctx.reply('📊 Пока нет статистики.\n\nПопробуй команды /random, /creativity или /active чтобы начать!');
        return;
      }
      
      const totalActivities = await Activity.countDocuments();
      
      const statsMessage = `📊 **Твоя статистика:**

✅ Выполнено активностей: ${userStats.completed_activities.length}
💾 В избранном: ${userStats.favorite_activities.length}
👨‍💼 Участник с: ${userStats.createdAt.toLocaleDateString('ru-RU')}

📈 **Общая статистика:**
🎯 Всего активностей в базе: ${totalActivities}

Используй /random для новых идей! 🎲`;
      
      await ctx.reply(statsMessage);
    } catch (error) {
      console.error('Error fetching stats:', error);
      await ctx.reply('Ошибка при получении статистики 😔');
    }
  });
  
  // Запуск бота
  bot.launch();
  
  console.log('🤖 Telegraf Bot "Мама, мне скучно!" запущен (без Web App)');
} else {
  console.log('⚠️ Telegram Bot token не настроен');
}

async function startServer() {
  await connectToDatabase();
  
  app.listen(PORT, '127.0.0.1', () => {
    async function startServer() {
  await connectToDatabase();
  
  app.listen(PORT, '127.0.0.1', () => {
    console.log('🗄️ Database: MongoDB Atlas connected');
    console.log('📊 API Endpoints:');
    console.log('   === ACTIVITIES ===');
    console.log('   - GET /api/activities (with filters)');
    console.log('   - GET /api/activities/:id');
    console.log('   - GET /api/activities/search/:query');
    console.log('   === USERS ===');
    console.log('   - POST /api/users (create/update)');
    console.log('   - GET /api/users/:telegram_id');
    console.log('   - POST /api/users/:telegram_id/rate/:activity_id');
    console.log('   - POST /api/users/:telegram_id/favorites/:activity_id');
    console.log('   - GET /api/users/:telegram_id/favorites');
    console.log('   - GET /api/users/:telegram_id/stats');
    console.log('   === OTHER ===');
    console.log('   - GET /api/categories');
    console.log('   - GET /api/age-groups');
    console.log('   - GET /api/stats');
    console.log('🎯 "Мама, мне скучно!" - Backend API');
    console.log('🌟 Тысяча и одна идея против скуки!');
    console.log('🚀 Server running on http://127.0.0.1:3000');
    console.log('🗄️ Database: MongoDB Atlas connected');
    console.log('🤖 Bot: @ne_skuchno_bot');
    console.log('📊 API готов для Telegram Mini App');
    console.log('Ready for testing!');
  });
}

startServer().catch(error => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});
  });
}

// ===== USER API =====

// Создание или получение пользователя
app.post('/api/users', async (req, res) => {
  try {
    const { telegram_id, username, first_name, last_name } = req.body;
    
    if (!telegram_id) {
      return res.status(400).json({ error: 'telegram_id is required' });
    }
    
    // Находим или создаем пользователя
    let user = await User.findOne({ telegram_id });
    
    if (!user) {
      user = new User({
        telegram_id,
        username,
        first_name,
        last_name
      });
      await user.save();
    } else {
      // Обновляем данные пользователя
      user.username = username || user.username;
      user.first_name = first_name || user.first_name;
      user.last_name = last_name || user.last_name;
      await user.save();
    }
    
    res.json({
      success: true,
      data: user,
      message: user.isNew ? 'User created' : 'User updated'
    });
  } catch (error) {
    console.error('Error with user:', error);
    res.status(500).json({ error: 'Failed to process user' });
  }
});

// Получение пользователя
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

// Оценка активности пользователем
app.post('/api/users/:telegram_id/rate/:activity_id', async (req, res) => {
  try {
    const { telegram_id, activity_id } = req.params;
    const { rating } = req.body;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }
    
    // Находим пользователя
    const user = await User.findOne({ telegram_id });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Находим активность
    const activity = await Activity.findOne({ id: activity_id });
    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }
    
    // Проверяем, не оценивал ли уже пользователь эту активность
    const existingRating = user.completed_activities.find(
      ca => ca.activity_id === activity_id
    );
    
    if (existingRating) {
      return res.status(400).json({ error: 'Activity already rated by this user' });
    }
    
    // Добавляем оценку к пользователю
    user.completed_activities.push({
      activity_id,
      rating,
      completed_at: new Date()
    });
    await user.save();
    
    // Обновляем рейтинг активности
    const totalRatings = activity.times_completed;
    const newAvgRating = ((activity.rating * totalRatings) + rating) / (totalRatings + 1);
    
    activity.rating = newAvgRating;
    activity.times_completed += 1;
    await activity.save();
    
    res.json({
      success: true,
      data: {
        user_rating: rating,
        activity_new_rating: newAvgRating,
        activity_total_completions: activity.times_completed
      }
    });
  } catch (error) {
    console.error('Error rating activity:', error);
    res.status(500).json({ error: 'Failed to rate activity' });
  }
});

// Добавление активности в избранное
app.post('/api/users/:telegram_id/favorites/:activity_id', async (req, res) => {
  try {
    const { telegram_id, activity_id } = req.params;
    
    const user = await User.findOne({ telegram_id });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const activity = await Activity.findOne({ id: activity_id });
    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }
    
    // Проверяем, не добавлена ли уже в избранное
    if (user.favorite_activities.includes(activity_id)) {
      return res.status(400).json({ error: 'Activity already in favorites' });
    }
    
    user.favorite_activities.push(activity_id);
    await user.save();
    
    res.json({
      success: true,
      message: 'Activity added to favorites',
      favorites_count: user.favorite_activities.length
    });
  } catch (error) {
    console.error('Error adding to favorites:', error);
    res.status(500).json({ error: 'Failed to add to favorites' });
  }
});

// Получение избранных активностей пользователя
app.get('/api/users/:telegram_id/favorites', async (req, res) => {
  try {
    const user = await User.findOne({ telegram_id: req.params.telegram_id });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Получаем полные данные избранных активностей
    const favoriteActivities = await Activity.find({
      id: { $in: user.favorite_activities }
    });
    
    res.json({
      success: true,
      data: favoriteActivities,
      count: favoriteActivities.length
    });
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({ error: 'Failed to fetch favorites' });
  }
});

// Статистика пользователя
app.get('/api/users/:telegram_id/stats', async (req, res) => {
  try {
    const user = await User.findOne({ telegram_id: req.params.telegram_id });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const totalCompleted = user.completed_activities.length;
    const avgRating = totalCompleted > 0 
      ? user.completed_activities.reduce((sum, ca) => sum + (ca.rating || 0), 0) / totalCompleted
      : 0;
    
    // Статистика по категориям
    const completedActivityIds = user.completed_activities.map(ca => ca.activity_id);
    const completedActivities = await Activity.find({ id: { $in: completedActivityIds } });
    
    const categoryStats = {};
    completedActivities.forEach(activity => {
      categoryStats[activity.category] = (categoryStats[activity.category] || 0) + 1;
    });
    
    res.json({
      success: true,
      data: {
        total_completed: totalCompleted,
        total_favorites: user.favorite_activities.length,
        average_rating_given: Math.round(avgRating * 10) / 10,
        daily_generations_today: user.daily_generations.count,
        is_premium: user.is_premium,
        categories_completed: categoryStats,
        member_since: user.createdAt
      }
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ error: 'Failed to fetch user stats' });
  }
});

startServer().catch(error => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});