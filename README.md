# Rohat Tech

Rohat Tech - maishiy texnika magazini uchun Next.js + NestJS + PostgreSQL + Prisma asosidagi MVP.

## MVP oqimi

- JWT autentifikatsiya: admin panel uchun
- Katalog: kategoriya, brend, qidiruv va mahsulot detallari
- Sevimlilar va savat
- Login talab qilmaydigan tez buyurtma
- Buyurtmalarni Netlify Function orqali Telegram botga yuborish
- Admin panel: dashboard, mahsulotlar, kategoriyalar, brendlar, buyurtmalar, mijozlar, aksiyalar, hisobotlar, sozlamalar
- Admin buyurtma statusini o'zgartiradi

## Tuzilma

```text
apps/api   NestJS backend
apps/web   Next.js frontend
netlify    Telegram buyurtma serverless funksiyasi
prisma     PostgreSQL schema va seed
```

## Ishga tushirish

1. Paketlarni o'rnating:

```bash
npm install
```

2. `.env.example` faylidan `.env` yarating va `DATABASE_URL`, `JWT_SECRET` qiymatlarini kiriting.

3. Prisma client va database:

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

4. API va web ilovani parallel ishga tushiring:

```bash
npm run dev
```

Frontend: `http://localhost:3000`

Backend: `http://localhost:4000/api`

## Telegram buyurtmalari

Telegram tokeni frontendga yoki GitHub'ga yozilmaydi. Netlify sayti uchun quyidagi maxfiy environment variable'larni kiriting:

```text
TELEGRAM_BOT_TOKEN
TELEGRAM_CHAT_ID
```

Bot foydalanuvchiga xabar yuborishidan oldin foydalanuvchi botga `/start` yuborishi kerak. Environment variable'lar saqlangach Netlify'da yangi deploy ishga tushiring.

## Admin login

- Admin: `admin@rohat.tech` / `Admin12345`
