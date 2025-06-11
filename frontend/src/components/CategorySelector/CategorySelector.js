import React from 'react';
import { CATEGORIES } from '../../types';

const CategorySelector = ({ selectedAge, onSelect, onBack }) => {
  return (
    <div style={{ padding: '20px' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        marginBottom: '24px' 
      }}>
        <button 
          onClick={onBack}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '20px',
            cursor: 'pointer',
            padding: '8px',
            marginRight: '12px',
            color: '#40a7e3'
          }}
        >
          ←
        </button>
        <div>
          <h1 style={{ 
            fontSize: '20px', 
            fontWeight: 'bold', 
            margin: '0',
            color: '#000'
          }}>
            Чем хочешь заняться?
          </h1>
          <p style={{ 
            fontSize: '14px', 
            color: '#666', 
            margin: '4px 0 0 0' 
          }}>
            Возраст: {selectedAge} лет
          </p>
        </div>
      </div>
      
      {/* Categories */}
      <div style={{ marginBottom: '20px' }}>
        {CATEGORIES.map((category) => (
          <button
            key={category.id}
            onClick={() => onSelect(category.id)}
            style={{
              width: '100%',
              background: '#ffffff',
              border: `3px solid ${category.color}20`,
              borderLeft: `6px solid ${category.color}`,
              borderRadius: '16px',
              padding: '20px 16px',
              marginBottom: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
            onMouseDown={(e) => {
              e.target.style.transform = 'scale(0.98)';
              e.target.style.background = category.color + '10';
            }}
            onMouseUp={(e) => {
              e.target.style.transform = 'scale(1)';
              e.target.style.background = '#ffffff';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
              e.target.style.background = '#ffffff';
            }}
          >
            <div style={{ 
              fontSize: '32px', 
              marginRight: '16px',
              minWidth: '40px'
            }}>
              {category.emoji}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ 
                fontWeight: '600', 
                fontSize: '16px',
                color: '#000',
                marginBottom: '4px'
              }}>
                {category.title}
              </div>
              <div style={{ 
                fontSize: '14px', 
                color: '#666',
                lineHeight: '1.3'
              }}>
                {category.description}
              </div>
            </div>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: category.color,
              marginLeft: '8px'
            }} />
          </button>
        ))}
      </div>
      
      {/* Info */}
      <div style={{
        background: '#f8f9fa',
        borderRadius: '12px',
        padding: '16px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '16px', marginBottom: '4px' }}>🎯</div>
        <div style={{ fontSize: '14px', color: '#666' }}>
          Выбери категорию и получи 3 персональные рекомендации!
        </div>
      </div>
    </div>
  );
};

export default CategorySelector;