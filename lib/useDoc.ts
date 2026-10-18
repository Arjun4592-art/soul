"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase";

/**
 * Subscribes to a single Firestore document in real time. Returns the doc
 * with `id` merged in (or null if it doesn't exist), plus loading/error.
 */
export function useDoc<T extends { id: string }>(collectionName: string, docId: string | undefined | null) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(isFirebaseConfigured && !!docId);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isFirebaseConfigured || !docId) return;
    const unsub = onSnapshot(
      doc(db, collectionName, docId),
      (snap) => {
        setData(snap.exists() ? ({ id: snap.id, ...snap.data() } as T) : null);
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );
    return () => unsub();
  }, [collectionName, docId]);

  return { data, loading, error };
}
