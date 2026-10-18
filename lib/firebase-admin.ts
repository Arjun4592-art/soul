import { getApps, initializeApp, cert, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

// Used only inside app/api/** route handlers (never imported by client
// components). Needs a Firebase service account — see .env.local.example.
let adminApp: App | null = null;

export function getAdminApp(): App {
  if (adminApp) return adminApp;
  if (getApps().length) {
    adminApp = getApps()[0];
    return adminApp;
  }

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Firebase Admin env vars missing. Set FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, FIREBASE_ADMIN_PRIVATE_KEY in .env.local"
    );
  }

  adminApp = initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
  return adminApp;
}

export function adminAuth() {
  return getAuth(getAdminApp());
}

export function adminDb() {
  return getFirestore(getAdminApp());
}

/** Default Cloud Storage bucket, used to upload generated certificate PDFs. */
export function adminStorageBucket() {
  return getStorage(getAdminApp()).bucket();
}

/**
 * Verifies the Firebase ID token sent as `Authorization: Bearer <token>`.
 * Returns the decoded token (with `.uid`) or null if missing/invalid.
 * Used by app/api/checkout/** routes, which involve money and must know
 * exactly which signed-in user is paying.
 */
export async function getAuthedUser(req: Request) {
  const header = req.headers.get("authorization") ?? req.headers.get("Authorization");
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return null;
  try {
    return await adminAuth().verifyIdToken(token);
  } catch {
    return null;
  }
}

/**
 * Staff gate for app/api/admin/** routes. Verifies the Bearer ID token, then
 * checks users/{uid}.role in Firestore. Pass `adminOnly` for routes that must
 * not be usable by coaches (e.g. creating or deleting accounts).
 * Returns { uid, role } on success, or null when the caller isn't allowed.
 */
export async function getStaffUser(req: Request, opts: { adminOnly?: boolean } = {}) {
  const authed = await getAuthedUser(req);
  if (!authed) return null;
  const snap = await adminDb().collection("users").doc(authed.uid).get();
  const role = snap.exists ? (snap.data()?.role as string | undefined) : undefined;
  if (role === "admin") return { uid: authed.uid, role };
  if (role === "coach" && !opts.adminOnly) return { uid: authed.uid, role };
  return null;
}
