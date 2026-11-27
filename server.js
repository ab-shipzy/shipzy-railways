const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const port = parseInt(process.env.PORT || '3000', 10);
const dev = false;
const app = next({ dev });
const handle = app.getRequestHandler();

console.log('Starting server on port', port);
console.log('DATABASE_URL set:', !!process.env.DATABASE_URL);
console.log('RAIL_API_KEY set:', !!process.env.RAIL_API_KEY);

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
}).catch((err) => {
  console.error('Failed to start:', err);
  process.exit(1);
});
