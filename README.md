# 🍕 Zim-Zim Merchant API — Interactive Web App & CRUD Playground

Ushbu repozitoriy **Zim-Zim Merchant API** bilan integratsiya qiluvchi dasturchilar uchun tayyorlangan **to'liq ishchi interaktiv veb-ilova (Live Playground)** hisoblanadi.

Siz ushbu ilovaga o'z tashkilotingizning `X-Api-Key` maxfiy tokenini kiritib, to'g'ridan-to'g'ri brauzer orqali menyuni ko'rishingiz, yangi taomlar qo'shishingiz, narxlarni o'zgartirishingiz, kassa buyurtmalarini ochishingiz va to'lov bilan yopishingiz mumkin.

---

## ⚡️ Asosiy Imkoniyatlar

1. **🍽️ Menyu va Taomlar Boshqaruvi (Full CRUD):**
   - `GET /products` — Menyu taomlari ro'yxatini yuklash va ko'rish
   - `PUT /products` — Yangi taom yaratish (Upsert)
   - `PUT /products` — Mavjud taom narxi va mavjudligini bir zumda yangilash
   - `DELETE /products/{id}` — Taomni menyudan xavfsiz (soft-delete) o'chirish
2. **🧾 Kassa va Buyurtmalar Oqimi (POS Checkout Flow):**
   - Restoran zali (`place_id`) va stoli (`table_id`)ni tanlash
   - Mehmonlar sonini ko'rsatish
   - Taomlarni interaktiv savatga yig'ib, `POST /orders` so'rovi bilan yangi buyurtma ochish
   - Ochilgan buyurtmani to'lov turi (Naqd, Karta, Click/Payme) bilan `POST /orders/{id}/close` orqali yopish
3. **📋 Tizim Ma'lumotnomalari (Dictionaries):**
   - `GET /payment-types` — Qabul qilinadigan to'lov turlari
   - `GET /places` — Restoran zallari va zonalari
   - `GET /tables` — Stollar ro'yxati
   - `GET /units` — O'lchov birliklari (dona, kg, litr)
4. **🔍 Real-Time API Inspector (Jonli Konsol):**
   - Har bir harakatda real vaqtda **Request URL**, **Headers (X-Api-Key)**, **Request Payload**, **Response Status** va **Formatlangan JSON** ko'rsatiladi.
   - Bitta bosish bilan **cURL** yoki **JavaScript Fetch** kodini nusxalash mumkin!
5. **🛡️ O'rnatilgan CORS Proxy (Zero-dependency):**
   - Brauzerda xavfsizlik cheklovlari (CORS) sababli so'rovlar to'xtab qolmasligi uchun `server.js` orqali shaffof proxy ta'minlangan.

---

## 🚀 O'rnatish va Ishga Tushirish

Loyihada hech qanday og'ir paketlar yoki murakkab sozlashlar yo'q (Faqat Node.js o'zining built-in `http` va `https` modullari ishlatilgan):

```bash
# 1. Reponi yuklab oling:
git clone https://github.com/zimzimmanager/zimzim-merchant-example.git
cd zimzim-merchant-example

# 2. Serverni ishga tushiring:
npm start
# yoki:
node server.js
```

So'ngra brauzeringizda quyidagi manzilni oching:
👉 **[http://localhost:3030](http://localhost:3030)**

---

## 🔑 API Tokenni Qo'yish va Ishlatish

1. Ekranning yuqori o'ng burchagidagi qutiga **`X-Api-Key`** maxfiy tokeningizni kiriting.
2. **"Saqlash"** tugmasini bosing — token xavfsiz tarzda brauzeringizning `localStorage` xotirasida saqlanadi.
3. Yuqoridagi holat paneli yashil rangga kiradi: `🟢 API Token ulangan`.
4. **"GET /products"** tugmasini bosing — o'z tashkilotingiz menyusidagi barcha taomlar bir zumda ekranda kartalar ko'rinishida paydo bo'ladi!
5. O'ng tarafdagi konsolda har bir yuborilgan so'rovning to'liq JSON javobi va cURL kodi ko'rinib turadi.

---

## 📁 Loyiha Tuzilishi

```
zimzim-merchant-example/
├── package.json          # Loyiha ma'lumotlari va start skripti
├── server.js             # Built-in HTTP server va CORS Proxy
├── public/
│   ├── index.html        # Asosiy interaktiv POS & CRUD Dashboard
│   ├── app.js            # API so'rovlar, savat, konsol va CRUD logikasi
│   ├── logo.png          # Zim-Zim brend logotipi
│   └── favicon.png       # Ilova belgisi
└── README.md             # To'liq hujjatlar
```

---

## 🛠️ To'g'ridan-to'g'ri Terminal orqali Sinash (cURL)

Agar terminal orqali sinab ko'rmoqchi bo'lsangiz:

```bash
# 1. Menyu taomlarini olish (GET)
curl -X GET "https://api-kafe.zim-zim.uz/api/v1/merchant/products?limit=5" \
  -H "Accept: application/json" \
  -H "X-Api-Key: SIZNING_TOKENINGIZ"

# 2. Yangi taom kiritish (PUT)
curl -X PUT "https://api-kafe.zim-zim.uz/api/v1/merchant/products" \
  -H "Content-Type: application/json" \
  -H "X-Api-Key: SIZNING_TOKENINGIZ" \
  -d '{
    "payload": [
      {
        "name": "Zim-Zim Qozon Kabob",
        "price": 54000,
        "enable": true
      }
    ]
  }'

# 3. Buyurtma ochish (POST)
curl -X POST "https://api-kafe.zim-zim.uz/api/v1/merchant/orders" \
  -H "Content-Type: application/json" \
  -H "X-Api-Key: SIZNING_TOKENINGIZ" \
  -d '{
    "place_id": 1,
    "table_id": 5,
    "guests": 2,
    "items": [
      { "product_id": 136004, "quantity": 2, "price": 54000 }
    ]
  }'

# 4. Buyurtmani yopish (POST)
curl -X POST "https://api-kafe.zim-zim.uz/api/v1/merchant/orders/1024/close" \
  -H "Content-Type: application/json" \
  -H "X-Api-Key: SIZNING_TOKENINGIZ" \
  -d '{
    "payment_type_id": 1,
    "amount": 108000
  }'
```

---

## 📚 Rasmiy API Hujjatlari

- **To'liq API Portal:** [https://api-kafe.zim-zim.uz/uz/docs](https://api-kafe.zim-zim.uz/uz/docs)
- **Base URL:** `https://api-kafe.zim-zim.uz/api/v1/merchant`
- **Autentifikatsiya:** `X-Api-Key: <token>`
- **Javob formati:** `application/json`

---

## 📄 Litsenziya

MIT License © [Zim-Zim Foodtech](https://zim-zim.uz)
