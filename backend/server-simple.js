const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

console.log('🚀 Запуск сервера...');
console.log('📊 PORT:', PORT);
console.log('🗄️ MONGODB_URI есть:', !!process.env.MONGODB_URI);

// CORS
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.json({ message: 'Backend работает!', status: 'OK' });
});

// Подключение к MongoDB
async function connectToDatabase() {
  try {
    console.log('🔄 Подключаемся к MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    // НЕ останавливаем процесс, просто логируем
  }
}

// Запуск сервера
async function startServer() {
  console.log('🔄 Запуск Express сервера...');
  
  app.listen(PORT, '0.0.0.0', () => {
    console.log('🚀 Server running on port', PORT);
    console.log('🌐 Health check: /health');
  });
  
  // Подключаем MongoDB после запуска сервера
  await connectToDatabase();
}

startServer().catch(error => {
  console.error('❌ Failed to start server:', error);
});