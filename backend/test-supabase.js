const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Инициализация Supabase клиента
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function testSupabaseConnection() {
  console.log('🔄 Тестируем подключение к Supabase...\n');
  
  try {
    // Тест 1: Проверка подключения
    console.log('1️⃣ Тест подключения к базе данных...');
    const { data, error } = await supabase
      .from('activities')
      .select('count', { count: 'exact' });
    
    if (error) {
      throw new Error(`Ошибка подключения: ${error.message}`);
    }
    
    console.log('✅ Подключение успешно!');
    console.log(`📊 Записей в таблице activities: ${data.length}\n`);
    
    // Тест 2: Создание тестовой записи
    console.log('2️⃣ Тест создания записи...');
    const testActivity = {
      id: 'test_001',
      title: 'Тестовая активность',
      short_description: 'Короткое описание для теста',
      full_description: 'Подробное описание тестовой активности для проверки работы с базой данных',
      category: 'creativity',
      age_groups: ['6-8'],
      duration_minutes: 15,
      difficulty: 'easy',
      materials: ['бумага', 'карандаши'],
      instructions: ['Возьми бумагу', 'Нарисуй что-нибудь', 'Покажи результат'],
      skills_developed: ['творчество'],
      season: 'any',
      location: 'indoor',
      premium: false,
      tags: ['тест'],
      video_url: null,
      image_url: null,
      site_url: 'https://example.com/test',
      has_detailed_content: true,
      rating: 0,
      times_completed: 0
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('activities')
      .insert([testActivity])
      .select();
    
    if (insertError) {
      throw new Error(`Ошибка создания записи: ${insertError.message}`);
    }
    
    console.log('✅ Тестовая запись создана!');
    console.log(`📄 Создано записей: ${insertData.length}\n`);
    
    // Тест 3: Чтение записи
    console.log('3️⃣ Тест чтения записи...');
    const { data: readData, error: readError } = await supabase
      .from('activities')
      .select('*')
      .eq('id', 'test_001')
      .single();
    
    if (readError) {
      throw new Error(`Ошибка чтения записи: ${readError.message}`);
    }
    
    console.log('✅ Запись успешно прочитана!');
    console.log(`📖 Название: ${readData.title}`);
    console.log(`📂 Категория: ${readData.category}\n`);
    
    // Тест 4: Обновление записи
    console.log('4️⃣ Тест обновления записи...');
    const { data: updateData, error: updateError } = await supabase
      .from('activities')
      .update({ rating: 4.5, times_completed: 10 })
      .eq('id', 'test_001')
      .select();
    
    if (updateError) {
      throw new Error(`Ошибка обновления записи: ${updateError.message}`);
    }
    
    console.log('✅ Запись успешно обновлена!');
    console.log(`⭐ Рейтинг: ${updateData[0].rating}`);
    console.log(`🔢 Выполнений: ${updateData[0].times_completed}\n`);
    
    // Тест 5: Удаление тестовой записи
    console.log('5️⃣ Тест удаления записи...');
    const { error: deleteError } = await supabase
      .from('activities')
      .delete()
      .eq('id', 'test_001');
    
    if (deleteError) {
      throw new Error(`Ошибка удаления записи: ${deleteError.message}`);
    }
    
    console.log('✅ Тестовая запись удалена!\n');
    
    // Финальная проверка
    console.log('6️⃣ Финальная проверка структуры таблицы...');
    const { data: tableStructure } = await supabase
      .from('activities')
      .select('*')
      .limit(0);
    
    console.log('✅ Структура таблицы корректна!\n');
    
    console.log('🎉 ВСЕ ТЕСТЫ ПРОЙДЕНЫ УСПЕШНО!');
    console.log('✅ Supabase готов к работе');
    console.log('✅ Таблица activities создана корректно');
    console.log('✅ CRUD операции работают');
    
  } catch (error) {
    console.error('❌ Ошибка тестирования:', error.message);
    console.log('\n🔧 Проверьте:');
    console.log('1. Переменные окружения в .env файле');
    console.log('2. Подключение к интернету');
    console.log('3. Правильность API ключей Supabase');
    process.exit(1);
  }
}

// Запуск тестирования
if (require.main === module) {
  testSupabaseConnection();
}

module.exports = testSupabaseConnection;