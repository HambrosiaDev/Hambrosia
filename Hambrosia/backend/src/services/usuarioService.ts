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
    password: string,
    cedulaRUC: string,
    nombre: string,
    ciudad: Ciudad[],
    direccion: string,
    fechaNacimiento: Date | undefined,
    rol: Rol,
    alergenos?: Alergeno[]
  ): Promise<Usuario> {
    // Crear usuario en Firebase Authentication
    const userRecord = await auth.createUser({
      email: email,
      password: password,
      displayName: nombre
    });
    
    const firebaseUid = userRecord.uid;

    // Crear el usuario
    const userData: Usuario = {
      id: cedulaRUC, // Usar la cédula/RUC como ID primario
      correo: email,
      cedulaRUC: cedulaRUC,
      nombre: nombre,
      ciudad: ciudad,
      direccion: direccion,
      rol: rol,
      firebaseUid: firebaseUid,
      intentosFallidos: 0,
      activo: true
    };
    
    if (rol === Rol.RESTAURANTE) {
      userData.alergenos = alergenos || []; // Inicializar alérgenos como un array vacío si no se proporciona
    }

    // Agregar fecha de nacimiento si está definida
    if (fechaNacimiento) {
      userData.fechaNacimiento = fechaNacimiento;
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

  // Crear un nuevo usuario (sin autenticación)
  async create(data: Omit<Usuario, 'id'>): Promise<Usuario> {
    const hashedId = hashCedula(data.cedulaRUC);
    const docRef = this.usuariosCollection.doc(hashedId);

    // Crear el usuario con el ID igual a la cédula/RUC
    const usuario: Usuario = { 
      id: data.cedulaRUC,
      ...data,
      intentosFallidos: data.intentosFallidos || 0,
      activo: data.activo !== undefined ? data.activo : true
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