import { Request, Response } from 'express';
import { CompraService } from '../services/compraService';
import { Compra } from '../models/interfaces';
import {usuarioService, UsuarioService} from '../services/usuarioService';

const compraService = new CompraService();

export const crearCompra = async (req: Request, res: Response): Promise<void> => {
  try {
    const { paqueteId, clienteId, restauranteId, } = req.params;

    const compraData: Partial<Compra> = {
      cantidadComprada: req.body.cantidadComprada,
      metodoPago: req.body.metodoPago,
      paqueteId: paqueteId,
      clienteId: clienteId,
      restauranteId: restauranteId,
    };

    // Validar que todos los campos obligatorios estén presentes
    if (
      !compraData.cantidadComprada ||
      !compraData.metodoPago
    ) {
      res.status(400).json({ success: false, error: 'Faltan datos obligatorios para crear la compra' });
      return;
    }
    console.log(compraData.clienteId, compraData.restauranteId)
    const usuario = await usuarioService.getById(clienteId)
    if (!usuario) {
      res.status(400).json({ success: false, error: 'El cliente no existe' });
      return;
    }

    const restaurante = await usuarioService.getById(restauranteId)
    if (!restaurante) {
      res.status(400).json({ success: false, error: 'El restaurante no existe' });
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