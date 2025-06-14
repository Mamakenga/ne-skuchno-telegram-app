import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';

const AgeSelector = ({ onSelect }) => {
  const [ageGroups, setAgeGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAgeGroups();
  }, []);

  const loadAgeGroups = async () => {
    try {
      const response = await apiService.getAgeGroups();
      setAgeGroups(response.data || []);
    } catch (error) {
      console.error('Error loading age groups:', error);
      // Fallback данные если API не работает
      setAgeGroups([
        { id: '3-5', title: '3-5 лет' },
        { id: '6-8', title: '6-8 лет' },
        { id: '9-12', title: '9-12 лет' },
        { id: '13-17', title: '13-17 лет' },
        { id: '18+', title: '18+' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="age-screen">
        <div className="loading-spinner">
          <div>Загружаем возрастные группы...</div>
        </div>
      </div>
    );
  }

  // Защита от пустого массива
  if (!ageGroups || ageGroups.length === 0) {
    return (
      <div className="age-screen">
        <h1 className="title">Упс!</h1>
        <p className="subtitle">Не удалось загрузить возрастные группы</p>
        <div className="glass-card">
          <div style={{ textAlign: 'center', color: '#e2bd48' }}>
            Попробуйте обновить страницу
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="age-screen">
      <h1 className="title">Привет!</h1>
      <p className="subtitle">Давай найдем для тебя интересное занятие!</p>
      
      <div className="glass-card">
        <h2 className="section-title">Выбери свой возраст:</h2>
        
        {/* Первые 4 кнопки в сетке 2x2 - БЕЗ эмодзи */}
        <div className="age-grid">
          {ageGroups.slice(0, 4).map((age) => (
            <div
              key={age.id}
              onClick={() => onSelect(age.id)}
              className="age-button"
            >
              <span className="age-number">{age.title}</span>
            </div>
          ))}
        </div>
        
        {/* Кнопка 18+ на всю ширину (если есть) */}
        {ageGroups.length > 4 && (
          <div 
            className="age-button age-button-wide" 
            onClick={() => onSelect(ageGroups[4].id)}
          >
            <span className="age-number">{ageGroups[4].title}</span>
          </div>
        )}
      </div>
      
      <div className="bottom-hint">
        💡 Ты в одном шаге от классных идей!
      </div>
    </div>
  );
};

export default AgeSelector;