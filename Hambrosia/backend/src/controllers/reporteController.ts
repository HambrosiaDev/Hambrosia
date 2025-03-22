import { Request, Response, NextFunction } from 'express';
import { ReporteService } from '../services/reporteService';
import { TipoReporte } from '../models/interfaces';

const reporteService = new ReporteService();

// Get all reportes
export const getAllReportes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const reportes = await reporteService.getAll();
    res.json({ success: true, data: reportes });
  } catch (error) {
    next(error);
  }
};

// Get reportes by tipo
export const getReportesByTipo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tipo = req.params.tipo as TipoReporte;
    const reportes = await reporteService.getByTipo(tipo);
    res.json({ success: true, data: reportes });
  } catch (error) {
    next(error);
  }
};

// Create reporte
export const createReporte = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const newReporte = await reporteService.create(req.body);
    res.status(201).json({ success: true, data: newReporte });
  } catch (error) {
    next(error);
  }
};

// Get reporte by ID
export const getReporteById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ success: false, error: 'ID inválido' });
      return;
    }

    const reporte = await reporteService.getById(id);
    if (!reporte) {
      res.status(404).json({ success: false, error: 'Reporte no encontrado' });
      return;
    }

    res.json({ success: true, data: reporte });
  } catch (error) {
    next(error);
  }
};

// Update reporte
export const updateReporte = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ success: false, error: 'ID inválido' });
      return;
    }

    const updatedReporte = await reporteService.update(id, req.body);
    res.json({ success: true, data: updatedReporte });
  } catch (error) {
    next(error);
  }
};

// Delete reporte
export const deleteReporte = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ success: false, error: 'ID inválido' });
      return;
    }

    await reporteService.delete(id);
    res.json({ success: true, message: 'Reporte eliminado correctamente' });
  } catch (error) {
    next(error);
  }
};
