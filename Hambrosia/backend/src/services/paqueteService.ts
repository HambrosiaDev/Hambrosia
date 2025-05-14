import { db } from '../config/firebase';
import { Paquete, Rol } from '../models/interfaces';
import { converterFactory } from '../utils/converterFactory';
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
  GET_PACKAGES_BY_URL_ERROR: 'Error al obtener paquetes por URL',
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
      metodoPago?: string[];
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

      const { nombre: nombreRestaurante, ciudad: ciudadRestaurante, direccion: direccion} = usuario;
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
        metodoPago: usuario.metodoPago || [],
        alergenos: usuario.alergenos || [],
        direccion: direccion || null,
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
      // Get current date in Ecuador timezone (UTC-5)
      const ecuadorTZ = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Guayaquil' }));
      const startOfDay = new Date(ecuadorTZ.getFullYear(), ecuadorTZ.getMonth(), ecuadorTZ.getDate());
      const endOfDay = new Date(startOfDay);
      endOfDay.setDate(endOfDay.getDate() + 1);

      // Get all packages for the city
      const snapshot = await this.paquetesCollection
        .where('ciudad', '==', ciudad)
        .where('fechaPublicacion', '>=', startOfDay)
        .where('fechaPublicacion', '<', endOfDay)
        .get();

      const paquetesAgotados: Paquete[] = [];
      const paquetesDisponibles: Paquete[] = [];

      snapshot.forEach((doc) => {
        const paqueteData = doc.data();
        const paquete = { id: doc.id, ...paqueteData };
        
        if (paquete.agotado) {
          paquetesAgotados.push(paquete);
        } else {
          paquetesDisponibles.push(paquete);
        }
      });

      // Take first 2 sold-out pachttps://ejemplo.com/imagen.jpgkages and combine with available packages
      return [
        ...paquetesAgotados.slice(0, 2),
        ...paquetesDisponibles
      ];
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
      const precioUnitario = paquete.precioDescuento || 0;
      const comision = 0.1; // 10% de comisión
      return cantidadComprada * precioUnitario * comision;
    } catch (error: any) {
      console.error(ERROR_MESSAGES.CALCULATE_COMMISSION_ERROR, error.message || error);
      throw error;
    }
  }

  async getPaquetesByURL(url: string): Promise<Paquete[]> {
    try {
      // Get current date in Ecuador timezone (UTC-5)
      const ecuadorTZ = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Guayaquil' }));
      const startOfDay = new Date(ecuadorTZ.getFullYear(), ecuadorTZ.getMonth(), ecuadorTZ.getDate());
      const endOfDay = new Date(startOfDay);
      endOfDay.setDate(endOfDay.getDate() + 1);

      // Get all packages for the URL
      const snapshot = await this.paquetesCollection
        .where('imagenURL', '==', url)
        .where('fechaPublicacion', '>=', startOfDay)
        .where('fechaPublicacion', '<', endOfDay)
        .get();

      const paquetesAgotados: Paquete[] = [];
      const paquetesDisponibles: Paquete[] = [];

      snapshot.forEach((doc) => {
        const paqueteData = doc.data();
        const paquete = { id: doc.id, ...paqueteData };
        
        if (paquete.agotado) {
          paquetesAgotados.push(paquete);
        } else {
          paquetesDisponibles.push(paquete);
        }
      });

      // Take first 2 sold-out packages and combine with available packages
      return [
        ...paquetesAgotados.slice(0, 2),
        ...paquetesDisponibles
      ];
    } catch (error: any) {
      console.error(ERROR_MESSAGES.GET_PACKAGES_BY_URL_ERROR, error.message || error);
      throw error;
    }
  }
}

// Exportar una instancia predeterminada de la clase
export const paqueteService = new PaqueteService();
