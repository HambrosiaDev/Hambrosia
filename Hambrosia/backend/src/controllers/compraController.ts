import { Request, Response } from 'express';
import { CompraService } from '../services/compraService';
import { Compra } from '../models/interfaces';


const compraService = new CompraService();

export const crearCompra = async (req: Request, res: Response): Promise<void> => {
  try {
    const { paqueteId } = req.params; // Mover aquí para usarlo en compraData
    
    const compraData: Compra={
      clienteId: req.body.clienteId,
      restauranteId: req.body.restauranteId,
      paqueteId: req.body.paqueteId,
      cantidadComprada: req.body.cantidadComprada,
      metodoPago: req.body.metodoPago
    }

    // Validar los datos de la compra
    if (!compraData) {
      res.status(400).json({ success: false, error: 'Datos de compra no proporcionados' });
      return;
    }

    // Crear la compra utilizando el servicio
    const nuevaCompra = await compraService.crearCompra(paqueteId, compraData);

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