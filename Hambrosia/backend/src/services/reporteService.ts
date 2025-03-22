import { db } from '../config/firebase';
import { Reporte, TipoReporte } from '../models/interfaces';
import { converterFactory } from '../utils/converterFactory';

export class ReporteService {
  private collection = db.collection('reportes').withConverter(converterFactory<Reporte>());

  async getAll(): Promise<Reporte[]> {
    const snapshot = await this.collection.get();
    return snapshot.docs.map(doc => doc.data());
  }

  async getById(id: string): Promise<Reporte | null> {
    const doc = await this.collection.doc(id).get();
    return doc.exists ? doc.data() || null : null;
  }

  async getByTipo(tipo: TipoReporte): Promise<Reporte[]> {
    const snapshot = await this.collection
      .where('tipo', '==', tipo)
      .get();
    return snapshot.docs.map(doc => doc.data());
  }

  async create(data: Omit<Reporte, 'id'>): Promise<Reporte> {
    const docRef = this.collection.doc();
    const reporte: Reporte = {
      ...data,
      id: docRef.id
    };
    await docRef.set(reporte);
    const newDoc = await docRef.get();
    return newDoc.data()!;
  }

  async update(id: string, data: Partial<Reporte>): Promise<void> {
    await this.collection.doc(id).update(data);
  }

  async delete(id: string): Promise<void> {
    await this.collection.doc(id).delete();
  }
}