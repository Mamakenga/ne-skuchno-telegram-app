const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Получение всех категорий
router.get('/', (req, res) => {
  try {
    const categoriesPath = path.join(__dirname, '../../content/categories/categories.json');
    
    if (!fs.existsSync(categoriesPath)) {
      return res.status(404).json({ 
        error: 'Categories file not found' 
      });
    }
    
    const categoriesData = fs.readFileSync(categoriesPath, 'utf8');
    const categories = JSON.parse(categoriesData);
    
    res.json({
      success: true,
      data: categories,
      count: categories.length
    });
  } catch (error) {
    console.error('Error loading categories:', error);
    res.status(500).json({ 
      error: 'Failed to load categories',
      message: error.message 
    });
  }
});

// ВАЖНО: Специфичные маршруты ДОЛЖНЫ быть ДО параметризованных!
// Получение возрастных групп (ПЕРЕМЕСТИЛИ ВВЕРХ)
router.get('/age-groups', (req, res) => {
  try {
    const ageGroupsPath = path.join(__dirname, '../../content/age-groups/age-groups.json');
    
    if (!fs.existsSync(ageGroupsPath)) {
      return res.status(404).json({ 
        error: 'Age groups file not found' 
      });
    }
    
    const ageGroupsData = fs.readFileSync(ageGroupsPath, 'utf8');
    const ageGroups = JSON.parse(ageGroupsData);
    
    res.json({
      success: true,
      data: ageGroups,
      count: ageGroups.length
    });
  } catch (error) {
    console.error('Error loading age groups:', error);
    res.status(500).json({ 
      error: 'Failed to load age groups',
      message: error.message 
    });
  }
});

// Получение конкретной категории (ПЕРЕМЕСТИЛИ ВНИЗ)
router.get('/:id', (req, res) => {
  try {
    const categoriesPath = path.join(__dirname, '../../content/categories/categories.json');
    const categoriesData = fs.readFileSync(categoriesPath, 'utf8');
    const categories = JSON.parse(categoriesData);
    
    const category = categories.find(cat => cat.id === req.params.id);
    
    if (!category) {
      return res.status(404).json({ 
        error: 'Category not found',
        id: req.params.id 
      });
    }
    
    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Error loading category:', error);
    res.status(500).json({ 
      error: 'Failed to load category',
      message: error.message 
    });
  }
});

module.exports = router;