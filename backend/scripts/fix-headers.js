// backend/scripts/fix-headers.js

const fs = require('fs');
const path = require('path');

function fixHeaders() {
  console.log('🔧 Исправляем заголовки CSV файла...\n');
  
  const csvPath = path.join(__dirname, '..', '..', 'activities.csv');
  const fixedCsvPath = path.join(__dirname, '..', '..', 'activities-headers-fixed.csv');
  
  if (!fs.existsSync(csvPath)) {
    console.log('❌ Файл не найден!');
    return;
  }
  
  // Читаем весь файл
  const fileContent = fs.readFileSync(csvPath, 'utf8');
  const lines = fileContent.split('\n');
  
  if (lines.length === 0) {
    console.log('❌ Файл пустой!');
    return;
  }
  
  // Исправляем первую строку (заголовки)
  let headerLine = lines[0];
  console.log('📋 Исходные заголовки:');
  console.log(`"${headerLine}"`);
  
  // Карта исправлений заголовков
  const headerFixes = {
    'ID': 'id',
    'Id': 'id',
    ' id': 'id',
    'id ': 'id',
    'Title': 'title',
    ' title': 'title',
    'title ': 'title',
    'Category': 'category',
    ' category': 'category',
    'category ': 'category',
    'Short_description': 'short_description',
    'Short Description': 'short_description',
    'Full_description': 'full_description',
    'Full Description': 'full_description',
    'Instructions': 'instructions',
    ' instructions': 'instructions',
    'Materials': 'materials',
    ' materials': 'materials',
    'Duration_minutes': 'duration_minutes',
    'Duration Minutes': 'duration_minutes',
    'Difficulty': 'difficulty',
    ' difficulty': 'difficulty',
    'Age_groups': 'age_groups',
    'Age Groups': 'age_groups',
    'Skills_developed': 'skills_developed',
    'Skills Developed': 'skills_developed',
    'Location': 'location',
    ' location': 'location',
    'Tags': 'tags',
    ' tags': 'tags',
    'Premium': 'premium',
    ' premium': 'premium',
    'Season': 'season',
    ' season': 'season'
  };
  
  // Применяем исправления
  let fixedHeaderLine = headerLine;
  Object.entries(headerFixes).forEach(([wrong, correct]) => {
    fixedHeaderLine = fixedHeaderLine.replace(new RegExp(`\\b${wrong}\\b`, 'g'), correct);
  });
  
  // Убираем лишние пробелы
  fixedHeaderLine = fixedHeaderLine.split(',').map(h => h.trim()).join(',');
  
  console.log('\n✅ Исправленные заголовки:');
  console.log(`"${fixedHeaderLine}"`);
  
  // Собираем исправленный файл
  const fixedLines = [fixedHeaderLine, ...lines.slice(1)];
  const fixedContent = fixedLines.join('\n');
  
  // Сохраняем исправленный файл
  fs.writeFileSync(fixedCsvPath, fixedContent, 'utf8');
  
  console.log('\n💾 Исправленный файл сохранен:', fixedCsvPath);
  console.log('\n🔄 Теперь можете заменить файл:');
  console.log('move activities.csv activities-original.csv');
  console.log('move activities-headers-fixed.csv activities.csv');
  
  // Показываем разницу
  const originalHeaders = headerLine.split(',');
  const fixedHeaders = fixedHeaderLine.split(',');
  
  console.log('\n📊 Сравнение заголовков:');
  originalHeaders.forEach((orig, index) => {
    const fixed = fixedHeaders[index] || '';
    if (orig.trim() !== fixed.trim()) {
      console.log(`   ${index + 1}. "${orig}" → "${fixed}"`);
    }
  });
}

// Запуск исправления
if (require.main === module) {
  fixHeaders();
}

module.exports = fixHeaders;