import { db } from '../config/firebase';
import { converterFactory } from '../utils/converterFactory';
import { Paquete, Rol } from '../models/interfaces';
import { hashCedula } from '../utils/HELPER';

// Centralized error messages
const ERROR_MESSAGES = {
  RESTAURANT_NOT_FOUND: 'Restaurante no encontrado',
  INVALID_RESTAURANT_DATA: 'Datos del restaurante no encontrados',
  UNAUTHORIZED_PUBLISH: 'Solo los restaurantes pueden publicar paquetes',
  MISSING_UNITS: "Datos del paquete inválidos o campo 'unidades' no encontrado",
  INSUFFICIENT_UNITS: 'No hay suficientes unidades disponibles',
  PACKAGE_NOT_FOUND: 'Paquete no encontrado',
  GET_PACKAGE_ERROR: 'Error al obtener el paquete por ID',
  GET_PACKAGES_BY_CITY_ERROR: 'Error al obtener paquetes por ciudad',
  UPDATE_UNITS_ERROR: 'Error al actualizar unidades del paquete',
  CALCULATE_COMMISSION_ERROR: 'Error calculando la comisión',
  PUBLISH_PACKAGE_ERROR: 'Error al publicar paquete',
};

export class PaqueteService {
  private paquetesCollection = db.collection('paquetes').withConverter(converterFactory<Paquete>());

  // Helper method to get a paqueteRef
  private paqueteRef(paqueteId: string) {
    return this.paquetesCollection.doc(paqueteId);
  }

  // Helper method to get a package by ID or return null
  async obtenerPaquetePorId(paqueteId: string): Promise<Paquete | null> {
    try {
      const paqueteSnapshot = await this.paqueteRef(paqueteId).get();
      if (!paqueteSnapshot.exists) {
        return null;
      }
      return { id: paqueteSnapshot.id, ...paqueteSnapshot.data() } as Paquete;
    } catch (error: any) {
      console.error(ERROR_MESSAGES.GET_PACKAGE_ERROR, error.message || error);
      throw error;
    }
  }

  async publicarPaquete(
    cedulaRUC: string,
    dataPaquete: {
      descripcion: string;
      precio: number;
      precioDescuento: number;
      unidades: number;
      horaRetiro: string;
      imagenURL?: string | null;
    }
  ): Promise<Paquete> {
    try {
      const hashedCedula = hashCedula(cedulaRUC);
      const usuarioRef = db.collection('usuarios').doc(hashedCedula);
      const usuarioSnapshot = await usuarioRef.get();

      if (!usuarioSnapshot.exists) {
        throw { statusCode: 404, message: ERROR_MESSAGES.RESTAURANT_NOT_FOUND };
      }

      const usuario = usuarioSnapshot.data();
      if (!usuario) {
        throw { statusCode: 404, message: ERROR_MESSAGES.INVALID_RESTAURANT_DATA };
      }

      if (usuario.rol !== Rol.RESTAURANTE) {
        throw { statusCode: 403, message: ERROR_MESSAGES.UNAUTHORIZED_PUBLISH };
      }

      const { nombre: nombreRestaurante, ciudad: ciudadRestaurante } = usuario;
      const descuento = ((dataPaquete.precio - dataPaquete.precioDescuento) / dataPaquete.precio) * 100;

      const nuevoPaquete = {
        restauranteId: hashedCedula,
        nombreRestaurante,
        descripcion: dataPaquete.descripcion,
        precio: dataPaquete.precio,
        descuento,
        precioDescuento: dataPaquete.precioDescuento,
        unidades: dataPaquete.unidades,
        agotado: false,
        imagenURL: dataPaquete.imagenURL || null,
        fechaPublicacion: new Date(),
        horaRetiro: new Date(dataPaquete.horaRetiro),
        ciudad: ciudadRestaurante,
      };

      const paqueteRef = await this.paquetesCollection.add(nuevoPaquete);
      return { id: paqueteRef.id, ...nuevoPaquete };
    } catch (error: any) {
      console.error(ERROR_MESSAGES.PUBLISH_PACKAGE_ERROR, error.message || error);
      throw error;
    }
  }

  async getPaqueteByCiudad(ciudad: string): Promise<Paquete[]> {
    try {
      const snapshot = await this.paquetesCollection.where('ciudad', '==', ciudad).get();
      const paquetes: Paquete[] = [];

      snapshot.forEach((doc) => {
        const paqueteData = doc.data();
        paquetes.push({ id: doc.id, ...paqueteData });
      });

      return paquetes;
    } catch (error: any) {
      console.error(ERROR_MESSAGES.GET_PACKAGES_BY_CITY_ERROR, error.message || error);
      throw error;
    }
  }

  async restarUnidadesPaquete(paqueteId: string, cantidad: number): Promise<void> {
    try {
      const paquete = await this.obtenerPaquetePorId(paqueteId);
      if (!paquete) {
        throw { statusCode: 404, message: ERROR_MESSAGES.PACKAGE_NOT_FOUND };
      }
      if (typeof paquete.unidades !== 'number') {
        throw { statusCode: 500, message: ERROR_MESSAGES.MISSING_UNITS };
      }
      if (paquete.unidades < cantidad) {
        throw {
          statusCode: 400,
          message: `${ERROR_MESSAGES.INSUFFICIENT_UNITS}. Actual: ${paquete.unidades}, Solicitado: ${cantidad}`,
        };
      }
      const nuevasUnidades = paquete.unidades - cantidad;
      await this.paqueteRef(paqueteId).update({ unidades: nuevasUnidades, agotado: nuevasUnidades <= 0 });
      console.log(`Unidades del paquete ${paqueteId} actualizadas. Anterior: ${paquete.unidades}, Nuevas: ${nuevasUnidades}`);
    } catch (error: any) {
      console.error(ERROR_MESSAGES.UPDATE_UNITS_ERROR, error.message || error);
      throw error;
    }
  }

  async aumentarUnidadesPaquete(paqueteId: string, cantidad: number): Promise<void> {
    try {
      const paquete = await this.obtenerPaquetePorId(paqueteId);
      if (!paquete) {
        throw { statusCode: 404, message: ERROR_MESSAGES.PACKAGE_NOT_FOUND };
      }

      if (typeof paquete.unidades !== 'number') {
        throw { statusCode: 500, message: ERROR_MESSAGES.MISSING_UNITS };
      }
      const nuevasUnidades = paquete.unidades + cantidad;
      await this.paqueteRef(paqueteId).update({ unidades: nuevasUnidades });
      console.log(`Unidades del paquete ${paqueteId} actualizadas. Anterior: ${paquete.unidades}, Nuevas: ${nuevasUnidades}`);
    } catch (error: any) {
      console.error(ERROR_MESSAGES.UPDATE_UNITS_ERROR, error.message || error);
      throw error;
    }
  }

  async calcularComision(paqueteId: string, cantidadComprada: number): Promise<number> {
    try {
      const paquete = await this.obtenerPaquetePorId(paqueteId);
      if (!paquete) {
        throw { statusCode: 404, message: ERROR_MESSAGES.PACKAGE_NOT_FOUND };
      }
      const precioUnitario = paquete.precio || 0;
      const comision = 0.1; // 10% de comisión
      return cantidadComprada * precioUnitario * comision;
    } catch (error: any) {
      console.error(ERROR_MESSAGES.CALCULATE_COMMISSION_ERROR, error.message || error);
      throw error;
    }
  }
}

// Exportar una instancia predeterminada de la clase
export const paqueteService = new PaqueteService();
