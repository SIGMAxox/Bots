# Minecraft Bot - kevin911

Bot مخصص لسيرفر Ultimis.net

## المميزات ✨

- ✅ اتصال تلقائي بالسيرفر
- ✅ 10 محاولات للاتصال (10 ثواني بين كل محاولة)
- ✅ تسجيل/تسجيل دخول تلقائي
- ✅ الانضمام تلقائياً للعبة Lifesteal
- ✅ تنفيذ أمر `/afk`
- ✅ الاستجابة لرسالة trigger من اللاعب SIGMAxox
- ✅ إعادة الاتصال التلقائية عند الانقطاع

## التشغيل على GitHub Actions 🚀

### الخطوات:

1. **إنشاء Repository جديد على GitHub**
   - اذهب إلى GitHub.com
   - اضغط على "New Repository"
   - اسم الـ repo مثلاً: `minecraft-bot`

2. **رفع الملفات**
   - ارفع الملفات التالية:
     - `bot.js`
     - `package.json`
     - `.github/workflows/bot.yml`
     - `README.md`

3. **تشغيل البوت**
   - اذهب إلى تبويب "Actions" في الـ repo
   - اضغط على "Minecraft Bot - kevin911"
   - اضغط على "Run workflow"
   - اضغط "Run workflow" مرة أخرى

4. **مراقبة البوت**
   - راقب الـ logs من تبويب Actions
   - البوت سيعمل لمدة 6 ساعات كحد أقصى

## التشغيل المحلي (على جهازك) 💻

```bash
# تثبيت الـ dependencies
npm install

# تشغيل البوت
npm start
```

## البيانات 🔑

- **اسم البوت:** kevin911
- **كلمة السر:** asdfghjkl1
- **السيرفر:** Ultimis.net
- **الإصدار:** 1.12.2

## كيف يعمل؟ 🤖

1. الاتصال بالسيرفر
2. تسجيل دخول/تسجيل حساب جديد
3. التحرك قليلاً
4. فتح Games Selector (البوصلة)
5. اختيار لعبة Lifesteal
6. التحرك في اللعبة
7. إرسال أمر `/afk`
8. تحريك الرأس والجسم
9. الانتظار لرسالة trigger
10. عند استقبال "partycomehereplzman" من SIGMAxox → إرسال `/tpa SIGMAxox`

## ملاحظات ⚠️

- البوت يعيد المحاولة 10 مرات إذا فشل الاتصال
- بين كل محاولة 10 ثواني
- إذا تم طرد البوت، سيعيد الاتصال تلقائياً
- GitHub Actions لها حدود استخدام مجانية شهرية

## التعديل 🛠️

لتعديل إعدادات البوت، افتح ملف `bot.js` وعدّل:

```javascript
const BOT_CONFIG = {
    username: 'kevin911',      // اسم البوت
    password: 'asdfghjkl1',    // كلمة السر
    host: 'Ultimis.net',       // السيرفر
    // ...
};

const TRIGGER_PLAYER = 'SIGMAxox';        // اللاعب المحفز
const TRIGGER_MESSAGE = 'partycomehereplzman';  // الرسالة المحفزة
```

## الدعم 📞

إذا واجهت مشاكل، تحقق من:
- الـ logs في GitHub Actions
- اتصال السيرفر
- صحة البيانات

---

**تم الإنشاء بواسطة Claude** 🤖
