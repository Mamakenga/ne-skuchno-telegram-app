import React from 'react';
import { AGE_GROUPS } from '../../types';

const AgeSelector = ({ onSelect, onBack }) => {
  return (
    <div style={{ padding: '20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{ fontSize: '64px', marginBottom: '16px' }}>👋</div>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 8px 0' }}>
          Привет!
        </h1>
        <p style={{ color: '#999999', margin: 0 }}>
          Давай найдем для тебя интересное занятие!
        </p>
      </div>
      
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ 
          fontSize: '18px', 
          fontWeight: '600', 
          textAlign: 'center',
          margin: '0 0 20px 0'
        }}>
          🎂 Сколько тебе лет?
        </h2>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(2, 1fr)', 
          gap: '12px' 
        }}>
          {AGE_GROUPS.map((age) => (
            <button
              key={age.id}
              onClick={() => onSelect(age.id)}
              style={{
                background: '#f1f1f1',
                border: 'none',
                borderRadius: '16px',
                padding: '16px 12px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                textAlign: 'center'
              }}
              onMouseDown={(e) => e.target.style.transform = 'scale(0.95)'}
              onMouseUp={(e) => e.target.style.transform = 'scale(1)'}
              onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
            >
              <div style={{ fontSize: '24px', marginBottom: '4px' }}>
                {age.emoji}
              </div>
              <div style={{ fontSize: '14px', fontWeight: '500' }}>
                {age.title}
              </div>
            </button>
          ))}
        </div>
      </div>
      
      <div style={{
        background: '#f8f9fa',
        borderRadius: '12px',
        padding: '12px',
        textAlign: 'center',
        fontSize: '14px',
        color: '#666'
      }}>
        💡 Ты в одном шаге от классных идей!
      </div>
    </div>
  );
};

export default AgeSelector;