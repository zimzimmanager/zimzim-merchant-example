# Zim-Zim Merchant API — Interactive Demo & CRUD Example

Ushbu loyiha **Zim-Zim Merchant API** bilan integratsiya qilishni o'rganuvchi dasturchilar uchun tayyorlangan **jonli interaktiv veb-ilova (Playground)** hisoblanadi.

Foydalanuvchi interfeys orqali o'zining `X-Api-Key` tokenini kiritib, barcha amaliyotlarni (menyu boshqaruvi, yangi taom qo'shish, narx yangilash, buyurtma ochish va to'lov bilan yopish) real vaqtda sinab ko'rishi mumkin.

---

## 🚀 Imkoniyatlar

1. **🍽️ Menyu / Mahsulotlar (CRUD):**
   - `GET /products` — Menyu mahsulotlari ro'yxatini yuklash
   - `PUT /products` — Yangi taom kiritish (Upsert)
   - `PUT /products` — Mavjud taom narxini o'zgartirish
   - `DELETE /products/{id}` — Taomni menyudan o'chirish
2. **🧾 Kassa va Buyurtmalar (POS Flow):**
   - Stol raqami va mehmonlar sonini tanlash
   - Savatga taomlarni qo'shib `POST /orders` so'rovi bilan buyurtma ochish
   - Ochilgan buyurtmani `POST /orders/{id}/close` so'rovi orqali to'lov bilan yopish
3. **⚡️ Real-Time API Inspector (Jonli Konsol):**
   - Har bir harakatda yuborilgan **haqiqiy cURL so'rovi**, **Request Headers**, **JSON Body** va **Server Response** ko'rsatiladi.
   - Bitta bosish bilan cURL buyrug'ini nusxalash mumkin.
4. **🛡️ O'rnatilgan CORS Proxy:**
   - Brauzerda CORS xatolarisiz `https://api-kafe.zim-zim.uz` ga to'g'ridan-to'g'ri so'rovlar yuborish uchun local proxy bilan ta'minlangan.

---

## 📦 O'rnatish va Ishga Tushirish

Hech qanday og'ir kutubxona yoki murakkab sozlash talab qilinmaydi (Zero-dependency Node.js):

```bash
# 1. Loyihani klonlang
git clone https://github.com/zimzimmanager/zimzim-merchant-example.git
cd zimzim-merchant-example

# 2. Serverni ishga tushiring
npm start
# yoki: node server.js
```

So'ngra brauzeringizda quyidagi manzilni oching:
👉 **[http://localhost:3030](http://localhost:3030)**

---

## 🔑 API Kalitni Sinash

1. Ekranning yuqori o'ng burchagidagi qutiga tashkilotingizning **`X-Api-Key`** maxfiy tokenini kiriting.
2. **"Saqlash"** tugmasini bosing (kalit xavfsiz holda brauzeringizning `localStorage` xotirasida saqlanadi).
3. **"Yangilash"** tugmasini bosing — menyudagi taomlaringiz avtomatik yuklanadi va ekranda kartalar ko'rinishida paydo bo'ladi!
4. Yangi taom qo'shib, narxini o'zgartirib yoki buyurtma berib ko'ring — o'ng tomondagi konsolda barcha so'rovlar real vaqtda ko'rinadi.

---

## 📚 Rasmiy Hujjatlar

- **API Documentation:** [https://api-kafe.zim-zim.uz/uz/docs](https://api-kafe.zim-zim.uz/uz/docs)
- **Base URL:** `https://api-kafe.zim-zim.uz/api/v1/merchant`
- **Format:** `application/json`

---

## 📄 Litsenziya

MIT License © [Zim-Zim Foodtech](https://zim-zim.uz)
