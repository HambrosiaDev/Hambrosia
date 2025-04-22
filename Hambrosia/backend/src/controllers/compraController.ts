import { request, Request, response, Response } from 'express';
import { CompraService } from '../services/compraService';
import { PaqueteService } from '../services/paqueteService';
import { verificarCodigo } from '../utils/HELPER';
import { Compra } from '../models/interfaces';
import { UsuarioService } from '../services/usuarioService';
import { reporteService } from '../services/reporteService';
import { generarCodigoAleatorioSeguro, hashCedula } from '../utils/HELPER';

const compraService = new CompraService();
const usuarioService = new UsuarioService();
const paqueteService = new PaqueteService();

// Centralized error messages
const ERROR_MESSAGES = {
  COMPRA_NOT_FOUND: 'La compra no existe',
  MISSING_DATA: 'Faltan datos obligatorios',
  INVALID_CODE: 'El código ingresado no es válido',
  CONFIRMING_ERROR: 'Error al confirmar la compra',
  CREATING_ERROR: 'Error al crear la compra',
  CANCELING_ERROR: 'Error al cancelar la compra',
  GENERIC_ERROR: 'Error en la operación',
};

// Helper function to fetch a compra or return an error
const getCompraOrError = async (res: Response, compraId: string) => {
  const compra = await compraService.getCompraById(compraId);
  if (!compra) {
    res.status(404).json({ success: false, error: ERROR_MESSAGES.COMPRA_NOT_FOUND });
    return null;
  }
  return compra;
};

export const confirmarCompra = async (req: Request, res: Response): Promise<void> => {
  try {
    const { compraId } = req.params;
    const { codigo, calificacion } = req.body;

    if (!codigo) {
      res.status(400).json({ success: false, error: 'El código es requerido para confirmar la compra' });
      return;
    }

    const compra = await getCompraOrError(res, compraId);
    if (!compra) return;

    const codigoValido = await verificarCodigo(codigo, compra.codigo as string);
    if (!codigoValido) {
      res.status(400).json({ success: false, error: ERROR_MESSAGES.INVALID_CODE });
      return;
    }

    const comision = await paqueteService.calcularComision(compra.paqueteId, compra.cantidadComprada);
    const compraConfirmada = await compraService.confirmarCompra(compraId, {
      pagado: true,
      confirmacionCodigo: true,
      retirado: true,
      fechaCompra: new Date(),
      comision,
      valorComision: compra.cantidadComprada * comision,
      calificacion,
    });

    res.status(200).json({
      success: true,
      message: 'Compra confirmada exitosamente',
      data: compraConfirmada,
    });
  } catch (error: any) {
    console.error(ERROR_MESSAGES.CONFIRMING_ERROR, error.message || error);
    res.status(500).json({ success: false, error: ERROR_MESSAGES.CONFIRMING_ERROR });
  }
};

export const crearCompra = async (req: Request, res: Response): Promise<void> => {
  try {
    const { paqueteId } = req.params;
    const { clienteId, restauranteId, cantidadComprada, metodoPago } = req.body;

    if (!clienteId || !restauranteId || !cantidadComprada || !metodoPago) {
      res.status(400).json({ success: false, error: ERROR_MESSAGES.MISSING_DATA });
      return;
    }

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

    const codigo =  generarCodigoAleatorioSeguro();
    console.log('Código generado:', codigo);
    const compraData: Compra = {
      clienteId,
      restauranteId,
      paqueteId,
      codigo: hashCedula(codigo), 
      cantidadComprada,
      metodoPago,
      pagado: false,
      confirmacionCodigo: false,
      retirado: false,
    };

    const nuevaCompra = await compraService.crearCompra(paqueteId, compraData);

    res.status(201).json({
      success: true,
      message: 'Compra creada exitosamente',
      data: nuevaCompra,
    });
  } catch (error: any) {
    console.error(ERROR_MESSAGES.CREATING_ERROR, error.message || error);
    res.status(500).json({ success: false, error: ERROR_MESSAGES.CREATING_ERROR });
  }
};

export const cancelarCompra = async (req: Request, res: Response): Promise<void> => {
  try {
    const { compraId } = req.params;
    const compra = await getCompraOrError(res, compraId);
    if (!compra) return;
    await usuarioService.incrementarStrike(compra.clienteId);
    await paqueteService.aumentarUnidadesPaquete(compra.paqueteId, compra.cantidadComprada);
    const compraCancelada = await compraService.actualizarCompra(compraId, {
      confirmacionCodigo: false,
      cancelado: true,
      retirado: false,
      pagado: false,
      cantidadComprada: 0,
    });

    await reporteService.crearReporte(compraId, 'Compra cancelada por el cliente');

    res.status(200).json({
      success: true,
      message: 'Compra cancelada exitosamente',
      data: compraCancelada,
    });

  } catch (error: any) {
    console.error(ERROR_MESSAGES.CANCELING_ERROR, error.message || error);
    res.status(500).json({ success: false, error: ERROR_MESSAGES.CANCELING_ERROR });
  }
};
