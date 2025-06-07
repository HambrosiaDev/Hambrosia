import { sendEmail } from '../config/emailConfig';
import { db } from '../config/firebase';
import { Reporte } from '../models/interfaces';
import { converterFactory } from '../utils/converterFactory';
import { CompraService } from './compraService';
import { PaqueteService } from './paqueteService';
import { UsuarioService } from './usuarioService';

// Centralized error messages for ReporteService
const ERROR_MESSAGES = {
  REPORTE_NOT_FOUND: 'Reporte no encontrado',
  CREATING_REPORTE_ERROR: 'Error creando el reporte',
  GETTING_REPORTE_ERROR: 'Error obteniendo el reporte',
  COMPRA_NOT_FOUND: 'Compra no encontrada',
  PAQUETE_NOT_FOUND: 'Paquete no encontrado',
  CLIENTE_NOT_FOUND: 'Cliente no encontrado',
  RESTAURANTE_NOT_FOUND: 'Restaurante no encontrado',
};

export class ReporteService {
  private collection = db.collection('reportes').withConverter(converterFactory<Reporte>());

  constructor(
    private compraService: CompraService = new CompraService(),
    private usuarioService: UsuarioService = new UsuarioService(),
    private paqueteService: PaqueteService = new PaqueteService()
  ) {}

  // Helper method to get a reporteRef
  private reporteRef(reporteId: string) {
    return this.collection.doc(reporteId);
  }

  private async enviarReportePorCorreo(reporte: Reporte, tipo: 'CLIENTE' | 'RESTAURANTE'): Promise<void> {
    const emailHtml = `
      <h2>Nuevo Reporte de ${tipo === 'CLIENTE' ? 'Cliente a Restaurante' : 'Restaurante a Cliente'}</h2>
      <p><strong>ID de Compra:</strong> ${reporte.compraId}</p>
      <p><strong>Descripción:</strong> ${reporte.descripcion}</p>
      <p><strong>Restaurante:</strong> ${reporte.nombreRestaurante}</p>
      <p><strong>Precio Original:</strong> $${reporte.precio}</p>
      <p><strong>Precio con Descuento:</strong> $${reporte.precioDescuento}</p>
      <p><strong>Comisión:</strong> $${reporte.comision}</p>
      <p><strong>Fecha de Compra:</strong> ${reporte.fechaCompra.toLocaleString()}</p>
      <p><strong>Correo del Restaurante:</strong> ${reporte.correo}</p>
      <p><strong>Cédula/RUC:</strong> ${reporte.cedulaRUC}</p>
    `;

    await sendEmail(
      process.env.EMAIL_CLIENT_SUPPORT || '',
      `Nuevo Reporte de ${tipo === 'CLIENTE' ? 'CLIENTE' : 'RESTAURANTE'} - Compra ${reporte.compraId}`,
      emailHtml
    );
  }

  async reporteClienteToRestaurante(compraId: string, descripcion: string): Promise<Reporte> {
    try {
      const compra = await this.compraService.getCompraById(compraId);
      if (!compra) {
        throw new Error(ERROR_MESSAGES.COMPRA_NOT_FOUND);
      }

      const restaurante = await this.usuarioService.getById(compra.restauranteId);
      if (!restaurante) {
        throw new Error(ERROR_MESSAGES.RESTAURANTE_NOT_FOUND);
      }

      const paquete = await this.paqueteService.obtenerPaquetePorId(compra.paqueteId);
      if (!paquete) {
        throw new Error(ERROR_MESSAGES.PAQUETE_NOT_FOUND);
      }

      const reporteData: Reporte = {
        id: compraId,
        compraId: compraId,
        descripcion,
        nombreRestaurante: restaurante.nombre,
        precio: paquete.precio || 0,
        precioDescuento: paquete.precioDescuento || 0,
        comision: compra.valorComision || 0,
        fechaCompra: compra.fechaCompra ? compra.fechaCompra.toDate() : new Date(),
        correo: restaurante.correo,
        cedulaRUC: restaurante.cedulaRUC,
        tipoReporte: 'cliente_to_restaurante'
      };

      await this.collection.doc(compraId).set(reporteData);
      await this.enviarReportePorCorreo(reporteData, 'CLIENTE');

      return reporteData;
    } catch (error) {
      console.error(ERROR_MESSAGES.CREATING_REPORTE_ERROR, error);
      throw error;
    }
  }

  async reporteRestauranteToCliente(compraId: string, descripcion: string): Promise<Reporte> {
    try {
      const compra = await this.compraService.getCompraById(compraId);
      if (!compra) {
        throw new Error(ERROR_MESSAGES.COMPRA_NOT_FOUND);
      }

      const restaurante = await this.usuarioService.getById(compra.restauranteId);
      if (!restaurante) {
        throw new Error(ERROR_MESSAGES.RESTAURANTE_NOT_FOUND);
      }

      const paquete = await this.paqueteService.obtenerPaquetePorId(compra.paqueteId);
      if (!paquete) {
        throw new Error(ERROR_MESSAGES.PAQUETE_NOT_FOUND);
      }

      const reporteData: Reporte = {
        id: compraId,
        compraId: compraId,
        descripcion,
        nombreRestaurante: restaurante.nombre,
        precio: paquete.precio || 0,
        precioDescuento: paquete.precioDescuento || 0,
        comision: compra.valorComision || 0,
        fechaCompra: compra.fechaCompra ? compra.fechaCompra.toDate() : new Date(),
        correo: restaurante.correo,
        cedulaRUC: restaurante.cedulaRUC,
        tipoReporte: 'restaurante_to_cliente'
      };

      await this.collection.doc(compraId).set(reporteData);
      await this.enviarReportePorCorreo(reporteData, 'RESTAURANTE');

      return reporteData;
    } catch (error) {
      console.error(ERROR_MESSAGES.CREATING_REPORTE_ERROR, error);
      throw error;
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
      throw error;
    }
  }
}

export const reporteService = new ReporteService();