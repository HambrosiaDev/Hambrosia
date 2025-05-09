import { database } from 'firebase-admin';
import { db } from '../config/firebase';
import { Compra, Notificaciones } from '../models/interfaces';
import { converterFactory } from '../utils/converterFactory';
import { paqueteService } from './paqueteService';


// Centralized error messages
const ERROR_MESSAGES = {
  COMPRA_NOT_FOUND: 'Compra no encontrada',
  CREATING_COMPRA_ERROR: 'Error creando la compra',
  CONFIRMING_COMPRA_ERROR: 'Error confirmando la compra',
  UPDATING_COMPRA_ERROR: 'Error actualizando la compra',
  GETTING_COMPRA_ERROR: 'Error obteniendo la compra',
  INVALID_COMPRA_ID: 'ID de compra inválido',
};

export class CompraService {
  private collection = db.collection('compras').withConverter(converterFactory<Compra>());

  // Helper method to get a compraRef
  private compraRef(compraId: string) {
    return this.collection.doc(compraId);
  }

  private notificacionRef(compraId: string) {
    return db.collection('notificaciones').doc(compraId).withConverter(converterFactory<Compra>());
  }

  async crearCompra(paqueteId: string, compra: Compra): Promise<Compra> {
    try {
      const docRef = await this.collection.add(compra);
      const nuevaCompra = { ...compra, id: docRef.id };
      await paqueteService.restarUnidadesPaquete(paqueteId, compra.cantidadComprada);

      return nuevaCompra;
    } catch (error) {
      console.error(ERROR_MESSAGES.CREATING_COMPRA_ERROR, error);
      throw new Error(ERROR_MESSAGES.CREATING_COMPRA_ERROR);
    }
  }

  async getCompraById(compraId: string): Promise<Compra | null> {
    try {
      const compraSnapshot = await this.compraRef(compraId).get();
      if (!compraSnapshot.exists) {
        return null;
      }
      return { id: compraSnapshot.id, ...compraSnapshot.data() } as Compra;
    } catch (error) {
      console.error(ERROR_MESSAGES.GETTING_COMPRA_ERROR, error);
      throw new Error(ERROR_MESSAGES.GETTING_COMPRA_ERROR);
    }
  }

  async confirmarCompra(compraId: string, datosActualizados: Partial<Compra>): Promise<Compra> {
    try {
      await this.actualizarCompra(compraId,datosActualizados)
      const compraSnapshot = await this.compraRef(compraId).get();

      if (!compraSnapshot.exists) {
        throw new Error(ERROR_MESSAGES.COMPRA_NOT_FOUND);
      }

      return { id: compraSnapshot.id, ...compraSnapshot.data() } as Compra;
    } catch (error) {
      console.error(ERROR_MESSAGES.CONFIRMING_COMPRA_ERROR, error);
      throw error;
    }
  }
   async actualizarCompra(compraId: string, body: Partial<Compra>): Promise<Compra> {
    try {
        await this.compraRef(compraId).update(body);
        const compraSnapshot = await this.compraRef(compraId).get();
        if (!compraSnapshot.exists) {
            throw new Error(ERROR_MESSAGES.COMPRA_NOT_FOUND);
        }
        return { id: compraSnapshot.id, ...compraSnapshot.data() } as Compra;
    } catch (error) {
        console.error(ERROR_MESSAGES.UPDATING_COMPRA_ERROR, error);
        throw error;
    }
}

async crearNotificacionCompra(compraId: string, body: any): Promise<Notificaciones> {
  try {
    // Validar que el ID de compra no esté vacío
    if (!compraId) {
      throw new Error(ERROR_MESSAGES.INVALID_COMPRA_ID);
    }

    const notificacionRef = this.notificacionRef(compraId);

    // Actualizar la notificación
    await notificacionRef.create(body);

    // Obtener la notificación actualizada
    const notificacionSnapshot = await notificacionRef.get();
    if (!notificacionSnapshot.exists) {
      throw new Error(ERROR_MESSAGES.COMPRA_NOT_FOUND);
    }

    // Retornar la notificación formateada
    return { id: notificacionSnapshot.id, ...notificacionSnapshot.data() } as Notificaciones;

  } catch (error) {
    console.error(ERROR_MESSAGES.UPDATING_COMPRA_ERROR, error);
    throw error; // Propagar el error para que el controlador lo maneje
  }
}
async actualizarNotificacionCompra(compraId: string, body: Partial<Notificaciones>): Promise<Notificaciones> {
  try {
    const notificacionRef = this.notificacionRef(compraId);
    await notificacionRef.update(body);

    const notificacionSnapshot = await notificacionRef.get();
    if (!notificacionSnapshot.exists) {
      throw new Error(ERROR_MESSAGES.COMPRA_NOT_FOUND);
    }

    return { id: notificacionSnapshot.id, ...notificacionSnapshot.data() } as Notificaciones;
  }
  catch (error) {
    console.error(ERROR_MESSAGES.UPDATING_COMPRA_ERROR, error);
    throw new Error(ERROR_MESSAGES.UPDATING_COMPRA_ERROR);
  }
}
async getNotificacionCompra(compraId: string): Promise<Notificaciones | null> {
  try {
    const notificacionSnapshot = await this.notificacionRef(compraId).get();
    if (!notificacionSnapshot.exists) {
      return null;
    }
    return { id: notificacionSnapshot.id, ...notificacionSnapshot.data() } as Notificaciones;
  }
  catch (error) {
    console.error(ERROR_MESSAGES.GETTING_COMPRA_ERROR, error);
    throw new Error(ERROR_MESSAGES.GETTING_COMPRA_ERROR);
  }
}
  // Dos tipos de notificaciones: cuando reserva y cuando cancela
  async getComisionMensualByRestauranteId(mes: string, restauranteId: string): Promise<number> {
    try {
      // Obtenemos todas las compras del restaurante específico
      const comprasSnapshot = await this.collection.where('restauranteId', '==', restauranteId).get();
  
      // Convertimos los documentos en objetos Compra
      const compras: Compra[] = comprasSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Compra));
  
      // Variable para acumular las comisiones
      let comisionAcumulada = 0;
  
      // Filtramos las compras por el mes proporcionado y sumamos las comisiones
      compras.forEach(compra => {
        const fechaCompra = compra.fechaCompra;
  
        if (fechaCompra) {
          // Extraemos el mes, ya sea desde un Timestamp o un Date
          let mesCompra: string;
  
          if (typeof fechaCompra === 'object' && 'seconds' in fechaCompra && 'nanoseconds' in fechaCompra) {
            // Si es un Timestamp, creamos un Date usando seconds y nanoseconds
            const fechaComoDate = new Date((fechaCompra as any).seconds * 1000 + (fechaCompra as any).nanoseconds / 1_000_000);
            mesCompra = fechaComoDate.toLocaleString('es', { month: 'long' });
          } else {
            // Si ya es un Date, lo usamos directamente
            const fechaComoDate = new Date(fechaCompra);
            mesCompra = fechaComoDate.toLocaleString('es', { month: 'long' });
          }
          // Verificamos si el mes coincide y si la compra está pagada
          if (mesCompra === mes && compra.pagado === true) {
            comisionAcumulada += compra.valorComision || 0; // Sumamos la comisión (si existe)
          }
        }
      });
  
      // Retornamos la comisión acumulada
      return comisionAcumulada;
    } catch (error) {
      console.error(ERROR_MESSAGES.GETTING_COMPRA_ERROR, error);
      throw new Error(ERROR_MESSAGES.GETTING_COMPRA_ERROR);
    }
  }

  async getCodigoConfirmacion(compraId: string): Promise<string | null> {
    try {
      const compraSnapshot = await this.compraRef(compraId).get();
      if (!compraSnapshot.exists) {
        return null;
      }
      return compraSnapshot.data()?.codigo|| null;
    } catch (error) {
      console.error(ERROR_MESSAGES.GETTING_COMPRA_ERROR, error);
      throw new Error(ERROR_MESSAGES.GETTING_COMPRA_ERROR);
    }
  }

  async getComprasActivasByClienteId(
    clienteId: string,
    cursor: string | null = null
  ): Promise<{
    compras: Array<{ codigo: string; fechaCompra: Date; precioApagar: number; paqueteId: string }>;
    nextCursor: string | null;
  }> {
    try {
      let query = this.collection
        .where('clienteId', '==', clienteId)
        .where('confirmacionCodigo', '==', false)
        .where('pagado', '==', false)
        .orderBy('fechaCompra')
        .limit(10)
        .select('codigo', 'fechaCompra', 'precioApagar', 'paqueteId', 'metodoElegido', 'id');
  
      if (cursor) {
        query = query.startAfter(cursor);
      }
  
      const snapshot = await query.get();
  
      const compras = snapshot.docs.map(doc => {
        const data = doc.data();
        console.log(data.compraId);
        console.log(data);
        return {
          codigo: data.codigo,
          fechaCompra: data.fechaCompra,
          precioApagar: data.precioApagar,
          paqueteId: data.paqueteId,
          metodoElegido: data.metodoElegido,
          compraId: data.id,
        };
      });

  
      const nextCursor = snapshot.docs.length > 0
        ? snapshot.docs[snapshot.docs.length - 1].id
        : null;
  
      return { compras, nextCursor };
    } catch (error) {
      console.error(ERROR_MESSAGES.GETTING_COMPRA_ERROR, error);
      throw new Error(ERROR_MESSAGES.GETTING_COMPRA_ERROR);
    }
  }

  async getComprasCompletadasByClienteId(
    clienteId: string,
    cursor: string | null = null
  ): Promise<{
    compras: Array<{
      codigo: string;
      fechaCompra: Date;
      precioApagar: number;
      paqueteId: string;
      metodoElegido: string;
    }>;
    nextCursor: string | null;
  }> {
    try {
      let query = this.collection
        .where('clienteId', '==', clienteId)
        .where('confirmacionCodigo', '==', true) 
        .where('pagado', '==', true)
        .orderBy('fechaCompra', 'desc')
        .limit(10)
        .select('codigo', 'fechaCompra', 'precioApagar', 'paqueteId', 'metodoElegido');
  
      if (cursor) {
        query = query.startAfter(cursor);
      }
  
      const snapshot = await query.get();
  
      const compras = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          codigo: data.codigo,
          fechaCompra: data.fechaCompra,
          precioApagar: data.precioApagar,
          paqueteId: data.paqueteId,
          metodoElegido: data.metodoElegido,
        };
      });
  
      const nextCursor = snapshot.docs.length > 0
        ? snapshot.docs[snapshot.docs.length - 1].id
        : null;
  
      return { compras, nextCursor };
    } catch (error) {
      console.error(ERROR_MESSAGES.GETTING_COMPRA_ERROR, error);
      throw new Error(ERROR_MESSAGES.GETTING_COMPRA_ERROR);
    }
  }

  // Compra por RestauranteId y fechaCompra, trae fechaCompra, MetodoPago, CedulaCliente(Usar Hash a la inversa), precioApagar
  async getComprasByRestauranteId(restauranteId: string, fechaCompra: Date): Promise<Compra[]> {
    try {
        const startOfDay = new Date(fechaCompra);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(fechaCompra);
        endOfDay.setHours(23, 59, 59, 999);

        const comprasSnapshot = await this.collection
            .where('restauranteId', '==', restauranteId)
            .where('fechaCompra', '>=', startOfDay)
            .where('fechaCompra', '<=', endOfDay)
            .get();

        return comprasSnapshot.docs.map(doc => ({ compraId: doc.id, ...doc.data() } as Compra));
    } catch (error) {
        console.error(ERROR_MESSAGES.GETTING_COMPRA_ERROR, error);
        throw new Error(ERROR_MESSAGES.GETTING_COMPRA_ERROR);
    }
}

  
}
