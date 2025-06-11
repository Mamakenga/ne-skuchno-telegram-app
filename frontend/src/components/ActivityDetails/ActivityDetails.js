import React, { useState } from 'react';

const ActivityDetails = ({ activity, onBack, onStartOver }) => {
  const [rating, setRating] = useState(0);
  const [hasRated, setHasRated] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const getDurationText = (minutes) => {
    if (minutes <= 20) return `${minutes} минут`;
    if (minutes <= 45) return `${minutes} минут`;
    return `${Math.round(minutes / 60 * 10) / 10} часа`;
  };

  const getDifficultyEmoji = (difficulty) => {
    switch (difficulty) {
      case 'easy': return '😊';
      case 'medium': return '🤔'; 
      case 'hard': return '😤';
      default: return '😊';
    }
  };

  const getDifficultyText = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'Легко';
      case 'medium': return 'Средне';
      case 'hard': return 'Сложно';
      default: return 'Легко';
    }
  };

  const handleRating = async (newRating) => {
    if (hasRated) return;
    
    setRating(newRating);
    setHasRated(true);
    
    // Здесь будет вызов API
    console.log('Rating activity:', activity.id, newRating);
  };

  const handleAddToFavorites = () => {
    setIsFavorite(!isFavorite);
    console.log('Toggle favorite:', activity.id);
  };

  return (
    <div style={{ padding: '20px', paddingBottom: '100px' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: '20px'
      }}>
        <button 
          onClick={onBack}
          style={{
            background: 'transparent',
            border: 'none',
            fontSize: '20px',
            cursor: 'pointer',
            color: '#40a7e3'
          }}
        >
          ←
        </button>
        <h1 style={{ 
          fontSize: '18px', 
          fontWeight: 'bold', 
          margin: 0,
          textAlign: 'center',
          flex: 1,
          paddingRight: '24px'
        }}>
          {activity.title}
        </h1>
      </div>

      {/* Основная информация */}
      <div style={{
        background: '#f8f9fa',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '20px'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>⏰</span>
            <span style={{ fontWeight: '500' }}>
              {getDurationText(activity.duration_minutes)}
            </span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '16px' }}>
              {getDifficultyEmoji(activity.difficulty)}
            </span>
            <span style={{ fontSize: '14px', color: '#666' }}>
              {getDifficultyText(activity.difficulty)}
            </span>
          </div>
        </div>

        {activity.age_groups && activity.age_groups.length > 0 && (
          <div style={{ fontSize: '14px', color: '#666' }}>
            👶 Возраст: {activity.age_groups.join(', ')} лет
          </div>
        )}
      </div>

      {/* Материалы */}
      {activity.materials && activity.materials.length > 0 && (
        <div style={{
          background: '#fff5f5',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '20px',
          borderLeft: '4px solid #ff6b6b'
        }}>
          <h3 style={{ 
            fontWeight: '600', 
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            margin: '0 0 12px 0'
          }}>
            📋 Что понадобится:
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {activity.materials.map((material, index) => (
              <div key={index} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px' 
              }}>
                <span style={{ color: '#ff6b6b', fontWeight: 'bold' }}>•</span>
                <span style={{ fontSize: '15px' }}>{material}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Инструкции */}
      <div style={{
        background: '#f0f9ff',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '20px',
        borderLeft: '4px solid #40a7e3'
      }}>
        <h3 style={{ 
          fontWeight: '600',
          margin: '0 0 16px 0',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          📝 Как делать:
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {activity.instructions && activity.instructions.map((instruction, index) => (
            <div key={index} style={{ display: 'flex', gap: '12px' }}>
              <span style={{
                background: '#40a7e3',
                color: 'white',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 'bold',
                flexShrink: 0,
                marginTop: '2px'
              }}>
                {index + 1}
              </span>
              <span style={{ 
                fontSize: '15px',
                lineHeight: '1.5',
                flex: 1
              }}>
                {instruction}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Что развивает */}
      {activity.skills_developed && activity.skills_developed.length > 0 && (
        <div style={{
          background: '#f0fff4',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '20px',
          borderLeft: '4px solid #4ecdc4'
        }}>
          <h3 style={{ 
            fontWeight: '600',
            margin: '0 0 12px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
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
                  background: 'rgba(78, 205, 196, 0.2)',
                  color: '#2d7a6e',
                  fontSize: '14px',
                  padding: '6px 12px',
                  borderRadius: '12px',
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
      <div style={{
        background: '#fffbf0',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '20px',
        borderLeft: '4px solid #f7dc6f'
      }}>
        <h3 style={{ 
          fontWeight: '600',
          margin: '0 0 12px 0'
        }}>
          ⭐ Понравилось?
        </h3>
        
        {!hasRated ? (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '8px' 
          }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => handleRating(star)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '32px',
                  cursor: 'pointer',
                  transition: 'transform 0.1s',
                  padding: '4px'
                }}
                onMouseDown={(e) => e.target.style.transform = 'scale(1.2)'}
                onMouseUp={(e) => e.target.style.transform = 'scale(1)'}
                onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
              >
                {star <= rating ? '⭐' : '☆'}
              </button>
            ))}
          </div>
        ) : (
          <div style={{ 
            textAlign: 'center',
            fontSize: '16px',
            color: '#666'
          }}>
            Спасибо за оценку! {Array(rating).fill('⭐').join('')}
          </div>
        )}
      </div>

      {/* Действия */}
      <div style={{ 
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'calc(100% - 40px)',
        maxWidth: '360px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <button 
          onClick={handleAddToFavorites}
          style={{
            background: isFavorite ? '#4ecdc4' : '#f1f1f1',
            color: isFavorite ? 'white' : '#333',
            border: 'none',
            padding: '12px 20px',
            borderRadius: '12px',
            cursor: 'pointer',
            fontWeight: '500',
            fontSize: '16px',
            transition: 'all 0.2s'
          }}
        >
          {isFavorite ? '✅ В избранном' : '💾 Сохранить в избранное'}
        </button>
        
        <button 
          onClick={onStartOver}
          style={{
            background: '#40a7e3',
            color: 'white',
            border: 'none',
            padding: '14px 20px',
            borderRadius: '12px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '16px',
            transition: 'transform 0.2s'
          }}
          onMouseDown={(e) => e.target.style.transform = 'scale(0.98)'}
          onMouseUp={(e) => e.target.style.transform = 'scale(1)'}
          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
        >
          🎯 Попробовать еще!
        </button>
      </div>
    </div>
  );
};

export default ActivityDetails;