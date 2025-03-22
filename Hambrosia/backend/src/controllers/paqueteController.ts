import { Request, Response } from 'express';
import { PaqueteService } from '../services/paqueteService';
import { RequestHandler } from 'express';

const paqueteService = new PaqueteService();

// Get all paquetes
export const getAllPaquetes = async (req: Request, res: Response) => {
  try {
    const paquetes = await paqueteService.getAll();
    res.json({ success: true, data: paquetes });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({ success: false, error: errorMessage });
  }
};

// Get visible paquetes
export const getVisiblePaquetes = async (req: Request, res: Response) => {
  try {
    const paquetes = await paqueteService.getVisibles();
    res.json({ success: true, data: paquetes });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({ success: false, error: errorMessage });
  }
};

// Get paquetes by restaurante
export const getPaquetesByRestaurante = async (req: Request, res: Response) => {
  try {
    const paquetes = await paqueteService.getByRestaurante(req.params.id);
    res.json({ success: true, data: paquetes });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({ success: false, error: errorMessage });
  }
};

// Get paquete by ID
export const getPaqueteById: RequestHandler = async (req, res) => {
    try {
      const { id } = req.params;
  
      // Validar que el ID sea un string no vacío
      if (!id || typeof id !== 'string') {
        res.status(400).json({ success: false, error: 'ID de paquete inválido' });
        return;
      }
  
      const paquete = await paqueteService.getById(id);
  
      if (!paquete) {
        res.status(404).json({ success: false, error: 'Paquete no encontrado' });
        return;
      }
  
      res.json({ success: true, data: paquete });
  
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error interno del servidor';
      res.status(500).json({ success: false, error: errorMessage });
    }
  };

// Create paquete
export const createPaquete = async (req: Request, res: Response) => {
  try {
    const newPaquete = await paqueteService.create(req.body);
    res.status(201).json({ success: true, data: newPaquete });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(400).json({ success: false, error: errorMessage });
  }
};

// Update paquete
export const updatePaquete = async (req: Request, res: Response) => {
  try {
    await paqueteService.update(req.params.id, req.body);
    const updatedPaquete = await paqueteService.getById(req.params.id);
    res.json({ success: true, data: updatedPaquete });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(400).json({ success: false, error: errorMessage });
  }
};

// Delete paquete
export const deletePaquete = async (req: Request, res: Response) => {
  try {
    await paqueteService.delete(req.params.id);
    res.json({ success: true, message: 'Paquete eliminado correctamente' });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(400).json({ success: false, error: errorMessage });
  }
};