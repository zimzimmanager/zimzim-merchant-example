# 🍕 Zim-Zim Merchant API — Pure HTML & CSS Interactive Web App

Ushbu repozitoriy **Zim-Zim Merchant API** bilan integratsiya qiluvchi dasturchilar uchun tayyorlangan **toza frontend (Pure HTML5 + CSS + JavaScript)** loyihasidir.

Hech qanday backend, Node.js yoki og'ir server aralashmagan. Siz shunchaki `index.html` faylini brauzeringizda ochib, o'z `X-Api-Key` tokeningizni kiritgan holda barcha CRUD va kassa amallarini jonli sinab ko'rishingiz mumkin!

---

## ⚡️ Asosiy Imkoniyatlar

1. **🍽️ Menyu va Mahsulotlar (Full CRUD):**
   - `GET /products` — Menyu taomlari ro'yxatini yuklash va ko'rish
   - `PUT /products` — Yangi taom yaratish (Upsert)
   - `PUT /products` — Taom narxini o'zgartirish (inline prompt/modal)
   - `DELETE /products/{id}` — Taomni menyudan xavfsiz (soft-delete) o'chirish
2. **🧾 Kassa va Buyurtmalar Oqimi (POS Checkout Flow):**
   - Restoran zali (`place_id`) va stoli (`table_id`)ni tanlash
   - Mehmonlar sonini ko'rsatish
   - Taomlarni savatga to'plab, `POST /orders` so'rovi bilan buyurtma ochish
   - Ochilgan buyurtmani to'lov turi (Naqd, Karta, Click/Payme) bilan `POST /orders/{id}/close` orqali yopish
3. **📋 Tizim Ma'lumotnomalari (Dictionaries):**
   - `GET /payment-types` — Qabul qilinadigan to'lov turlari
   - `GET /places` — Restoran zallari va zonalari
   - `GET /tables` — Stollar ro'yxati
   - `GET /units` — O'lchov birliklari (dona, kg, litr)
4. **🔍 Real-Time API Inspector (Jonli Konsol):**
   - Har bir harakatda real vaqtda **Request URL**, **Headers (X-Api-Key)**, **Request Payload**, **Response Status** va **Formatlangan JSON** ko'rsatiladi.
   - Bitta bosish bilan **cURL** yoki **JavaScript Fetch** kodini nusxalash mumkin!

---

## 🚀 Ishga Tushirish (Juda Oson!)

Hech qanday `npm install` yoki server kerak emas:

1. Repozitoriyni yuklab oling:
   ```bash
   git clone https://github.com/zimzimmanager/zimzim-merchant-example.git
   cd zimzim-merchant-example
   ```
2. **`index.html` faylini brauzeringizda oching:**
   - MacOS: `open index.html`
   - Windows: Faylni sichqoncha bilan ikki marta bosing (yoki VS Code Live Server bilan oching)
   - Linux: `xdg-open index.html`

---

## 🔑 API Tokenni Qo'yish va Ishlatish

1. Sayt ochilgach, yuqori o'ng burchakdagi qutiga tashkilotingizning **`X-Api-Key`** maxfiy tokenini kiriting.
2. **"Saqlash"** tugmasini bosing — token xavfsiz tarzda brauzeringizning `localStorage` xotirasiga saqlanadi.
3. Holat paneli yashil bo'ladi: `🟢 API Token ulangan`.
4. **"GET /products"** tugmasini bosing — menyudagi barcha taomlar bir zumda ekranda kartalar ko'rinishida paydo bo'ladi!
5. O'ng tarafdagi konsolda har bir yuborilgan so'rovning to'liq JSON javobi va cURL kodi ko'rinadi.

---

## 📁 Loyiha Tuzilishi (Pure Static Frontend)

```
zimzim-merchant-example/
├── index.html        # Asosiy interaktiv POS & CRUD Dashboard (HTML5)
├── style.css         # Zamonaviy qorong'i dizayn va uslublar (CSS)
├── app.js            # API so'rovlar, savat, konsol va CRUD logikasi (Vanilla JS)
├── logo.png          # Zim-Zim brend logotipi
├── favicon.png       # Ilova belgisi
└── README.md         # To'liq hujjatlar
```

---

## 🛠️ To'g'ridan-to'g'ri Terminal orqali Sinash (cURL)

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
