// Скрипт валидации контента для Telegram Mini App
// Проверяет корректность JSON файлов с активностями

const fs = require('fs');
const path = require('path');

// Список файлов с активностями
const activityFiles = [
  'active-games.json',
  'creativity.json', 
  'learn-new.json',
  'cooking.json',
  'gifts.json',
  'experiments.json',
  'reading-stories.json'
];

// Допустимые значения для валидации
const validCategories = [
  'active_games', 'creativity', 'learn_new', 
  'cooking', 'gifts', 'experiments', 'reading_stories'
];

const validAgeGroups = ['3-5', '6-8', '9-12', '13-16', '17+', 'adult'];
const validDifficulties = ['easy', 'medium', 'hard'];
const validSeasons = ['spring', 'summer', 'autumn', 'winter', 'any'];
const validLocations = ['indoor', 'outdoor', 'any'];

function validateActivity(activity, fileName, index) {
  const errors = [];
  const warnings = [];

  // Проверка обязательных полей
  if (!activity.id) errors.push(`${fileName}[${index}]: отсутствует поле 'id'`);
  if (!activity.title) errors.push(`${fileName}[${index}]: отсутствует поле 'title'`);
  if (!activity.category) errors.push(`${fileName}[${index}]: отсутствует поле 'category'`);
  if (!activity.instructions || !Array.isArray(activity.instructions)) {
    errors.push(`${fileName}[${index}]: отсутствует или некорректное поле 'instructions'`);
  }

  // Проверка значений полей
  if (activity.category && !validCategories.includes(activity.category)) {
    errors.push(`${fileName}[${index}]: недопустимая категория '${activity.category}'`);
  }

  if (activity.age_groups) {
    activity.age_groups.forEach(age => {
      if (!validAgeGroups.includes(age)) {
        errors.push(`${fileName}[${index}]: недопустимая возрастная группа '${age}'`);
      }
    });
  }

  if (activity.difficulty && !validDifficulties.includes(activity.difficulty)) {
    errors.push(`${fileName}[${index}]: недопустимая сложность '${activity.difficulty}'`);
  }

  // Проверка длительности
  if (activity.duration_minutes) {
    if (activity.duration_minutes < 5 || activity.duration_minutes > 180) {
      warnings.push(`${fileName}[${index}]: необычная длительность ${activity.duration_minutes} минут`);
    }
  }

  // Проверка инструкций
  if (activity.instructions) {
    if (activity.instructions.length < 3) {
      warnings.push(`${fileName}[${index}]: мало инструкций (${activity.instructions.length}), рекомендуется минимум 3`);
    }
    if (activity.instructions.length > 8) {
      warnings.push(`${fileName}[${index}]: много инструкций (${activity.instructions.length}), рекомендуется максимум 8`);
    }
  }

  // Проверка материалов
  if (!activity.materials || activity.materials.length === 0) {
    warnings.push(`${fileName}[${index}]: не указаны материалы`);
  }

  return { errors, warnings };
}

function validateActivities() {
  console.log('🔍 Начинаем валидацию контента...\n');

  let totalActivities = 0;
  let totalErrors = 0;
  let totalWarnings = 0;

  activityFiles.forEach(fileName => {
    console.log(`📁 Проверяем файл: ${fileName}`);
    
    const filePath = path.join(__dirname, 'activities', fileName);
    
    // Проверяем существование файла
    if (!fs.existsSync(filePath)) {
      console.log(`   ⚠️  Файл не найден`);
      return;
    }

    try {
      // Читаем и парсим JSON
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const activities = JSON.parse(fileContent);

      if (!Array.isArray(activities)) {
        console.log(`   ❌ Файл должен содержать массив активностей`);
        return;
      }

      console.log(`   📊 Найдено активностей: ${activities.length}`);
      totalActivities += activities.length;

      // Валидируем каждую активность
      activities.forEach((activity, index) => {
        const { errors, warnings } = validateActivity(activity, fileName, index + 1);
        
        totalErrors += errors.length;
        totalWarnings += warnings.length;

        errors.forEach(error => console.log(`   ❌ ${error}`));
        warnings.forEach(warning => console.log(`   ⚠️  ${warning}`));
      });

      if (activities.length === 0) {
        console.log(`   ⚠️  Файл пустой`);
      }

    } catch (error) {
      console.log(`   💥 Ошибка чтения файла: ${error.message}`);
      totalErrors++;
    }

    console.log(''); // Пустая строка для разделения
  });

  // Итоговая статистика
  console.log('📊 ИТОГОВАЯ СТАТИСТИКА:');
  console.log(`✅ Всего активностей: ${totalActivities}`);
  console.log(`❌ Ошибок: ${totalErrors}`);
  console.log(`⚠️  Предупреждений: ${totalWarnings}`);

  if (totalErrors === 0) {
    console.log('\n🎉 Валидация прошла успешно! Все файлы корректны.');
  } else {
    console.log('\n🚨 Обнаружены ошибки! Исправьте их перед продолжением.');
  }

  return { totalActivities, totalErrors, totalWarnings };
}

// Запуск валидации при прямом вызове скрипта
if (require.main === module) {
  validateActivities();
}

module.exports = { validateActivities, validateActivity };