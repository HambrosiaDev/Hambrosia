import { db } from "../config/firebase"; // Importa db
import { Rol } from "../models/interfaces"; // Importa el modelo de Rol si es necesario
import { hashCedula } from "../utils/HELPER"; // Importa la función hashCedula

export class PaqueteService {
  // Propiedad estática para la colección de paquetes
  private static paquetesCollection = db.collection("paquetes");

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
  ) {
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
  async getPaqueteByCiudad(ciudad: string) {
    try {
      const snapshot = await PaqueteService.paquetesCollection.where("ciudad", "==", ciudad).get();
      const paquetes: any[] = [];

      snapshot.forEach((doc) => {
        paquetes.push({ id: doc.id, ...doc.data() });
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

      // Actualizar las unidades en Firestore
      await paqueteRef.update({ unidades: nuevasUnidades });

      // Registro de éxito
      console.log(`Unidades del paquete ${paqueteId} actualizadas. Anterior: ${unidadesActuales}, Nuevas: ${nuevasUnidades}`);
    } catch (error: any) {
      // Registro del error
      console.error("Error al restar unidades del paquete:", error.message || error);

      // Re-lanzar el error con contexto adicional
      throw { ...error, message: `Error al restar unidades del paquete ${paqueteId}: ${error.message || "Error desconocido"}` };
    }
  }
}

// Exportar una instancia predeterminada de la clase
export const paqueteService = new PaqueteService();