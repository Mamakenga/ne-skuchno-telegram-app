// api.js - ВАШ ОРИГИНАЛЬНЫЙ КОД + минимальные дополнения для дизайна

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://ne-skuchno-telegram-app-production.up.railway.app/api';

console.log('🔗 API_BASE_URL:', API_BASE_URL);
console.log('🔗 process.env.REACT_APP_API_URL:', process.env.REACT_APP_API_URL);

// ========== ВАШ ОРИГИНАЛЬНЫЙ КОД (сохраняем как есть) ==========

// Получение активностей с фильтрами (ваш существующий код)
const getActivities = async (params = {}) => {
  const queryParams = new URLSearchParams(params).toString();
  const url = `${API_BASE_URL}/activities?${queryParams}`;
  
  console.log('🔍 Отправляем запрос:', url);
  
  try {
    const response = await fetch(url);
    console.log('📡 Ответ сервера:', response.status, response.statusText);
    
    const data = await response.json();
    console.log('📊 Данные:', data);
    
    return data.data || [];
  } catch (error) {
    console.error('❌ Ошибка запроса:', error);
    return [];
  }
};

// Получение конкретной активности (ваш существующий код)
const getActivity = async (id) => {
  const response = await fetch(`${API_BASE_URL}/activities/${id}`);
  const data = await response.json();
  return data.data;
};

// Оценка активности (ваш существующий код)
const rateActivity = async (activityId, rating) => {
  console.log('Rating activity:', activityId, rating);
  return { success: true };
};

// ========== ДОБАВЛЯЕМ ТОЛЬКО ДВА МЕТОДА ДЛЯ ДИЗАЙНА ==========

// Получение возрастных групп (БЕЗ эмодзи как в дизайне)
const getAgeGroups = async () => {
  console.log('🔍 Загружаем возрастные группы (fallback)');
  
  // Простые данные БЕЗ эмодзи - точно как в HTML дизайне
  return {
    success: true,
    data: [
      { id: '3-5', title: '3-5 лет' },
      { id: '6-8', title: '6-8 лет' },
      { id: '9-12', title: '9-12 лет' },
      { id: '13-17', title: '13-17 лет' },
      { id: '18+', title: '18+' }
    ]
  };
};

// Получение категорий (простые данные)
const getCategories = async () => {
  console.log('🔍 Загружаем категории (fallback)');
  
  return {
    success: true,
    data: [
      {
        id: 'creativity',
        title: 'Творчество',
        emoji: '🎨',
        description: 'Рисование, поделки, музыка',
        color: '#4ECDC4'
      },
      {
        id: 'active_games',
        title: 'Активная игра',
        emoji: '🏃‍♂️',
        description: 'Спорт, движение, танцы',
        color: '#FF6B6B'
      },
      {
        id: 'cooking',
        title: 'Кулинария',
        emoji: '👨‍🍳',
        description: 'Готовка, выпечка',
        color: '#96CEB4'
      }
    ]
  };
};

// ЭКСПОРТИРУЕМ КАК NAMED EXPORTS (для совместимости с App.js)
export const apiService = {
  getActivities,
  getActivity,
  rateActivity,
  getAgeGroups,
  getCategories
};

// ТАКЖЕ экспортируем как default (для совместимости)
export default apiService;