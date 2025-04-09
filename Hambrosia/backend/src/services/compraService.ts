import { db } from '../config/firebase';
import { Compra } from '../models/interfaces';
import { converterFactory } from '../utils/converterFactory';
import { PaqueteService } from './paqueteService';
import { generarCodigoAleatorioSeguro, hashCedula } from '../utils/HELPER';

export class CompraService {
  private collection = db.collection('compras').withConverter(converterFactory<Compra>());

  async crearCompra(paqueteId: string, compra: Compra): Promise<Compra> {
    try {
      // Verificar si el paquete existe
      const paquete = await PaqueteService.obtenerPaquetePorId(paqueteId);
      if (!paquete) {
        throw new Error('Paquete no encontrado');
      }

      // Verificar si hay suficientes unidades disponibles
      if (paquete.unidades < compra.cantidadComprada) {
        throw new Error('No hay suficientes unidades disponibles en el paquete');
      }

      // Generar un código único para la compra
      let codigoExiste = true;
      let nuevoCodigo = '';
      while (codigoExiste) {
        const codigo = generarCodigoAleatorioSeguro();
        nuevoCodigo = hashCedula(codigo);
        const compraExistente = await this.collection.where('codigo', '==', nuevoCodigo).get();
        if (compraExistente.empty) {
          codigoExiste = false;
        }
      }

      // Asignar el código a la compra
      compra.codigo = nuevoCodigo;

      // Guardar la compra en Firestore
      const docRef = await this.collection.add(compra);
      const nuevaCompra = { ...compra, id: docRef.id };

      // Restar unidades del paquete
      await PaqueteService.restarUnidadesPaquete(paqueteId, compra.cantidadComprada);

      return nuevaCompra;
    } catch (error) {
      console.error('Error creando la compra:', error);
      throw error;
    }
  }
}