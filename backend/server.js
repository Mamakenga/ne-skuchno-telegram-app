const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { Telegraf } = require('telegraf');

const app = express();
const PORT = process.env.PORT || 3000;


// CORS настройки
app.use(cors({
  origin: [
    'http://localhost:3001', 
    'http://127.0.0.1:3001', 
    'http://localhost:3000', 
    'http://127.0.0.1:3000',
    'https://ne-skuchno-telegram-app.vercel.app',  // <- ДОБАВЛЯЕМ VERCEL
    'https://ne-skuchno-telegram-app-*.vercel.app' // <- И PREVIEW ВЕРСИИ
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// API Routes - подключение к отдельным файлам
app.use('/api/activities', require('./routes/activities'));
app.use('/api/categories', require('./routes/categories'));

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
    database: 'Connected to Supabase'
  });
});
    
    // Ограничиваем количество
    filteredActivities = filteredActivities.slice(0, parseInt(limit));
    
    res.json({
      success: true,
      data: filteredActivities,
      count: filteredActivities.length,
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
    
   catch (error) {
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

- Ребенок сидит в телефоне или страдает от скуки?
- Не знаешь, чем заняться в свободное время?
😩 Знакомо?

🎯 Есть решение!

Наше БЕСПЛАТНОЕ приложение поможет:
✅ Занять ребенка или себя надолго
✅ Развить творческие способности  
✅ Укрепить связь с семьей
✅ Забыть про страдания в стиле "мне скучно"

🎁 Без затрат: используй то, что есть дома!

👇 Жми кнопку → "Приложение"
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

// ===== SERVER START =====
async function startServer() {
  // Убираем подключение к MongoDB - Supabase подключается автоматически
  console.log('✅ Using Supabase as database');
  
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV}`);
    console.log(`🌐 Health check: http://localhost:${PORT}/health`);
    console.log(`🗄️ Database: Supabase`);
  });
}

startServer().catch(error => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});