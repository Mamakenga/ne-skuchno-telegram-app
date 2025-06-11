const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Simple test works');
});

app.listen(3000, () => {
  console.log('Simple server works on 3000');
});