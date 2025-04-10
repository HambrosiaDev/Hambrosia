import { db } from '../config/firebase';
import { Compra } from '../models/interfaces';
import { converterFactory } from '../utils/converterFactory';
import { paqueteService } from './paqueteService';


// Centralized error messages
const ERROR_MESSAGES = {
  COMPRA_NOT_FOUND: 'Compra no encontrada',
  CREATING_COMPRA_ERROR: 'Error creando la compra',
  CONFIRMING_COMPRA_ERROR: 'Error confirmando la compra',
  UPDATING_COMPRA_ERROR: 'Error actualizando la compra',
  GETTING_COMPRA_ERROR: 'Error obteniendo la compra',
};

export class CompraService {
  private collection = db.collection('compras').withConverter(converterFactory<Compra>());

  // Helper method to get a compraRef
  private compraRef(compraId: string) {
    return this.collection.doc(compraId);
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
}
