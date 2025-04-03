import type { DocumentData, QueryDocumentSnapshot } from 'firebase-admin/firestore';

interface SnapshotOptions {
  serverTimestamps?: 'estimate' | 'previous' | 'none';
}

// Convertidor genérico para manejar fechas en formato "DD-MM-YYYY"
export function converterFactory<T extends { id: string, [key: string]: any }>() {
  return {
    toFirestore(data: T): DocumentData {
      const { id, ...rest } = data;

      // Convertir objetos Date a string "DD-MM-YYYY"
      const processedData: { [key: string]: any } = { ...rest };
      for (const [key, value] of Object.entries(processedData)) {
        if (value instanceof Date) {
          const dia = String(value.getDate()).padStart(2, '0');
          const mes = String(value.getMonth() + 1).padStart(2, '0'); // +1 porque getMonth() es base 0
          const año = value.getFullYear();
          processedData[key] = `${dia}-${mes}-${año}`;
        }
      }

      return processedData;
    },
    fromFirestore(
      snapshot: QueryDocumentSnapshot,
      options?: SnapshotOptions
    ): T {
      const data = snapshot.data();
      if (!data) {
        throw new Error('Document not found');
      }

      // Convertir strings "DD-MM-YYYY" a objetos Date
      const processedData: { [key: string]: any } = { ...data };
      for (const [key, value] of Object.entries(processedData)) {
        if (typeof value === 'string' && /^\d{2}-\d{2}-\d{4}$/.test(value)) {
          const [dia, mes, año] = value.split('-').map(Number);
          processedData[key] = new Date(año, mes - 1, dia); // mes - 1 porque Date usa meses base 0
        }
      }

      return { ...processedData, id: snapshot.id } as T;
    },
  };
}
