import { db } from "../config/firebase";
import { converterFactory } from "../utils/converterFactory";
import { Paquete } from "../models/interfaces";
import { hashCedula } from "../utils/HELPER";
import { Rol } from "../models/interfaces";

export class PaqueteService {
  // Propiedad estática para la colección de paquetes con el Converter
  private static paquetesCollection = db.collection("paquetes").withConverter(converterFactory<Paquete>());

  /**
   * Método para publicar un paquete.
   */
  async publicarPaquete(
    cedulaRUC: string,
    dataPaquete: {
      descripcion: string;
      precio: number;
      precioDescuento: number;
      unidades: number;
      fechaRetiro: string;
      imagenURL?: string | null;
    }
  ): Promise<Paquete> {
    try {
      // Encriptar la cédula RUC
      const hashedCedula = hashCedula(cedulaRUC);
      console.log("Hashed Cedula:", hashedCedula); // Depuración: Imprime la cédula cifrada

      // Buscar el usuario (restaurante) por cedulaRUC
      const usuarioRef = db.collection("usuarios").doc(hashedCedula);
      const usuarioSnapshot = await usuarioRef.get();

      if (!usuarioSnapshot.exists) {
        throw { statusCode: 404, message: "Restaurante no encontrado" };
      }

      const usuario = usuarioSnapshot.data();
      if (!usuario) {
        throw { statusCode: 404, message: "Datos del restaurante no encontrados" };
      }

      // Validar que el usuario tenga el rol RESTAURANTE
      if (usuario.rol !== Rol.RESTAURANTE) {
        throw { statusCode: 403, message: "Solo los restaurantes pueden publicar paquetes" };
      }

      const nombreRestaurante = usuario.nombre; // Obtener el nombre del restaurante desde el usuario
      const ciudadRestaurante = usuario.ciudad; // Usar la ciudad del restaurante

      // Calcular el descuento
      const descuento = ((dataPaquete.precio - dataPaquete.precioDescuento) / dataPaquete.precio) * 100;

      // Crear el objeto del paquete
      const nuevoPaquete = {
        restauranteId: hashedCedula,
        nombreRestaurante: nombreRestaurante,
        descripcion: dataPaquete.descripcion,
        precio: dataPaquete.precio,
        descuento,
        precioDescuento: dataPaquete.precioDescuento,
        unidades: dataPaquete.unidades,
        agotado: false,
        imagenURL: dataPaquete.imagenURL || null, // Opcional
        fechaPublicacion: new Date(),
        fechaRetiro: new Date(dataPaquete.fechaRetiro), // Convertir a Date
        ciudad: ciudadRestaurante, // Usar la ciudad del restaurante
      };

      // Guardar el paquete en la colección 'paquetes'
      const paqueteRef = await PaqueteService.paquetesCollection.add(nuevoPaquete);

      // Devolver el ID del paquete creado junto con los datos
      return { id: paqueteRef.id, ...nuevoPaquete };
    } catch (error: any) {
      console.error("Error en el servicio de publicarPaquete:", error);
      throw error; // Re-lanzar el error para que lo maneje el controlador
    }
  }

  /**
   * Método para obtener paquetes por ciudad.
   */
  async getPaqueteByCiudad(ciudad: string): Promise<Paquete[]> {
    try {
      const snapshot = await PaqueteService.paquetesCollection.where("ciudad", "==", ciudad).get();
      const paquetes: Paquete[] = [];

      snapshot.forEach((doc) => {
        const paqueteData = doc.data();
        paquetes.push({ id: doc.id, ...paqueteData });
      });

      return paquetes;
    } catch (error: any) {
      console.error("Error al obtener paquetes por ciudad:", error);
      throw error; // Re-lanzar el error para que lo maneje el controlador
    }
  }

  /**
   * Método estático para restar unidades de un paquete.
   */
  static async restarUnidadesPaquete(paqueteId: string, cantidad: number): Promise<void> {
    try {
      // Referencia al documento del paquete
      const paqueteRef = this.paquetesCollection.doc(paqueteId);

      // Obtener el documento del paquete
      const paqueteSnapshot = await paqueteRef.get();
      if (!paqueteSnapshot.exists) {
        throw { statusCode: 404, message: "Paquete no encontrado" };
      }

      // Extraer los datos del paquete
      const paqueteData = paqueteSnapshot.data();
      if (!paqueteData || typeof paqueteData.unidades !== 'number') {
        throw { statusCode: 500, message: "Datos del paquete inválidos o campo 'unidades' no encontrado" };
      }

      // Validar que haya suficientes unidades disponibles
      const unidadesActuales = paqueteData.unidades;
      if (unidadesActuales < cantidad) {
        throw { statusCode: 400, message: `No hay suficientes unidades disponibles. Actual: ${unidadesActuales}, Solicitado: ${cantidad}` };
      }

      // Calcular las nuevas unidades
      const nuevasUnidades = unidadesActuales - cantidad;

      if (nuevasUnidades <= 0) {
        // Si las unidades llegan a cero, marcar el paquete como agotado
        await paqueteRef.update({ unidades: 0, agotado: true });
        console.log(`Paquete ${paqueteId} agotado. Unidades restantes: 0`);
      } else {
        // Actualizar las unidades en Firestore
        await paqueteRef.update({ unidades: nuevasUnidades });
        console.log(`Unidades del paquete ${paqueteId} actualizadas. Anterior: ${unidadesActuales}, Nuevas: ${nuevasUnidades}`);
      }
    } catch (error: any) {
      console.error("Error al restar unidades del paquete:", error.message || error);
      throw { ...error, message: `Error al restar unidades del paquete ${paqueteId}: ${error.message || "Error desconocido"}` };
    }
  }

  /**
   * Método estático para aumentar unidades de un paquete.
   */
  static async aumentarUnidadesPaquete(paqueteId: string, cantidad: number): Promise<void> {
    try {
      // Referencia al documento del paquete
      const paqueteRef = this.paquetesCollection.doc(paqueteId);

      // Obtener el documento del paquete
      const paqueteSnapshot = await paqueteRef.get();
      if (!paqueteSnapshot.exists) {
        throw { statusCode: 404, message: "Paquete no encontrado" };
      }

      // Extraer los datos del paquete
      const paqueteData = paqueteSnapshot.data();
      if (!paqueteData || typeof paqueteData.unidades !== 'number') {
        throw { statusCode: 500, message: "Datos del paquete inválidos o campo 'unidades' no encontrado" };
      }

      // Obtener las unidades actuales
      const unidadesActuales = paqueteData.unidades;

      // Calcular las nuevas unidades (suma en lugar de resta)
      const nuevasUnidades = unidadesActuales + cantidad;

      // Actualizar las unidades en Firestore
      await paqueteRef.update({ unidades: nuevasUnidades });

      // Registro de éxito
      console.log(`Unidades del paquete ${paqueteId} actualizadas. Anterior: ${unidadesActuales}, Nuevas: ${nuevasUnidades}`);
    } catch (error: any) {
      console.error("Error al aumentar unidades del paquete:", error.message || error);
      throw { ...error, message: `Error al aumentar unidades del paquete ${paqueteId}: ${error.message || "Error desconocido"}` };
    }
  }

  /**
   * Método estático para calcular la comisión.
   */
  static async calcularComision(paqueteId: string, cantidad: number, comision: number): Promise<number> {
    try {
      // Referencia al documento del paquete
      const paqueteRef = this.paquetesCollection.doc(paqueteId);

      // Obtener el documento del paquete
      const paqueteSnapshot = await paqueteRef.get();
      if (!paqueteSnapshot.exists) {
        throw { statusCode: 404, message: "Paquete no encontrado" };
      }

      // Extraer los datos del paquete
      const paqueteData = paqueteSnapshot.data();
      if (!paqueteData || typeof paqueteData.precioDescuento !== 'number') {
        throw { statusCode: 500, message: "Datos del paquete inválidos o campo 'precioDescuento' no encontrado" };
      }

      const precioPaquete = paqueteData.precioDescuento;

      // Calcular la comisión
      const valorComision = (precioPaquete * comision) * cantidad;
      return valorComision;
    } catch (error: any) {
      console.error("Error al calcular la comisión del paquete:", error.message || error);
      throw { ...error, message: `Error al calcular la comisión del paquete ${paqueteId}: ${error.message || "Error desconocido"}` };
    }
  }

  /**
   * Método estático para obtener un paquete por ID.
   */
  static async obtenerPaquetePorId(paqueteId: string): Promise<Paquete> {
    try {
      // Referencia al documento del paquete
      const paqueteRef = this.paquetesCollection.doc(paqueteId);

      // Obtener el documento del paquete
      const paqueteSnapshot = await paqueteRef.get();
      if (!paqueteSnapshot.exists) {
        throw { statusCode: 404, message: "Paquete no encontrado" };
      }

      // Extraer los datos del paquete
      const paqueteData = paqueteSnapshot.data();
      return { id: paqueteSnapshot.id, ...paqueteData } as Paquete;
    } catch (error: any) {
      console.error("Error al obtener el paquete por ID:", error.message || error);
      throw { ...error, message: `Error al obtener el paquete por ID ${paqueteId}: ${error.message || "Error desconocido"}` };
    }
  }
}

// Exportar una instancia predeterminada de la clase
export const paqueteService = new PaqueteService();