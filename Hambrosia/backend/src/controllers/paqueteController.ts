import { Request, Response } from 'express';
import { paqueteService } from '../services/paqueteService';
import { hashCedula } from '../utils/HELPER';
import { Paquete } from '../models/interfaces';

// Centralized error messages
const ERROR_MESSAGES = {
  MISSING_FIELDS: 'Todos los campos obligatorios deben ser proporcionados',
  INVALID_UNITS: 'El número de unidades debe ser al menos 1',
  INVALID_DATE: 'La fecha de retiro no es válida',
  PUBLISH_ERROR: 'Error al publicar el paquete',
  GET_BY_CITY_ERROR: 'Error al obtener paquetes por ciudad',
  NO_PACKAGES_FOUND: 'No se encontraron paquetes para esta ciudad',
  PACKAGE_NOT_FOUND: 'Paquete no encontrado',
};

// Helper function to fetch a package or return an error
const getPaqueteOrError = async (res: Response, paqueteId: string) => {
  const paquete = await paqueteService.obtenerPaquetePorId(paqueteId);
  if (!paquete) {
    res.status(404).json({ success: false, error: ERROR_MESSAGES.PACKAGE_NOT_FOUND });
    return null;
  }
  return paquete;
};

export const publicarPaquete = async (req: Request, res: Response): Promise<void> => {
  try {
    const { descripcion, precio, precioDescuento, unidades, fechaRetiro, imagenURL } = req.body;
    const { cedRuc } = req.params;

    if (!descripcion || !precio || !precioDescuento || !unidades || !fechaRetiro) {
      res.status(400).json({ success: false, error: ERROR_MESSAGES.MISSING_FIELDS });
      return;
    }

    if (unidades < 1) {
      res.status(400).json({ success: false, error: ERROR_MESSAGES.INVALID_UNITS });
      return;
    }

    const parsedFechaRetiro = new Date(fechaRetiro);
    if (isNaN(parsedFechaRetiro.getTime())) {
      res.status(400).json({ success: false, error: ERROR_MESSAGES.INVALID_DATE });
      return;
    }

    const hashedCedula = hashCedula(cedRuc);
    const resultado = await paqueteService.publicarPaquete(hashedCedula, {
      descripcion,
      precio,
      precioDescuento,
      unidades,
      fechaRetiro: parsedFechaRetiro.toISOString(),
      imagenURL,
    });

    res.status(201).json({
      success: true,
      message: 'Paquete publicado exitosamente',
      data: resultado,
    });
  } catch (error: any) {
    console.error(ERROR_MESSAGES.PUBLISH_ERROR, error.message || error);
    res.status(500).json({ success: false, error: ERROR_MESSAGES.PUBLISH_ERROR });
  }
};

export const getPaqueteByCiudad = async (req: Request, res: Response): Promise<void> => {
  try {
    const { ciudad } = req.params;
    const paquetes = await paqueteService.getPaqueteByCiudad(ciudad);

    if (paquetes.length === 0) {
      res.status(404).json({ success: false, message: ERROR_MESSAGES.NO_PACKAGES_FOUND });
      return;
    }

    res.status(200).json({
      success: true,
      data: paquetes,
    });
  } catch (error: any) {
    console.error(ERROR_MESSAGES.GET_BY_CITY_ERROR, error.message || error);
    res.status(500).json({ success: false, error: ERROR_MESSAGES.GET_BY_CITY_ERROR });
  }
};
