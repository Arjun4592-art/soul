"use client";

import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  type QueryConstraint,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase";

/**
 * Subscribes to a Firestore collection in real time. Returns items with
 * `id` merged in, plus loading/error/empty state so pages can render
 * something sensible before Firebase is even connected.
 */
export function useCollection<T extends { id: string }>(
  collectionName: string,
  constraints: QueryConstraint[] = [orderBy("createdAt", "desc")]
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(isFirebaseConfigured);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isFirebaseConfigured) return;
    const q = query(collection(db, collectionName), ...constraints);
    const unsub = onSnapshot(
      q,
      (snap) => {
        setData(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as T));
        setLoading(false);
        setError(null);
      },
      (err) => {
        // Most common cause locally: the collection doesn't exist yet or
        // Firestore rules reject the read — surface it instead of hanging.
        setError(err.message);
        setLoading(false);
      }
    );
    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionName]);

  return { data, loading, error };
}
