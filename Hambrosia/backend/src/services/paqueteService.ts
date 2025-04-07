// src/services/paqueteService.ts
import { db } from "../config/firebase"; // Importa db
import { Rol } from "../models/interfaces"; // Importa el modelo de Rol si es necesario
import { hashCedula } from "../utils/HELPER"; // Importa la función hashCedula

export class PaqueteService {
  private paquetesCollection = db.collection("paquetes");

  // Método para publicar un paquete
  async publicarPaquete(
    cedulaRUC: string,
    dataPaquete: {
      nombre: string;
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
      // const hashedCedula = hashCedula(cedulaRUC);
      console.log("Hashed Cedula:", cedulaRUC); // Depuración: Imprime la cédula cifrada

      // Buscar el usuario (restaurante) por cedulaRUC
      const usuarioRef = db.collection("usuarios").doc(cedulaRUC);
      const usuarioSnapshot = await usuarioRef.get();

      console.log("Usuario Snapshot:", usuarioSnapshot); // Depuración: Imprime el snapshot completo
      console.log("Existe el usuario?", usuarioSnapshot.exists); // Depuración: Verifica si el documento existe

      if (!usuarioSnapshot.exists) {
        throw { statusCode: 404, message: "Restaurante no encontrado" };
      }

      const usuario = usuarioSnapshot.data();
      console.log("Datos del usuario:", usuario); // Depuración: Imprime los datos del usuario

      if (!usuario) {
        throw { statusCode: 404, message: "Datos del restaurante no encontrados" };
      }

      // Validar que el usuario tenga el rol RESTAURANTE
      if (usuario.rol !== Rol.RESTAURANTE) {
        throw { statusCode: 403, message: "Solo los restaurantes pueden publicar paquetes" };
      }

      

      // Calcular el descuento
      const descuento = ((dataPaquete.precio - dataPaquete.precioDescuento) / dataPaquete.precio) * 100;

      // Crear el objeto del paquete
      const nuevoPaquete = {
        restauranteId: cedulaRUC,
      
        nombre: dataPaquete.nombre,
        descripcion: dataPaquete.descripcion,
        precio: dataPaquete.precio,
        descuento,
        precioDescuento: dataPaquete.precioDescuento,
        unidades: dataPaquete.unidades,
        agotado: false,
        imagenURL: dataPaquete.imagenURL || null, // Opcional
        fechaPublicacion: new Date(),
        fechaRetiro: new Date(dataPaquete.fechaRetiro), // Convertir a Date
      };

      // Guardar el paquete en la colección 'paquetes'
      const paqueteRef = await this.paquetesCollection.add(nuevoPaquete);

      // Devolver el ID del paquete creado junto con los datos
      return { id: paqueteRef.id, ...nuevoPaquete };
    } catch (error: any) {
      console.error("Error en el servicio de publicarPaquete:", error);
      throw error; // Re-lanzar el error para que lo maneje el controlador
    }
  }
}