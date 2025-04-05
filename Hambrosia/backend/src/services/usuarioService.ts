import { db, auth } from '../config/firebase';
import { Usuario, Rol, Alergeno } from '../models/interfaces';
import { converterFactory } from '../utils/converterFactory';
import * as admin from 'firebase-admin';
import {hashCedula, ValidacionCedulaRuc} from '../utils/HELPER';

export class UsuarioService {
  private collection = db.collection('usuarios').withConverter(converterFactory<Usuario>());

  // Método privado para buscar un usuario por su correo o cédula
  async getByField(field: string, value: string): Promise<Usuario | null> {
    const snapshot = await this.collection.where(field, '==', value).limit(1).get();
    return snapshot.empty ? null : snapshot.docs[0].data();
  }

  // Obtener todos los usuarios
  async getAll(): Promise<Usuario[]> {
    const snapshot = await this.collection.get();
    return snapshot.docs.map(doc => doc.data());
  }

  // Obtener un usuario por ID
  async getById(id: string): Promise<Usuario | null> {
    const hashedId = hashCedula(id);
    console.log('ID de usuario getbyuid:', id, 'Hashed ID:', hashedId);
    const doc = await this.collection.doc(hashedId).get();
    return doc.exists ? (doc.data() || null) : null;
  }

  // Obtener un usuario por correo
  async getByEmail(email: string): Promise<Usuario | null> {
    return this.getByField('correo', email);
  }

  // Obtener un usuario por Cédula/RUC
  async getByCedulaRUC(cedulaRUC: string): Promise<Usuario | null> {
    return this.getByField('cedulaRUC', cedulaRUC);
  }

  // Obtener un usuario por uid de Firebase
  async getByFirebaseUid(firebaseUid: string): Promise<Usuario | null> {
    const snapshot = await this.collection.where('firebaseUid', '==', firebaseUid).limit(1).get();
    return snapshot.empty ? null : snapshot.docs[0].data();
  }


  // Registro con Firebase Authentication y Firestore
  async register(
    email: string,
    password: string,
    cedulaRUC: string,
    nombre: string,
    direccion: string,
    fechaNacimiento: Date | undefined,
    rol: Rol,
    alergenos?: Alergeno[]
  ): Promise<Usuario> {
    // Verificar si ya existe un usuario con el mismo correo o cédula
    if (await this.getByEmail(email)) {
      throw new Error('El correo ya está registrado');
    }
  
    if (!ValidacionCedulaRuc.esIdentificacionValida(cedulaRUC)) {
      throw new Error('La Cédula/RUC no es válida');
    }
    
    if (await this.getByCedulaRUC(cedulaRUC)) {
      throw new Error('La Cédula/RUC ya está registrada');
    }

    try {
      // Crear usuario en Firebase Authentication
      const userRecord = await auth.createUser({
        email: email,
        password: password,
        displayName: nombre
      });
      
      const firebaseUid = userRecord.uid;
  
      // Crear una referencia de documento utilizando la cédula/RUC como ID
      const hashedCedula = hashCedula(cedulaRUC);
      const docRef = this.collection.doc(hashedCedula);
  
      // Crear el usuario
      const userData: Usuario = {
        id: cedulaRUC, // Usar la cédula/RUC como ID primario
        correo: email,
        cedulaRUC: cedulaRUC,
        nombre: nombre,
        direccion: direccion,
        rol: rol,
        firebaseUid: firebaseUid,
        intentosFallidos: 0, // Inicializar contador de intentos fallidos
        activo: true // Por defecto, el usuario está activo
      };
  
      // Agregar alérgenos solo si el rol es restaurante y hay alérgenos definidos
      if (rol === Rol.RESTAURANTE && alergenos && alergenos.length > 0) {
        userData.alergenos = alergenos;
      }

      // Agregar fecha de nacimiento solo si el rol es cliente
      if (rol === Rol.CLIENTE && fechaNacimiento) {
        userData.fechaNacimiento = fechaNacimiento;
        userData.strikes = 0; // Inicializar contador de strikes para clientes
      }
  
      // Guardar en Firestore
      await docRef.set(userData);
      return userData;
    } catch (error: any) {
      // Manejar errores de Firebase Authentication
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('El correo electrónico ya está en uso');
      }
      throw error;
    }
  }

  // Crear un nuevo usuario (sin autenticación - para uso administrativo)
  async create(data: Omit<Usuario, 'id'>): Promise<Usuario> {
    // Verificar si ya existe un usuario con el mismo correo o cédula
    if (await this.getByEmail(data.correo)) {
      throw new Error('El correo ya está registrado');
    }
    
    if (!ValidacionCedulaRuc.esIdentificacionValida(data.cedulaRUC)) {
      throw new Error('La Cédula/RUC no es válida');
    }

    if (await this.getByCedulaRUC(data.cedulaRUC)) {
      throw new Error('La Cédula/RUC ya está registrada');
    }

    const hashedCedula = hashCedula(data.cedulaRUC);
    const docRef = this.collection.doc(hashedCedula);

    // Crear el usuario con el ID igual a la cédula/RUC y asegurar que intentosFallidos esté inicializado
    const usuario: Usuario = { 
      id: data.cedulaRUC,
      ...data,
      intentosFallidos: data.intentosFallidos || 0,
      activo: data.activo !== undefined ? data.activo : true // Por defecto, el usuario está activo
    };

    // Inicializar strikes para clientes si no están definidos
    if (usuario.rol === Rol.CLIENTE && usuario.strikes === undefined) {
      usuario.strikes = 0;
    }

    // Establecer los datos en el documento
    await docRef.set(usuario);
    return usuario;
  }

  // Actualizar los datos de un usuario
  async update(id: string, data: Partial<Usuario>): Promise<void> {
    await this.collection.doc(id).update(data);
  }

  // Eliminar un usuario
  async delete(id: string): Promise<void> {
    // Obtener el usuario primero para obtener el firebaseUid
    const usuario = await this.getById(id);
    
    if (usuario && usuario.firebaseUid) {
      // Eliminar el usuario de Firebase Authentication
      await auth.deleteUser(usuario.firebaseUid);
    }
    
    // Eliminar el documento de Firestore
    await this.collection.doc(id).delete();
  }

  // Obtener usuarios que son restaurantes
  async getRestaurantes(): Promise<Usuario[]> {
    const snapshot = await this.collection.where('rol', '==', Rol.RESTAURANTE).get();
    return snapshot.docs.map(doc => doc.data());
  }

  // Registrar intento fallido de login y bloquear si es necesario
  async registrarIntentoFallido(userId: string): Promise<void> {
    const usuario = await this.getById(userId);
    
    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }
    
    const intentosFallidos = (usuario.intentosFallidos || 0) + 1;
    
    // Verificar si se excedió el límite de intentos fallidos (3)
    if (intentosFallidos >= 3) {
      // Bloquear la cuenta cambiando activo a FALSE
      const bloqueadoHasta = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas de bloqueo
      const motivoBloqueo = `Su cuenta ha sido bloqueada por exceder el límite de intentos fallidos de inicio de sesión. Por favor, restablezca su contraseña para desbloquear su cuenta.`;
      
      await this.update(hashCedula(userId), { 
        intentosFallidos,
        activo: false,
        bloqueadoHasta,
        motivoBloqueo
      });
      
      // Enviar notificación de bloqueo
      await this.enviarNotificacionBloqueo(userId, motivoBloqueo);
    } else {
      // Solo actualizar el contador de intentos fallidos
      await this.update(hashCedula(userId), { intentosFallidos });
    }
  }

  // Resetear intentos fallidos al iniciar sesión correctamente
  async resetearIntentosFallidos(userId: string): Promise<void> {
    const usuario = await this.getById(userId);
    
    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }
    
    // Determinar si el bloqueo fue por intentos fallidos
    const bloqueadoPorIntentos = !usuario.activo && 
                               usuario.intentosFallidos && 
                               usuario.intentosFallidos >= 3 && 
                               (!usuario.strikes || usuario.strikes < 5);
    
    const updateData: Partial<Usuario> = { intentosFallidos: 0 };
    
    // Si estaba bloqueado por intentos fallidos, desbloquear la cuenta
    if (bloqueadoPorIntentos) {
      updateData.activo = true;
      updateData.motivoBloqueo = undefined;
      updateData.bloqueadoHasta = undefined;
    }
    
    await this.update(hashCedula(userId), updateData);
  }

  // Verificar si el usuario está bloqueado y verificar si debe desbloquearse por tiempo transcurrido
  async verificarBloqueo(userId: string): Promise<{bloqueado: boolean, mensaje?: string}> {
    const usuario = await this.getById(userId);
    
    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }
    
    // Si la cuenta no está activa
    if (!usuario.activo) {
      // Si hay fecha de bloqueo, verificar si ya pasó el tiempo
      if (usuario.bloqueadoHasta) {
        if (new Date() >= usuario.bloqueadoHasta) {
          // El tiempo de bloqueo ha pasado, desbloquear automáticamente
          const updateData: Partial<Usuario> = {
            activo: true,
            bloqueadoHasta: undefined,
            motivoBloqueo: undefined
          };
          
          // Si el bloqueo era por strikes, resetear strikes
          if (usuario.rol === Rol.CLIENTE && usuario.strikes && usuario.strikes >= 5) {
            updateData.strikes = 0;
          }
          
          // Si el bloqueo era por intentos fallidos, resetear intentos
          if (usuario.intentosFallidos && usuario.intentosFallidos >= 3) {
            updateData.intentosFallidos = 0;
          }
          
          await this.update(hashCedula(userId), updateData);
          return { bloqueado: false };
        }
        
        // Si aún no ha pasado el tiempo de bloqueo
        const fechaDesbloqueo = usuario.bloqueadoHasta.toLocaleDateString();
        return {
          bloqueado: true,
          mensaje: usuario.motivoBloqueo || `Su cuenta está bloqueada hasta el ${fechaDesbloqueo}.`
        };
      }
      
      // No hay fecha de bloqueo pero está inactivo (bloqueo permanente)
      return {
        bloqueado: true,
        mensaje: usuario.motivoBloqueo || 'Su cuenta está bloqueada. Contacte al administrador para más información.'
      };
    }
    
    return { bloqueado: false };
  }

  // Incrementar strikes para un cliente y bloquear si es necesario
  async incrementarStrike(userId: string): Promise<number> {
    console.log('ID de usuario en incrementarStrike:', userId);
    const usuario = await this.getById(userId);
    console.log('Usuario encontrado:', usuario);
    
    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }
    
    if (usuario.rol !== Rol.CLIENTE) {
      throw new Error('Solo se pueden asignar strikes a usuarios con rol CLIENTE');
    }
    
    const strikesActuales = usuario.strikes || 0;
    const nuevosStrikes = strikesActuales + 1;
    
    // Preparar los datos para actualizar
    const updateData: Partial<Usuario> = { strikes: nuevosStrikes };
    
    // Si alcanza 5 strikes, desactivar la cuenta y bloquear por 30 días
    if (nuevosStrikes >= 5) {
      const bloqueadoHasta = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 días
      const fechaDesbloqueo = bloqueadoHasta.toLocaleDateString();
      const motivoBloqueo = `Su cuenta ha sido bloqueada por acumulación de strikes (${nuevosStrikes}/5). Estará bloqueada hasta el ${fechaDesbloqueo}.`;
      
      Object.assign(updateData, {
        activo: false,
        bloqueadoHasta: bloqueadoHasta,
        motivoBloqueo: motivoBloqueo
      });
      
      // Enviar notificación de bloqueo
      await this.enviarNotificacionBloqueo(userId, motivoBloqueo);
    }
    
    await this.update(hashCedula(userId), updateData);
    return nuevosStrikes;
  }
  
  // Método para enviar notificación al usuario sobre su bloqueo
  async enviarNotificacionBloqueo(userId: string, mensaje: string): Promise<void> {
    const usuario = await this.getById(userId);
    
    if (!usuario || !usuario.firebaseUid) {
      throw new Error('Usuario no encontrado o sin ID de Firebase');
    }
    
    try {
      // Almacenar mensaje en Firestore para que el cliente lo recupere en próximo inicio de sesión
      await db.collection('notificaciones').add({
        userId: userId,
        cedulaRUC: usuario.cedulaRUC, // Agregar cedulaRUC para referencias futuras
        firebaseUid: usuario.firebaseUid,
        mensaje: mensaje,
        leido: false,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });
      
      console.log(`Notificación de bloqueo enviada a usuario ${userId}: ${mensaje}`);
    } catch (error) {
      console.error('Error al enviar notificación de bloqueo:', error);
    }
  }
}