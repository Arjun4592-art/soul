import { auth } from "@/lib/firebase";

/** fetch() that attaches the signed-in staff member's Firebase ID token. */
export async function authedFetch(input: string, init: RequestInit = {}) {
  const token = await auth.currentUser?.getIdToken();
  const headers = new Headers(init.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return fetch(input, { ...init, headers });
}
