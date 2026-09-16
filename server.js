/**
 * ============================================================================
 * Zim-Zim Merchant API — Example Web App Server
 * ============================================================================
 * Built-in Node.js HTTP Server & Proxy (Zero Dependencies).
 * 
 * Features:
 *   1. Serves the interactive Web App (HTML, CSS, JS, Assets)
 *   2. Transparent API Proxy (/api/proxy -> https://api-kafe.zim-zim.uz) to bypass browser CORS
 *   3. Colorized request logging in console
 * 
 * Run:
 *   npm start (or node server.js)
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const https = require('https');

const PORT = process.env.PORT || 3030;
const PUBLIC_DIR = path.join(__dirname, 'public');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

const server = http.createServer((req, res) => {
  // CORS Headers for browser requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Api-Key, Authorization, Accept');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const startTime = Date.now();

  // ── Proxy endpoint to Zim-Zim Merchant API ──
  if (parsedUrl.pathname.startsWith('/api/proxy')) {
    const targetPath = parsedUrl.pathname.replace('/api/proxy', '') + parsedUrl.search;
    const targetUrl = new URL(`https://api-kafe.zim-zim.uz/api/v1/merchant${targetPath}`);

    const clientHeaders = {
      'Content-Type': req.headers['content-type'] || 'application/json',
      'Accept': 'application/json',
      'User-Agent': 'ZimZim-Example-App/1.0',
    };

    if (req.headers['x-api-key']) {
      clientHeaders['X-Api-Key'] = req.headers['x-api-key'];
    }

    let bodyChunks = [];
    req.on('data', (chunk) => bodyChunks.push(chunk));
    req.on('end', () => {
      const bodyBuffer = Buffer.concat(bodyChunks);

      const proxyReq = https.request(
        targetUrl,
        {
          method: req.method,
          headers: {
            ...clientHeaders,
            ...(bodyBuffer.length > 0 ? { 'Content-Length': bodyBuffer.length } : {}),
          },
        },
        (proxyRes) => {
          res.writeHead(proxyRes.statusCode, proxyRes.headers);
          proxyRes.pipe(res);

          const elapsed = Date.now() - startTime;
          const statusColor = proxyRes.statusCode < 400 ? '\x1b[32m' : '\x1b[31m';
          console.log(`[PROXY] ${req.method} ${targetPath} -> ${statusColor}${proxyRes.statusCode}\x1b[0m (${elapsed}ms)`);
        }
      );

      proxyReq.on('error', (err) => {
        console.error(`[PROXY ERROR] ${err.message}`);
        res.writeHead(502, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Proxy Connection Failed', details: err.message }));
      });

      if (bodyBuffer.length > 0) {
        proxyReq.write(bodyBuffer);
      }
      proxyReq.end();
    });
    return;
  }

  // ── Static Files Serving ──
  let filePath = path.join(PUBLIC_DIR, parsedUrl.pathname === '/' ? 'index.html' : parsedUrl.pathname);
  const ext = path.extname(filePath);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('404 Not Found');
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('500 Server Error');
      }
      return;
    }

    res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`\n\x1b[31m╔════════════════════════════════════════════════════════════════╗\x1b[0m`);
  console.log(`\x1b[31m║\x1b[0m  🍕 \x1b[1mZim-Zim Merchant API — Interactive Web App is Running!\x1b[0m     \x1b[31m║\x1b[0m`);
  console.log(`\x1b[31m║\x1b[0m  👉 Open in your browser: \x1b[36mhttp://localhost:${PORT}\x1b[0m              \x1b[31m║\x1b[0m`);
  console.log(`\x1b[31m║\x1b[0m  📡 Proxy Endpoint: \x1b[33mhttp://localhost:${PORT}/api/proxy\x1b[0m            \x1b[31m║\x1b[0m`);
  console.log(`\x1b[31m╚════════════════════════════════════════════════════════════════╝\x1b[0m\n`);
});
