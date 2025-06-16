const { createClient } = require('@supabase/supabase-js');

// Инициализация Supabase клиента
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

class Activity {
  constructor(data) {
    Object.assign(this, data);
  }

  // Получить все активности с фильтрами
  static async find(filters = {}) {
    try {
      let query = supabase.from('activities').select('*');
      
      // Применяем фильтры
      if (filters.category) {
        query = query.eq('category', filters.category);
      }
      
      if (filters.age_group) {
        query = query.contains('age_groups', [filters.age_group]);
      }
      
      if (filters.premium !== undefined) {
        query = query.eq('premium', filters.premium);
      }
      
      if (filters.duration_min && filters.duration_max) {
        query = query.gte('duration_minutes', filters.duration_min)
                     .lte('duration_minutes', filters.duration_max);
      }
      
      if (filters.difficulty) {
        query = query.eq('difficulty', filters.difficulty);
      }
      
      // Сортировка
      if (filters.sort_by === 'rating') {
        query = query.order('rating', { ascending: false });
      } else if (filters.sort_by === 'popular') {
        query = query.order('times_completed', { ascending: false });
      } else {
        query = query.order('created_at', { ascending: false });
      }
      
      // Лимит
      if (filters.limit) {
        query = query.limit(filters.limit);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      return data.map(item => new Activity(item));
    } catch (error) {
      throw new Error(`Failed to fetch activities: ${error.message}`);
    }
  }

  // Найти активность по ID
  static async findById(id) {
    try {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      return data ? new Activity(data) : null;
    } catch (error) {
      throw new Error(`Failed to fetch activity: ${error.message}`);
    }
  }

  // Найти по категории
  static async findByCategory(category) {
    return this.find({ category });
  }

  // Найти по возрастной группе
  static async findByAgeGroup(ageGroup) {
    return this.find({ age_group: ageGroup });
  }

  // Получить случайные активности
  static async getRandom(count = 3, filters = {}) {
    try {
      // Сначала получаем все подходящие активности
      const activities = await this.find(filters);
      
      // Перемешиваем и берем нужное количество
      const shuffled = activities.sort(() => 0.5 - Math.random());
      return shuffled.slice(0, count);
    } catch (error) {
      throw new Error(`Failed to get random activities: ${error.message}`);
    }
  }

  // Создать новую активность
  static async create(activityData) {
    try {
      const { data, error } = await supabase
        .from('activities')
        .insert([activityData])
        .select()
        .single();
      
      if (error) throw error;
      
      return new Activity(data);
    } catch (error) {
      throw new Error(`Failed to create activity: ${error.message}`);
    }
  }

  // Обновить активность
  async update(updateData) {
    try {
      const { data, error } = await supabase
        .from('activities')
        .update(updateData)
        .eq('id', this.id)
        .select()
        .single();
      
      if (error) throw error;
      
      Object.assign(this, data);
      return this;
    } catch (error) {
      throw new Error(`Failed to update activity: ${error.message}`);
    }
  }

  // Увеличить счетчик выполнений
  async incrementCompleted() {
    try {
      const { data, error } = await supabase
        .from('activities')
        .update({ 
          times_completed: this.times_completed + 1 
        })
        .eq('id', this.id)
        .select()
        .single();
      
      if (error) throw error;
      
      this.times_completed = data.times_completed;
      return this;
    } catch (error) {
      throw new Error(`Failed to increment completed: ${error.message}`);
    }
  }

  // Обновить рейтинг
  async updateRating(newRating) {
    try {
      const totalRatings = this.times_completed;
      let updatedRating;
      
      if (totalRatings === 0) {
        updatedRating = newRating;
      } else {
        updatedRating = ((this.rating * totalRatings) + newRating) / (totalRatings + 1);
      }
      
      const { data, error } = await supabase
        .from('activities')
        .update({ 
          rating: Math.round(updatedRating * 10) / 10 // Округляем до 1 знака
        })
        .eq('id', this.id)
        .select()
        .single();
      
      if (error) throw error;
      
      this.rating = data.rating;
      return this;
    } catch (error) {
      throw new Error(`Failed to update rating: ${error.message}`);
    }
  }

  // Удалить активность
  async delete() {
    try {
      const { error } = await supabase
        .from('activities')
        .delete()
        .eq('id', this.id);
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      throw new Error(`Failed to delete activity: ${error.message}`);
    }
  }

  // Получить статистику
  static async getStats() {
    try {
      const { data: totalCount } = await supabase
        .from('activities')
        .select('id', { count: 'exact' });

      const { data: categories } = await supabase
        .from('activities')
        .select('category')
        .then(({ data }) => {
          const counts = {};
          data.forEach(item => {
            counts[item.category] = (counts[item.category] || 0) + 1;
          });
          return { data: counts };
        });

      const { data: avgRating } = await supabase
        .from('activities')
        .select('rating')
        .then(({ data }) => {
          const sum = data.reduce((acc, item) => acc + item.rating, 0);
          return { data: sum / data.length };
        });

      return {
        total: totalCount.length,
        by_category: categories,
        average_rating: Math.round(avgRating * 10) / 10
      };
    } catch (error) {
      throw new Error(`Failed to get stats: ${error.message}`);
    }
  }

  // Виртуальные свойства
  get duration_text() {
    if (this.duration_minutes <= 20) return 'Быстро';
    if (this.duration_minutes <= 45) return 'Средне';
    return 'Долго';
  }

  get difficulty_emoji() {
    const emojis = { easy: '😊', medium: '🤔', hard: '😤' };
    return emojis[this.difficulty] || '😊';
  }
}

module.exports = Activity;