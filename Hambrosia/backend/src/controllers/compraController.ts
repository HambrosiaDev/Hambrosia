import { Request, Response } from 'express';
import { CompraService } from '../services/compraService';

const compraService = new CompraService();

// Get all compras
export const getAllCompras = async (req: Request, res: Response) => {
  try {
    const compras = await compraService.getAll();
    res.json({ success: true, data: compras });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ success: false, error: errorMessage });
  }
};

// Get compra by código
export const getCompraByCodigo = async (req: Request, res: Response) => {
  try {
    const compra = await compraService.getByCodigo(req.params.codigo);
    if (!compra) {
      res.status(404).json({ success: false, error: 'Compra no encontrada' });
      return;
    }
    res.json({ success: true, data: compra });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ success: false, error: errorMessage });
  }
};

// Get compras by usuario
export const getComprasByUsuario = async (req: Request, res: Response) => {
  try {
    const compras = await compraService.getByUsuario(req.params.id);
    res.json({ success: true, data: compras });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ success: false, error: errorMessage });
  }
};

// Get compras by paquete
export const getComprasByPaquete = async (req: Request, res: Response) => {
  try {
    const compras = await compraService.getByPaquete(req.params.id);
    res.json({ success: true, data: compras });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ success: false, error: errorMessage });
  }
};

// Get compra by ID
export const getCompraById = async (req: Request, res: Response) => {
  try {
    const compra = await compraService.getById(req.params.id);
    if (!compra) {
      res.status(404).json({ success: false, error: 'Compra no encontrada' });
      return;
    }
    res.json({ success: true, data: compra });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ success: false, error: errorMessage });
  }
};

// Create compra
export const createCompra = async (req: Request, res: Response) => {
  try {
    const newCompra = await compraService.create(req.body);
    res.status(201).json({ success: true, data: newCompra });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(400).json({ success: false, error: errorMessage });
  }
};

// Delete compra
export const deleteCompra = async (req: Request, res: Response) => {
  try {
    await compraService.delete(req.params.id);
    res.json({ success: true, message: 'Compra eliminada correctamente' });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(400).json({ success: false, error: errorMessage });
  }
};