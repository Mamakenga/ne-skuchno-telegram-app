import React, { useState } from 'react';

const ActivityDetails = ({ activity, onBack, onStartOver }) => {
  const [rating, setRating] = useState(0);
  const [hasRated, setHasRated] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const handleRating = (newRating) => {
    if (hasRated) return;
    
    setRating(newRating);
    setHasRated(true);
    
    // Здесь потом добавим API вызов
    console.log('Оценка активности:', activity.id, newRating);
  };

  const handleAddToFavorites = () => {
    setIsFavorite(true);
    
    // Здесь потом добавим API вызов
    console.log('Добавлено в избранное:', activity.id);
  };

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

  if (!activity) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>Активность не найдена</p>
        <button onClick={onBack} style={{ 
          background: '#007AFF', 
          color: 'white', 
          border: 'none', 
          padding: '10px 20px', 
          borderRadius: '8px' 
        }}>
          Назад
        </button>
      </div>
    );
  }

  return (
    <div style={{ 
      maxWidth: '400px', 
      margin: '0 auto', 
      padding: '20px',
      minHeight: '100vh',
      background: '#ffffff'
    }}>
      {/* Заголовок с кнопкой назад */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        marginBottom: '20px',
        borderBottom: '1px solid #eee',
        paddingBottom: '15px'
      }}>
        <button 
          onClick={onBack}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '24px',
            color: '#007AFF',
            cursor: 'pointer',
            marginRight: '15px'
          }}
        >
          ←
        </button>
        <h1 style={{ 
          margin: 0, 
          fontSize: '20px', 
          fontWeight: 'bold',
          flex: 1
        }}>
          {activity.title}
        </h1>
      </div>

      {/* Основная информация */}
      <div style={{ 
        background: '#f8f9fa', 
        padding: '15px', 
        borderRadius: '12px', 
        marginBottom: '20px' 
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>⏰</span>
            <span>{getDurationText(activity.duration_minutes)}</span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>{getDifficultyEmoji(activity.difficulty)}</span>
            <span>{getDifficultyText(activity.difficulty)}</span>
          </div>
        </div>

        {activity.age_groups && (
          <div style={{ fontSize: '14px', color: '#666' }}>
            Возраст: {activity.age_groups.join(', ')} лет
          </div>
        )}
      </div>

      {/* Материалы */}
      {activity.materials && activity.materials.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ 
            fontSize: '16px', 
            fontWeight: 'bold', 
            marginBottom: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            📋 Что понадобится:
          </h3>
          <div style={{ 
            background: '#fff', 
            padding: '15px', 
            borderRadius: '8px', 
            border: '1px solid #eee' 
          }}>
            {activity.materials.map((material, index) => (
              <div key={index} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                marginBottom: '8px'
              }}>
                <span style={{ color: '#007AFF' }}>•</span>
                <span style={{ fontSize: '14px' }}>{material}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Инструкции */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ 
          fontSize: '16px', 
          fontWeight: 'bold', 
          marginBottom: '10px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          📝 Как делать:
        </h3>
        <div style={{ 
          background: '#fff', 
          padding: '15px', 
          borderRadius: '8px', 
          border: '1px solid #eee' 
        }}>
          {activity.instructions.map((instruction, index) => (
            <div key={index} style={{ 
              display: 'flex', 
              gap: '12px',
              marginBottom: '15px',
              alignItems: 'flex-start'
            }}>
              <span style={{
                background: '#007AFF',
                color: 'white',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 'bold',
                flexShrink: 0
              }}>
                {index + 1}
              </span>
              <span style={{ fontSize: '14px', lineHeight: '1.4' }}>
                {instruction}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Что развивает */}
      {activity.skills_developed && activity.skills_developed.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ 
            fontSize: '16px', 
            fontWeight: 'bold', 
            marginBottom: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            💡 Что развивает:
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {activity.skills_developed.map((skill, index) => (
              <span 
                key={index}
                style={{
                  background: '#e3f2fd',
                  color: '#1976d2',
                  fontSize: '12px',
                  padding: '6px 12px',
                  borderRadius: '16px',
                  border: '1px solid #bbdefb'
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
        background: '#fff3cd', 
        padding: '15px', 
        borderRadius: '8px', 
        marginBottom: '20px',
        border: '1px solid #ffeaa7'
      }}>
        <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px' }}>
          ⭐ Понравилось?
        </h3>
        
        {!hasRated ? (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '5px' }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => handleRating(star)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '28px',
                  cursor: 'pointer',
                  transition: 'transform 0.1s'
                }}
                onMouseDown={(e) => e.target.style.transform = 'scale(1.2)'}
                onMouseUp={(e) => e.target.style.transform = 'scale(1)'}
              >
                {star <= rating ? '⭐' : '☆'}
              </button>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: '#666' }}>
            Спасибо за оценку! ⭐
          </div>
        )}
      </div>

      {/* Действия */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <button 
          onClick={handleAddToFavorites}
          disabled={isFavorite}
          style={{
            background: isFavorite ? '#d4edda' : '#f8f9fa',
            color: isFavorite ? '#155724' : '#495057',
            border: `1px solid ${isFavorite ? '#c3e6cb' : '#dee2e6'}`,
            padding: '12px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: isFavorite ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s'
          }}
        >
          {isFavorite ? '✅ В избранном' : '💾 Сохранить в избранное'}
        </button>
        
        <button 
          onClick={onStartOver}
          style={{
            background: '#007AFF',
            color: 'white',
            border: 'none',
            padding: '12px',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'transform 0.1s'
          }}
          onMouseDown={(e) => e.target.style.transform = 'scale(0.98)'}
          onMouseUp={(e) => e.target.style.transform = 'scale(1)'}
        >
          🎯 Другие варианты
        </button>
      </div>
    </div>
  );
};

export default ActivityDetails;