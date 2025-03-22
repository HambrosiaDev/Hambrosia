import { Request, Response, NextFunction } from 'express';
import { ComisionService } from '../services/comisionService';

const comisionService = new ComisionService();

// Get all comisiones
export const getAllComisiones = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const comisiones = await comisionService.getAll();
    res.json({ success: true, data: comisiones });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get comisiones by restaurante
export const getComisionesByRestaurante = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const comisiones = await comisionService.getByRestaurante(req.params.id);
    res.json({ success: true, data: comisiones });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get comision by ID
export const getComisionById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const comision = await comisionService.getById(req.params.id);
    if (!comision) {
      res.status(404).json({ success: false, error: 'Comisión no encontrada' });
      return;
    }
    res.json({ success: true, data: comision });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Create comision
export const createComision = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const newComision = await comisionService.create(req.body);
    res.status(201).json({ success: true, data: newComision });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Update comision
export const updateComision = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await comisionService.update(req.params.id, req.body);
    const updatedComision = await comisionService.getById(req.params.id);
    res.json({ success: true, data: updatedComision });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Delete comision
export const deleteComision = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await comisionService.delete(req.params.id);
    res.json({ success: true, message: 'Comisión eliminada correctamente' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};