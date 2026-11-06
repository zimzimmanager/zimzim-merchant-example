#!/usr/bin/env node
/**
 * Zim-Zim HR & Merchant Webhook Receiver Demo
 * 
 * Ushbu skript Zim-Zim tizimidan yuborilgan HR (xodimlar oylik, avans, jarima, bonus)
 * hamda Buyurtma webhooklarini qabul qilish va HMAC SHA256 imzosini tekshirishni ko'rsatadi.
 * 
 * Hech qanday tashqi npm paket (dependencies) talab qilinmaydi! Sof Node.js da ishlaydi.
 * 
 * Ishga tushirish:
 *   node hr-webhook-server.js
 * 
 * Port: 4000 (yoki PORT env o'zgaruvchisi orqali)
 */

const http = require('http');
const crypto = require('crypto');

const PORT = process.env.PORT || 4000;
const WEBHOOK_SECRET = process.env.ZIMZIM_WEBHOOK_SECRET || 'zimzim_webhook_secret_key_demo_2026';

function verifySignature(payload, signature, secret) {
  if (!signature) return false;
  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(payload).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}

const server = http.createServer((req, res) => {
  // CORS sarlavhalari
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-ZimZim-Signature');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Healthcheck endpoint
  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'active',
      service: 'Zim-Zim Webhook Receiver Demo',
      endpoints: {
        hr_webhook: 'POST /webhooks/hr',
        orders_webhook: 'POST /webhooks/orders',
      },
      secret_configured: !!WEBHOOK_SECRET,
    }));
    return;
  }

  // Webhook handler
  if (req.method === 'POST' && (req.url === '/webhooks/hr' || req.url === '/webhooks/zimzim' || req.url === '/webhook')) {
    let rawBody = '';

    req.on('data', (chunk) => {
      rawBody += chunk;
    });

    req.on('end', () => {
      const signature = req.headers['x-zimzim-signature'];

      console.log('\n========================================');
      console.log(`📥 [${new Date().toISOString()}] Yangi Webhook qabul qilindi`);
      console.log(`URL: ${req.url}`);
      console.log(`X-ZimZim-Signature: ${signature || '(yo\'q)'}`);

      // Imzoni tekshirish
      const isValid = signature ? verifySignature(rawBody, signature, WEBHOOK_SECRET) : false;

      if (!isValid && process.env.STRICT_SIGNATURE === 'true') {
        console.error('❌ Xato: Webhook imzosi noto\'g\'ri!');
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Invalid HMAC signature' }));
        return;
      }

      try {
        const payload = JSON.parse(rawBody);
        const { event, scope, timestamp, data } = payload;

        console.log(`Hodisa (Event): \x1b[36m${event}\x1b[0m | Doira (Scope): \x1b[33m${scope || 'merchant'}\x1b[0m`);
        console.log(`Vaqt: ${timestamp}`);

        if (scope === 'hr' || event.startsWith('transaction.')) {
          console.log('\n👥 --- [HR Xodim Tranzaksiyasi] ---');
          console.log(`   Xodim: \x1b[32m${data.employee_name || 'Noma\'lum'}\x1b[0m (ID: ${data.employee_id}, Lavozim: ${data.role || '-'})`);
          console.log(`   Tranzaksiya turi: \x1b[35m${data.type}\x1b[0m (ID: ${data.transaction_id})`);
          console.log(`   Miqdor: \x1b[1m${Number(data.amount).toLocaleString('uz-UZ')} ${data.currency || 'UZS'}\x1b[0m`);
          console.log(`   Izoh: "${data.note || 'izohsiz'}"`);
          console.log('-----------------------------------');
        } else {
          console.log('\n🍽️ --- [Buyurtma Hodisasi] ---');
          console.log(JSON.stringify(data, null, 2));
          console.log('------------------------------');
        }

        // 200 OK qaytarish shart, aks holda Zim-Zim serveri so'rovni qayta yuboradi (retry)
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, received: true, event }));
      } catch (err) {
        console.error('JSON parsing xatosi:', err.message);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Malformed JSON payload' }));
      }
    });
    return;
  }

  // 404 for other endpoints
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Endpoint not found' }));
});

server.listen(PORT, () => {
  console.log(`\n🚀 Zim-Zim HR & Merchant Webhook Server ishga tushdi!`);
  console.log(`📡 Manzil: http://localhost:${PORT}/webhooks/hr`);
  console.log(`🔑 Webhook Secret: "${WEBHOOK_SECRET}"`);
  console.log(`\n💡 Test so'rov yuborish uchun terminalda ushbu cURL ni ishga tushiring:`);

  const sampleBody = JSON.stringify({
    event: 'transaction.created',
    scope: 'hr',
    timestamp: new Date().toISOString(),
    data: {
      transaction_id: 'tx_demo_101',
      employee_id: 'emp_77',
      employee_name: 'Bobur Mirzayev',
      role: 'Bosh Oshpaz',
      type: 'advance',
      amount: 300000,
      currency: 'UZS',
      note: 'Haftalik avans to\'lovi',
      created_at: new Date().toISOString()
    }
  });

  const sampleSig = crypto.createHmac('sha256', WEBHOOK_SECRET).update(sampleBody).digest('hex');

  console.log(`
curl -X POST http://localhost:${PORT}/webhooks/hr \\
  -H "Content-Type: application/json" \\
  -H "X-ZimZim-Signature: ${sampleSig}" \\
  -d '${sampleBody}'
  `);
});

