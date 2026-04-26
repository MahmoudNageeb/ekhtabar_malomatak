# 🚀 دليل النشر على Vercel - اختبر معلوماتك

## 📋 المتطلبات قبل النشر

1. **حساب على [Vercel](https://vercel.com)** (مجاني)
2. **حساب على [MongoDB Atlas](https://cloud.mongodb.com)** (مجاني - خطة M0)
3. **حساب على [GitHub](https://github.com)** (لرفع الكود)

---

## الخطوة 1️⃣: إعداد قاعدة البيانات (MongoDB Atlas)

### إنشاء Cluster مجاني:
1. ادخل على [cloud.mongodb.com](https://cloud.mongodb.com) وسجّل دخول
2. اضغط **"Build a Database"** → اختر **M0 Free**
3. اختر منطقة قريبة (مثلاً `Frankfurt` أو `Ireland`)
4. اضغط **Create**

### إنشاء مستخدم قاعدة البيانات:
1. **Database Access** → **Add New Database User**
2. اختر **Password** authentication
3. اكتب اسم مستخدم وكلمة سر قوية (احفظهم!)
4. **Built-in Role**: `Atlas Admin`
5. اضغط **Add User**

### السماح للاتصال من Vercel:
1. **Network Access** → **Add IP Address**
2. اضغط **"Allow Access from Anywhere"** → `0.0.0.0/0`
3. اضغط **Confirm**

### نسخ Connection String:
1. ارجع لـ **Database** → اضغط **Connect** على الـ Cluster
2. اختر **"Drivers"** → Node.js
3. انسخ الـ Connection String (هيكون شكله كده):
   ```
   mongodb+srv://username:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
4. **استبدل `<password>` بكلمة السر الفعلية**

---

## الخطوة 2️⃣: رفع الكود على GitHub

```bash
# في مجلد المشروع
git init
git add .
git commit -m "Initial deploy"

# أنشئ Repo جديد على GitHub ثم:
git remote add origin https://github.com/YOUR_USERNAME/ekhtabar-malomatak.git
git branch -M main
git push -u origin main
```

---

## الخطوة 3️⃣: النشر على Vercel

### استيراد المشروع:
1. ادخل [vercel.com/new](https://vercel.com/new)
2. اختر **Import Git Repository**
3. اختر الـ Repo بتاع المشروع
4. **Framework Preset**: سيكتشف Next.js تلقائياً ✅
5. **لا تضغط Deploy لسه!** أضف Environment Variables أولاً ⬇️

### إضافة Environment Variables (مهم جداً):
في صفحة **Configure Project**، افتح قسم **Environment Variables** وأضف:

| Name | Value | مطلوب؟ |
|------|-------|--------|
| `MONGODB_URI` | الـ Connection String من Atlas | ✅ إجباري |
| `MONGODB_DB_NAME` | `ekhtabar_malomatak` | ✅ إجباري |
| `JWT_SECRET` | مفتاح سري قوي (مثلاً: `my-super-secret-key-2026`) | ✅ إجباري |
| `ADMIN_NAME` | `أسماء نجيب` | ✅ إجباري |
| `ADMIN_PASSWORD` | `Asoowr4477` | ✅ إجباري |
| `CLOUDINARY_CLOUD_NAME` | `drqoyjclh` | اختياري |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | `drqoyjclh` | اختياري |
| `CLOUDINARY_API_KEY` | (من Cloudinary) | اختياري |
| `CLOUDINARY_API_SECRET` | (من Cloudinary) | اختياري |

### النشر:
6. اضغط **Deploy**
7. انتظر 2-3 دقايق ⏳
8. مبروك! المشروع شغال على رابط زي: `https://your-project.vercel.app` 🎉

---

## الخطوة 4️⃣: التحقق من النشر

افتح الموقع وجرّب:
- ✅ صفحة الرئيسية تفتح
- ✅ سجّل دخول كأدمن: `أسماء نجيب` / `Asoowr4477`
- ✅ جرّب إضافة اختبار جديد
- ✅ سجّل حساب طالب جديد وجرّب اختبار

---

## 🔧 حل المشاكل الشائعة

### ❌ "MONGODB_URI غير موجود"
- روح Vercel Dashboard → Settings → Environment Variables
- تأكد إن `MONGODB_URI` متضاف في **Production** و **Preview**
- أعد النشر: Deployments → ⋯ → Redeploy

### ❌ "Authentication failed" من MongoDB
- تأكد إنك حطيت كلمة السر الصحيحة في الـ Connection String
- لو فيها رموز خاصة (`@`, `#`, `$`) لازم تتعمل URL-encode

### ❌ "MongoServerSelectionError" / Timeout
- في MongoDB Atlas → Network Access → تأكد إن `0.0.0.0/0` مضاف

### ❌ صفحة 404 على API
- تأكد من رفع كل ملفات `src/app/api/` بشكل صحيح
- شوف Logs في Vercel Dashboard → Deployments → View Function Logs

---

## 🔄 تحديث المشروع بعد النشر

```bash
# عدّل اللي محتاجه ثم:
git add .
git commit -m "Update"
git push

# Vercel هيعمل deploy تلقائياً 🚀
```

---

## 📝 ملاحظات مهمة

- **لا ترفع `.env`** على GitHub (موجود في `.gitignore` بالفعل) ✅
- **خزّن كلمات السر** بشكل آمن
- **MongoDB Atlas Free Tier**: 512 MB مجاناً (كافي لآلاف الاختبارات)
- **Vercel Free Tier**: 100 GB Bandwidth/شهر
- التطوير المحلي يستخدم `mongodb-memory-server` تلقائياً لو `MONGODB_URI` فاضي

---

**بالتوفيق! 🌟**
