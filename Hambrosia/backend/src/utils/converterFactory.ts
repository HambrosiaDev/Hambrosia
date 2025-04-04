import type { DocumentData, QueryDocumentSnapshot } from 'firebase-admin/firestore';

interface SnapshotOptions {
  serverTimestamps?: 'estimate' | 'previous' | 'none';
}

// Convertidor genérico para manejar fechas, incluyendo bloqueadoHasta y fechaNacimiento
export function converterFactory<T extends { id: string, [key: string]: any }>() {
  return {
    toFirestore(data: T): DocumentData {
      const { id, ...rest } = data;

      // Convertir objetos Date a timestamp para Firestore
      const processedData: { [key: string]: any } = { ...rest };
      for (const [key, value] of Object.entries(processedData)) {
        if (value instanceof Date) {
          // Guardamos como timestamp en Firestore para mejor precisión
          processedData[key] = value;
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

      // Convertir timestamps a objetos Date
      const processedData: { [key: string]: any } = { ...data };
      
      // Convertir fechas explícitamente conocidas
      if (processedData.fechaNacimiento && processedData.fechaNacimiento.toDate) {
        processedData.fechaNacimiento = processedData.fechaNacimiento.toDate();
      }
      
      if (processedData.bloqueadoHasta && processedData.bloqueadoHasta.toDate) {
        processedData.bloqueadoHasta = processedData.bloqueadoHasta.toDate();
      }
      
      // Buscar otros campos que podrían ser timestamps
      for (const [key, value] of Object.entries(processedData)) {
        if (value && typeof value === 'object' && value.toDate && typeof value.toDate === 'function') {
          processedData[key] = value.toDate();
        } else if (typeof value === 'string' && /^\d{2}-\d{2}-\d{4}$/.test(value)) {
          const [dia, mes, año] = value.split('-').map(Number);
          processedData[key] = new Date(año, mes - 1, dia); // mes - 1 porque Date usa meses base 0
        }
      }

      return { ...processedData, id: snapshot.id } as T;
    },
  };
}