import { db } from '../config/firebase';
import { Compra } from '../models/interfaces';
import { converterFactory } from '../utils/converterFactory';
import { PaqueteService } from './paqueteService';
import { generarCodigoAleatorioSeguro, hashCedula } from '../utils/HELPER';

export class CompraService {
  private collection = db.collection('compras').withConverter(converterFactory<Compra>());

  async crearCompra(paqueteId: string, compra: Compra): Promise<Compra> {
    try {
      const docRef = await this.collection.add(compra);
      const nuevaCompra = { ...compra, id: docRef.id };

      // Restar las unidades del paquete
      await PaqueteService.restarUnidadesPaquete(paqueteId, compra.cantidadComprada);

      return nuevaCompra;
    } catch (error) {
      console.error('Error creando la compra:', error);
      throw error;
    }
  }

  /**
   * Obtiene una compra por su ID.
   */
  async getCompraById(compraId: string): Promise<Compra | null> {
    try {
      const compraRef = this.collection.doc(compraId);
      const compraSnapshot = await compraRef.get();

      if (!compraSnapshot.exists) {
        return null;
      }

      return { id: compraSnapshot.id, ...compraSnapshot.data() } as Compra;
    } catch (error) {
      console.error('Error obteniendo la compra por ID:', error);
      throw error;
    }
  }

  /**
   * Confirma una compra.
   */
  async confirmarCompra(compraId: string, datosActualizados: Partial<Compra>): Promise<Compra> {
    try {
      const compraRef = this.collection.doc(compraId);
      await compraRef.update(datosActualizados);

      const compraSnapshot = await compraRef.get();

      if (!compraSnapshot.exists) {
        throw new Error('Compra no encontrada');
      }

      return { id: compraSnapshot.id, ...compraSnapshot.data() }as Compra;
    } catch (error) {
      console.error('Error confirmando la compra:', error);
      throw error;
    }
  }

  async cambiarBooleano(variable: string, value: boolean): Promise<void> {
    try {
      // Referencia al documento en Firestore
      const compraRef = this.collection.doc(variable);
      const compraSnapshot = await compraRef.get();
  
      // Verificar si el documento existe
      if (!compraSnapshot.exists) {
        throw new Error(`El documento con ID '${variable}' no fue encontrado.`);
      }
  
      // Actualizar el campo específico con el valor booleano
      await compraRef.update({ variable: value });
  
      console.log(`El campo 'booleanField' del documento '${variable}' ha sido actualizado a ${value}.`);
    } catch (error) {
      console.error('Error cambiando el booleano:', error);
      throw error; // Propagar el error para que pueda ser manejado por el llamador
    }
  }

  async buscarCodigoById(compraId: string): Promise<Compra> {
    try {
      const compraRef = this.collection.doc(compraId);
      const compraSnapshot = await compraRef.get();

      if (!compraSnapshot.exists) {
        throw new Error('Compra no encontrada');
      }

      return compraSnapshot.data() as Compra;
    } catch (error) {
      console.error('Error buscando la compra por ID:', error);
      throw error;
    }
  }
}