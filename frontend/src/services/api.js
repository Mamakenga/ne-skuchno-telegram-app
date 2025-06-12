const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://ne-skuchno-telegram-app-production.up.railway.app/api';

console.log('🔗 API_BASE_URL:', API_BASE_URL);
console.log('🔗 process.env.REACT_APP_API_URL:', process.env.REACT_APP_API_URL);

export const apiService = {
  // Получение активностей с фильтрами
  getActivities: async (params = {}) => {
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
  },

  // Получение конкретной активности
  getActivity: async (id) => {
    const response = await fetch(`${API_BASE_URL}/activities/${id}`);
    const data = await response.json();
    return data.data;
  },

  // Оценка активности (заглушка)
  rateActivity: async (activityId, rating) => {
    console.log('Rating activity:', activityId, rating);
    return { success: true };
  }
};