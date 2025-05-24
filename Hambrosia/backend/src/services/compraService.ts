import { Timestamp } from 'firebase-admin/firestore';
import { db } from '../config/firebase';
import { Compra, Notificaciones } from '../models/interfaces';
import { converterFactory } from '../utils/converterFactory';
import { getEcuadorDayRangeFromDate } from '../utils/HELPER';
import { paqueteService } from './paqueteService';
import { usuarioService } from './usuarioService';

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
      compra.fechaCompra = Timestamp.now();
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
      await this.actualizarCompra(compraId, datosActualizados);
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
      if (!compraId) {
        throw new Error(ERROR_MESSAGES.INVALID_COMPRA_ID);
      }

      const notificacionRef = this.notificacionRef(compraId);
      await notificacionRef.create(body);

      const notificacionSnapshot = await notificacionRef.get();
      if (!notificacionSnapshot.exists) {
        throw new Error(ERROR_MESSAGES.COMPRA_NOT_FOUND);
      }

      return { id: notificacionSnapshot.id, ...notificacionSnapshot.data() } as Notificaciones;
    } catch (error) {
      console.error(ERROR_MESSAGES.UPDATING_COMPRA_ERROR, error);
      throw error;
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
    } catch (error) {
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
    } catch (error) {
      console.error(ERROR_MESSAGES.GETTING_COMPRA_ERROR, error);
      throw new Error(ERROR_MESSAGES.GETTING_COMPRA_ERROR);
    }
  }

  async getComisionMensualByRestauranteId(mes: string, restauranteId: string): Promise<number> {
    try {
      const comprasSnapshot = await this.collection.where('restauranteId', '==', restauranteId).get();
      const compras: Compra[] = comprasSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Compra));
      let comisionAcumulada = 0;

      compras.forEach(compra => {
        const fechaCompra = compra.fechaCompra;
        if (fechaCompra) {
          let mesCompra: string;
          if (typeof fechaCompra === 'object' && 'seconds' in fechaCompra && 'nanoseconds' in fechaCompra) {
            const fechaComoDate = new Date((fechaCompra as any).seconds * 1000 + (fechaCompra as any).nanoseconds / 1_000_000);
            mesCompra = fechaComoDate.toLocaleString('es', { month: 'long' });
          } else {
            const fechaComoDate = new Date(fechaCompra);
            mesCompra = fechaComoDate.toLocaleString('es', { month: 'long' });
          }
          if (mesCompra === mes && compra.pagado === true) {
            comisionAcumulada += compra.valorComision || 0;
          }
        }
      });

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
      return compraSnapshot.data()?.codigo || null;
    } catch (error) {
      console.error(ERROR_MESSAGES.GETTING_COMPRA_ERROR, error);
      throw new Error(ERROR_MESSAGES.GETTING_COMPRA_ERROR);
    }
  }

  async getComprasByRestauranteId(
    restauranteId: string,
    fechaCompra: string
  ): Promise<
    Array<{
      precioApagar: number;
      metodoElegido: string;
      fechaCompra: Timestamp;
      clienteId: string;
      nombreCliente: string;
    }>
  > {
    try {

      const additionalDay = process.env.DEV_DAY || 1;
      // Parsear la fecha desde string 'YYYY-MM-DD'
      const [year, month, day] = fechaCompra.split('-').map(Number);
      const date = new Date(year, month - 1, day + Number(additionalDay)); // Mes es 0-based
  
      // Usar el helper reusable para obtener inicio y fin del día en Ecuador
      const { start, end } = getEcuadorDayRangeFromDate(date);
  
      console.log('Fecha de consulta:', fechaCompra);
      console.log('Rango en UTC para Ecuador:', {
        start: start.toDate().toISOString(),
        end: end.toDate().toISOString(),
      });
  
      // Realizar consulta Firestore
      const comprasSnapshot = await this.collection
        .where('restauranteId', '==', restauranteId)
        .where('fechaCompra', '>=', start)
        .where('fechaCompra', '<', end)
        .select('precioApagar', 'metodoElegido', 'fechaCompra', 'clienteId', 'cantidadComprada', 'pagado', 'id', 'cancelado')
        .get();
  
      // Obtener datos adicionales (nombre del cliente)
      const compras = await Promise.all(
        comprasSnapshot.docs.map(async (doc) => {
          const data = doc.data();
          const cliente = await usuarioService.getById(data.clienteId);
  
          return {
            precioApagar: data.precioApagar,
            metodoElegido: data.metodoElegido,
            fechaCompra: data.fechaCompra,
            clienteId: data.clienteId,
            nombreCliente: cliente?.nombre || 'Cliente no encontrado',
            cantidadComprada: data.cantidadComprada,
            compraId: data.id,
            pagado: data.pagado,
            cancelado: data.cancelado,
          };
        })
      );
  
      return compras;
    } catch (error) {
      console.error('Error al obtener compras por restaurante:', error);
      throw new Error('Error al obtener las compras del restaurante');
    }
  }

  async getComprasActivasByClienteId(
    clienteId: string,
    cursor: string | null = null
  ): Promise<{
    compras: Array<{ codigo: string; fechaCompra: Timestamp; precioApagar: number; paqueteId: string }>;
    nextCursor: string | null;
  }> {
    try {
      const additionalDay = process.env.DEV_DAY || 1;
      const now = new Date();
      const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + Number(additionalDay));

      // Usar el helper reusable para obtener inicio y fin del día en Ecuador
      const { start, end } = getEcuadorDayRangeFromDate(date);

      console.log('Fecha de consulta:', date.toISOString());
      console.log('Rango en UTC para Ecuador:', {
        start: start.toDate().toISOString(),
        end: end.toDate().toISOString(),
      });

      let query = this.collection
        .where('clienteId', '==', clienteId)
        .where('confirmacionCodigo', '==', false)
        .where('pagado', '==', false)
        .where('cancelado', '==', false)
        .where('retirado', '==', false)
        .where('fechaCompra', '>=', start)
        .where('fechaCompra', '<', end)
        .orderBy('fechaCompra')
        .limit(10)
        .select('codigo', 'fechaCompra', 'precioApagar', 'paqueteId', 'metodoElegido', 'id');

      if (cursor) {
        query = query.startAfter(cursor);
      }

      const snapshot = await query.get();
      const compras = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          codigo: data.codigo,
          fechaCompra: data.fechaCompra,
          precioApagar: data.precioApagar,
          paqueteId: data.paqueteId,
          metodoElegido: data.metodoElegido,
          compraId: data.id,
        };
      });

      const nextCursor = snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1].id : null;

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
      cancelado: boolean;
    }>;
    nextCursor: string | null;
  }> {
    try {
      let query = this.collection
        .where('clienteId', '==', clienteId)
        .where('confirmacionCodigo', '==', true) 
        .where('pagado', '==', true)
        .where('retirado', '==', true)
        .orderBy('fechaCompra', 'desc')
        .limit(10)
        .select('codigo', 'fechaCompra', 'precioApagar', 'paqueteId', 'metodoElegido', 'cancelado');
  
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
          cancelado: data.cancelado,
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

  async getComprasCanceladasByClienteId(
    clienteId: string,
    cursor: string | null = null
  ): Promise<{
    compras: Array<{
      codigo: string;
      fechaCompra: Date;
      precioApagar: number;
      paqueteId: string;
      metodoElegido: string;
      cancelado: boolean;
    }>;
    nextCursor: string | null;
  }> {
    try {
      let query = this.collection
        .where('clienteId', '==', clienteId)
        .where('cancelado', '==', true)
        .orderBy('fechaCompra', 'desc')
        .limit(3)
        .select('codigo', 'fechaCompra', 'precioApagar', 'paqueteId', 'metodoElegido', 'cancelado');

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
          cancelado: data.cancelado,
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
}
