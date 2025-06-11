const express = require('express');
const router = express.Router();

// Заглушка для Telegram webhook - будет реализовано позже
router.post('/', (req, res) => {
  res.json({
    message: 'Telegram webhook - coming soon',
    status: 'placeholder'
  });
});

module.exports = router;