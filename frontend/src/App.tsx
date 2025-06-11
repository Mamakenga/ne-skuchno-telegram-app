import React from 'react';

function App() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      padding: '32px 16px', 
      maxWidth: '400px', 
      margin: '0 auto',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎯</div>
        <h1 style={{ 
          fontSize: '24px', 
          fontWeight: 'bold', 
          margin: '0 0 8px 0'
        }}>
          Мама, мне скучно!
        </h1>
        <p style={{ color: '#999999', margin: 0 }}>
          Тысяча и одна идея против скуки!
        </p>
      </div>

      <div style={{
        background: '#f1f1f1',
        borderRadius: '24px',
        padding: '24px',
        marginBottom: '16px'
      }}>
        <h3 style={{ margin: '0 0 8px 0' }}>🎨 Творчество</h3>
        <p style={{ color: '#999999', fontSize: '14px', margin: 0 }}>
          Рисование, поделки, музыка
        </p>
      </div>

      <button style={{
        background: '#40a7e3',
        color: '#ffffff',
        padding: '12px 24px',
        borderRadius: '16px',
        border: 'none',
        fontWeight: '500',
        cursor: 'pointer',
        width: '100%',
        fontSize: '16px'
      }}>
        🚀 Начать поиск активности!
      </button>

      <div style={{ 
        marginTop: '16px', 
        textAlign: 'center', 
        fontSize: '14px', 
        color: '#999999' 
      }}>
        React запущен! ✅
      </div>
    </div>
  );
}

export default App;