import { Timestamp } from 'firebase-admin/firestore';
import { db } from '../config/firebase';
import { Paquete, Rol } from '../models/interfaces';
import { converterFactory } from '../utils/converterFactory';
import { hashCedula } from '../utils/HELPER';
import { getEcuadorDayRangeFromDate } from '../utils/HELPER';

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
      horaRetiro: string; // Formato esperado "HH:mm" ejemplo "23:00"
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

      // Validar formato de hora
      const timePattern = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timePattern.test(dataPaquete.horaRetiro)) {
        throw { statusCode: 400, message: 'Formato de hora inválido. Debe ser HH:mm (ej: 23:00)' };
      }

      const { nombre: nombreRestaurante, ciudad: ciudadRestaurante, direccion: direccion} = usuario;
      const descuento = ((dataPaquete.precio - dataPaquete.precioDescuento) / dataPaquete.precio) * 100;

      // Obtener fecha actual en timezone de Ecuador
      const ecuadorTZ = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Guayaquil' }));
      const fechaPublicacionTimestamp = Timestamp.fromDate(ecuadorTZ);
      
      // Procesar horaRetiro
      const [hours, minutes] = dataPaquete.horaRetiro.split(':').map(Number);
      
      // Crear fecha con la hora especificada
      const horaRetiroDate = new Date(ecuadorTZ);
      horaRetiroDate.setHours(hours, minutes, 0, 0);
      // Convertir a Timestamp y validar que sea posterior a fechaPublicacion
      const horaRetiroTimestamp = Timestamp.fromDate(horaRetiroDate);
      
      // Validar que horaRetiro sea posterior a fechaPublicacion
      if (horaRetiroTimestamp.seconds <= fechaPublicacionTimestamp.seconds) {
        throw { 
          statusCode: 400, 
          message: 'La hora de retiro debe ser posterior a la hora de publicación' 
        };
      }

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
        fechaPublicacion: fechaPublicacionTimestamp,
        horaRetiro: horaRetiroTimestamp,
        ciudad: ciudadRestaurante,
        metodoPago: usuario.metodoPago || [],
        alergenos: usuario.alergenos || [],
        direccion: direccion || null,
      };

      const paqueteRef = await this.paquetesCollection.add(nuevoPaquete);
      
      return { 
        id: paqueteRef.id, 
        ...nuevoPaquete
      };
    } catch (error: any) {
      console.error(ERROR_MESSAGES.PUBLISH_PACKAGE_ERROR, error.message || error);
      throw error;
    }
  }

  async getPaqueteByCiudad(ciudad: string): Promise<Paquete[]> {
    try {
      const additionalDay = process.env.DEV_DAY_COMPRAS_PAQUETES || 1;
      const now = new Date();
      const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + Number(additionalDay));

      // Usar el helper reusable para obtener inicio y fin del día en Ecuador
      const { start, end } = getEcuadorDayRangeFromDate(date);

      console.log('Fecha de consulta:', date.toISOString());
      console.log('Rango en UTC para Ecuador:', {
        start: start.toDate().toISOString(),
        end: end.toDate().toISOString(),
      });

  
      const snapshot = await this.paquetesCollection
        .where('ciudad', '==', ciudad)
        .where('fechaPublicacion', '>=', start)
        .where('fechaPublicacion', '<=', end)
        .get();
  
      const paquetesAgotados: Paquete[] = [];
      const paquetesDisponibles: Paquete[] = [];
  
      snapshot.forEach((doc) => {
        const paquete = {
          id: doc.id,
          ...doc.data(),
        } as Paquete;
  
        if (paquete.agotado) {
          paquetesAgotados.push(paquete);
        } else {
          paquetesDisponibles.push(paquete);
        }
      });
  
      return [...paquetesAgotados.slice(0, 2), ...paquetesDisponibles];
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

  async getPaquetesByURL(url: string, ciudad: string): Promise<Paquete[]> {
    try {
      const { start, end } = getEcuadorDayRangeFromDate(new Date()); // Usa el día actual en Ecuador
  
      const snapshot = await this.paquetesCollection
        .where('imagenURL', '==', url)
        .where('ciudad', '==', ciudad)
        .where('fechaPublicacion', '>=', start)
        .where('fechaPublicacion', '<=', end)
        .get();
  
      const paquetesAgotados: Paquete[] = [];
      const paquetesDisponibles: Paquete[] = [];
  
      snapshot.forEach((doc) => {
        const paquete = {
          id: doc.id,
          ...doc.data(),
        } as Paquete;
  
        if (paquete.agotado) {
          paquetesAgotados.push(paquete);
        } else {
          paquetesDisponibles.push(paquete);
        }
      });
  
      return [...paquetesAgotados.slice(0, 2), ...paquetesDisponibles];
    } catch (error: any) {
      console.error(ERROR_MESSAGES.GET_PACKAGES_BY_URL_ERROR, error.message || error);
      throw error;
    }
  }
}

// Exportar una instancia predeterminada de la clase
export const paqueteService = new PaqueteService();
