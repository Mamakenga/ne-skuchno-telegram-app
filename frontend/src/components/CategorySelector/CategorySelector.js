import React from 'react';
import { CATEGORIES } from '../../types';

const CategorySelector = ({ selectedAge, onSelect, onBack }) => {
  return (
    <div className="category-screen">
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
        <div>
          <h1 className="section-title" style={{ 
            fontSize: '20px', 
            margin: '0',
            textAlign: 'left'
          }}>
            Чем хочешь заняться?
          </h1>
          <p style={{ 
            fontSize: '14px', 
            color: 'rgba(255, 255, 255, 0.7)', 
            margin: '4px 0 0 0' 
          }}>
            Возраст: {selectedAge} лет
          </p>
        </div>
      </div>
      
      {/* Categories - простые полупрозрачные плашки */}
      <div style={{ marginBottom: '20px' }}>
        {CATEGORIES.map((category) => (
          <div
            key={category.id}
            onClick={() => onSelect(category.id)}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '12px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
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
            {/* Эмодзи */}
            <div style={{
              fontSize: '32px',
              minWidth: '40px',
              textAlign: 'center'
            }}>
              {category.emoji}
            </div>
            
            {/* Текст */}
            <div style={{ flex: 1 }}>
              <div style={{
                color: '#e2bd48', // ЖЕЛТЫЙ заголовок
                fontWeight: '700',
                fontSize: '18px',
                marginBottom: '4px'
              }}>
                {category.title}
              </div>
              <div style={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '14px',
                lineHeight: '1.3'
              }}>
                {category.description}
              </div>
            </div>
            
            {/* Цветная точка */}
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: category.color,
              marginLeft: '8px'
            }} />
          </div>
        ))}
      </div>
      
      {/* Info */}
      <div className="bottom-hint">
        <div style={{ fontSize: '16px', marginBottom: '4px' }}>🎯</div>
        <div>
          Выбери категорию и получи 3 персональные рекомендации!
        </div>
      </div>
    </div>
  );
};

export default CategorySelector;