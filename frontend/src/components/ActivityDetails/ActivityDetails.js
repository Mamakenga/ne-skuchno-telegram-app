import React, { useState } from 'react';

const ActivityDetails = ({ activity, onBack, onStartOver }) => {
  const [rating, setRating] = useState(0);
  const [hasRated, setHasRated] = useState(false);

  const handleRating = (newRating) => {
    if (hasRated) return;
    setRating(newRating);
    setHasRated(true);
    // Здесь можно добавить отправку рейтинга на сервер
  };

  if (!activity) {
    return (
      <div className="details-screen">
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          padding: '40px 20px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>😔</div>
          <div style={{ color: '#ffffff', fontSize: '18px' }}>
            Активность не найдена
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="details-screen">
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        marginBottom: '24px' 
      }}>
        <div 
          className="back-button"
          onClick={onBack}
          style={{ marginRight: '16px' }}
        >
          ←
        </div>
        <h1 className="section-title" style={{ 
          fontSize: '20px', 
          margin: '0',
          textAlign: 'left'
        }}>
          {activity.title}
        </h1>
      </div>

      {/* Activity Info */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '16px'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          {activity.duration && (
            <div style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              ⏱️ {activity.duration} минут
            </div>
          )}
          {activity.difficulty && (
            <div style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              📊 {getDifficultyText(activity.difficulty)}
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      {activity.description && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '16px'
        }}>
          <h3 style={{ 
            color: '#e2bd48', 
            marginBottom: '12px', 
            fontSize: '16px',
            fontWeight: '600'
          }}>
            📝 Описание:
          </h3>
          <div style={{
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: '15px',
            lineHeight: '1.5'
          }}>
            {activity.description}
          </div>
        </div>
      )}

      {/* Materials */}
      {activity.materials && activity.materials.length > 0 && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '16px'
        }}>
          <h3 style={{ 
            color: '#e2bd48', 
            marginBottom: '12px', 
            fontSize: '16px',
            fontWeight: '600'
          }}>
            🛠️ Материалы:
          </h3>
          <div style={{
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: '15px',
            lineHeight: '1.7'
          }}>
            {activity.materials.map((material, index) => (
              <div key={index} style={{ marginBottom: '4px' }}>
                • {material}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      {activity.instructions && activity.instructions.length > 0 && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '16px'
        }}>
          <h3 style={{ 
            color: '#e2bd48', 
            marginBottom: '12px', 
            fontSize: '16px',
            fontWeight: '600'
          }}>
            📋 Инструкции:
          </h3>
          <div style={{
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: '15px',
            lineHeight: '1.7'
          }}>
            {activity.instructions.map((instruction, index) => (
              <div key={index} style={{ 
                marginBottom: '8px',
                display: 'flex',
                gap: '12px'
              }}>
                <span style={{ 
                  color: '#e2bd48',
                  fontWeight: '600',
                  minWidth: '20px'
                }}>
                  {index + 1}.
                </span>
                <span>{instruction}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rating */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '16px',
        textAlign: 'center'
      }}>
        <h3 style={{ 
          color: '#e2bd48', 
          marginBottom: '16px', 
          fontSize: '16px',
          fontWeight: '600'
        }}>
          ⭐ Понравилось?
        </h3>
        
        {!hasRated ? (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => handleRating(star)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: star <= rating ? '#e2bd48' : 'rgba(255, 255, 255, 0.3)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.target.style.transform = 'scale(1.2)'}
                onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
              >
                ★
              </button>
            ))}
          </div>
        ) : (
          <div style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
            Спасибо за оценку! 🎉
          </div>
        )}
      </div>

      {/* Actions */}
      <button 
        onClick={onStartOver}
        style={{
          width: '100%',
          background: 'linear-gradient(135deg, #e2bd48 0%, #f4d06f 100%)',
          color: '#081a26',
          border: 'none',
          padding: '16px 32px',
          borderRadius: '16px',
          cursor: 'pointer',
          fontWeight: '700',
          fontSize: '16px',
          transition: 'all 0.3s cubic-bezier(0.23, 1, 0.320, 1)',
          boxShadow: '0 12px 30px rgba(226, 189, 72, 0.25)',
          letterSpacing: '-0.2px',
          marginBottom: '20px'
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = 'translateY(-3px)';
          e.target.style.boxShadow = '0 20px 40px rgba(226, 189, 72, 0.35)';
          e.target.style.background = 'linear-gradient(135deg, #f4d06f 0%, #e2bd48 100%)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = '0 12px 30px rgba(226, 189, 72, 0.25)';
          e.target.style.background = 'linear-gradient(135deg, #e2bd48 0%, #f4d06f 100%)';
        }}
      >
        Найти еще идеи
      </button>
      
      <div className="bottom-hint">
        🌟 Поделись результатом с друзьями!
      </div>
    </div>
  );
};

// Вспомогательная функция
const getDifficultyText = (difficulty) => {
  const difficultyMap = {
    'easy': 'Легко',
    'medium': 'Средне',
    'hard': 'Сложно'
  };
  return difficultyMap[difficulty] || 'Неизвестно';
};

export default ActivityDetails;