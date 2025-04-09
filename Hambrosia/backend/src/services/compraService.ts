import { db } from '../config/firebase';
import { Compra } from '../models/interfaces';
import { converterFactory } from '../utils/converterFactory';
import { PaqueteService } from "../services/paqueteService";
import { generarCodigoAleatorioSeguro, hashCedula } from '../utils/HELPER';


export class CompraService {
  private collection = db.collection('compras').withConverter(converterFactory<Compra>());
  
  async crearCompra(paqueteId: string, compra: Compra): Promise<Compra> {
    try {
      const paquete = await PaqueteService.obtenerPaquetePorId(paqueteId); // Cambia esto según tu implementación de obtenerPaquetePorId

      if (!paquete) {
        throw new Error('Paquete no encontrado');
      }

      const codigo = generarCodigoAleatorioSeguro()
      const nuevoCodigo = hashCedula(codigo)
      compra.codigo = nuevoCodigo

      // Guardar la compra en Firestore
      const docRef = await this.collection.add(compra);
      const nuevaCompra = { ...compra, id: docRef.id };

      await PaqueteService.restarUnidadesPaquete(paqueteId, compra.cantidadComprada);

      return nuevaCompra;
    } catch (error) {
      console.error('Error creando la compra:', error);
      throw error;
    }
  }

  
}