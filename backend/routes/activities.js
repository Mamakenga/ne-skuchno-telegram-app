const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const router = express.Router();

// Инициализация Supabase клиента
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Получение активностей с фильтрами
router.get('/', async (req, res) => {
  try {
    const { age, category, duration, difficulty, limit = 10 } = req.query;
    
    let query = supabase
      .from('activities')
      .select('*');
    
    // Фильтр по возрасту
    if (age) {
      query = query.contains('age_groups', [age]);
    }
    
    // Фильтр по категории
    if (category && category !== 'surprise_me') {
      query = query.eq('category', category);
    }
    
    // Фильтр по длительности
    if (duration) {
      switch (duration) {
        case 'short':
          query = query.lte('duration_minutes', 20);
          break;
        case 'medium':
          query = query.gte('duration_minutes', 20).lte('duration_minutes', 45);
          break;
        case 'long':
          query = query.gte('duration_minutes', 45);
          break;
      }
    }
    
    // Фильтр по сложности
    if (difficulty) {
      query = query.eq('difficulty', difficulty);
    }
    
    // Лимит результатов
    query = query.limit(parseInt(limit));
    
    // Сортировка по рейтингу
    query = query.order('rating', { ascending: false });
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ 
        error: 'Failed to fetch activities',
        details: error.message 
      });
    }
    
    // Если запрос "surprise_me" - возвращаем случайные активности
    if (category === 'surprise_me' && data.length > 0) {
      const shuffled = data.sort(() => 0.5 - Math.random());
      return res.json({
        success: true,
        data: shuffled.slice(0, 3),
        count: shuffled.slice(0, 3).length
      });
    }
    
    res.json({
      success: true,
      data: data || [],
      count: data ? data.length : 0
    });
    
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// Получение конкретной активности
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('id', req.params.id)
      .single();
    
    if (error) {
      console.error('Supabase error:', error);
      return res.status(404).json({ 
        error: 'Activity not found',
        id: req.params.id 
      });
    }
    
    res.json({
      success: true,
      data: data
    });
    
  } catch (error) {
    console.error('Error fetching activity:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// Обновление рейтинга активности
router.post('/:id/rate', async (req, res) => {
  try {
    const { rating } = req.body;
    const activityId = req.params.id;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ 
        error: 'Rating must be between 1 and 5' 
      });
    }
    
    // Получаем текущие данные
    const { data: activity, error: fetchError } = await supabase
      .from('activities')
      .select('rating, times_completed')
      .eq('id', activityId)
      .single();
    
    if (fetchError) {
      return res.status(404).json({ 
        error: 'Activity not found' 
      });
    }
    
    // Вычисляем новый рейтинг
    const currentRating = activity.rating || 0;
    const currentCount = activity.times_completed || 0;
    const newCount = currentCount + 1;
    const newRating = ((currentRating * currentCount) + rating) / newCount;
    
    // Обновляем в базе
    const { error: updateError } = await supabase
      .from('activities')
      .update({ 
        rating: Math.round(newRating * 100) / 100,
        times_completed: newCount 
      })
      .eq('id', activityId);
    
    if (updateError) {
      console.error('Update error:', updateError);
      return res.status(500).json({ 
        error: 'Failed to update rating' 
      });
    }
    
    res.json({ 
      success: true, 
      new_rating: Math.round(newRating * 100) / 100,
      times_completed: newCount
    });
    
  } catch (error) {
    console.error('Error rating activity:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

module.exports = router;