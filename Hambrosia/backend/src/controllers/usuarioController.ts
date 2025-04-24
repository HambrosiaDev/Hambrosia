import { Request, Response, NextFunction } from 'express';
import { UsuarioService } from '../services/usuarioService';
import { Rol, Alergeno } from '../models/interfaces';
import { ValidacionCedulaRuc } from '../utils/HELPER';
import { hashCedula } from '../utils/HELPER';


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
    const id = req.params.id;
    
    if (!id) {
      res.status(400).json({ success: false, error: 'ID es requerido' });
      return;
    }
    
    const hashedId = hashCedula(id);
    const usuario = await usuarioService.getById(hashedId);
    
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
      const { correo, cedulaRUC, nombre, ciudad, fechaNacimiento, rol, alergenos } = req.body;

      // Validar campos requeridos
      if (!correo || !cedulaRUC || !nombre || !rol || !ciudad) {
          res.status(400).json({ success: false, error: 'Todos los campos son obligatorios' });
          return;
      }

      // Validar que ciudad sea un string no vacío
      if (typeof ciudad !== 'string' || ciudad.trim() === '') {
          res.status(400).json({ success: false, error: 'La ciudad debe ser un string válido' });
          return;
      }

      // Validar rol
      if (![Rol.CLIENTE, Rol.RESTAURANTE].includes(rol)) {
          res.status(400).json({ success: false, error: 'Rol no válido, debe ser CLIENTE o RESTAURANTE' });
          return;
      }

      // Validar que la fecha de nacimiento esté presente para CLIENTE
      if (rol === Rol.CLIENTE && !fechaNacimiento) {
          res.status(400).json({ success: false, error: 'La fecha de nacimiento es obligatoria para clientes' });
          return;
      }

      // Validar alergenos si es restaurante
      if (rol === Rol.RESTAURANTE) {
          // Permitir un array vacío o un array con valores válidos
          if (!Array.isArray(alergenos)) {
              res.status(400).json({
                  success: false,
                  error: 'Los alérgenos deben ser un array',
              });
              return;
          }

          // Verificar que los alérgenos son válidos (si no está vacío)
          if (alergenos.length > 0) {
              const alergenosValidos = alergenos.every((a) => Object.values(Alergeno).includes(a));
              if (!alergenosValidos) {
                  res.status(400).json({ success: false, error: 'Uno o más alérgenos no son válidos' });
                  return;
              }
          }
      }

      // Validar el formato de la cédula/RUC
      if (!ValidacionCedulaRuc.esIdentificacionValida(cedulaRUC)) {
          res.status(400).json({ success: false, error: 'La Cédula/RUC no es válida' });
          return;
      }

      // Verificar si ya existe un usuario con el mismo correo
      const existeCorreo = await usuarioService.getByEmail(correo);
      if (existeCorreo) {
          res.status(400).json({ success: false, error: 'El correo ya está registrado' });
          return;
      }

      // Verificar si ya existe un usuario con la misma cédula/RUC
      const existeCedula = await usuarioService.getByCedulaRUC(cedulaRUC);
      if (existeCedula) {
          res.status(400).json({ success: false, error: 'La Cédula/RUC ya está registrada' });
          return;
      }

      try {
          // Registrar el usuario utilizando el servicio
          const newUsuario = await usuarioService.register(
            correo,          // email
            cedulaRUC,       // cedulaRUC
            nombre,          // nombre
            ciudad,          // ciudad
            rol,             // rol
            req.body.firebaseUid, // firebaseUid (asegúrate de usar el valor correcto del payload)
            fechaNacimiento, // fechaNacimiento
            alergenos
        );

          res.status(201).json({ success: true, data: newUsuario });
      } catch (error: any) {
          // Manejar errores específicos de Firebase
          if (error.code === 'auth/email-already-in-use') {
              res.status(400).json({ success: false, error: 'El correo electrónico ya está en uso' });
          } else {
              res.status(400).json({ success: false, error: error.message });
          }
      }
  } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
  }
};

// Create usuario (admin function)
// export const createUsuario = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//   try {
//     const { correo, cedulaRUC, nombre, direccion, ciudad, fechaNacimiento, rol, alergenos } = req.body;
    
//     // Validar campos requeridos
//     if (!correo || !cedulaRUC || !nombre || !direccion || !rol || !ciudad) {
//       res.status(400).json({ success: false, error: 'Todos los campos son obligatorios' });
//       return;
//     }
    
//     // Validar el formato de la cédula/RUC
//     if (!ValidacionCedulaRuc.esIdentificacionValida(cedulaRUC)) {
//       res.status(400).json({ success: false, error: 'La Cédula/RUC no es válida' });
//       return;
//     }
    
//     // Verificar si ya existe un usuario con el mismo correo
//     const existeCorreo = await usuarioService.getByEmail(correo);
//     if (existeCorreo) {
//       res.status(400).json({ success: false, error: 'El correo ya está registrado' });
//       return;
//     }
    
//     // Verificar si ya existe un usuario con la misma cédula/RUC
//     const existeCedula = await usuarioService.getByCedulaRUC(cedulaRUC);
//     if (existeCedula) {
//       res.status(400).json({ success: false, error: 'La Cédula/RUC ya está registrada' });
//       return;
//     }
    
//     const newUsuario = await usuarioService.createUsuario(req.body);
//     res.status(201).json({ success: true, data: newUsuario });
//   } catch (error: any) {
//     res.status(400).json({ success: false, error: error.message });
//   }
// };

// Update usuario
export const updateUsuario = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id;
    
    if (!id) {
      res.status(400).json({ success: false, error: 'ID es requerido' });
      return;
    }
    
    // Verificar si el usuario existe
    const existeUsuario = await usuarioService.getById(id);
    if (!existeUsuario) {
      res.status(404).json({ success: false, error: 'Usuario no encontrado' });
      return;
    }
    
    await usuarioService.update(id, req.body);
    const updatedUsuario = await usuarioService.getById(id);
    res.json({ success: true, data: updatedUsuario });
  } catch (error) {
    next(error);
  }
};

// Delete usuario
export const deleteUsuario = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id;
    const hashedId = hashCedula(id);
    if (!id) {
      res.status(400).json({ success: false, error: 'ID es requerido' });
      return;
    }
    
    // Verificar si el usuario existe
    const existeUsuario = await usuarioService.getById(hashedId);
    if (!existeUsuario) {
      res.status(404).json({ success: false, error: 'Usuario no encontrado' });
      return;
    }
    
    await usuarioService.delete(hashedId);
    res.json({ success: true, message: 'Usuario eliminado correctamente' });
  } catch (error) {
    next(error);
  }
};

// Incrementar strike
export const incrementarStrike = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.id;
    const hashedId = hashCedula(userId);
    if (!userId) {
      res.status(400).json({ success: false, error: 'ID de usuario es requerido' });
      return;
    }
    
    // Verificar si el usuario existe
    const usuario = await usuarioService.getById(hashedId);
    if (!usuario) {
      res.status(404).json({ success: false, error: 'Usuario no encontrado' });
      return;
    }
    
    // Verificar que sea un cliente
    if (usuario.rol !== Rol.CLIENTE) {
      res.status(400).json({ success: false, error: 'Solo se pueden asignar strikes a usuarios con rol CLIENTE' });
      return;
    }
    
    // Incrementar strike
    const nuevosStrikes = await usuarioService.incrementarStrike(hashedId);
    
    // Obtener el usuario actualizado para verificar su estado
    const usuarioActualizado = await usuarioService.getById(userId);
    
    let mensaje = `Se ha incrementado el número de strikes para el usuario. Total: ${nuevosStrikes}`;
    
    // Verificar si el usuario ha sido bloqueado por strikes
    if (usuarioActualizado && !usuarioActualizado.activo) {
      mensaje += `. El usuario ha sido bloqueado hasta ${usuarioActualizado.bloqueadoHasta?.toLocaleDateString()}.`;
    }
    
    res.json({ 
      success: true, 
      data: { 
        userId, 
        strikes: nuevosStrikes,
        activo: usuarioActualizado?.activo,
        bloqueadoHasta: usuarioActualizado?.bloqueadoHasta,
        mensaje 
      } 
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Registrar intento fallido de login por correo
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
    const intentosFallidos = (usuario.intentosFallidos || 0) + 1;
    
    // Si excede el límite de intentos fallidos (3), bloquear la cuenta
    if (intentosFallidos >= 3) {
      const duracionBloqueo = 24 * 10000; // 24 horas
      const motivoBloqueo = 'Su cuenta ha sido bloqueada por exceder el límite de intentos fallidos de inicio de sesión. Por favor, restablezca su contraseña para desbloquear su cuenta.';
      
      // Bloquear usuario
      await usuarioService.bloquearUsuario(usuario.id, duracionBloqueo, motivoBloqueo);
      
      // Enviar notificación
      await usuarioService.enviarNotificacion(usuario.id, motivoBloqueo);
      
      res.status(403).json({ success: false, error: motivoBloqueo });
    } else {
      res.status(200).json({ success: true, error: 'Intento Fallido Registrado' });
    }
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Resetear intentos fallidos usando correo
export const resetearIntentosFallidos = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { correo } = req.body;

    if (!correo) {
      res.status(400).json({ success: false, error: 'Correo es requerido' });
      return;
    }

    const usuario = await usuarioService.getByEmail(correo);

    if (!usuario) {
      res.status(404).json({ success: false, error: 'Usuario no encontrado' });
      return;
    }

    await usuarioService.resetearIntentosFallidos(usuario.id);

    const usuarioActualizado = await usuarioService.getById(usuario.id);

    res.json({
      success: true,
      data: {
        intentosFallidos: usuarioActualizado?.intentosFallidos || 0,
        activo: usuarioActualizado?.activo,
      },
      message: 'Intentos fallidos reseteados exitosamente',
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Verificar si el usuario está bloqueado
export const verificarBloqueo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id;
    
    if (!id) {
      res.status(400).json({ success: false, error: 'ID de usuario es requerido' });
      return;
    }
    const hashedId = hashCedula(id);
    // Verificar si el usuario existe
    const usuario = await usuarioService.getById(hashedId);
    if (!usuario) {
      res.status(404).json({ success: false, error: 'Usuario no encontrado' });
      return;
    }
    
    // Si la cuenta no está activa
    if (!usuario.activo) {
      // Si hay fecha de bloqueo, verificar si ya pasó el tiempo
      if (usuario.bloqueadoHasta) {
        if (new Date() >= usuario.bloqueadoHasta) {
          // El tiempo de bloqueo ha pasado, desbloquear automáticamente
          await usuarioService.desbloquearUsuario(hashedId);
          
          // Si el bloqueo era por strikes, resetear strikes
          if (usuario.rol === Rol.CLIENTE && usuario.strikes && usuario.strikes >= 5) {
            await usuarioService.update(hashedId, { strikes: 0 });
          }
          
          // Si el bloqueo era por intentos fallidos, resetear intentos
          if (usuario.intentosFallidos && usuario.intentosFallidos >= 3) {
            await usuarioService.resetearIntentosFallidos(hashedId);
          }
          
          res.json({ success: true, data: { bloqueado: false } });
          return;
        }
        
        // Si aún no ha pasado el tiempo de bloqueo
        const fechaDesbloqueo = usuario.bloqueadoHasta.toLocaleDateString();
        res.json({
          success: true,
          data: {
            bloqueado: true,
            mensaje: usuario.motivoBloqueo || `Su cuenta está bloqueada hasta el ${fechaDesbloqueo}.`
          }
        });
        return;
      }
      
      // No hay fecha de bloqueo pero está inactivo (bloqueo permanente)
      res.json({
        success: true,
        data: {
          bloqueado: true,
          mensaje: usuario.motivoBloqueo || 'Su cuenta está bloqueada. Contacte al administrador para más información.'
        }
      });
      return;
    }
    
    res.json({ success: true, data: { bloqueado: false } });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const resetearStrikes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { correo } = req.body;

    if (!correo) {
      res.status(400).json({ success: false, error: 'Correo es requerido' });
      return;
    }

    // Buscar usuario por correo
    const usuario = await usuarioService.getByEmail(correo);

    if (!usuario) {
      res.status(404).json({ success: false, error: 'Usuario no encontrado' });
      return;
    }

    // Verificar si el usuario tiene strikes para resetear
    if (!usuario.strikes || usuario.strikes === 0) {
      res.status(400).json({ success: false, error: 'El usuario no tiene strikes para resetear' });
      return;
    }

    // Resetear strikes
    await usuarioService.resetearStrikes(correo);

    // Obtener el usuario actualizado
    const usuarioActualizado = await usuarioService.getByEmail(correo);

    res.json({
      success: true,
      data: {
        strikes: usuarioActualizado?.strikes || 0,
        activo: usuarioActualizado?.activo,
      },
      message: 'Strikes reseteados exitosamente',
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const desbloquearUsuario = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { correo } = req.body;

    if (!correo) {
      res.status(400).json({ success: false, error: 'Correo es requerido' });
      return;
    }

    // Buscar usuario por correo
    const usuario = await usuarioService.getByEmail(correo);

    if (!usuario) {
      res.status(404).json({ success: false, error: 'Usuario no encontrado' });
      return;
    }

    // Verificar si el usuario está bloqueado
    if (usuario.activo) {
      res.status(400).json({ success: false, error: 'El usuario ya está activo y no necesita ser desbloqueado' });
      return;
    }

    // Verificar condiciones para desbloquear
    const debeDesbloquear =
      (usuario.intentosFallidos && usuario.intentosFallidos >= 3 ) ||
      (usuario.strikes && usuario.strikes <= 5);

    if (!debeDesbloquear) {
      res.status(400).json({ success: false, error: 'El usuario no cumple con las condiciones para ser desbloqueado' });
      return;
    }

    // Desbloquear usuario
    await usuarioService.desbloquearUsuario(usuario.id);

    // Obtener el usuario actualizado
    const usuarioActualizado = await usuarioService.getById(usuario.id);

    res.json({
      success: true,
      data: {
        intentosFallidos: usuarioActualizado?.intentosFallidos || 0,
        strikes: usuarioActualizado?.strikes || 0,
        activo: usuarioActualizado?.activo,
      },
      message: 'Usuario desbloqueado exitosamente',
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};
