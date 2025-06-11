import React from 'react';

const ActivityList = ({ activities, selectedAge, selectedCategory, onActivitySelect, onBack, onStartOver }) => {
  
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
    <div style={{ padding: '20px' }}>
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
            background: 'none',
            border: 'none',
            fontSize: '20px',
            cursor: 'pointer',
            padding: '8px',
            color: '#40a7e3'
          }}
        >
          ←
        </button>
        <div style={{ textAlign: 'center', flex: 1 }}>
          <h1 style={{ 
            fontSize: '18px', 
            fontWeight: 'bold', 
            margin: '0',
            color: '#000'
          }}>
            Вот что я нашел!
          </h1>
          <p style={{ 
            fontSize: '12px', 
            color: '#666', 
            margin: '4px 0 0 0' 
          }}>
            {getCategoryTitle(selectedCategory)} • {selectedAge} лет
          </p>
        </div>
        <div style={{ width: '32px' }} />
      </div>

      {/* Activities List */}
      <div style={{ marginBottom: '20px' }}>
        {activities.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: '#666'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
            <p>Загружаем активности...</p>
          </div>
        ) : (
          activities.map((activity, index) => (
            <button
              key={activity.id || index}
              onClick={() => onActivitySelect(activity)}
              style={{
                width: '100%',
                background: '#ffffff',
                border: '2px solid #f0f0f0',
                borderRadius: '16px',
                padding: '16px',
                marginBottom: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                textAlign: 'left',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
              onMouseDown={(e) => e.target.style.transform = 'scale(0.98)'}
              onMouseUp={(e) => e.target.style.transform = 'scale(1)'}
              onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
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
                    color: '#000',
                    marginBottom: '4px',
                    lineHeight: '1.2'
                  }}>
                    {activity.title}
                  </div>
                  
                  <div style={{
                    fontSize: '12px',
                    color: '#666',
                    marginBottom: '8px'
                  }}>
                    {getDurationText(activity.duration_minutes)} • {activity.difficulty === 'easy' ? 'Легко' : activity.difficulty === 'medium' ? 'Средне' : 'Сложно'}
                  </div>
                  
                  <div style={{
                    fontSize: '14px',
                    color: '#333',
                    lineHeight: '1.3'
                  }}>
                    {activity.instructions && activity.instructions[0] ? 
                      activity.instructions[0].substring(0, 80) + (activity.instructions[0].length > 80 ? '...' : '')
                      : 'Интересная активность!'
                    }
                  </div>

                  {activity.materials && activity.materials.length > 0 && (
                    <div style={{ marginTop: '8px' }}>
                      {activity.materials.slice(0, 3).map((material, idx) => (
                        <span 
                          key={idx}
                          style={{
                            display: 'inline-block',
                            background: '#f0f0f0',
                            color: '#666',
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
                        <span style={{ fontSize: '11px', color: '#666' }}>
                          +{activity.materials.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))
        )}
      </div>
      
      {/* Actions */}
      <div style={{ display: 'flex', gap: '12px' }}>
        <button 
          onClick={onStartOver}
          style={{
            flex: 1,
            background: '#f1f1f1',
            color: '#333',
            border: 'none',
            padding: '12px 16px',
            borderRadius: '12px',
            cursor: 'pointer',
            fontWeight: '500',
            fontSize: '14px'
          }}
        >
          🎯 Выбрать другие
        </button>
      </div>
    </div>
  );
};

export default ActivityList;