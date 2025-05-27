import { Request, Response } from 'express';
import { reporteService } from '../services/reporteService';

export class ReporteController {
  async reporteClienteToRestaurante(req: Request, res: Response): Promise<void> {
    try {
      const { compraId } = req.params;
      const { descripcion } = req.body;

      if (!compraId || !descripcion) {
        res.status(400).json({ error: 'compraId y descripcion son obligatorios' });
        return;
      }

      const nuevoReporte = await reporteService.reporteClienteToRestaurante(compraId, descripcion);
      res.status(201).json({
        success: true,
        data: nuevoReporte,
        message: 'Reporte creado y notificación enviada al equipo de soporte'
      });
    } catch (error) {
      console.error('Error al crear el reporte del cliente:', error);
      if ((error as Error).message === 'Compra no encontrada') {
        res.status(404).json({ success: false, error: 'Compra no encontrada' });
      } else if ((error as Error).message === 'Error al enviar el correo electrónico') {
        res.status(500).json({ 
          success: false, 
          error: 'El reporte se creó pero hubo un problema al enviar la notificación',
          data: { reporteCreado: true, emailEnviado: false }
        });
      } else {
        res.status(500).json({ success: false, error: 'Error interno del servidor' });
      }
    }
  }

  async reporteRestauranteToCliente(req: Request, res: Response): Promise<void> {
    try {
      const { compraId } = req.params;
      const { descripcion } = req.body;

      if (!compraId || !descripcion) {
        res.status(400).json({ error: 'compraId y descripcion son obligatorios' });
        return;
      }

      const nuevoReporte = await reporteService.reporteRestauranteToCliente(compraId, descripcion);
      res.status(201).json({
        success: true,
        data: nuevoReporte,
        message: 'Reporte creado y notificación enviada al equipo de soporte'
      });
    } catch (error) {
      console.error('Error al crear el reporte del restaurante:', error);
      if ((error as Error).message === 'Compra no encontrada') {
        res.status(404).json({ success: false, error: 'Compra no encontrada' });
      } else if ((error as Error).message === 'Error al enviar el correo electrónico') {
        res.status(500).json({ 
          success: false, 
          error: 'El reporte se creó pero hubo un problema al enviar la notificación',
          data: { reporteCreado: true, emailEnviado: false }
        });
      } else {
        res.status(500).json({ success: false, error: 'Error interno del servidor' });
      }
    }
  }

  async getReporteById(req: Request, res: Response): Promise<void> {
    try {
      const { reporteId } = req.params;

      if (!reporteId) {
        res.status(400).json({ error: 'reporteId es obligatorio' });
        return;
      }

      const reporte = await reporteService.getReporteById(reporteId);

      if (!reporte) {
        res.status(404).json({ error: 'Reporte no encontrado' });
        return;
      }

      res.status(200).json(reporte);
    } catch (error) {
      console.error('Error al obtener el reporte:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
}

export const reporteController = new ReporteController();