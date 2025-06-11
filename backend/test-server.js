const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ 
    message: 'Test server works!', 
    timestamp: new Date().toISOString() 
  }));
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`✅ Test server running on http://localhost:${PORT}`);
});