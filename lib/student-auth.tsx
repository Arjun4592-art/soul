"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db, isFirebaseConfigured } from "@/lib/firebase";
import type { UserDoc } from "@/lib/types";

type StudentAuthState = {
  user: User | null;
  profile: UserDoc | null;
  loading: boolean;
  error: string | null;
  /** Set right after signup so the signup page can show a
   *  "check your email" screen instead of redirecting in. */
  verificationSentTo: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
};

const StudentAuthContext = createContext<StudentAuthState | undefined>(undefined);

async function ensureUserProfile(user: User) {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      name: user.displayName ?? "Student",
      email: user.email ?? "",
      role: "student",
      status: "active",
      coursesEnrolled: 0,
      createdAt: serverTimestamp(),
    });
  }
}

export function StudentAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserDoc | null>(null);
  const [loading, setLoading] = useState(isFirebaseConfigured);
  const [error, setError] = useState<string | null>(null);
  const [verificationSentTo, setVerificationSentTo] = useState<string | null>(null);

  useEffect(() => {
    if (!isFirebaseConfigured) return;
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      // Safety net: an email/password session that somehow isn't verified
      // (e.g. a session that predates this requirement) never counts as
      // signed in on the student portal.
      const isGoogleUser = firebaseUser?.providerData.some((p) => p.providerId === "google.com");
      if (firebaseUser && !firebaseUser.emailVerified && !isGoogleUser) {
        await signOut(auth);
        setUser(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const snap = await getDoc(doc(db, "users", firebaseUser.uid));
          setProfile(snap.exists() ? ({ id: snap.id, ...snap.data() } as UserDoc) : null);
        } catch {
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  async function login(email: string, password: string) {
    setError(null);
    setVerificationSentTo(null);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      if (!cred.user.emailVerified) {
        await sendEmailVerification(cred.user);
        await signOut(auth);
        setError(
          "Your email hasn't been verified yet. We've resent the verification link — please check your inbox and log in again."
        );
        throw new Error("email-not-verified");
      }
    } catch (err) {
      if ((err as Error)?.message !== "email-not-verified") {
        setError("Incorrect email or password. Please try again.");
      }
      throw err;
    }
  }

  async function signup(name: string, email: string, password: string) {
    setError(null);
    setVerificationSentTo(null);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name });
      await setDoc(doc(db, "users", cred.user.uid), {
        name,
        email,
        role: "student",
        status: "active",
        coursesEnrolled: 0,
        createdAt: serverTimestamp(),
      });
      await sendEmailVerification(cred.user);
      await signOut(auth);
      setVerificationSentTo(email);
    } catch (err) {
      const code = (err as { code?: string })?.code;
      if (code === "auth/email-already-in-use") {
        setError("This email is already registered. Please log in.");
      } else if (code === "auth/weak-password") {
        setError("Password must be at least 6 characters.");
      } else {
        setError("There was a problem creating your account. Please try again.");
      }
      throw new Error("signup-failed");
    }
  }

  async function loginWithGoogle() {
    setError(null);
    setVerificationSentTo(null);
    try {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      // Google-verified emails come through with emailVerified: true already,
      // so no extra verification step is needed — just make sure a profile exists.
      await ensureUserProfile(cred.user);
    } catch (err) {
      const code = (err as { code?: string })?.code;
      if (code === "auth/popup-closed-by-user") {
        // User cancelled — not a real error, no message needed.
        throw err;
      }
      setError("Could not log in with Google. Please try again.");
      throw err;
    }
  }

  async function logout() {
    await signOut(auth);
  }

  return (
    <StudentAuthContext.Provider
      value={{ user, profile, loading, error, verificationSentTo, login, signup, loginWithGoogle, logout }}
    >
      {children}
    </StudentAuthContext.Provider>
  );
}

export function useStudentAuth() {
  const ctx = useContext(StudentAuthContext);
  if (!ctx) throw new Error("useStudentAuth must be used within StudentAuthProvider");
  return ctx;
}
