// backend/scripts/show-headers.js

const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

async function showHeaders() {
  console.log('📋 Показываем реальные заголовки CSV файла...\n');
  
  const csvPath = path.join(__dirname, '..', '..', 'activities.csv');
  
  if (!fs.existsSync(csvPath)) {
    console.log('❌ Файл не найден!');
    return;
  }
  
  // Читаем первую строку как текст
  const fileContent = fs.readFileSync(csvPath, 'utf8');
  const firstLine = fileContent.split('\n')[0];
  
  console.log('📄 Первая строка (заголовки):');
  console.log(`"${firstLine}"`);
  console.log('');
  
  console.log('📋 Разбор заголовков по запятым:');
  const headers = firstLine.split(',');
  headers.forEach((header, index) => {
    console.log(`${index + 1}. "${header}" (длина: ${header.length})`);
    if (header.trim() !== header) {
      console.log(`   ⚠️  Есть пробелы! Очищенное: "${header.trim()}"`);
    }
  });
  
  // Пробуем парсить и показать первую строку данных
  console.log('\n🔍 Проверяем что парсер видит:');
  
  return new Promise((resolve) => {
    let headersSeen = false;
    let firstDataRow = null;
    
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('headers', (parsedHeaders) => {
        console.log('✅ Парсер видит заголовки:');
        parsedHeaders.forEach((header, index) => {
          console.log(`   ${index + 1}. "${header}"`);
        });
        headersSeen = true;
      })
      .on('data', (row) => {
        if (!firstDataRow) {
          firstDataRow = row;
          console.log('\n📊 Первая строка данных:');
          Object.entries(row).forEach(([key, value]) => {
            console.log(`   ${key}: "${value}"`);
          });
          
          // Показываем проблемные поля
          console.log('\n🚨 Проверка ключевых полей:');
          console.log(`   id: "${row.id}" (тип: ${typeof row.id})`);
          console.log(`   title: "${row.title}" (тип: ${typeof row.title})`);
          console.log(`   category: "${row.category}" (тип: ${typeof row.category})`);
        }
      })
      .on('end', () => {
        if (!headersSeen) {
          console.log('❌ Заголовки не распознаны!');
        }
        if (!firstDataRow) {
          console.log('❌ Данные не распознаны!');
        }
        resolve();
      })
      .on('error', (error) => {
        console.error('❌ Ошибка:', error);
        resolve();
      });
  });
}

// Запуск
if (require.main === module) {
  showHeaders();
}

module.exports = showHeaders;
