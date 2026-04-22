const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function analyzeActivities() {
  try {
    const client = await pool.connect();
    
    // Получаем все активности
    const result = await client.query('SELECT category, age_groups FROM activities');
    
    console.log('📊 АНАЛИЗ АКТИВНОСТЕЙ ПО КАТЕГОРИЯМ И ВОЗРАСТАМ\n');
    
    // Все возможные категории и возрасты
    const allCategories = ['creativity', 'active_games', 'learn_new', 'cooking', 'gifts', 'experiments', 'reading_stories'];
    const allAges = ['3-5', '6-8', '9-12', '13-17', '18+'];
    
    // Подсчитываем активности по категориям
    const categoryCount = {};
    allCategories.forEach(cat => categoryCount[cat] = 0);
    
    // Подсчитываем по комбинациям категория + возраст
    const matrix = {};
    allCategories.forEach(cat => {
      matrix[cat] = {};
      allAges.forEach(age => matrix[cat][age] = 0);
    });
    
    result.rows.forEach(row => {
      const category = row.category;
      const ageGroups = Array.isArray(row.age_groups) ? row.age_groups : JSON.parse(row.age_groups || '[]');
      
      categoryCount[category] = (categoryCount[category] || 0) + 1;
      
      ageGroups.forEach(age => {
        if (!matrix[category]) matrix[category] = {};
        matrix[category][age] = (matrix[category][age] || 0) + 1;
      });
    });
    
    // Выводим общую статистику по категориям
    console.log('🎯 ОБЩАЯ СТАТИСТИКА ПО КАТЕГОРИЯМ:');
    Object.entries(categoryCount).sort((a,b) => b[1] - a[1]).forEach(([cat, count]) => {
      console.log(`  ${cat.padEnd(15)}: ${count} активностей`);
    });
    
    console.log('\n📈 ДЕТАЛЬНАЯ МАТРИЦА (категория → возраст):');
    console.log('Категория'.padEnd(15) + allAges.map(age => age.padStart(8)).join(''));
    console.log('-'.repeat(15 + allAges.length * 8));
    
    allCategories.forEach(category => {
      const counts = allAges.map(age => {
        const count = matrix[category] && matrix[category][age] ? matrix[category][age] : 0;
        return count.toString().padStart(8);
      });
      console.log(category.padEnd(15) + counts.join(''));
    });
    
    console.log('\n❌ ПРОБЕЛЫ В ПОКРЫТИИ:');
    
    // Находим пробелы
    const gaps = [];
    allCategories.forEach(category => {
      allAges.forEach(age => {
        const count = matrix[category] && matrix[category][age] ? matrix[category][age] : 0;
        if (count === 0) {
          gaps.push({ category, age, count: 0, priority: 'HIGH' });
        } else if (count < 3) {
          gaps.push({ category, age, count, priority: 'MEDIUM' });
        }
      });
    });
    
    // Группируем по приоритету
    const highPriority = gaps.filter(g => g.count === 0);
    const mediumPriority = gaps.filter(g => g.count > 0 && g.count < 3);
    
    console.log('\n🚨 ВЫСОКИЙ ПРИОРИТЕТ (НЕТ активностей):');
    highPriority.forEach(gap => {
      console.log(`   ${gap.category} → ${gap.age}`);
    });
    
    console.log('\n⚠️  СРЕДНИЙ ПРИОРИТЕТ (МАЛО активностей):');
    mediumPriority.forEach(gap => {
      console.log(`   ${gap.category} → ${gap.age} (${gap.count} шт.)`);
    });
    
    console.log('\n📋 РЕКОМЕНДАЦИИ ПО ДОПОЛНЕНИЮ:');
    
    // Категории с наибольшими пробелами
    const categoryGaps = {};
    gaps.forEach(gap => {
      if (!categoryGaps[gap.category]) categoryGaps[gap.category] = 0;
      categoryGaps[gap.category] += gap.count === 0 ? 3 : (3 - gap.count);
    });
    
    const sortedCategories = Object.entries(categoryGaps).sort((a,b) => b[1] - a[1]);
    
    console.log('\nТоп категории для дополнения:');
    sortedCategories.forEach(([cat, needed], index) => {
      console.log(`${index + 1}. ${cat}: нужно ~${needed} активностей`);
    });
    
    client.release();
    await pool.end();
  } catch (error) {
    console.error('❌ Ошибка:', error);
  }
}

analyzeActivities();