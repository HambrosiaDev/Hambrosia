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
    const { correo, password, cedulaRUC, nombre, direccion, fechaNacimiento, rol, alergenos } = req.body;
    
    // Validar campos requeridos
    if (!correo || !password || !cedulaRUC || !nombre || !direccion || !rol) {
      res.status(400).json({ success: false, error: 'Todos los campos son obligatorios' });
      return;
    }
    
    // Convertir la fecha de nacimiento a objeto Date si está presente
    let fechaNac: Date | undefined = undefined;
    if (fechaNacimiento) {
      fechaNac = new Date(fechaNacimiento);
      if (isNaN(fechaNac.getTime())) {
        res.status(400).json({ success: false, error: 'Formato de fecha de nacimiento inválido' });
        return;
      }
    }
    
    // Validar rol
    if (![Rol.CLIENTE, Rol.RESTAURANTE].includes(rol)) {
      res.status(400).json({ success: false, error: 'Rol no válido, debe ser CLIENTE o RESTAURANTE' });
      return;
    }

    // Validar que la fecha de nacimiento esté presente para CLIENTE
    if (rol === Rol.CLIENTE && !fechaNac) {
      res.status(400).json({ success: false, error: 'La fecha de nacimiento es obligatoria para clientes' });
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
      direccion,
      fechaNac,
      rol,
      rol === Rol.RESTAURANTE ? alergenos : undefined
    );
    
    res.status(201).json({ success: true, data: newUsuario });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
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

// Incrementar strike
export const incrementarStrike = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.params.id;
    const nuevosStrikes = await usuarioService.incrementarStrike(userId);
    
    // Obtener el usuario actualizado para verificar su estado
    const usuario = await usuarioService.getById(userId);
    
    let mensaje = `Se ha incrementado el número de strikes para el usuario. Total: ${nuevosStrikes}`;
    
    // Verificar si el usuario ha sido bloqueado por strikes
    if (usuario && !usuario.activo) {
      mensaje += `. El usuario ha sido bloqueado hasta ${usuario.bloqueadoHasta?.toLocaleDateString()}.`;
    }
    
    res.json({ 
      success: true, 
      data: { 
        userId, 
        strikes: nuevosStrikes,
        activo: usuario?.activo,
        bloqueadoHasta: usuario?.bloqueadoHasta,
        mensaje 
      } 
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Registrar intento fallido de login (endpoint para el frontend)
export const registrarIntentoFallido = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { correo } = req.body;
    
    if (!correo) {
      res.status(400).json({ success: false, error: 'Correo es requerido' });
      return;
    }
    
    // Buscar usuario por correo
    const usuario = await usuarioService.getByEmail(correo);
    
    if (!usuario) {
      res.status(401).json({ success: false, error: 'Credenciales inválidas' });
      return;
    }
    
    // Registrar intento fallido
    await usuarioService.registrarIntentoFallido(usuario.id);
    
    // Verificar si el usuario ahora está bloqueado
    const estadoBloqueo = await usuarioService.verificarBloqueo(usuario.id);
    
    if (estadoBloqueo.bloqueado) {
      res.status(403).json({ success: false, error: estadoBloqueo.mensaje });
    } else {
      res.status(401).json({ success: false, error: 'Credenciales inválidas' });
    }
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};