# Admin Dashboard — Setup Guide

Ye guide batati hai ki `/admin` console ko live Firebase project se kaise connect karein.

## 1. Firebase project banayein

1. https://console.firebase.google.com pe jaake naya project banayein.
2. **Build → Authentication → Get Started → Email/Password** enable karein.
3. **Build → Firestore Database → Create database** (production mode).
4. **Build → Storage** enable karein (agar course thumbnails Firebase Storage me rakhne hain; is project me Cloudinary use ho raha hai to ye optional hai).

## 2. Client keys lein

Project Settings → General → "Your apps" → Web app add karein → config object milega. Ye values `.env.local` me `NEXT_PUBLIC_FIREBASE_*` ke against daalein.

## 3. Admin (server) keys lein

Project Settings → Service Accounts → **Generate new private key**. Downloaded JSON se:
- `project_id` → `FIREBASE_ADMIN_PROJECT_ID`
- `client_email` → `FIREBASE_ADMIN_CLIENT_EMAIL`
- `private_key` → `FIREBASE_ADMIN_PRIVATE_KEY` (quotes ke andar, `\n` waise hi rehne dein)

## 4. `.env.local` banayein

```
cp .env.local.example .env.local
```
Sab values fill karein — Firebase, Razorpay, Cloudinary, Resend (jo abhi na ho wo blank chhod sakte hain, wo feature bas kaam nahi karega).

## 5. Firestore security rules deploy karein

```
npm install -g firebase-tools
firebase login
firebase init firestore   # existing project select karein, firestore.rules already hai
firebase deploy --only firestore:rules
```

## 6. Pehla admin account banayein

```
npm install
npm run create-admin -- "Preeti" admin@preetisoulpreneur.com "StrongPassword123"
```

Ye `users/{uid}` doc me `role: "admin"` set karta hai — is email/password se `/admin/login` par login karein.

## 7. Local me run karein

```
npm run dev
```
`/admin` par jaake login karein. Dashboard, Call bookings, Leads, Users, Courses, Categories, Enrollments, Live classes, Community, Certificates, Orders, Coupons, Journal, Voices, Email campaigns, Announcements, Settings — sab pages Firestore se real-time connected hain.

## Data model (Firestore collections)

| Collection | Purpose |
|---|---|
| `users` | Profiles + role (`admin` / `coach` / `student`) |
| `courses` | Course catalog |
| `categories` | Course categories |
| `enrollments` | Student ↔ course links + progress |
| `orders` | Razorpay orders/payments |
| `coupons` | Discount codes |
| `testimonials` | Homepage testimonials |
| `posts` | Blog posts |
| `live_classes` | Live classes with a pasted Zoom link |
| `bookings` | Free-call requests and scheduled calls |
| `certificates` | Issued certificates |
| `email_campaigns` | Sent email campaign log |
| `notifications` | Sent push notification log |
| `settings/site` | Site-wide settings (single doc) |

## Razorpay, Cloudinary, Resend, FCM — next steps

Ye admin panel Orders/Payments, Blog images, Email Campaigns, aur Push Notifications ke liye already wired hai (`app/api/admin/*` routes), bas unke API keys `.env.local` me chahiye:

- **Razorpay**: Dashboard → Settings → API Keys. Checkout flow (student-facing payment page) is admin build ke scope se bahar hai — wo agla phase hai jab student dashboard banega.
- **Cloudinary**: unsigned upload preset banayein Dashboard → Settings → Upload, phir `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` set karein.
- **Resend**: resend.com se API key + verified sending domain.


## Roadmap — agla kya banayein

Diagram ke hisaab se admin dashboard **aur ab Student Dashboard + Course Player** dono ready hain.

### Student Portal (`/student`) — naya

- `/student/signup`, `/student/login` — student khud account bana sakte hain (role: `student`)
- `/student` — Dashboard: stats, Continue Learning, upcoming Live Classes, My Courses preview
- `/student/courses` — My Courses (sirf enrolled courses)
- `/student/courses/[courseId]` — **Course Player**: modules/lessons sidebar, video (YouTube/Vimeo/mp4), tabs (Overview, Notes, Resources, Discussion, Quiz), progress tracking, mark-complete
- `/student/live-classes`, `/student/certificates`, `/student/notes`, `/student/notifications`, `/student/profile`

Course content abhi khali hoga jab tak admin course ke liye modules/lessons na banaye — `/admin/courses` me har course ke saamne ab **"Manage Content"** link hai jahan se modules aur lessons (video/text/quiz) add kar sakte hain.

### Public Course Catalog + Razorpay Checkout — naya

- `/courses` — public catalog (published courses hi dikhte hain), category filter + search
- `/courses/[slug]` — course detail: curriculum preview (module titles) + Enroll panel
- Enroll flow: login/signup (agar nahi kiya) → coupon apply (optional) → Razorpay Checkout modal → payment verify → auto-enroll → student ko `/student/courses/[id]` par redirect

API routes: `app/api/checkout/create-order`, `app/api/checkout/verify`, `app/api/checkout/webhook` (Razorpay dashboard → Settings → Webhooks me webhook URL + `RAZORPAY_WEBHOOK_SECRET` set karein, event: `payment.captured` — ye ek safety-net hai agar client-side verify call fail ho jaye).

Free/100%-off coupon course ko bina Razorpay ke seedha enroll kar deta hai.

Naye env vars (already `.env.local.example` me hain, bas values bharni hain):
`NEXT_PUBLIC_RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`.

### Community Forum — naya

- `/student/community` — thread list (category filter chips ki jagah simple category tag) + "New Discussion" button
- `/student/community/[threadId]` — thread detail + replies, koi bhi apna reply delete kar sakta hai
- `/admin/community` — moderation: pin/unpin thread, thread expand karke replies dekhna, thread (with all replies) ya individual reply delete karna

Naye Firestore collections: `forum_threads`, `forum_replies` — reply counts aur "last activity" client-side compute hote hain (koi counter field nahi), isliye extra Firestore writes/permissions ki zaroorat nahi padi.

### Certificate PDF Auto-Generation — naya

- Student jab course 100% complete karta hai (course player me "Finish Course" par), ek certificate PDF automatically generate hokar Firebase Storage me upload ho jaata hai aur `/student/certificates` par turant dikh jaata hai (download link ke saath)
- Admin bhi `/admin/certificates` se kisi bhi completed enrollment ke liye certificate issue kar sakta hai (same PDF generation, "Issue Certificate")
- PDF design: landscape A4, site ke ink/gold/cream colors match karta hua, student ka naam + course title + issue date + certificate ID
- API route: `app/api/certificates/generate` — idempotent hai (dobara call karne se duplicate certificate nahi banta, existing wapas mil jaata hai)

Tech: `pdf-lib` (pure JS, koi native dependency nahi) se PDF banta hai, Firebase Storage me `certificates/{userId}_{courseId}.pdf` par upload hota hai with a download token (bina bucket ko public kiye access-able).

Sab phases ab complete hain jo humne discuss kiye the:
- ✅ Public Website
- ✅ Admin Dashboard
- ✅ Student Dashboard + Course Player
- ✅ Public Course Catalog + Razorpay Checkout
- ✅ Community Forum
- ✅ Certificate PDF Auto-Generation

Agla phase jab chahiye ho bata dein: AI features (course assistant, quiz generator, study planner).


## Call bookings (Zoom link manual)

Koi Zoom/Calendly integration nahi hai. Flow:
1. Visitor `/book` pe request bhejta hai -> `bookings` me `requested` status.
2. Admin -> **Call bookings** -> **Schedule**: date/time chuno, apna Zoom link paste karo, save.
3. Guest ko email jaata hai (Resend key ho to) time + Zoom link ke saath.
Admin hi "Add booking" se manually bhi booking bana sakta hai. `NOTIFY_EMAIL` set karo to naye request pe alert aayega.

## Website settings

Admin -> **Settings** se contact email/phone, WhatsApp community link (Sacred Mornings), social links aur announcement banner badlo, code chhue bina.
