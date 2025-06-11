const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const Activity = require('../models/Activity');

async function importActivities() {
  try {
    console.log('🔄 Starting import process...');
    
    // Подключаемся к базе
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Очищаем существующие активности
    await Activity.deleteMany({});
    console.log('🗑️ Cleared existing activities');
    
    // Проверяем путь к файлам
   const contentPath = path.join(__dirname, '../../content/activities');
    console.log('📂 Looking for files in:', contentPath);
    
    // Проверяем файлы
    const files = ['active-games.json', 'creativity.json'];
    let totalImported = 0;
    
    for (const fileName of files) {
      const filePath = path.join(contentPath, fileName);
      console.log(`📄 Checking file: ${filePath}`);
      
      if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const activities = JSON.parse(fileContent);
        
        if (activities.length > 0) {
          await Activity.insertMany(activities);
          console.log(`✅ Imported ${activities.length} activities from ${fileName}`);
          totalImported += activities.length;
        } else {
          console.log(`⚠️ ${fileName} is empty`);
        }
      } else {
        console.log(`❌ File not found: ${filePath}`);
      }
    }
    
    console.log(`\n🎉 Total imported: ${totalImported} activities`);
    
    // Показать что загрузилось
    const count = await Activity.countDocuments();
    console.log(`📊 Total activities in database: ${count}`);
    
  } catch (error) {
    console.error('❌ Import error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
}

importActivities();