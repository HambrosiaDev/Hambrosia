import { Request, Response, NextFunction } from 'express';
import { UsuarioService } from '../services/usuarioService';
import { Rol, Alergeno } from '../models/interfaces';

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

// Register new user with authentication
export const registerUsuario = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { correo, password, cedulaRUC, nombre, fechaNacimiento, rol, alergenos } = req.body;
    
    // Validar campos requeridos
    if (!correo || !password || !cedulaRUC || !nombre || !fechaNacimiento || !rol) {
      res.status(400).json({ success: false, error: 'Todos los campos son obligatorios' });
      return;
    }
    
    // Convertir la fecha de nacimiento a objeto Date
    const fechaNac = new Date(fechaNacimiento);
    if (isNaN(fechaNac.getTime())) {
      res.status(400).json({ success: false, error: 'Formato de fecha de nacimiento inválido' });
      return;
    }
    
    // Validar rol
    if (![Rol.CLIENTE, Rol.RESTAURANTE].includes(rol)) {
      res.status(400).json({ success: false, error: 'Rol no válido, debe ser CLIENTE o RESTAURANTE' });
      return;
    }
    
    // Validar alergenos si es restaurante
    if (rol === Rol.RESTAURANTE) {
      if (!alergenos || !Array.isArray(alergenos) || alergenos.length === 0) {
        res.status(400).json({ 
          success: false, 
          error: 'Debe seleccionar al menos un alérgeno para el restaurante' 
        });
        return;
      }
      
      // Verificar que los alérgenos son válidos
      const alergenosValidos = alergenos.every(a => Object.values(Alergeno).includes(a));
      if (!alergenosValidos) {
        res.status(400).json({ success: false, error: 'Uno o más alérgenos no son válidos' });
        return;
      }
    }
    
    const newUsuario = await usuarioService.register(
      correo,
      password,
      cedulaRUC,
      nombre,
      fechaNac,
      rol,
      rol === Rol.RESTAURANTE ? alergenos : undefined
    );
    
    res.status(201).json({ success: true, data: newUsuario });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Verificar credenciales - Esta es una función auxiliar para sistemas backend
// En un caso real, la autenticación se haría en el cliente con Firebase Auth
export const verificarCredenciales = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { correo, password } = req.body;
    
    if (!correo || !password) {
      res.status(400).json({ success: false, error: 'Correo y contraseña son requeridos' });
      return;
    }
    
    const usuario = await usuarioService.verificarCredenciales(correo, password);
    res.json({ success: true, data: usuario });
  } catch (error: any) {
    res.status(401).json({ success: false, error: error.message });
  }
};

// Create usuario (admin function)
export const createUsuario = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const newUsuario = await usuarioService.create(req.body);
    res.status(201).json({ success: true, data: newUsuario });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
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

// Get perfil del usuario actual (usuario autenticado)
export const getPerfilUsuario = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Este endpoint asume que el middleware de autenticación ya ha sido ejecutado
    // y ha añadido el usuario al objeto request
    if (!req.usuario) {
      res.status(401).json({ success: false, error: 'No autenticado' });
      return;
    }
    
    res.json({ success: true, data: req.usuario });
  } catch (error) {
    next(error);
  }
};