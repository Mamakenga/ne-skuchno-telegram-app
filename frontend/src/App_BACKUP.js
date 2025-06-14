import React, { useState } from 'react';
import { STEPS } from './types';
import { apiService } from './services/api';
import AgeSelector from './components/AgeSelector/AgeSelector';
import CategorySelector from './components/CategorySelector/CategorySelector';
import ActivityList from './components/ActivityList/ActivityList';
import ActivityDetails from './components/ActivityDetails/ActivityDetails';

function App() {
  const [step, setStep] = useState(STEPS.AGE);
  const [selectedAge, setSelectedAge] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [activities, setActivities] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAgeSelect = (age) => {
    setSelectedAge(age);
    setStep(STEPS.CATEGORY);
  };

  const handleCategorySelect = async (category) => {
    setSelectedCategory(category);
    setLoading(true);
    setStep(STEPS.RESULTS);
    
    try {
      const fetchedActivities = await apiService.getActivities({
        age: selectedAge,
        category: category === 'surprise_me' ? undefined : category,
        random: category === 'surprise_me' ? 'true' : undefined,
        limit: 3
      });
      
      setActivities(fetchedActivities);
    } catch (error) {
      console.error('Error fetching activities:', error);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const handleActivitySelect = (activity) => {
    setSelectedActivity(activity);
    setStep(STEPS.DETAILS);
  };

  const handleBack = () => {
    if (step === STEPS.CATEGORY) {
      setStep(STEPS.AGE);
    } else if (step === STEPS.RESULTS) {
      setStep(STEPS.CATEGORY);
    } else if (step === STEPS.DETAILS) {
      setStep(STEPS.RESULTS);
    }
  };

  const handleStartOver = () => {
    setSelectedAge('');
    setSelectedCategory('');
    setActivities([]);
    setSelectedActivity(null);
    setStep(STEPS.AGE);
  };

  return (
    <>
      {/* Добавляем фоновые геометрические фигуры */}
      <div className="background-shapes">
        <div className="shape triangle triangle-1"></div>
        <div className="shape triangle triangle-2"></div>
        <div className="shape square square-1"></div>
        <div className="shape square square-2"></div>
        <div className="shape circle circle-1"></div>
        <div className="shape circle circle-2"></div>
        <div className="shape diamond diamond-1"></div>
        <div className="shape diamond diamond-2"></div>
        <div className="shape pentagon pentagon-1"></div>
        <div className="shape pentagon pentagon-2"></div>
      </div>

      {/* Ваш существующий контейнер с небольшими изменениями */}
      <div className="app-container" style={{ 
        minHeight: '100vh', 
        maxWidth: '400px', 
        margin: '0 auto',
        background: 'linear-gradient(135deg, #081a26 0%, #0a1d2e 25%, #0f2235 50%, #162a3c 75%, #1a2f42 100%)',
        color: '#ffffff',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        padding: '20px',
        position: 'relative',
        zIndex: 10
      }}>
        {step === STEPS.AGE && (
          <AgeSelector 
            onSelect={handleAgeSelect}
          />
        )}
        
        {step === STEPS.CATEGORY && (
          <CategorySelector 
            selectedAge={selectedAge}
            onSelect={handleCategorySelect}
            onBack={handleBack}
          />
        )}
        
        {step === STEPS.RESULTS && (
          <ActivityList 
            activities={activities}
            selectedAge={selectedAge}
            selectedCategory={selectedCategory}
            onActivitySelect={handleActivitySelect}
            onBack={handleBack}
            onStartOver={handleStartOver}
            loading={loading}
          />
        )}
        
        {step === STEPS.DETAILS && selectedActivity && (
          <ActivityDetails 
            activity={selectedActivity}
            onBack={handleBack}
            onStartOver={handleStartOver}
          />
        )}
        
        {/* Debug info */}
        <div style={{ 
          position: 'fixed',
          bottom: '10px',
          left: '10px',
          fontSize: '10px',
          color: '#888',
          background: 'rgba(0,0,0,0.7)',
          padding: '4px 8px',
          borderRadius: '4px',
          border: '1px solid #333'
        }}>
          {step} | {selectedAge} | {selectedCategory} | {activities.length} активностей
        </div>
      </div>
    </>
  );
}

export default App;