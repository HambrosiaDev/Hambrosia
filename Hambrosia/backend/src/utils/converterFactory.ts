// src/utils/converterFactory.ts
import type { DocumentData, QueryDocumentSnapshot } from "firebase-admin/firestore";

interface SnapshotOptions {
  serverTimestamps?: "estimate" | "previous" | "none";
}

// Convertidor genérico para manejar fechas específicas y otros tipos de datos
// src/utils/converterFactory.ts
export function converterFactory<T extends { id?: string }>() {
  return {
    toFirestore(data: T): DocumentData {
      const { id, ...rest } = data;

      // Convertir objetos Date o cadenas ISO a los formatos requeridos
      const processedData: { [key: string]: any } = { ...rest };
      for (const [key, value] of Object.entries(processedData)) {
        if (value === undefined) {
          continue; // Ignorar valores undefined
        }

        // Manejo de fechas
        if (["fechaNacimiento", "bloqueadoHasta", "fechaPublicacion", "fechaRetiro"].includes(key)) {
          let dateValue: Date;

          // Si es una cadena ISO, conviértela a Date
          if (typeof value === "string") {
            dateValue = new Date(value);
            if (isNaN(dateValue.getTime())) {
              throw new Error(`Invalid date string for field '${key}': ${value}`);
            }
          } else {
            dateValue = value; // Ya es un objeto Date
          }

          if (key === "fechaNacimiento") {
            // Guardar fechaNacimiento como DD-MM-YYYY
            const day = String(dateValue.getDate()).padStart(2, "0");
            const month = String(dateValue.getMonth() + 1).padStart(2, "0"); // Meses base 0
            const year = dateValue.getFullYear();
            processedData[key] = `${day}-${month}-${year}`;
          } else if (key === "bloqueadoHasta" || key === "fechaPublicacion" || key === "fechaRetiro") {
            // Guardar como timestamp de Firestore
            processedData[key] = dateValue;
          }
        } else {
          // Para otros campos, mantener el valor original
          processedData[key] = value;
        }
      }

      return processedData;
    },
    fromFirestore(snapshot: QueryDocumentSnapshot): T {
      const data = snapshot.data();
      if (!data) {
        throw new Error("Document not found");
      }

      // Convertir datos recuperados a objetos Date cuando sea necesario
      const processedData: { [key: string]: any } = { ...data };

      // Procesar fechaNacimiento (cadena DD-MM-YYYY)
      if (processedData.fechaNacimiento && typeof processedData.fechaNacimiento === "string") {
        const [dia, mes, año] = processedData.fechaNacimiento.split("-").map(Number);
        processedData.fechaNacimiento = new Date(año, mes - 1, dia); // Meses base 0
      }

      // Procesar bloqueadoHasta, fechaPublicacion y fechaRetiro (timestamps de Firestore)
      for (const key of ["bloqueadoHasta", "fechaPublicacion", "fechaRetiro"]) {
        if (processedData[key] && processedData[key].toDate) {
          processedData[key] = processedData[key].toDate();
        }
      }

      // Incluir el ID del documento
      return { ...processedData, id: snapshot.id } as T;
    },
  };
}