import { Request, Response } from 'express';
import { reporteService } from '../services/reporteService';


export class ReporteController {
  async crearReporte(req: Request, res: Response): Promise<void> {
    try {
      const { compraId } = req.params;
      const { descripcion } = req.body;

      // Validate required fields
      if (!compraId || !descripcion) {
        res.status(400).json({ error: 'compraId y descripcion son obligatorios' });
        return;
      }
      const nuevoReporte = await reporteService.crearReporte(compraId, descripcion);

      // Return the created report
      res.status(201).json(nuevoReporte);
    } catch (error) {
      console.error('Error al crear el reporte:', error);
      if ((error as Error).message === 'Compra no encontrada') {
        res.status(404).json({ error: 'Compra no encontrada' });
      } else {
        res.status(500).json({ error: 'Error interno del servidor' });
      }
    }
  }

  async getReporteById(req: Request, res: Response): Promise<void> {
    try {
      const { reporteId } = req.params;

      // Validate required fields
      if (!reporteId) {
        res.status(400).json({ error: 'reporteId es obligatorio' });
        return;
      }

      // Call the service to fetch the report
      const reporte = await reporteService.getReporteById(reporteId);

      // Check if the report exists
      if (!reporte) {
        res.status(404).json({ error: 'Reporte no encontrado' });
        return;
      }

      // Return the report
      res.status(200).json(reporte);
    } catch (error) {
      console.error('Error al obtener el reporte:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
  
}

export const reporteController = new ReporteController();