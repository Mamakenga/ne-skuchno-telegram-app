import React from 'react';

const BackgroundShapes = () => {
  return (
    <div className="background-shapes">
      {/* Треугольники - красные */}
      <div className="shape triangle triangle-1"></div>
      <div className="shape triangle triangle-2"></div>
      
      {/* Квадраты - зеленые */}
      <div className="shape square square-1"></div>
      <div className="shape square square-2"></div>
      
      {/* Круги - синие */}
      <div className="shape circle circle-1"></div>
      <div className="shape circle circle-2"></div>
      
      {/* Ромбы - оранжевые */}
      <div className="shape diamond diamond-1"></div>
      <div className="shape diamond diamond-2"></div>
      
      {/* Пентагоны - фиолетовые */}
      <div className="shape pentagon pentagon-1"></div>
      <div className="shape pentagon pentagon-2"></div>
    </div>
  );
};

export default BackgroundShapes;