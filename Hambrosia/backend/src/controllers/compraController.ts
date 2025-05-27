import { Request, Response } from 'express';
import { db } from '../config/firebase';
import { Compra, Paquete, Usuario } from '../models/interfaces';
import { CompraService } from '../services/compraService';
import { PaqueteService } from '../services/paqueteService';
import { reporteService } from '../services/reporteService';
import { UsuarioService } from '../services/usuarioService';
import { generarCodigoAleatorioSeguro, hashCedula, verificarCodigo } from '../utils/HELPER';


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
    const { clienteId, restauranteId, cantidadComprada, metodoElegido } = req.body;

    if (!clienteId || !restauranteId || !cantidadComprada || !metodoElegido) {
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

    const Paquete = await paqueteService.obtenerPaquetePorId(paqueteId);
    if (!Paquete) {
      res.status(404).json({ success: false, error: 'El paquete no existe' });
      return;
    }

    if (!restaurante.metodoPago || !restaurante.metodoPago.includes(metodoElegido)) {
      res.status(400).json({ success: false, error: 'Método de pago no disponible para este paquete' });
      return;
    }

    const totalPaquete = Paquete.precioDescuento * cantidadComprada;
    const codigo = generarCodigoAleatorioSeguro();

    console.log('Código generado:', codigo);
    const compraData: Compra = {
      clienteId,
      restauranteId,
      paqueteId,
      codigo: codigo,
      cantidadComprada,
      metodoElegido: metodoElegido,
      pagado: false,
      confirmacionCodigo: false,
      retirado: false,
      precioApagar: totalPaquete,
      cancelado: false,
    };

    const nuevaCompra = await compraService.crearCompra(paqueteId, compraData);
    if (nuevaCompra.id !== undefined) {
    }
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
    await reporteService.reporteRestauranteToCliente(compraId, 'Compra cancelada por el cliente');
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

  export const getComisionMensualByRestauranteId = async (req: Request, res: Response): Promise<void> => {
    try {
        const { mes, restauranteId } = req.params;
        if (!mes || !restauranteId) {
            res.status(400).json({ success: false, error: "Faltan datos obligatorios" });
            return;
        }
        const hashedId = hashCedula(restauranteId);
        const comisionMensual = await compraService.getComisionMensualByRestauranteId(mes, hashedId);
        if (!comisionMensual) {
            res.status(404).json({ success: false, error: "No hay comisiones para este restaurante en este mes" });
            return;
        }

        res.status(200).json({
            success: true,
            data: comisionMensual,
        });
    } catch (error: any) {
        console.error(ERROR_MESSAGES.GENERIC_ERROR, error.message || error);
        res.status(500).json({ success: false, error: ERROR_MESSAGES.GENERIC_ERROR });
    }
  }

  export const getCodigoByCompraId = async (req: Request, res: Response): Promise<void> => {
    try {
        const { compraId } = req.params;
        if (!compraId) {
            res.status(400).json({ success: false, error: "No hay una compra con ese ID" });
            return;
        }

        const codigo = await compraService.getCodigoConfirmacion(compraId);
        if (!codigo) {
            res.status(404).json({ success: false, error: "No hay compra con ese ID" });
            return;
        }

        res.status(200).json({
            success: true,
            data: codigo
        });

    } catch (error: any) {
        console.error(ERROR_MESSAGES.GENERIC_ERROR, error.message || error);
        res.status(500).json({ success: false, error: ERROR_MESSAGES.GENERIC_ERROR });
    }
  }

  export const getComprasActivasByClienteId = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { clienteId } = req.params;
      const { cursor } = req.query;
  
      if (!clienteId) {
        res.status(400).json({ success: false, error: "Cliente ID no proporcionado" });
        return;
      }
  
      const { compras, nextCursor } = await compraService.getComprasActivasByClienteId(clienteId, cursor as string | null);
  
      if (!compras.length) {
        res.status(404).json({ success: false, error: "No hay compras activas para este cliente" });
        return;
      }
  
      // Si obtenerPaquetePorId es asíncrono:
      const comprasConRestaurante = await Promise.all(
        compras.map(async (compra) => {
          const paquete = await paqueteService.obtenerPaquetePorId(compra.paqueteId);
          return {
            ...compra,
            nombreRestaurante: paquete ? paquete.nombreRestaurante : null,
          };
        })
      );
  
      res.status(200).json({
        success: true,
        data: comprasConRestaurante,
        nextCursor,
      });
    } catch (error: any) {
      console.error(ERROR_MESSAGES.GENERIC_ERROR, error.message || error);
      res.status(500).json({ success: false, error: ERROR_MESSAGES.GENERIC_ERROR });
    }
  };

  export const getComprasCompletadasByClienteId = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { clienteId } = req.params;
      const { cursor } = req.query;
  
      if (!clienteId) {
        res.status(400).json({ success: false, error: "Cliente ID no proporcionado" });
        return;
      }
  
      const { compras, nextCursor } = await compraService.getComprasCompletadasByClienteId(
        clienteId,
        cursor as string | null
      );
  
      if (!compras.length) {
        res.status(404).json({ success: false, error: "No hay compras completadas para este cliente" });
        return;
      }
  
      // Si necesitas incluir información adicional como el nombre del restaurante:
      const comprasConRestaurante = await Promise.all(
        compras.map(async (compra) => {
          const paquete = await paqueteService.obtenerPaquetePorId(compra.paqueteId);
          return {
            ...compra,
            nombreRestaurante: paquete?.nombreRestaurante || null,
          };
        })
      );
  
      res.status(200).json({
        success: true,
        data: comprasConRestaurante,
        nextCursor,
      });
    } catch (error: any) {
      console.error(ERROR_MESSAGES.GENERIC_ERROR, error.message || error);
      res.status(500).json({ success: false, error: ERROR_MESSAGES.GENERIC_ERROR });
    }
  };


  export const getComprasByRestauranteId = async (req: Request, res: Response): Promise<void> => {
    try {
        const { restauranteId, fechaCompra } = req.params;

        if (!restauranteId || !fechaCompra) {
            res.status(400).json({ success: false, error: "Faltan datos obligatorios" });
            return;
        }

        // Validar que la fecha sea válida
        const parsedDate = new Date(fechaCompra);
        if (isNaN(parsedDate.getTime())) {
            res.status(400).json({ success: false, error: "Formato de fecha inválido" });
            return;
        }
        const formattedDate = parsedDate.toISOString().split('T')[0];
        const compras = await compraService.getComprasByRestauranteId(restauranteId, formattedDate);

        if (!compras.length) {
            res.status(404).json({ success: false, error: "No hay compras para este restaurante en la fecha especificada" });
            return;
        }


        res.status(200).json({
            success: true,
            data: compras,
        });

    } catch (error: any) {
        console.error(ERROR_MESSAGES.GENERIC_ERROR, error.message || error);
        res.status(500).json({ success: false, error: ERROR_MESSAGES.GENERIC_ERROR });
    }
}

export const getComprasCanceladasByClienteId = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { clienteId } = req.params;
    const { cursor } = req.query;

    if (!clienteId) {
      res.status(400).json({ success: false, error: "Cliente ID no proporcionado" });
      return;
    }

    const { compras, nextCursor } = await compraService.getComprasCanceladasByClienteId(
      clienteId,
      cursor as string | null
    );

    if (!compras.length) {
      res.status(404).json({ success: false, error: "No hay compras canceladas para este cliente" });
      return;
    }

    // Si necesitas incluir información adicional como el nombre del restaurante:
    const comprasConRestaurante = await Promise.all(
      compras.map(async (compra) => {
        const paquete = await paqueteService.obtenerPaquetePorId(compra.paqueteId);
        return {
          ...compra,
          nombreRestaurante: paquete?.nombreRestaurante || null,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: comprasConRestaurante,
      nextCursor,
    });
  } catch (error: any) {
    console.error(ERROR_MESSAGES.GENERIC_ERROR, error.message || error);
    res.status(500).json({ success: false, error: ERROR_MESSAGES.GENERIC_ERROR });
  }
}