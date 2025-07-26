const { Pool } = require('pg');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');
require('dotenv').config();

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

// Конфигурация PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Функция конвертации CSV строки в объект активности
function parseActivityFromCSV(row) {
  return {
    id: row.id ? row.id.toString() : `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
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
    const client = await pool.connect();
    console.log('✅ Connected to Railway PostgreSQL');
    
    // Очистка существующих активностей
    await client.query('DELETE FROM activities');
    console.log('🗑️ Cleared existing activities');
    
    const activities = [];
    const csvPath = path.join(__dirname, '../..', 'sample-activities.csv'); // Путь к вашему CSV файлу
    
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
              // Вставка данных в PostgreSQL
              for (let i = 0; i < activities.length; i++) {
                const activity = activities[i];
                await client.query(`
                  INSERT INTO activities (
                    id, title, short_description, full_description, category, 
                    age_groups, duration_minutes, difficulty, materials, 
                    instructions, skills_developed, season, location, premium, tags
                  ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
                `, [
                  activity.id, activity.title, activity.short_description, 
                  activity.full_description, activity.category, 
                  activity.age_groups, activity.duration_minutes, 
                  activity.difficulty, activity.materials,
                  activity.instructions, activity.skills_developed,
                  activity.season, activity.location, activity.premium, activity.tags
                ]);
                console.log(`✅ Imported: ${activity.title}`);
              }
              
              console.log(`🎉 Successfully imported ${activities.length} activities`);
              
              // Показать статистику
              const statsResult = await client.query(`
                SELECT category, COUNT(*) as count 
                FROM activities 
                GROUP BY category
              `);
              
              console.log('\n📊 Import statistics:');
              statsResult.rows.forEach(stat => {
                console.log(`${stat.category}: ${stat.count} activities`);
              });
            } else {
              console.log('⚠️ No activities to import');
            }
            
            client.release();
            console.log('👋 Disconnected from PostgreSQL');
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