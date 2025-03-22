import { db } from '../config/firebase';
import { Comision } from '../models/interfaces';
import { converterFactory } from '../utils/converterFactory';

export class ComisionService {
  private collection = db.collection('comisiones').withConverter(converterFactory<Comision>());

  async getAll(): Promise<Comision[]> {
    const snapshot = await this.collection.get();
    return snapshot.docs.map(doc => doc.data());
  }

  async getById(id: string): Promise<Comision | null> {
    const doc = await this.collection.doc(id).get();
    
    if (!doc.exists) {
      return null;
    }
    
    const data = doc.data();
    if (!data) {
      return null;
    }
    
    // Convertir el documento de Firestore al modelo Comision
    return {
      ...data
    } as Comision;
  }

  async getByRestaurante(restauranteId: string): Promise<Comision[]> {
    const snapshot = await this.collection
      .where('restauranteId', '==', restauranteId)
      .get();
    return snapshot.docs.map(doc => doc.data());
  }

  async create(data: Omit<Comision, 'id'>): Promise<Comision> {
    const id = this.collection.doc().id; // Generate a new ID
    const comisionWithId: Comision = { ...data, id };
    await this.collection.doc(id).set(comisionWithId);
    const newDoc = await this.collection.doc(id).get();
    return newDoc.data()!;
  }

  async update(id: string, data: Partial<Comision>): Promise<void> {
    await this.collection.doc(id).update(data);
  }

  async delete(id: string): Promise<void> {
    await this.collection.doc(id).delete();
  }
}