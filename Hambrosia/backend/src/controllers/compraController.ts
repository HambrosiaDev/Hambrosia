import { Request, Response } from 'express';
import { CompraService } from '../services/compraService';
import { Compra } from '../models/interfaces';

const compraService = new CompraService();

export const crearCompra = async (req: Request, res: Response): Promise<void> => {
  try {
    const { paqueteId } = req.params;

    const compraData: Partial<Compra> = {
      clienteId: req.body.clienteId,
      restauranteId: req.body.restauranteId,
      cantidadComprada: req.body.cantidadComprada,
      metodoPago: req.body.metodoPago,
    };

    // Validar que todos los campos obligatorios estén presentes
    if (
      !compraData.clienteId ||
      !compraData.restauranteId ||
      !compraData.cantidadComprada ||
      !compraData.metodoPago
    ) {
      res.status(400).json({ success: false, error: 'Faltan datos obligatorios para crear la compra' });
      return;
    }

    // Crear la compra utilizando el servicio
    const nuevaCompra = await compraService.crearCompra(paqueteId, compraData as Compra);

    // Responder con la compra creada
    res.status(201).json({
      success: true,
      message: 'Compra creada exitosamente',
      data: nuevaCompra,
    });
  } catch (error: any) {
    console.error('Error creando la compra:', error.message || error);
    res.status(500).json({ success: false, error: error.message || 'Error al crear la compra' });
  }
};