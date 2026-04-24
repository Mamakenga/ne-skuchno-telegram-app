import React, { useState } from 'react';
import BackgroundShapes from '../common/BackgroundShapes';
import { apiService } from '../../services/api';

// Telegram WebApp — встроен автоматически в Telegram Mini App окружении
const WebApp = window.Telegram?.WebApp || {};

const showAlert = (msg) => {
  try { WebApp.showAlert(msg); } catch { console.warn(msg); }
};

const ActivityDetails = ({ activity, user, onBack, onStartOver }) => {
  const [rating, setRating] = useState(0);
  const [hasRated, setHasRated] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isRating, setIsRating] = useState(false);

  // Функция для форматирования времени
  const getDurationText = (minutes) => {
    if (minutes <= 20) return `${minutes} минут`;
    if (minutes <= 45) return `${minutes} минут`;
    return `${Math.round(minutes / 60 * 10) / 10} часа`;
  };

  // Функция для получения эмодзи сложности
  const getDifficultyEmoji = (difficulty) => {
    switch (difficulty) {
      case 'easy': return '😊';
      case 'medium': return '🤔'; 
      case 'hard': return '😤';
      default: return '😊';
    }
  };

  // Функция для получения текста сложности
  const getDifficultyText = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'Легко';
      case 'medium': return 'Средне';
      case 'hard': return 'Сложно';
      default: return 'Легко';
    }
  };

  // Обработка оценки
  const handleRating = async (newRating) => {
    if (hasRated || isRating) return;
    
    setIsRating(true);
    try {
      await apiService.rateActivity(activity.id, newRating);
      setRating(newRating);
      setHasRated(true);
      
      // Анимация звезд
      const stars = document.querySelectorAll('.star');
      stars.forEach((star, index) => {
        if (index < newRating) {
          star.style.transform = 'scale(1.3)';
          setTimeout(() => {
            star.style.transform = 'scale(1.1)';
          }, 200);
        }
      });
    } catch (error) {
      console.error('Error rating activity:', error);
    } finally {
      setIsRating(false);
    }
  };

  // Добавление в избранное
  const handleAddToFavorites = async () => {
    if (!user?.is_premium) {
      showAlert('Избранное доступно только в Premium версии');
      return;
    }
    
    try {
      await apiService.addToFavorites(activity.id);
      setIsFavorite(true);
    } catch (error) {
      console.error('Error adding to favorites:', error);
      showAlert('Не удалось добавить в избранное');
    }
  };

  return (
    <>
      {/* Фоновые геометрические фигуры */}
      <BackgroundShapes />
      
      {/* Основной контент */}
      <div className="details-screen">
        <div className="back-button" onClick={onBack}>← Назад</div>
        
        <h1 className="title">{activity.title}</h1>
        
        {/* Основная информация */}
        <div className="glass-card">
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '16px' 
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              color: '#ffffff' 
            }}>
              <span>⏰</span>
              <span>{getDurationText(activity.duration_minutes)}</span>
            </div>
            
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              color: '#ffffff' 
            }}>
              <span>{getDifficultyEmoji(activity.difficulty)}</span>
              <span>{getDifficultyText(activity.difficulty)}</span>
            </div>
          </div>

          {activity.age_groups && activity.age_groups.length > 0 && (
            <div style={{ 
              color: 'rgba(255, 255, 255, 0.6)', 
              fontSize: '14px' 
            }}>
              Возраст: {activity.age_groups.join(', ')} лет
            </div>
          )}

          {activity.premium && (
            <div style={{
              background: 'linear-gradient(135deg, #e2bd48, #f4d06f)',
              color: '#081a26',
              padding: '8px 16px',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '600',
              marginTop: '12px',
              textAlign: 'center'
            }}>
              ⭐ Premium активность
            </div>
          )}
        </div>

        {/* Материалы */}
        {activity.materials && activity.materials.length > 0 && (
          <div className="glass-card">
            <h3 style={{ 
              color: '#e2bd48', 
              marginBottom: '20px', 
              fontSize: '18px',
              fontWeight: '600'
            }}>
              📋 Что понадобится:
            </h3>
            <div className="materials-list">
              {activity.materials.map((material, index) => (
                <div key={index} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px',
                  marginBottom: '8px'
                }}>
                  <span style={{ color: '#e2bd48' }}>•</span>
                  <span>{material}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Инструкции */}
        <div className="glass-card">
          <h3 style={{ 
            color: '#e2bd48', 
            marginBottom: '20px', 
            fontSize: '18px',
            fontWeight: '600'
          }}>
            📝 Как делать:
          </h3>
          <div className="instructions-list">
            {activity.instructions.map((instruction, index) => (
              <div key={index} className="instruction-step">
                <div className="step-number">{index + 1}</div>
                <div style={{ flex: 1 }}>{instruction}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Что развивает */}
        {activity.skills_developed && activity.skills_developed.length > 0 && (
          <div className="glass-card">
            <h3 style={{ 
              color: '#e2bd48', 
              marginBottom: '20px', 
              fontSize: '18px',
              fontWeight: '600'
            }}>
              💡 Что развивает:
            </h3>
            <div style={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: '8px' 
            }}>
              {activity.skills_developed.map((skill, index) => (
                <span 
                  key={index}
                  style={{
                    background: 'rgba(226, 189, 72, 0.2)',
                    color: '#e2bd48',
                    fontSize: '14px',
                    padding: '8px 16px',
                    borderRadius: '16px',
                    fontWeight: '500'
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Оценка */}
        <div className="glass-card">
          <h3 style={{ 
            color: '#e2bd48', 
            marginBottom: '20px', 
            fontSize: '18px',
            fontWeight: '600'
          }}>
            ⭐ Понравилось?
          </h3>
          
          {!hasRated ? (
            <div className="rating-stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleRating(star)}
                  className="star"
                  disabled={isRating}
                  style={{
                    opacity: isRating ? 0.5 : 1,
                    cursor: isRating ? 'not-allowed' : 'pointer'
                  }}
                >
                  {star <= rating ? '★' : '☆'}
                </button>
              ))}
            </div>
          ) : (
            <div style={{ 
              textAlign: 'center', 
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '16px'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>
                {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
              </div>
              <div>Спасибо за оценку! 🎉</div>
            </div>
          )}
        </div>

        {/* Кнопки действий */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {user?.is_premium && (
            <button 
              onClick={handleAddToFavorites}
              disabled={isFavorite}
              style={{
                background: isFavorite 
                  ? 'rgba(87, 204, 153, 0.2)' 
                  : 'rgba(255, 255, 255, 0.06)',
                backdropFilter: 'blur(15px)',
                border: `1px solid ${isFavorite ? 'rgba(87, 204, 153, 0.3)' : 'rgba(255, 255, 255, 0.1)'}`,
                borderRadius: '16px',
                padding: '16px',
                color: isFavorite ? '#57cc99' : '#ffffff',
                cursor: isFavorite ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                fontWeight: '600',
                transition: 'all 0.3s ease'
              }}
            >
              {isFavorite ? '✅ В избранном' : '💾 Сохранить в избранное'}
            </button>
          )}
          
          <button 
            className="button-primary"
            onClick={onStartOver}
          >
            🎯 Найти еще идеи
          </button>
        </div>
        
        <div className="bottom-hint">
          🌟 Поделись результатом с друзьями!
        </div>
      </div>
    </>
  );
};

export default ActivityDetails;