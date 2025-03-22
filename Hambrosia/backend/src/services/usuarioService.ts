import { db } from '../config/firebase';
import { Usuario, Rol } from '../models/interfaces';
import { converterFactory } from '../utils/converterFactory';

export class UsuarioService {
  private collection = db.collection('usuarios').withConverter(converterFactory<Usuario>());

  // Método privado para buscar un usuario por su correo o cédula
  private async getByField(field: string, value: string): Promise<Usuario | null> {
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

  // Crear un nuevo usuario
  async create(data: Omit<Usuario, 'id'>): Promise<Usuario> {
    // Verificar si ya existe un usuario con el mismo correo o cédula
    if (await this.getByEmail(data.correo)) {
      throw new Error('El correo ya está registrado');
    }

    if (await this.getByCedulaRUC(data.cedulaRUC)) {
      throw new Error('La Cédula/RUC ya está registrada');
    }

    // Crear una referencia de documento para obtener el ID
    const docRef = this.collection.doc();

    // Crear el usuario con el ID generado por Firestore
    const usuario: Usuario = { id: docRef.id, ...data };

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
    await this.collection.doc(id).delete();
  }

  // Obtener usuarios que son restaurantes
  async getRestaurantes(): Promise<Usuario[]> {
    const snapshot = await this.collection.where('rol', '==', Rol.RESTAURANTE).get();
    return snapshot.docs.map(doc => doc.data());
  }
}
