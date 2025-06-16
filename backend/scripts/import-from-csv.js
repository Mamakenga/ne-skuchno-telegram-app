const mongoose = require('mongoose');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');
require('dotenv').config();

const Activity = require('../models/Activity');

// Функция парсинга строк в массивы
function parseStringToArray(str) {
  if (!str || str.trim() === '') return [];
  return str.split(',').map(item => item.trim()).filter(item => item.length > 0);
}

// Функция парсинга инструкций (разделитель - вертикальная черта |)
function parseInstructions(str) {
  if (!str || str.trim() === '') return [];
  return str.split('|').map(item => item.trim()).filter(item => item.length > 0);
}

/ Можно также использовать для других полей:
function parseStringToArray(str, delimiter = ',') {
  if (!str || str.trim() === '') return [];
  return str.split(delimiter).map(item => item.trim()).filter(item => item.length > 0);
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
    duration_minutes: parseFloat(row.duration_minutes) || 15,
    difficulty: row.difficulty || 'easy',
    materials: parseStringToArray(row.materials, ','),      // Запятая для материалов
    instructions: parseInstructions(row.instructions),       // | для инструкций 
    skills_developed: parseStringToArray(row.skills_developed, ','), // Запятая для навыков
    season: row.season || 'any',
    location: row.location || 'indoor',
    premium: row.premium === 'true' || row.premium === true,
    tags: parseStringToArray(row.tags, ','),                // Запятая для тегов
    rating: 0,
    times_completed: 0
  };
}

async function importFromCSV() {
  try {
    console.log('🔄 Starting CSV import...');
    
    // Подключение к БД
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Очистка существующих активностей
    await Activity.deleteMany({});
    console.log('🗑️ Cleared existing activities');
    
    const activities = [];
    const csvPath = path.join(__dirname, '../..', 'activities.csv'); // Путь к вашему CSV файлу
    
    console.log('📂 Reading CSV from:', csvPath);
    
    return new Promise((resolve, reject) => {
      fs.createReadStream(csvPath)
        .pipe(csv())
        .on('data', (row) => {
          try {
            const activity = parseActivityFromCSV(row);
            activities.push(activity);
            console.log(`📄 Parsed: ${activity.title}`);
          } catch (error) {
            console.error('❌ Error parsing row:', error);
          }
        })
        .on('end', async () => {
          try {
            if (activities.length > 0) {
              await Activity.insertMany(activities);
              console.log(`🎉 Successfully imported ${activities.length} activities`);
              
              // Показать статистику
              const stats = await Activity.aggregate([
                {
                  $group: {
                    _id: '$category',
                    count: { $sum: 1 }
                  }
                }
              ]);
              
              console.log('\n📊 Import statistics:');
              stats.forEach(stat => {
                console.log(`${stat._id}: ${stat.count} activities`);
              });
            } else {
              console.log('⚠️ No activities to import');
            }
            
            await mongoose.disconnect();
            console.log('👋 Disconnected from MongoDB');
            resolve();
          } catch (error) {
            console.error('❌ Database error:', error);
            reject(error);
          }
        })
        .on('error', (error) => {
          console.error('❌ CSV reading error:', error);
          reject(error);
        });
    });
    
  } catch (error) {
    console.error('❌ Import error:', error);
    process.exit(1);
  }
}

// Запуск импорта
if (require.main === module) {
  importFromCSV();
}

module.exports = importFromCSV;