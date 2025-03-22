import { db } from '../config/firebase';
import { Compra } from '../models/interfaces';
import { converterFactory } from '../utils/converterFactory';

export class CompraService {
  private collection = db.collection('compras').withConverter(converterFactory<Compra>());

  async getAll(): Promise<Compra[]> {
    const snapshot = await this.collection.get();
    return snapshot.docs.map(doc => doc.data());
  }

  async getById(id: string): Promise<Compra | null> {
    const doc = await this.collection.doc(id).get();
    return doc.exists ? (doc.data() || null) : null;
  }

  async getByCodigo(codigo: string): Promise<Compra | null> {
    const snapshot = await this.collection
      .where('codigo', '==', codigo)
      .limit(1)
      .get();
    return snapshot.empty ? null : snapshot.docs[0].data();
  }

  async getByUsuario(usuarioId: string): Promise<Compra[]> {
    const snapshot = await this.collection
      .where('usuarioId', '==', usuarioId)
      .get();
    return snapshot.docs.map(doc => doc.data());
  }

  async getByPaquete(paqueteId: string): Promise<Compra[]> {
    const snapshot = await this.collection
      .where('paqueteId', '==', paqueteId)
      .get();
    return snapshot.docs.map(doc => doc.data());
  }

  async create(data: Omit<Compra, 'id'>): Promise<Compra> {
    // Verificar si el código ya existe
    const codigoExists = await this.getByCodigo(data.codigo);
    if (codigoExists) {
      throw new Error('El código ya está en uso');
    }

    // Generate a new document reference with ID
    const docRef = this.collection.doc();
    
    // Create the complete Compra object with the generated ID
    const compraWithId: Compra = {
      id: docRef.id,
      ...data
    };
    
    // Save the document with the specified ID
    await docRef.set(compraWithId);
    
    return compraWithId;
  }

  async update(id: string, data: Partial<Compra>): Promise<void> {
    await this.collection.doc(id).update(data);
  }

  async delete(id: string): Promise<void> {
    await this.collection.doc(id).delete();
  }
}