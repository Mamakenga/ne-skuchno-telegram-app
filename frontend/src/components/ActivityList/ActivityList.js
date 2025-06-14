import React from 'react';

const ActivityList = ({ activities, selectedAge, selectedCategory, onActivitySelect, onBack, onStartOver }) => {
  
  // ========== ВАШИ ФУНКЦИИ (сохраняем как есть) ==========
  const getDurationIcon = (minutes) => {
    if (minutes <= 20) return '⚡';
    if (minutes <= 45) return '🕐';
    return '🕒';
  };

  const getDurationText = (minutes) => {
    if (minutes <= 20) return `${minutes} мин`;
    if (minutes <= 60) return `${minutes} мин`;
    return `${Math.round(minutes / 60 * 10) / 10} ч`;
  };

  const getCategoryTitle = (categoryId) => {
    const categoryMap = {
      'active_games': '🏃‍♂️ Активные игры',
      'creativity': '🎨 Творчество',
      'learn_new': '🧠 Изучение',
      'cooking': '👨‍🍳 Кулинария',
      'surprise_me': '🎲 Сюрприз'
    };
    return categoryMap[categoryId] || categoryId;
  };

  return (
    <div className="results-screen">
      {/* Header - обновляем стили но сохраняем структуру */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: '20px' 
      }}>
        <div 
          className="back-button"
          onClick={onBack}
        >
          ←
        </div>
        <div style={{ textAlign: 'center', flex: 1 }}>
          <h1 className="section-title" style={{ 
            fontSize: '18px', 
            margin: '0'
          }}>
            Вот что я нашел!
          </h1>
          <p style={{ 
            fontSize: '12px', 
            color: 'rgba(255, 255, 255, 0.7)', 
            margin: '4px 0 0 0' 
          }}>
            {getCategoryTitle(selectedCategory)} • {selectedAge} лет
          </p>
        </div>
        <div style={{ width: '32px' }} />
      </div>

      {/* Activities List - обновляем карточки на полупрозрачные */}
      <div style={{ marginBottom: '20px' }}>
        {activities.length === 0 ? (
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            textAlign: 'center',
            padding: '40px 20px'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
            <p style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Загружаем активности...</p>
          </div>
        ) : (
          activities.map((activity, index) => (
            <div
              key={activity.id || index}
              onClick={() => onActivitySelect(activity)}
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                padding: '16px',
                marginBottom: '12px',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ 
                  fontSize: '24px',
                  minWidth: '32px',
                  textAlign: 'center'
                }}>
                  {getDurationIcon(activity.duration_minutes)}
                </div>
                
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontWeight: '600',
                    fontSize: '16px',
                    color: '#e2bd48', // ЖЕЛТЫЙ заголовок
                    marginBottom: '4px',
                    lineHeight: '1.2'
                  }}>
                    {activity.title}
                  </div>
                  
                  <div style={{
                    fontSize: '12px',
                    color: 'rgba(255, 255, 255, 0.6)',
                    marginBottom: '8px'
                  }}>
                    {getDurationText(activity.duration_minutes)} • {activity.difficulty === 'easy' ? 'Легко' : activity.difficulty === 'medium' ? 'Средне' : 'Сложно'}
                  </div>
                  
                  <div style={{
                    fontSize: '14px',
                    color: 'rgba(255, 255, 255, 0.8)',
                    lineHeight: '1.3'
                  }}>
                    {activity.instructions && activity.instructions[0] ? 
                      activity.instructions[0].substring(0, 80) + (activity.instructions[0].length > 80 ? '...' : '')
                      : 'Интересная активность!'
                    }
                  </div>

                  {/* Материалы - сохраняем вашу логику, обновляем стили */}
                  {activity.materials && activity.materials.length > 0 && (
                    <div style={{ marginTop: '8px' }}>
                      {activity.materials.slice(0, 3).map((material, idx) => (
                        <span 
                          key={idx}
                          style={{
                            display: 'inline-block',
                            background: 'rgba(255, 255, 255, 0.1)',
                            color: 'rgba(255, 255, 255, 0.8)',
                            fontSize: '11px',
                            padding: '2px 6px',
                            borderRadius: '8px',
                            marginRight: '4px',
                            marginTop: '2px'
                          }}
                        >
                          {material}
                        </span>
                      ))}
                      {activity.materials.length > 3 && (
                        <span style={{ 
                          fontSize: '11px', 
                          color: 'rgba(255, 255, 255, 0.6)' 
                        }}>
                          +{activity.materials.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
{/* Actions - стилизованная кнопка */}
<div style={{ display: 'flex', gap: '12px' }}>
  <button 
    onClick={onStartOver}
    style={{
      flex: 1,
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
      letterSpacing: '-0.2px'
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
    Поискать еще варианты
  </button>
</div>
    </div>
  );
};

export default ActivityList;