import { Request, Response } from 'express';
import { CompraService } from '../services/compraService';

const compraService = new CompraService();

export const crearCompra = async (req: Request, res: Response): Promise<void> => {
  try {
    const compraData = req.body;

    // Validar los datos de la compra
    if (!compraData) {
      res.status(400).json({ success: false, error: 'Datos de compra no proporcionados' });
      return;
    }

    // Crear la compra utilizando el servicio
    const nuevaCompra = await compraService.crearCompra(compraData);

    // Responder con la compra creada
    res.status(201).json({
      success: true,
      message: 'Compra creada exitosamente',
      data: nuevaCompra,
    });
  } catch (error) {
    console.error('Error creando la compra:', error);
    res.status(500).json({ success: false, error: 'Error al crear la compra' });
  }
};