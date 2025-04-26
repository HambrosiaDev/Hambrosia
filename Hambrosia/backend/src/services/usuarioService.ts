import { db, auth } from '../config/firebase';
import { Usuario, Rol, Alergeno, Ciudad } from '../models/interfaces';
import { converterFactory } from '../utils/converterFactory';
import * as admin from 'firebase-admin';
import { hashCedula } from '../utils/HELPER';
import { FieldValue } from 'firebase-admin/firestore';
export class UsuarioService {
  private usuariosCollection = db.collection('usuarios').withConverter(converterFactory<Usuario>());

  // Método privado para buscar un usuario por cualquier campo
  async getByField(field: string, value: string): Promise<Usuario | null> {
    try {
      const snapshot = await this.usuariosCollection.where(field, '==', value).limit(1).get();
      
      if (!snapshot.empty) {
        return snapshot.docs[0].data();
      }
      
      return null;
    } catch (error) {
      throw error;
    }
  }

  // Obtener todos los usuarios
  async getAll(): Promise<Usuario[]> {
    const snapshot = await this.usuariosCollection.get();
    return snapshot.docs.map(doc => doc.data());
  }

  // Obtener un usuario por ID - sin hasheo
  async getById(id: string): Promise<Usuario | null> {
    const doc = await this.usuariosCollection.doc(id).get();
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
    return this.getByField('firebaseUid', firebaseUid);
  }

  // Registro simple en Firebase Auth y Firestore
  async register(
    email: string,
    cedulaRUC: string,
    nombre: string,
    ciudad: string,
    rol: Rol,
    firebaseUid: string,
    fechaNacimiento?: string | undefined, // Fecha de nacimiento es opcional
    alergenos?: Alergeno[],
    direccion?: string // Dirección es opcional
): Promise<Usuario> {
    // Convertir fechaNacimiento a Date si existe
    let parsedFechaNacimiento: Date | undefined = undefined;
    if (fechaNacimiento && typeof fechaNacimiento === 'string') {
        const parts = fechaNacimiento.split('-');
        if (parts.length === 3) {
            const [day, month, year] = parts.map(Number);
            if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
                parsedFechaNacimiento = new Date(year, month - 1, day); // Mes empieza en 0 en JavaScript
            } else {
                throw new Error('Formato de fecha de nacimiento inválido. Debe ser DD-MM-YYYY.');
            }
        } else {
            throw new Error('Formato de fecha de nacimiento inválido. Debe ser DD-MM-YYYY.');
        }
    }

    // Crear el usuario
    const userData: Usuario = {
        id: cedulaRUC, // Usar la cédula/RUC como ID primario
        correo: email,
        cedulaRUC: cedulaRUC,
        nombre: nombre,
        ciudad: ciudad, // Asignar ciudad directamente
        rol: rol,
        firebaseUid: firebaseUid,
        intentosFallidos: 0,
        activo: true,
    };

    if (rol === Rol.RESTAURANTE) {
        userData.alergenos = alergenos || [];
        userData.direccion = direccion // Inicializar alérgenos como un array vacío si no se proporciona
    }

    // Agregar fecha de nacimiento si está definida
    if (parsedFechaNacimiento) {
        userData.fechaNacimiento = parsedFechaNacimiento;
    }

    // Inicializar strikes para clientes
    if (rol === Rol.CLIENTE) {
        userData.strikes = 0;
    }


    // Guardar en Firestore
    const hashedId = hashCedula(cedulaRUC);
    const docRef = this.usuariosCollection.doc(hashedId);
    await docRef.set(userData);
    return userData;
}

  // Actualizar los datos de un usuario
  async update(id: string, data: Partial<Usuario>): Promise<void> {
    await this.usuariosCollection.doc(id).update(data);
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
    await this.usuariosCollection.doc(id).delete();
  }

  // Obtener usuarios que son restaurantes
  async getRestaurantes(): Promise<Usuario[]> {
    const snapshot = await this.usuariosCollection.where('rol', '==', Rol.RESTAURANTE).get();
    return snapshot.docs.map(doc => doc.data());
  }

  // Registrar intento fallido de login y actualizar contador
  async registrarIntentoFallido(id: string): Promise<void> {
    const usuario = await this.getById(id);
    
    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }
    
    const intentosFallidos = (usuario.intentosFallidos || 0) + 1;
    await this.update(id, { intentosFallidos });
  }

  // Bloquear usuario
  async bloquearUsuario(id: string, duracionHoras: number, motivo: string): Promise<void> {
    const bloqueadoHasta = new Date(Date.now() + duracionHoras * 60 * 60 * 1000);
    
    await this.update(id, { 
      activo: false,
      bloqueadoHasta,
      motivoBloqueo: motivo
    });
  }

  // Resetear intentos fallidos
  async resetearIntentosFallidos(id: string): Promise<void> {
    await this.update(id, {
      intentosFallidos: 0,
      activo: true,
      bloqueadoHasta: FieldValue.delete() as any,
      motivoBloqueo: FieldValue.delete() as any});
  }

  // Desbloquear usuario
  async desbloquearUsuario(id: string): Promise<void> {
    await this.update(id, {
      activo: true,
      bloqueadoHasta: FieldValue.delete() as any,
      motivoBloqueo: FieldValue.delete() as any,
      strikes: 0,
      intentosFallidos: 0
    });
  }

  // Incrementar strikes para un cliente
  async incrementarStrike(id: string): Promise<number> {
    const usuario = await this.getById(id);
    
    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }
    const strikesActuales = usuario.strikes || 0;
    const nuevosStrikes = strikesActuales + 1;
    
    // Verificar si se debe bloquear al usuario
    if (nuevosStrikes >= 5) {
      const duracionBloqueo = 30 * 24; // 30 días en horas
      const fechaDesbloqueo = new Date(Date.now() + duracionBloqueo * 60 * 60 * 1000).toLocaleDateString();
      const motivoBloqueo = `Su cuenta ha sido bloqueada por acumulación de strikes (${nuevosStrikes}/5). Estará bloqueada hasta el ${fechaDesbloqueo}.`;
      
      // Bloquear usuario
      await usuarioService.bloquearUsuario(id, duracionBloqueo, motivoBloqueo);
      
      // Enviar notificación
      await usuarioService.enviarNotificacion(id, motivoBloqueo);
    }
    await this.update(id, { strikes: nuevosStrikes });
    return nuevosStrikes;
  }
  
  // Enviar notificación al usuario
  async enviarNotificacion(id: string, mensaje: string): Promise<void> {
    const usuario = await this.getById(id);
    
    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }
    
    await db.collection('notificaciones').add({
      userId: id,
      cedulaRUC: usuario.cedulaRUC,
      firebaseUid: usuario.firebaseUid,
      mensaje: mensaje,
      leido: false,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
  }

  async resetearStrikes(correo: string): Promise<void> {
    const usuario = await this.getByEmail(correo);
    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }
    // Verificar si el usuario tiene strikes para resetear
    if (!usuario.strikes || usuario.strikes === 0) {
      console.warn(`El usuario ${correo} no tiene strikes para resetear`);
      return;
    }

    const updateData: Partial<Usuario> = { strikes: 0 };
  
    if (!usuario.activo || usuario.bloqueadoHasta && usuario.strikes >= 5) {
      Object.assign(updateData, {
        activo: true,
        bloqueadoHasta: admin.firestore.FieldValue.delete() as any,
        motivoBloqueo: admin.firestore.FieldValue.delete() as any,
      });
    }

    await this.update(usuario.id, updateData);
  }
}

export const usuarioService = new UsuarioService();