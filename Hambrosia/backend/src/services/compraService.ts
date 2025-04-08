import { db } from '../config/firebase';
import { Compra } from '../models/interfaces';
import { converterFactory } from '../utils/converterFactory';
import { PaqueteService } from "../services/paqueteService";

export class CompraService {
  private collection = db.collection('compras').withConverter(converterFactory<Compra>());
  
  async crearCompra(compra: Compra): Promise<Compra> {
    try {
      // restarUnidadesPaquete
      const paqueteId = compra.paqueteId;
      const unidadesCompradas = compra.cantidadComprada;
      const paquete = await PaqueteService.restarUnidadesPaquete(paqueteId, unidadesCompradas);
      // Crear la compra en Firestore
      const docRef = await this.collection.add(compra);
      const newCompra = { ...compra, id: docRef.id };
      return newCompra;
    } catch (error) {
      console.error('Error creando la compra:', error);
      throw error;
    }
  }

  
}