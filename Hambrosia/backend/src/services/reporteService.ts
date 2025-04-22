import { db } from '../config/firebase';
import { Reporte, Compra, Usuario } from '../models/interfaces';
import { converterFactory } from '../utils/converterFactory';
import { CompraService } from './compraService';
import { UsuarioService } from './usuarioService';
import { PaqueteService } from './paqueteService';

const compraService = new CompraService();
const usuarioService = new UsuarioService();
const paqueteService = new PaqueteService();
// Centralized error messages for ReporteService
const ERROR_MESSAGES = {
  REPORTE_NOT_FOUND: 'Reporte no encontrado',
  CREATING_REPORTE_ERROR: 'Error creando el reporte',
  GETTING_REPORTE_ERROR: 'Error obteniendo el reporte',
  COMPRA_NOT_FOUND: 'Compra no encontrada',
  PAQUETE_NOT_FOUND: 'Paquete no encontrado',
};

export class ReporteService {
  private collection = db.collection('reportes').withConverter(converterFactory<Reporte>());

  // Helper method to get a reporteRef
  private reporteRef(reporteId: string) {
    return this.collection.doc(reporteId);
  }

  async crearReporte(compraId: string, descripcion: string): Promise<Reporte> {
    try {
      const compra = await compraService.getCompraById(compraId);
      if (!compra) {
        throw new Error(ERROR_MESSAGES.COMPRA_NOT_FOUND);
      }

      const usuario: Usuario | null = await usuarioService.getById(compra.restauranteId);
      if (!usuario) {
        throw new Error('Usuario no encontrado');
      }
      const paquete = await paqueteService.obtenerPaquetePorId(compra.paqueteId);
      if (!paquete) {
        throw new Error(ERROR_MESSAGES.PAQUETE_NOT_FOUND);
      }

      const reporteData: Reporte = {
        compraId: compraId,
        descripcion,
        nombreRestaurante: usuario.nombre,
        precio: paquete.precio ? paquete.precio: 0,
        precioDescuento: paquete.precioDescuento ? paquete.precioDescuento: 0,
        comision: compra.valorComision ? compra.valorComision: 0,
        fechaCompra: compra.fechaCompra ? compra.fechaCompra : new Date(),
        correo: usuario.correo,
        cedulaRUC: usuario.cedulaRUC,
      };

      const docRef = await this.collection.add(reporteData);
      const nuevoReporte = { ...reporteData, id: docRef.id };

      return nuevoReporte;
    } catch (error) {
      console.error(ERROR_MESSAGES.CREATING_REPORTE_ERROR, error);
      throw error; // Let the controller handle the error
    }
  }

  async getReporteById(reporteId: string): Promise<Reporte | null> {
    try {
      const reporteSnapshot = await this.reporteRef(reporteId).get();
      if (!reporteSnapshot.exists) {
        return null;
      }
      return { id: reporteSnapshot.id, ...reporteSnapshot.data() } as Reporte;
    } catch (error) {
      console.error(ERROR_MESSAGES.GETTING_REPORTE_ERROR, error);
      throw error; // Let the controller handle the error
    }
  }
}

export const reporteService = new ReporteService();