import React from 'react';
import BackgroundShapes from '../common/BackgroundShapes';

const AgeSelector = ({ ageGroups, onSelect, loading }) => {
  if (loading) {
    return (
      <div className="loading-spinner">
        <div>Загружаем возрастные группы...</div>
      </div>
    );
  }

  return (
    <>
      {/* Фоновые геометрические фигуры */}
      <BackgroundShapes />
      
      {/* Основной контент - точно как в HTML дизайне */}
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
    </>
  );
};

export default AgeSelector;