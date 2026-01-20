'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  onSnapshot,
  collection,
  query,
  where,
  type Query,
  type DocumentData,
  type CollectionReference,
} from 'firebase/firestore';
import { useFirestore } from '../provider';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

interface UseCollectionOptions {
  listen?: boolean;
}

export function useCollection<T extends DocumentData>(
  q: Query<T> | CollectionReference<T> | null,
  options: UseCollectionOptions = { listen: true }
) {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!q) {
        setData(null);
        setLoading(false);
        return;
    }

    setLoading(true);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        } as T));
        setData(docs);
        setLoading(false);
      },
      (err) => {
        const permissionError = new FirestorePermissionError({
          path: 'path' in q ? q.path : '',
          operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [JSON.stringify(q)]);

  return { data, loading, error };
}
