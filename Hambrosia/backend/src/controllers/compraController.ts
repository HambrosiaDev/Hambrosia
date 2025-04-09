import { Request, Response } from 'express';
import { CompraService } from '../services/compraService';
import { PaqueteService } from '../services/paqueteService';
import { verificarCodigo } from '../utils/HELPER';
import { Compra } from '../models/interfaces';
import { UsuarioService } from '../services/usuarioService';
import { Usuario } from '../models/interfaces';

const compraService = new CompraService();
const usuarioService = new UsuarioService();

export const confirmarCompra = async (req: Request, res: Response): Promise<void> => {
  try {
    const { compraId } = req.params;
    const { codigo, calificacion } = req.body;

    // Validar que los campos obligatorios estén presentes
    if (!codigo) {
      res.status(400).json({ success: false, error: 'El código es requerido para confirmar la compra' });
      return;
    }

    // Obtener los datos de la compra
    const compra = await compraService.getCompraById(compraId);
    if (!compra) {
      res.status(404).json({ success: false, error: 'La compra no existe' });
      return;
    }

    const codigoAlmacenado = compra.codigo as string;
 
    // Verificar el código
    const codigoValido = await verificarCodigo(codigo, codigoAlmacenado);
    if (!codigoValido) {
      res.status(400).json({ success: false, error: 'El código ingresado no es válido' });
      return;
    }

    // Calcular la comisión
    const comision = await PaqueteService.calcularComision(compra.paqueteId, compra.cantidadComprada);

    // Actualizar la compra
    const compraConfirmada = await compraService.confirmarCompra(compraId, {
      pagado: true,
      confirmacionCodigo: true,
      retirado: true,
      fechaCompra: new Date(),
      comision,
      valorComision: compra.cantidadComprada * comision,
      calificacion,
    });

    // Responder con la compra confirmada
    res.status(200).json({
      success: true,
      message: 'Compra confirmada exitosamente',
      data: compraConfirmada,
    });
  } catch (error: any) {
    console.error('Error confirmando la compra:', error.message || error);
    res.status(500).json({ success: false, error: error.message || 'Error al confirmar la compra' });
  }
};

export const crearCompra = async (req: Request, res: Response): Promise<void> => {
  try {
    const { paqueteId } = req.params; // ID del paquete desde los parámetros
    const { clienteId, restauranteId, cantidadComprada, metodoPago } = req.body;

    // Validar que todos los campos obligatorios estén presentes
    if (!clienteId || !restauranteId || !cantidadComprada || !metodoPago) {
      res.status(400).json({ success: false, error: 'Faltan datos obligatorios para crear la compra' });
      return;
    }
    // Verificar que el cliente y el restaurante existen
    const cliente = await usuarioService.getById(clienteId);
    if (!cliente) {
      res.status(404).json({ success: false, error: 'El cliente no existe' });
      return;
    }

    const restaurante = await usuarioService.getById(restauranteId);
    if (!restaurante) {
      res.status(404).json({ success: false, error: 'El restaurante no existe' });
      return;
    }

    // Crear la compra utilizando el servicio
    const compraData: Compra = {
      clienteId,
      restauranteId,
      paqueteId,
      cantidadComprada,
      metodoPago,
      pagado: false,
      confirmacionCodigo: false,
      retirado: false,
    };

    const nuevaCompra = await compraService.crearCompra(paqueteId, compraData);

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