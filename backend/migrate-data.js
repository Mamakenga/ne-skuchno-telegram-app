const { Pool } = require('pg');
const { createClient } = require('@supabase/supabase-js');

// Настройки Supabase (откуда копируем)
const SUPABASE_URL = 'https://rfqssjgpmhybebbgnwhm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmcXNzamdwbWh5YmViYmdud2htIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwODIxNTAsImV4cCI6MjA2NTY1ODE1MH0.l4LqwGrgEk_pH4YooIMZmkHB6_oe7Ehw2vD1rKYygZI';

// ЗАМЕНИТЕ НА ВАШ РЕАЛЬНЫЙ DATABASE_URL ИЗ RAILWAY!
const RAILWAY_DATABASE_URL = 'postgresql://postgres:JVTHicuijnpiqUCFBwKdbCoNADmkHuna@tramway.proxy.rlwy.net:20902/railway';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const railwayPool = new Pool({
  connectionString: RAILWAY_DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function migrateData() {
  console.log('🚀 Начинаем миграцию данных Supabase → Railway PostgreSQL\n');

  try {
    // Проверяем подключение к Railway
    const client = await railwayPool.connect();
    console.log('✅ Подключение к Railway PostgreSQL успешно');
    client.release();

    // Экспортируем данные из Supabase
    console.log('📤 Экспортируем данные из Supabase...');
    const { data: supabaseActivities, error } = await supabase
      .from('activities')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(`Ошибка экспорта из Supabase: ${error.message}`);
    }

    console.log(`📊 Найдено ${supabaseActivities.length} активностей в Supabase`);

    if (supabaseActivities.length === 0) {
      console.log('⚠️ Нет данных для миграции');
      return;
    }

    // Показываем первые 3 активности для проверки
    console.log('\n📋 Примеры активностей из Supabase:');
    supabaseActivities.slice(0, 3).forEach((activity, index) => {
      console.log(`   ${index + 1}. ${activity.id}: ${activity.title}`);
    });

    // Очищаем тестовые данные в Railway (кроме тестовой записи)
    console.log('\n🗑️ Очищаем старые данные в Railway...');
    await railwayPool.query('DELETE FROM activities WHERE id != \'test_railway_001\'');

    // Импортируем данные в Railway
    console.log('📥 Импортируем данные в Railway PostgreSQL...');
    let importedCount = 0;
    let errors = [];

    for (const activity of supabaseActivities) {
      try {
        await insertActivity(activity);
        importedCount++;
        
        if (importedCount % 5 === 0) {
          console.log(`   ✅ Импортировано ${importedCount}/${supabaseActivities.length} активностей`);
        }
      } catch (insertError) {
        console.error(`   ❌ Ошибка импорта ${activity.id}: ${insertError.message}`);
        errors.push({ id: activity.id, error: insertError.message });
      }
    }

    // Проверяем результат
    const result = await railwayPool.query('SELECT COUNT(*) as total FROM activities');
    const totalImported = result.rows[0].total;

    console.log('\n🎉 МИГРАЦИЯ ЗАВЕРШЕНА!');
    console.log(`📊 Всего записей в Railway: ${totalImported}`);
    console.log(`✅ Успешно импортировано: ${importedCount} активностей`);
    
    if (errors.length > 0) {
      console.log(`❌ Ошибок импорта: ${errors.length}`);
    }

    // Показываем статистику по категориям
    const statsResult = await railwayPool.query(`
      SELECT category, COUNT(*) as count 
      FROM activities 
      WHERE id != 'test_railway_001'
      GROUP BY category 
      ORDER BY count DESC
    `);

    console.log('\n📈 Статистика по категориям:');
    statsResult.rows.forEach(row => {
      console.log(`   ${row.category}: ${row.count} активностей`);
    });

    console.log('\n✅ БАЗА ДАННЫХ ГОТОВА К РАБОТЕ!');

  } catch (error) {
    console.error('❌ Критическая ошибка миграции:', error.message);
  } finally {
    await railwayPool.end();
    console.log('\n👋 Отключение от базы данных');
  }
}

async function insertActivity(activity) {
  const insertQuery = `
    INSERT INTO activities (
      id, title, short_description, full_description, category,
      age_groups, duration_minutes, difficulty, materials,
      instructions, skills_developed, season, location,
      premium, tags, rating, times_completed, created_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
    ON CONFLICT (id) DO UPDATE SET
      title = EXCLUDED.title,
      short_description = EXCLUDED.short_description,
      category = EXCLUDED.category
  `;

  const values = [
    activity.id,
    activity.title,
    activity.short_description || activity.title,
    activity.full_description || activity.short_description || activity.title,
    activity.category,
    activity.age_groups || [],
    activity.duration_minutes || 15,
    activity.difficulty || 'easy',
    activity.materials || [],
    activity.instructions || [],
    activity.skills_developed || [],
    activity.season || 'any',
    activity.location || 'indoor',
    activity.premium || false,
    activity.tags || [],
    activity.rating || 0,
    activity.times_completed || 0,
    activity.created_at || new Date()
  ];

  await railwayPool.query(insertQuery, values);
}

migrateData();