import { db } from '../config/firebase';
import { Paquete } from '../models/interfaces';
import { converterFactory } from '../utils/converterFactory';

export class PaqueteService {
  private collection = db.collection('paquetes').withConverter(converterFactory<Paquete>());

  async getAll(): Promise<Paquete[]> {
    const snapshot = await this.collection.get();
    return snapshot.docs.map(doc => doc.data());
  }

  async getById(id: string): Promise<Paquete | null> {
    const doc = await this.collection.doc(id).get();
    return doc.exists ? doc.data()! : null;
  }

  async getByRestaurante(restauranteId: string): Promise<Paquete[]> {
    const snapshot = await this.collection
      .where('restauranteId', '==', restauranteId)
      .get();
    return snapshot.docs.map(doc => doc.data());
  }

  async getVisibles(): Promise<Paquete[]> {
    const snapshot = await this.collection
      .where('visibilidad', '==', true)
      .where('agotado', '==', false)
      .get();
    return snapshot.docs.map(doc => doc.data());
  }

  async create(data: Omit<Paquete, 'id'>): Promise<Paquete> {
    const docRef = this.collection.doc();
    const id = docRef.id;
    const paqueteWithId: Paquete = { id, ...data };
    await docRef.set(paqueteWithId);
    return paqueteWithId;
  }

  async update(id: string, data: Partial<Paquete>): Promise<void> {
    await this.collection.doc(id).update(data);
  }

  async delete(id: string): Promise<void> {
    await this.collection.doc(id).delete();
  }
}