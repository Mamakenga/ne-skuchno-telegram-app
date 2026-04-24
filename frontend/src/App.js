import React, { useState, useEffect } from 'react';
// Telegram WebApp — встроен автоматически в Telegram Mini App окружении
const WebApp = window.Telegram?.WebApp || {};

// Импорт компонентов
import AgeSelector from './components/AgeSelector/AgeSelector';
import CategorySelector from './components/CategorySelector/CategorySelector';
import ResultsList from './components/ResultsList/ResultsList';
import ActivityDetails from './components/ActivityDetails/ActivityDetails';

// Импорт сервисов
import { apiService } from './services/api';

// Импорт стилей
import './index.css';

function App() {
  // Состояние приложения
  const [currentScreen, setCurrentScreen] = useState('age'); // age, category, results, details
  const [selectedAge, setSelectedAge] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [activities, setActivities] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [user, setUser] = useState(null);
  
  // Данные из API
  const [ageGroups, setAgeGroups] = useState([]);
  const [categories, setCategories] = useState([]);
  
  // Состояния загрузки
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Инициализация при загрузке
  useEffect(() => {
    initializeTelegramApp();
    loadReferenceData();
  }, []);

  // Инициализация Telegram Web App
  const initializeTelegramApp = () => {
    try {
      // Инициализация Telegram Web App
      WebApp.ready();
      WebApp.expand();
      
      // Настройка цветов под наш дизайн
      WebApp.setHeaderColor('#081a26');
      WebApp.setBackgroundColor('#081a26');
      
      // Отключаем вертикальные свайпы для лучшей работы анимаций
      WebApp.disableVerticalSwipes();
      
      // Устанавливаем CSS переменные для Telegram
      if (WebApp.themeParams) {
        document.documentElement.style.setProperty('--tg-theme-bg-color', '#081a26');
        document.documentElement.style.setProperty('--tg-theme-text-color', '#ffffff');
        document.documentElement.style.setProperty('--tg-theme-button-color', '#e2bd48');
        document.documentElement.style.setProperty('--tg-theme-button-text-color', '#081a26');
      }
      
      // Добавляем класс для Telegram viewport
      document.body.classList.add('telegram-viewport');
      
      console.log('Telegram Web App initialized');
    } catch (error) {
      console.error('Error initializing Telegram Web App:', error);
    }
  };

  // Загрузка справочных данных
  const loadReferenceData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [ageGroupsData, categoriesData] = await Promise.all([
        apiService.getAgeGroups(),
        apiService.getCategories()
      ]);
      
      setAgeGroups(ageGroupsData.data || ageGroupsData);
      setCategories(categoriesData.data || categoriesData);
      
      console.log('Reference data loaded:', { ageGroupsData, categoriesData });
    } catch (error) {
      console.error('Error loading reference data:', error);
      setError('Ошибка загрузки данных. Проверьте подключение к интернету.');
      
      // В случае ошибки показываем alert через Telegram
      if (WebApp.showAlert) {
        WebApp.showAlert('Ошибка загрузки данных');
      }
    } finally {
      setLoading(false);
    }
  };

  // Обработчик выбора возраста
  const handleAgeSelect = (ageId) => {
    setSelectedAge(ageId);
    setCurrentScreen('category');
    
    console.log('Age selected:', ageId);
  };

  // Обработчик выбора категории
  const handleCategorySelect = async (categoryId) => {
    setSelectedCategory(categoryId);
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching activities for:', { age: selectedAge, category: categoryId });
      
      const response = await apiService.getActivities({
        age: selectedAge,
        category: categoryId
      });
      
      setActivities(response.activities || []);
      setUser(response.user || null);
      setCurrentScreen('results');
      
      console.log('Activities loaded:', response);
    } catch (error) {
      console.error('Error fetching activities:', error);
      setError('Не удалось загрузить активности. Попробуйте еще раз.');
      
      if (WebApp.showAlert) {
        WebApp.showAlert('Ошибка загрузки активностей');
      }
    } finally {
      setLoading(false);
    }
  };

  // Обработчик выбора активности
  const handleActivitySelect = async (activity) => {
    // Проверка доступа к Premium контенту
    if (activity.premium && !user?.is_premium) {
      if (WebApp.showAlert) {
        WebApp.showAlert('Эта активность доступна только в Premium версии');
      }
      return;
    }
    
    setSelectedActivity(activity);
    setCurrentScreen('details');
    
    console.log('Activity selected:', activity);
  };

  // Навигация назад
  const handleBack = () => {
    switch (currentScreen) {
      case 'category':
        setCurrentScreen('age');
        break;
      case 'results':
        setCurrentScreen('category');
        break;
      case 'details':
        setCurrentScreen('results');
        break;
      default:
        setCurrentScreen('age');
    }
  };

  // Начать заново
  const handleStartOver = () => {
    setSelectedAge('');
    setSelectedCategory('');
    setActivities([]);
    setSelectedActivity(null);
    setCurrentScreen('age');
    setError(null);
  };

  // Рендер экрана ошибки
  if (error && currentScreen === 'age') {
    return (
      <div className="app-container">
        <div className="error-message">
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>😞</div>
          <div style={{ fontSize: '18px', marginBottom: '8px' }}>Упс! Что-то пошло не так</div>
          <div style={{ fontSize: '14px', marginBottom: '20px' }}>{error}</div>
          <button 
            className="button-primary"
            onClick={loadReferenceData}
          >
            🔄 Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  // Главный рендер
  return (
    <div className="app-container">
      {/* Экран выбора возраста */}
      {currentScreen === 'age' && (
        <AgeSelector 
          ageGroups={ageGroups}
          onSelect={handleAgeSelect}
          loading={loading}
        />
      )}
      
      {/* Экран выбора категории */}
      {currentScreen === 'category' && (
        <CategorySelector 
          categories={categories}
          onSelect={handleCategorySelect}
          onBack={handleBack}
          selectedAge={selectedAge}
          loading={loading}
        />
      )}
      
      {/* Экран списка результатов */}
      {currentScreen === 'results' && (
        <ResultsList 
          activities={activities}
          user={user}
          onActivitySelect={handleActivitySelect}
          onBack={handleBack}
          onStartOver={handleStartOver}
          loading={loading}
        />
      )}
      
      {/* Экран деталей активности */}
      {currentScreen === 'details' && (
        <ActivityDetails 
          activity={selectedActivity}
          user={user}
          onBack={handleBack}
          onStartOver={handleStartOver}
        />
      )}
    </div>
  );
}

export default App;