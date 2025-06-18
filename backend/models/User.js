// backend/models/User.js - ИСПРАВЛЕННАЯ ВЕРСИЯ ДЛЯ SUPABASE

// Временно отключаем User модель, так как используем Supabase, а не MongoDB
// В будущем переведем на Supabase, но пока сосредоточимся на активностях

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Заглушка для User модели (для совместимости с существующим кодом)
class User {
  constructor(data) {
    Object.assign(this, data);
  }

  // Статические методы-заглушки
  static async findOne(query) {
    console.log('User.findOne called with:', query);
    return null; // Пока возвращаем null
  }

  static async create(userData) {
    console.log('User.create called with:', userData);
    return new User(userData);
  }

  async save() {
    console.log('User.save called');
    return this;
  }

  // В будущем здесь будет полная реализация для Supabase
  // TODO: Создать таблицу users в Supabase
  // TODO: Реализовать CRUD операции через Supabase
}

module.exports = User;