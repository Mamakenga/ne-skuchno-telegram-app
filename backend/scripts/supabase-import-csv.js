// backend/scripts/supabase-import-csv-fixed.js

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Функция парсинга строк в массивы
function parseStringToArray(str) {
  if (!str || str.trim() === '') return [];
  return str.split(',').map(item => item.trim()).filter(item => item.length > 0);
}

// Функция парсинга инструкций
function parseInstructions(str) {
  if (!str || str.trim() === '') return [];
  return str.split('|').map(item => item.trim()).filter(item => item.length > 0);
}

// Функция конвертации CSV строки в объект активности
function parseActivityFromCSV(row) {
  return {
    id: row.id.toString(),
    title: row.title,
    short_description: row.short_description,
    full_description: row.full_description,
    category: row.category,
    age_groups: parseStringToArray(row.age_groups),
    duration_minutes: parseInt(row.duration_minutes) || 15,
    difficulty: row.difficulty || 'easy',
    materials: parseStringToArray(row.materials),
    instructions: parseInstructions(row.instructions),
    skills_developed: parseStringToArray(row.skills_developed),
    season: row.season || 'any',
    location: row.location || 'indoor',
    premium: row.premium === 'true',
    tags: parseStringToArray(row.tags),
    
    // Автогенерируемые поля
    video_url: null,
    image_url: null,
    site_url: `https://yoursite.com/activities/${row.id}`,
    has_detailed_content: !!(row.full_description && row.full_description.length > 50),
    
    // Начальные значения
    rating: 0,
    times_completed: 0
  };
}

// Функция валидации активности
function validateActivity(activity) {
  const errors = [];
  
  if (!activity.id) errors.push('Отсутствует ID');
  if (!activity.title) errors.push('Отсутствует название');
  if (!activity.category) errors.push('Отсутствует категория');
  if (!activity.instructions || activity.instructions.length === 0) {
    errors.push('Отсутствуют инструкции');
  }
  
  return errors;
}

// Основная функция импорта
async function importFromCSV() {
  try {
    console.log('🔄 Начинаем импорт из CSV в Supabase...');
    console.log('✅ Подключились к Supabase');
    
    // ✅ ИСПРАВЛЕННЫЙ ПУТЬ К ФАЙЛУ
    const csvPath = path.join(__dirname, '..', '..', 'activities.csv');
    console.log('📂 Ищем CSV файл:', csvPath);
    
    if (!fs.existsSync(csvPath)) {
      throw new Error(`CSV файл не найден: ${csvPath}`);
    }
    
    // Очистка существующих данных
    console.log('🗑️ Удаляем все существующие активности...');
    const { data: existingData, error: countError } = await supabase
      .from('activities')
      .select('id', { count: 'exact' });
    
    if (existingData && existingData.length > 0) {
      const { error: deleteError } = await supabase
        .from('activities')
        .delete()
        .neq('id', ''); // Удаляем все записи
      
      if (deleteError) throw deleteError;
      console.log(`✅ Удалили ${existingData.length} существующих активностей`);
    }
    
    const activities = [];
    const errors = [];
    
    return new Promise((resolve, reject) => {
      fs.createReadStream(csvPath)
        .pipe(csv())
        .on('data', (row) => {
          try {
            const activity = parseActivityFromCSV(row);
            const validationErrors = validateActivity(activity);
            
            if (validationErrors.length > 0) {
              errors.push({
                id: activity.id,
                title: activity.title,
                errors: validationErrors
              });
            } else {
              activities.push(activity);
              console.log(`📄 Обработали: ${activity.title} (${activity.id})`);
            }
          } catch (error) {
            console.error(`❌ Ошибка обработки строки:`, error);
            errors.push({
              row: JSON.stringify(row),
              error: error.message
            });
          }
        })
        .on('end', async () => {
          try {
            console.log('\n📊 Статистика обработки:');
            console.log(`✅ Успешно обработано: ${activities.length} активностей`);
            console.log(`❌ Ошибок: ${errors.length}`);
            
            if (errors.length > 0) {
              console.log('\n🚨 Найденные ошибки:');
              errors.forEach((error, index) => {
                console.log(`${index + 1}. ${error.id || 'Unknown'}: ${error.errors ? error.errors.join(', ') : error.error}`);
              });
            }
            
            if (activities.length > 0) {
              console.log('\n💾 Сохраняем в Supabase...');
              const { data, error } = await supabase
                .from('activities')
                .insert(activities);
              
              if (error) throw error;
              
              console.log(`🎉 Успешно импортировано ${activities.length} активностей`);
              
              // Показать статистику по категориям
              const { data: statsData } = await supabase
                .from('activities')
                .select('category');
              
              if (statsData) {
                const categoryStats = statsData.reduce((acc, item) => {
                  acc[item.category] = (acc[item.category] || 0) + 1;
                  return acc;
                }, {});
                
                console.log('\n📈 Статистика по категориям:');
                Object.entries(categoryStats).forEach(([category, count]) => {
                  console.log(`${category}: ${count} активностей`);
                });
              }
              
              // Показать примеры активностей
              const { data: samples } = await supabase
                .from('activities')
                .select('id, title, category, duration_minutes')
                .limit(3);
              
              if (samples) {
                console.log('\n🎯 Примеры импортированных активностей:');
                samples.forEach(activity => {
                  console.log(`- ${activity.title} (${activity.category}, ${activity.duration_minutes} мин)`);
                });
              }
            } else {
              console.log('⚠️ Нет активностей для импорта');
            }
            
            console.log('\n👋 Импорт завершен успешно!');
            resolve();
          } catch (error) {
            console.error('❌ Ошибка сохранения в БД:', error);
            reject(error);
          }
        })
        .on('error', (error) => {
          console.error('❌ Ошибка чтения CSV:', error);
          reject(error);
        });
    });
    
  } catch (error) {
    console.error('❌ Ошибка импорта:', error);
    process.exit(1);
  }
}

// Запуск импорта при прямом вызове
if (require.main === module) {
  importFromCSV();
}

module.exports = importFromCSV;