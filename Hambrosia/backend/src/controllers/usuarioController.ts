import { Request, Response, NextFunction } from 'express';
import { UsuarioService } from '../services/usuarioService';

const usuarioService = new UsuarioService();

// Get all usuarios
export const getAllUsuarios = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const usuarios = await usuarioService.getAll();
    res.json({ success: true, data: usuarios });
  } catch (error) {
    next(error);
  }
};

// Get all restaurantes
export const getRestaurantes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const restaurantes = await usuarioService.getRestaurantes();
    res.json({ success: true, data: restaurantes });
  } catch (error) {
    next(error);
  }
};

// Get usuario by ID
export const getUsuarioById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const usuario = await usuarioService.getById(req.params.id);
    if (!usuario) {
      res.status(404).json({ success: false, error: 'Usuario no encontrado' });
      return;
    }
    res.json({ success: true, data: usuario });
  } catch (error) {
    next(error);
  }
};

// Create usuario
export const createUsuario = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const newUsuario = await usuarioService.create(req.body);
    res.status(201).json({ success: true, data: newUsuario });
  } catch (error) {
    next(error);
  }
};

// Update usuario
export const updateUsuario = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await usuarioService.update(req.params.id, req.body);
    const updatedUsuario = await usuarioService.getById(req.params.id);
    res.json({ success: true, data: updatedUsuario });
  } catch (error) {
    next(error);
  }
};

// Delete usuario
export const deleteUsuario = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await usuarioService.delete(req.params.id);
    res.json({ success: true, message: 'Usuario eliminado correctamente' });
  } catch (error) {
    next(error);
  }
};
