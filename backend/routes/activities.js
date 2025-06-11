const express = require('express');
const router = express.Router();

// Заглушка - будет реализовано позже
router.get('/', (req, res) => {
  res.json({
    message: 'Activities endpoint - coming soon',
    status: 'placeholder'
  });
});

module.exports = router;