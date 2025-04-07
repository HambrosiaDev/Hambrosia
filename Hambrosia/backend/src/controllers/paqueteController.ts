// src/controllers/paqueteController.ts
import { Request, Response, NextFunction } from "express";
import { PaqueteService } from "../services/paqueteService";
import { hashCedula } from "../utils/HELPER";

// Instancia del servicio
const paqueteService = new PaqueteService();

// Controlador para publicar un paquete
export const publicarPaquete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Extraer datos del cuerpo de la solicitud y parámetros
    const { nombre, descripcion, precio, precioDescuento, unidades, fechaRetiro, imagenURL } = req.body;
    const { cedRuc } = req.params;

    // Validar campos obligatorios
    if (!nombre || !descripcion || !precio || !precioDescuento || !unidades || !fechaRetiro) {
      res.status(400).json({ success: false, error: "Todos los campos obligatorios deben ser proporcionados" });
      return;
    }

    if (unidades < 1) {
      res.status(400).json({ success: false, error: "El número de unidades debe ser al menos 1" });
      return;
    }

    // Encriptar la cédula RUC
    const hashedCedula = hashCedula(cedRuc);

    // Convertir fechaRetiro a un objeto Date
    const parsedFechaRetiro = new Date(fechaRetiro);
    if (isNaN(parsedFechaRetiro.getTime())) {
      res.status(400).json({ success: false, error: "La fecha de retiro no es válida" });
      return;
    }

    // Llamar al servicio para publicar el paquete
    const resultado = await paqueteService.publicarPaquete(hashedCedula, {
      nombre,
      descripcion,
      precio,
      precioDescuento,
      unidades,
      fechaRetiro: parsedFechaRetiro.toISOString(), // Convertir a ISO string para Firestore
      imagenURL,
    });

    // Devolver respuesta exitosa
    res.status(201).json({
      success: true,
      message: "Paquete publicado exitosamente",
      data: resultado,
    });
  } catch (error: any) {
    console.error("Error en el controlador de publicarPaquete:", error);
    next(error); // Pasar el error al middleware de manejo de errores
  }
};