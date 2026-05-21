# DialogSpyBot - Heroku Deploy Qo'llanma

Bu loyiha Heroku ga GitHub orqali deploy qilishga tayyor.

## Zarur Qo'shimcha O'zgarishlar

### 1. MongoDB Atlas Sozlash
Heroku lokal MongoDB dan foydalana olmaydi. MongoDB Atlas (cloud) ishlatish kerak:

1. https://www.mongodb.com/cloud/atlas ga o'ting
2. Yangi cluster yarating
3. Connection string oling (masalan: `mongodb+srv://username:password@cluster.mongodb.net/database_name`)

### 2. Heroku Config Variables O'rnatish
Heroku Dashboard-da quyidagi o'zgaruvchilarni o'rnating:

```
BOT_TOKEN = your_telegram_bot_token
MONGODB_URI = mongodb+srv://username:password@cluster.mongodb.net/database_name
```

### 3. GitHub Bilan Deploy Qilish

1. GitHub-da repository yarating va kodni push qiling:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/DialogSpyBot.git
git push -u origin main
```

2. Heroku-da yangi app yarating:
   - Heroku Dashboard → New → Create new app
   - App nomini bering
   - Deploy tab-ida GitHub-ni tanlang
   - Repository-ni tanlang va "Connect" qiling
   - "Enable Automatic Deploys" yoki "Deploy Branch" bosing

### 4. Deploy Status Tekshirish
- Heroku Dashboard → Activity tab
- Deploy log-ni ko'ring
- Issues bo'lsa error message ko'rsatiladi

## Fayl Strukturasi

- `bot.js` - Bot asosiy fayali
- `package.json` - Dependencies va scripts
- `Procfile` - Heroku uchun ishga tushirish buyrug'i
- `.gitignore` - Git-dan istisno qilish fayllar
- `.env.example` - Environment variables shablon

## Muhim Eslatmalar

⚠️ **Xavfsizlik**: 
- Bot token va MongoDB password-i hech qachon kodga yozmang
- Faqat environment variables orqali ishlatilsin
- `.env` fayli `.gitignore`-da ro'yxatga olindi

✅ **Tekshirish**:
- `package.json`-da barcha dependencies bor
- Procfile-da ishga tushirish buyrug'i to'g'ri
- Environment variables Heroku-da o'rnatilgan
- MongoDB Atlas connection string to'g'ri

## Masalalar Bo'lsa

1. Log-ni ko'ring: `heroku logs --tail`
2. Variables-ni tekshiring: `heroku config`
3. Database ulanishni tekshiring: MongoDB Atlas dashboard-da
