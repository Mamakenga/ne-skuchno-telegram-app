// backend/scripts/diagnose-csv.js

const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

function diagnoseCsv() {
  console.log('🔍 Диагностика CSV файла...\n');
  
  const csvPath = path.join(__dirname, '..', '..', 'activities.csv');
  console.log('📂 Путь к файлу:', csvPath);
  
  // Проверяем существование файла
  if (!fs.existsSync(csvPath)) {
    console.log('❌ CSV файл не найден!');
    return;
  }
  
  // Читаем файл как текст
  const fileContent = fs.readFileSync(csvPath, 'utf8');
  const lines = fileContent.split('\n');
  
  console.log('📊 Базовая статистика:');
  console.log(`📝 Всего строк в файле: ${lines.length}`);
  console.log(`📝 Непустых строк: ${lines.filter(line => line.trim().length > 0).length}`);
  console.log(`📝 Размер файла: ${Math.round(fileContent.length / 1024)} KB\n`);
  
  // Показываем первые и последние строки
  console.log('🔝 Первые 3 строки:');
  lines.slice(0, 3).forEach((line, index) => {
    console.log(`${index + 1}: ${line.substring(0, 100)}${line.length > 100 ? '...' : ''}`);
  });
  
  console.log('\n🔚 Последние 3 строки:');
  lines.slice(-3).forEach((line, index) => {
    const lineNum = lines.length - 3 + index + 1;
    console.log(`${lineNum}: ${line.substring(0, 100)}${line.length > 100 ? '...' : ''}`);
  });
  
  // Парсим CSV и считаем строки
  let rowCount = 0;
  let validRows = 0;
  let errors = [];
  
  return new Promise((resolve) => {
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (row) => {
        rowCount++;
        
        // Проверяем обязательные поля
        if (row.id && row.title && row.category) {
          validRows++;
          console.log(`✅ Строка ${rowCount}: ${row.id} - ${row.title}`);
        } else {
          console.log(`❌ Строка ${rowCount}: ОШИБКА валидации`);
          console.log(`   ID: "${row.id}", Title: "${row.title}", Category: "${row.category}"`);
          errors.push({
            row: rowCount,
            data: row
          });
        }
      })
      .on('end', () => {
        console.log('\n📊 ИТОГОВАЯ СТАТИСТИКА:');
        console.log(`📝 Обработано CSV строк: ${rowCount}`);
        console.log(`✅ Валидных строк: ${validRows}`);
        console.log(`❌ Ошибок: ${errors.length}`);
        
        if (errors.length > 0) {
          console.log('\n🚨 ДЕТАЛИ ОШИБОК:');
          errors.forEach(error => {
            console.log(`Строка ${error.row}:`, Object.keys(error.data).length, 'колонок');
            console.log('Первые поля:', Object.entries(error.data).slice(0, 3));
          });
        }
        
        resolve();
      })
      .on('error', (error) => {
        console.error('❌ Ошибка чтения CSV:', error);
        resolve();
      });
  });
}

// Запуск диагностики
if (require.main === module) {
  diagnoseCsv();
}

module.exports = diagnoseCsv;