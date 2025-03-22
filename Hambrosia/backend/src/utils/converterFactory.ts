import type { DocumentData, QueryDocumentSnapshot } from 'firebase-admin/firestore';

interface SnapshotOptions {
  serverTimestamps?: 'estimate' | 'previous' | 'none';
}

// Generic converter factory for Firestore documents
export function converterFactory<T extends { id: string }>() {
  return {
    toFirestore(data: T): DocumentData {
      const { id, ...rest } = data;
      return rest;
    },
    fromFirestore(
      snapshot: QueryDocumentSnapshot,
      options?: SnapshotOptions
    ): T {
      const data = snapshot.data();
      if (!data) {
        throw new Error('Document not found');
      }
      return { ...data, id: snapshot.id } as T;
    },
  };
}


