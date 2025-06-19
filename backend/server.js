const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.json({ app_name: "Мама, мне скучно!", status: 'running' });
});

app.get('/api/activities', (req, res) => {
  res.json({ success: true, data: [], message: 'Static endpoint working' });
});

app.get('/api/categories', (req, res) => {
  res.json({ success: true, data: [], message: 'Static endpoint working' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});