# Preeti Soulpreneur: website, courses and student portal

Next.js + Firebase. Public site (`/`), student portal (`/student`), admin console (`/admin`).

```
npm install
cp .env.local.example .env.local   # fill in Firebase, Razorpay, Resend keys
npm run dev
```

Setup steps for Firebase, the first admin account and call bookings are in `ADMIN_SETUP.md`.

Site-wide copy lives in `lib/content.ts`; contact details and defaults in `lib/site.ts`. Lines marked `CONFIRM` need Preeti to verify before launch.
