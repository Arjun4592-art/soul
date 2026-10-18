/**
 * Creates the very first admin user so you can log into /admin.
 * Run with: npx tsx scripts/create-admin.ts "Your Name" you@email.com "yourPassword123"
 *
 * Requires FIREBASE_ADMIN_* vars in .env.local (see .env.local.example).
 */
import "dotenv/config";
import { adminAuth, adminDb } from "../lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

async function main() {
  const [name, email, password] = process.argv.slice(2);

  if (!name || !email || !password) {
    console.error('Usage: npx tsx scripts/create-admin.ts "Your Name" you@email.com "password123"');
    process.exitCode = 1;
    return;
  }

  const user = await adminAuth().createUser({ email, password, displayName: name });

  await adminDb().collection("users").doc(user.uid).set({
    name,
    email,
    role: "admin",
    status: "active",
    coursesEnrolled: 0,
    createdAt: FieldValue.serverTimestamp(),
  });

  console.log(`✅ Admin created: ${email} — you can now log in at /admin/login.`);
}

main().catch((err) => {
  console.error("❌ Could not create admin:", err.message ?? err);
  process.exitCode = 1;
});
