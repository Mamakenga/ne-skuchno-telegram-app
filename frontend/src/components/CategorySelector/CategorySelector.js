import React from 'react';
import BackgroundShapes from '../common/BackgroundShapes';

const CategorySelector = ({ categories, onSelect, onBack, selectedAge, loading }) => {
  if (loading) {
    return (
      <div className="loading-spinner">
        <div>Загружаем категории...</div>
      </div>
    );
  }

  return (
    <>
      {/* Фоновые геометрические фигуры */}
      <BackgroundShapes />
      
      {/* Основной контент */}
      <div className="category-screen">
        <div className="back-button" onClick={onBack}>← Назад</div>
        
        <h1 className="title">Чем хочешь заняться?</h1>
        <p className="subtitle">Выбери категорию, которая тебе интересна</p>
        
        <div className="categories-container">
          {categories.map((category) => (
            <div
              key={category.id}
              onClick={() => onSelect(category.id)}
              className="activity-card"
              style={{ 
                borderLeft: `4px solid ${category.color}`,
                cursor: 'pointer'
              }}
            >
              <div className="activity-header">
                <div 
                  className="activity-icon"
                  style={{ 
                    background: `linear-gradient(135deg, ${category.color}20 0%, ${category.color}40 100%)`,
                    color: category.color 
                  }}
                >
                  {category.emoji}
                </div>
                <div>
                  <div className="activity-title">{category.title}</div>
                  <div className="activity-meta">{category.description}</div>
                </div>
              </div>
              {category.examples && (
                <div className="activity-description">
                  {category.examples}
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="bottom-hint">
          🎯 Каждая категория содержит множество интересных идей!
        </div>
      </div>
    </>
  );
};

export default CategorySelector;