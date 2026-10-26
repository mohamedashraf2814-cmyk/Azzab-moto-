# AZZAB MOTO | عزاب موتو — TVS Authorized Dealer Store (Frontend)

متجر إلكتروني عربي (RTL) لقطع غيار TVS — HTML + CSS + JavaScript فقط.
**بدون Next.js، بدون npm، بدون Build.** افتح الموقع على أي استضافة ملفات ثابتة.

## التشغيل والنشر

- **النشر (مُوصى به):** ارفع المجلد على **Vercel** أو **Netlify** كما هو. الإعدادات جاهزة (`vercel.json` و `_redirects`) عشان الروابط النظيفة تشتغل (`/products/...`, `/motorcycles/...`).
- **GitHub Pages:** يشتغل برضه (ملف `404.html` بيحوّل الروابط).
- **محليًا:** `npx serve -s .` أو افتح `index.html` مباشرة (هيشتغل بروابط `#/`).
- **بعد أي تعديل في الكود:** شغّل البناء عشان يتحدث الملف المضغوط وخريطة الموقع:
  ```bash
  npm i -g esbuild      # مرة واحدة
  node scripts/build.js https://your-domain.com
  ```
  البناء بيعمل: دمج وضغط JS/CSS في `assets/dist/`، `sitemap.xml` (575 رابط)، `robots.txt`، محتوى HTML جاهز للـ Google داخل `index.html`، وتحديث نسخة الـ Service Worker.

## SEO

- روابط نظيفة قابلة للأرشفة: `/products/<slug>`، `/motorcycles/<slug>`، `/shop?cat=brakes`.
- لكل صفحة: عنوان ووصف خاص، canonical، Open Graph وTwitter Card بصورة مشاركة، وnoindex للصفحات الخاصة (السلة، الحساب، الأدمن…).
- بيانات منظمة (JSON-LD): AutoPartsStore، WebSite مع البحث، Product بالسعر والتوفر والتوافق، BreadcrumbList، FAQPage.
- **مهم:** غيّر الدومين بتشغيل `node scripts/build.js https://your-domain.com` (بيبدّل كل الروابط المطلقة)، وبعد النشر ارفع `sitemap.xml` في Google Search Console.

## تطبيق الموبايل (PWA)

- `manifest.webmanifest` + أيقونات + `sw.js` (يشتغل أوفلاين ويفتح أسرع في الزيارات التالية).
- زرار "ثبّت التطبيق" في الهيدر والقائمة، وكارت تثبيت بيظهر للزوار (على آيفون بيشرح خطوات «إضافة إلى الشاشة الرئيسية»).
- التثبيت بيشتغل على الموقع المنشور بـ HTTPS (مش في رابط المعاينة).

## الصفحات (Hash routing)

| الصفحة | الرابط |
|---|---|
| الرئيسية | `#/` |
| المتجر + الفلاتر | `#/shop` (يدعم `?model=&year=&cat=&q=&sale=1…`) |
| موديلات TVS | `#/motorcycles` · `#/motorcycles/<slug>` |
| المنتج | `#/products/<slug>` |
| الأقسام · العروض · الأطقم | `#/categories` · `#/offers` · `#/bundles` |
| السلة · إتمام الطلب · تأكيد الطلب | `#/cart` · `#/checkout` · `#/order-success` |
| تتبع الطلب · المفضلة · جراچي | `#/track-order` · `#/wishlist` · `#/garage` |
| دخول · تسجيل · حسابي · طلباتي | `#/login` · `#/register` · `#/account` · `#/account/orders` |
| من نحن · تواصل · الأسئلة · السياسات | `#/about` · `#/contact` · `#/faq` · `#/policies/shipping|returns|privacy|terms` |
| لوحة التحكم | `#/admin` (كلمة المرور التجريبية: `admin123`) |

## هيكل الملفات

```
index.html
assets/css/styles.css      نظام التصميم (ألوان، خطوط Cairo، مكونات، حركات، reduced-motion)
assets/js/data.js          الكتالوج: 25 موديل TVS، 12 قسم، 524 منتج، 8 أطقم، طلبات وعملاء تجريبيين
assets/js/core.js          الإعدادات، الأيقونات، التخزين (LocalStorage)، السلة، الكوبونات، الحساب، الطلبات، واتساب
assets/js/ui.js            الهيدر/الفوتر، كروت المنتجات، السلة الجانبية، العرض السريع، البحث، الحركات
assets/js/pages-store.js   الرئيسية، المتجر والفلاتر، الموديلات، المنتج، الأقسام، العروض، الأطقم
assets/js/pages-flow.js    السلة، الدفع عند الاستلام، التتبع، الحساب، جراچي، الصفحات التعريفية
assets/js/admin.js         لوحة التحكم (KPIs، رسوم بيانية، CRUD للمنتجات/الأقسام/الكوبونات، المخزون، الطلبات)
assets/js/photos.js        الصور الحقيقية (صور المتجر + Commons)؛ الموديلات بدون صورة تظهر بلوحة اسم بدون رسومات
assets/dist/               الملفات المضغوطة اللي الموقع بيستخدمها (من scripts/build.js)
scripts/import-photos.js   استيراد صور المحل: model--slug.jpg / part--art.jpg / sku--SKU.jpg (بيشيل الخلفية البيضا تلقائي)
assets/js/app.js           الراوتر والتشغيل
assets/img/                صور توضيحية SVG (قطع الغيار والموتوسيكلات)
assets/brand/              اللوجو الرسمي
scripts/generate-art.js    مولّد الصور التوضيحية:  node scripts/generate-art.js
```

## قبل الإطلاق — مطلوب من المتجر

1. **رقم واتساب المتجر:** في `assets/js/core.js` ← `STORE_WHATSAPP` (صيغة دولية مثل `2010XXXXXXXX`)، أو من لوحة التحكم ← الإعدادات.
2. **بيانات التواصل والسوشيال:** هاتف، بريد، عنوان، روابط فيسبوك/إنستجرام/تيك توك.
3. **الأسعار والمخزون وأرقام القطع:** كل الأسعار والمخزون وأرقام القطع وسنوات التوافق في `data.js` **بيانات تجريبية** — تُستبدل بالكتالوج الحقيقي.
4. **الصور الحقيقية:**
   - مُضاف حاليًا صور حقيقية من Wikimedia Commons (تراخيص حرة) لـ 8 موديلات TVS و12 نوع قطعة — مذكورة في صفحة `#/credits`. بتتحمّل أونلاين من commons.wikimedia.org.
   - **الأفضل:** صور TVS الرسمية من كيت الوكيل. ضعها في `assets/photos/` وسجّلها في `assets/js/photos.js` داخل `LOCAL`:
     ```js
     LOCAL.models["apache-rtr-160-4v"] = "assets/photos/models/apache-rtr-160-4v.jpg";
     LOCAL.parts["brake-pads"]        = "assets/photos/parts/brake-pads.jpg";   // لكل نوع قطعة
     LOCAL.products["AZ-BRK-004"]     = "assets/photos/products/AZ-BRK-004.jpg"; // لمنتج محدد بالـ SKU
     ```
   - لو أي صورة فشلت في التحميل، الموقع يعرض الرسم التوضيحي بدلها تلقائيًا (مفيش صور مكسورة).
5. **صفة الوكيل المعتمد:** الموقع يعرض "وكيل معتمد TVS" — تأكد إن المتجر عنده تفويض رسمي ساري قبل النشر (يمكن إيقافها من `AUTHORIZED_DEALER` / النصوص).

## حدود هذه النسخة (Frontend فقط)

- السلة، المفضلة، الحسابات، الطلبات، وتعديلات لوحة التحكم محفوظة في **متصفح المستخدم فقط** (LocalStorage).
- تسجيل الدخول ولوحة التحكم **محاكاة** وليست حماية حقيقية.
- **لا يوجد إرسال واتساب تلقائي.** الأزرار تفتح واتساب برسالة جاهزة يرسلها المستخدم يدويًا. الإرسال التلقائي يتطلب Backend + WhatsApp Business Platform معتمد. كل طلب يحمل حقل `notification` جاهز للربط.
- الدفع: عند الاستلام فقط (لا كروت، لا بوابات دفع).

## الربط بـ Backend لاحقًا

كل الوصول للبيانات يمر عبر طبقات واضحة في `core.js` (`AZ.catalog`, `AZ.cart`, `AZ.orders`, `AZ.auth`, `AZ.settings`).
استبدل تنفيذها بطلبات API (مثلاً Laravel/Node) بدون تغيير الصفحات.

---
TVS علامة تجارية مملوكة لشركة TVS Motor Company.
