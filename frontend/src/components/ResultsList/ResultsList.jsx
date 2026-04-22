import React from 'react';
import BackgroundShapes from '../common/BackgroundShapes';

const ResultsList = ({ activities, user, onActivitySelect, onBack, onStartOver, loading }) => {
  // Функция для определения иконки по длительности
  const getDurationIcon = (minutes) => {
    if (minutes <= 20) return '⚡';
    if (minutes <= 45) return '🕐';
    return '🕒';
  };

  // Функция для форматирования времени
  const getDurationText = (minutes) => {
    if (minutes <= 20) return `${minutes} мин`;
    if (minutes <= 45) return `${minutes} мин`;
    return `${Math.round(minutes / 60 * 10) / 10} ч`;
  };

  // Функция для форматирования сложности
  const getDifficultyText = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'Легко';
      case 'medium': return 'Средне';
      case 'hard': return 'Сложно';
      default: return 'Легко';
    }
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <div>Подбираем активности...</div>
      </div>
    );
  }

  return (
    <>
      {/* Фоновые геометрические фигуры */}
      <BackgroundShapes />
      
      {/* Основной контент */}
      <div className="results-screen">
        <div className="back-button" onClick={onBack}>← Назад</div>
        
        <h1 className="title">Вот что я нашел!</h1>
        
        {/* Информация о лимитах для бесплатных пользователей */}
        {user && !user.is_premium && user.generations_left !== undefined && (
          <div className="glass-card" style={{ background: 'rgba(226, 189, 72, 0.1)' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#e2bd48', fontSize: '16px', fontWeight: '600' }}>
                ⚡ Осталось генераций сегодня: {user.generations_left}
              </div>
              {user.generations_left <= 2 && (
                <div style={{ color: 'rgba(226, 189, 72, 0.8)', fontSize: '14px', marginTop: '8px' }}>
                  Оформите Premium для безлимитного доступа!
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Список активностей */}
        <div className="activities-list">
          {activities.length === 0 ? (
            <div className="glass-card">
              <div style={{ textAlign: 'center', color: 'rgba(255, 255, 255, 0.7)' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🤔</div>
                <div>Не нашлось подходящих активностей.</div>
                <div style={{ fontSize: '14px', marginTop: '8px' }}>
                  Попробуйте выбрать другую категорию или возраст.
                </div>
              </div>
            </div>
          ) : (
            activities.map((activity, index) => (
              <div
                key={activity.id}
                onClick={() => onActivitySelect(activity)}
                className="activity-card"
              >
                <div className="activity-header">
                  <div className="activity-icon">
                    {getDurationIcon(activity.duration_minutes)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="activity-title">
                      {activity.title}
                      {activity.premium && (
                        <span style={{
                          background: 'linear-gradient(135deg, #e2bd48, #f4d06f)',
                          color: '#081a26',
                          fontSize: '10px',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          marginLeft: '8px',
                          fontWeight: '700'
                        }}>
                          ⭐ Premium
                        </span>
                      )}
                    </div>
                    <div className="activity-meta">
                      {getDurationText(activity.duration_minutes)} • {getDifficultyText(activity.difficulty)}
                    </div>
                  </div>
                </div>
                
                <div className="activity-description">
                  {activity.instructions && activity.instructions.length > 0 ? activity.instructions[0] + '...' : activity.short_description || ''}
                </div>
                
                {/* Материалы (первые 3) */}
                {activity.materials && activity.materials.length > 0 && (
                  <div style={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: '8px', 
                    marginTop: '12px' 
                  }}>
                    {activity.materials.slice(0, 3).map((material, idx) => (
                      <span 
                        key={idx}
                        style={{
                          background: 'rgba(255, 255, 255, 0.06)',
                          color: 'rgba(255, 255, 255, 0.8)',
                          fontSize: '12px',
                          padding: '4px 8px',
                          borderRadius: '8px'
                        }}
                      >
                        {material}
                      </span>
                    ))}
                    {activity.materials.length > 3 && (
                      <span style={{
                        color: 'rgba(255, 255, 255, 0.6)',
                        fontSize: '12px',
                        padding: '4px 8px'
                      }}>
                        +{activity.materials.length - 3} еще
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
        
        {/* Кнопки действий */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
          <button 
            className="button-primary"
            onClick={onStartOver}
            style={{ flex: 1 }}
          >
            🎯 Выбрать другие
          </button>
        </div>
        
        <div className="bottom-hint">
          💡 Нажми на активность, чтобы увидеть подробные инструкции!
        </div>
      </div>
    </>
  );
};

export default ResultsList;