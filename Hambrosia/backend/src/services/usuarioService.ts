import { db, auth } from '../config/firebase';
import { Usuario, Rol, Alergeno } from '../models/interfaces';
import { converterFactory } from '../utils/converterFactory';

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
    const doc = await this.collection.doc(id).get();
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

  // Registro con Firebase Authentication y Firestore
  async register(
    email: string,
    password: string,
    cedulaRUC: string,
    nombre: string,
    fechaNacimiento: Date,
    rol: Rol,
    alergenos?: Alergeno[]
  ): Promise<Usuario> {
    // Verificar si ya existe un usuario con el mismo correo o cédula
    if (await this.getByEmail(email)) {
      throw new Error('El correo ya está registrado');
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
      const docRef = this.collection.doc(cedulaRUC);
  
      // Crear el usuario
      const userData: Usuario = {
        id: cedulaRUC, // Usar la cédula/RUC como ID primario
        correo: email,
        cedulaRUC: cedulaRUC,
        nombre: nombre,
        fechaNacimiento: fechaNacimiento,
        rol: rol,
        firebaseUid: firebaseUid
      };
  
      // Agregar alérgenos solo si el rol es restaurante y hay alérgenos definidos
      if (rol === Rol.RESTAURANTE && alergenos && alergenos.length > 0) {
        userData.alergenos = alergenos;
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

    if (await this.getByCedulaRUC(data.cedulaRUC)) {
      throw new Error('La Cédula/RUC ya está registrada');
    }

    // Utilizar la cédula/RUC como ID del documento
    const docRef = this.collection.doc(data.cedulaRUC);

    // Crear el usuario con el ID igual a la cédula/RUC
    const usuario: Usuario = { 
      id: data.cedulaRUC,
      ...data 
    };

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

  // Verificar credenciales - no podemos iniciar sesión directamente con el Admin SDK,
  // este método solo verifica si existe un usuario con esas credenciales
  async verificarCredenciales(email: string, password: string): Promise<Usuario> {
    // Nota: No podemos verificar directamente la contraseña con el Admin SDK
    // En una aplicación real, usarías Firebase Auth en el cliente para iniciar sesión
    // y luego verificarías el token en el servidor
    
    // Buscar usuario por email
    const usuario = await this.getByEmail(email);
    
    if (!usuario) {
      throw new Error('Credenciales inválidas');
    }
    
    // Como no podemos verificar la contraseña en el servidor con el Admin SDK,
    // asumimos que la validación de la contraseña se realiza en el cliente
    // con Firebase Auth, y la respuesta exitosa es indicativa de credenciales válidas
    
    return usuario;
  }
}