// backend/scripts/debug-csv.js

const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

async function debugCSV() {
  console.log('🔍 Диагностика CSV файла...\n');
  
  const csvPath = path.join(__dirname, '..', '..', 'activities.csv');
  console.log('📂 Путь к файлу:', csvPath);
  
  if (!fs.existsSync(csvPath)) {
    console.log('❌ Файл не найден!');
    return;
  }
  
  // 1. Читаем файл как текст для проверки
  console.log('📄 Читаем файл как текст...');
  const fileContent = fs.readFileSync(csvPath, 'utf8');
  const lines = fileContent.split('\n');
  
  console.log(`📊 Всего строк: ${lines.length}`);
  console.log(`📊 Размер файла: ${fileContent.length} символов\n`);
  
  // 2. Показываем первые строки
  console.log('🔝 Первые 3 строки файла:');
  lines.slice(0, 3).forEach((line, index) => {
    console.log(`${index + 1}: "${line}"`);
    console.log(`   Длина: ${line.length}, Запятых: ${(line.match(/,/g) || []).length}`);
  });
  
  // 3. Проверяем заголовки
  console.log('\n📋 Анализ заголовков:');
  const headers = lines[0].split(',');
  console.log(`Найдено ${headers.length} колонок:`);
  headers.forEach((header, index) => {
    console.log(`${index + 1}. "${header.trim()}"`);
  });
  
  // 4. Проверяем разделители
  console.log('\n🔍 Проверка разделителей:');
  const firstDataLine = lines[1];
  console.log('Первая строка данных:', firstDataLine);
  console.log('Количество запятых:', (firstDataLine.match(/,/g) || []).length);
  console.log('Количество точек с запятой:', (firstDataLine.match(/;/g) || []).length);
  console.log('Количество табов:', (firstDataLine.match(/\t/g) || []).length);
  
  // 5. Пробуем парсить CSV
  console.log('\n🔧 Попытка парсинга CSV...');
  let rowCount = 0;
  let firstRow = null;
  
  return new Promise((resolve) => {
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('headers', (headers) => {
        console.log('✅ Заголовки распознаны:', headers);
      })
      .on('data', (row) => {
        rowCount++;
        if (rowCount === 1) {
          firstRow = row;
          console.log('✅ Первая строка данных распознана:');
          console.log('  ID:', typeof row.id, `"${row.id}"`);
          console.log('  Title:', typeof row.title, `"${row.title}"`);
          console.log('  Category:', typeof row.category, `"${row.category}"`);
          console.log('  Все ключи:', Object.keys(row));
        }
        if (rowCount <= 3) {
          console.log(`Строка ${rowCount}: ID="${row.id}", Title="${row.title}"`);
        }
      })
      .on('end', () => {
        console.log(`\n📊 ИТОГО: Обработано ${rowCount} строк данных`);
        
        if (firstRow) {
          console.log('\n✅ CSV парсится корректно!');
          if (!firstRow.id) {
            console.log('❌ ПРОБЛЕМА: Поле ID пустое или отсутствует');
          }
          if (!firstRow.title) {
            console.log('❌ ПРОБЛЕМА: Поле title пустое или отсутствует');
          }
        } else {
          console.log('❌ ПРОБЛЕМА: Не удалось распарсить ни одной строки');
        }
        
        resolve();
      })
      .on('error', (error) => {
        console.error('❌ Ошибка парсинга CSV:', error);
        resolve();
      });
  });
}

// Запуск диагностики
if (require.main === module) {
  debugCSV();
}

module.exports = debugCSV;