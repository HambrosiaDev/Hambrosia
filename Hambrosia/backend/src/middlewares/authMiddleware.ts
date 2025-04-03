import { Request, Response, NextFunction } from 'express';
import { auth } from '../config/firebase'; // Usamos el auth exportado de tu configuración
import { UsuarioService } from '../services/usuarioService';

const usuarioService = new UsuarioService();

// Definir una interfaz extendida para Request para incluir el usuario
declare global {
  namespace Express {
    interface Request {
      usuario?: any;
      firebaseUser?: any;
    }
  }
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, error: 'No autenticado' });
      return;
    }
    
    const token = authHeader.split('Bearer ')[1];
    
    try {
      // Verificar el token con Firebase Admin
      const decodedToken = await auth.verifyIdToken(token);
      req.firebaseUser = decodedToken;
      
      // Buscar el usuario en nuestra base de datos
      const usuario = await usuarioService.getByField('firebaseUid', decodedToken.uid);
      
      if (!usuario) {
        res.status(404).json({ success: false, error: 'Usuario no encontrado' });
        return;
      }
      
      // Adjuntar el usuario al request para uso en controladores
      req.usuario = usuario;
      next();
    } catch (error) {
      res.status(401).json({ success: false, error: 'Token inválido' });
    }
  } catch (error) {
    next(error);
  }
};

// Middleware para verificar roles específicos
export const requireRoles = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.usuario) {
      res.status(401).json({ success: false, error: 'No autenticado' });
      return;
    }
    
    if (!roles.includes(req.usuario.rol)) {
      res.status(403).json({ success: false, error: 'No autorizado para esta operación' });
      return;
    }
    
    next();
  };
};