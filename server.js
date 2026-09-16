/**
 * ============================================================================
 * Zim-Zim Merchant API — Example Web App Server (Node.js built-in HTTP)
 * ============================================================================
 * Ushbu server:
 *   1. Interaktiv veb-sayt interfeysini brauzerga uzatadi (port 3030)
 *   2. Brauzerdan to'g'ridan-to'g'ri Zim-Zim API ga so'rov yuborishda
 *      CORS cheklovlarini aylanib o'tish uchun qulay Proxy vazifasini bajaradi.
 * 
 * Ishga tushirish:
 *   node server.js
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
};

const server = http.createServer((req, res) => {
  // CORS Headers for local development
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Api-Key, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);

  // ── Proxy endpoint to forward requests to Zim-Zim Merchant API ──
  if (parsedUrl.pathname.startsWith('/api/proxy')) {
    const targetPath = parsedUrl.pathname.replace('/api/proxy', '') + parsedUrl.search;
    const targetUrl = new URL(`https://api-kafe.zim-zim.uz/api/v1/merchant${targetPath}`);

    const clientHeaders = {
      'Content-Type': req.headers['content-type'] || 'application/json',
      'Accept': 'application/json',
    };

    if (req.headers['x-api-key']) {
      clientHeaders['X-Api-Key'] = req.headers['x-api-key'];
    }

    let bodyData = [];
    req.on('data', (chunk) => bodyData.push(chunk));
    req.on('end', () => {
      const bodyBuffer = Buffer.concat(bodyData);

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
        }
      );

      proxyReq.on('error', (err) => {
        res.writeHead(502, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
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
  console.log(`\n======================================================`);
  console.log(`🚀 Zim-Zim Merchant API Example Web App ishga tushdi!`);
  console.log(`👉 Brauzerda oching: http://localhost:${PORT}`);
  console.log(`======================================================\n`);
});
