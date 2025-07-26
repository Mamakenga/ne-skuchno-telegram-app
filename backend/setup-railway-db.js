const { Pool } = require('pg');

// Замените на ваш connection string из Railway
const DATABASE_URL = 'postgresql://postgres:JVTHicuijnpiqUCFBwKdbCoNADmkHuna@tramway.proxy.rlwy.net:20902/railway';

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function setupDatabase() {
  console.log('🚀 Подключаемся к Railway PostgreSQL...');
  
  try {
    // Тест подключения
    const client = await pool.connect();
    console.log('✅ Подключение успешно!');
    client.release();

    // Создание таблицы
    console.log('🔧 Создаем таблицу activities...');
    
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS activities (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        short_description VARCHAR(500) NOT NULL,
        full_description TEXT NOT NULL,
        category VARCHAR(100) NOT NULL,
        age_groups TEXT[],
        duration_minutes INTEGER NOT NULL,
        difficulty VARCHAR(20) DEFAULT 'easy',
        materials TEXT[],
        instructions TEXT[] NOT NULL,
        skills_developed TEXT[],
        season VARCHAR(20) DEFAULT 'any',
        location VARCHAR(20) DEFAULT 'indoor',
        premium BOOLEAN DEFAULT false,
        tags TEXT[],
        rating NUMERIC(3,2) DEFAULT 0,
        times_completed INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_activities_category ON activities(category);
      CREATE INDEX IF NOT EXISTS idx_activities_age_groups ON activities USING GIN(age_groups);
      CREATE INDEX IF NOT EXISTS idx_activities_rating ON activities(rating DESC);
    `;

    await pool.query(createTableSQL);
    console.log('✅ Таблица activities создана!');

    // Добавление тестовой записи
    console.log('📝 Добавляем тестовую запись...');
    
    const insertSQL = `
      INSERT INTO activities (
        id, title, short_description, full_description, category,
        age_groups, duration_minutes, difficulty, materials, instructions,
        skills_developed, season, location, premium, tags
      ) VALUES (
        'test_railway_001',
        'Тестовая Railway активность',
        'Проверяем работу Railway PostgreSQL',
        'Эта активность создана для проверки работы Railway PostgreSQL через Node.js',
        'creativity',
        ARRAY['6-8', '9-12'],
        15,
        'easy',
        ARRAY['бумага', 'карандаш'],
        ARRAY['Возьми бумагу', 'Нарисуй что-нибудь', 'Покажи результат'],
        ARRAY['творчество', 'мелкая моторика'],
        'any',
        'indoor',
        false,
        ARRAY['тест', 'railway']
      ) ON CONFLICT (id) DO NOTHING;
    `;

    await pool.query(insertSQL);
    console.log('✅ Тестовая запись добавлена!');

    // Проверка результата
    const result = await pool.query('SELECT COUNT(*) as total FROM activities');
    console.log(`📊 Всего записей в таблице: ${result.rows[0].total}`);

    const testResult = await pool.query('SELECT id, title FROM activities LIMIT 3');
    console.log('📄 Примеры записей:');
    testResult.rows.forEach(row => {
      console.log(`   - ${row.id}: ${row.title}`);
    });

  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  } finally {
    await pool.end();
    console.log('👋 Отключение от базы данных');
  }
}

setupDatabase();