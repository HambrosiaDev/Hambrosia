import { request, Request, response, Response } from 'express';
import { CompraService } from '../services/compraService';
import { PaqueteService } from '../services/paqueteService';
import { verificarCodigo } from '../utils/HELPER';
import { Compra, Paquete, Usuario , MetodoPago} from '../models/interfaces';
import { UsuarioService } from '../services/usuarioService';
import { reporteService } from '../services/reporteService';
import { generarCodigoAleatorioSeguro, hashCedula } from '../utils/HELPER';
import { db } from '../config/firebase';


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
// comparar paquete.metodoPago con metodoElegido
    if (!restaurante.metodoPago || !restaurante.metodoPago.includes(metodoElegido)) {
      res.status(400).json({ success: false, error: 'Método de pago no disponible para este paquete' });
      return;
    }

    const totalPaquete = Paquete.precioDescuento * cantidadComprada;
    const codigo =  generarCodigoAleatorioSeguro();

    console.log('Código generado:', codigo);
    const compraData: Compra = {
      clienteId,
      restauranteId,
      paqueteId,
      codigo: hashCedula(codigo), 
      cantidadComprada,
      metodoElegido: metodoElegido,
      pagado: false,
      confirmacionCodigo: false,
      retirado: false,
      precioApagar: totalPaquete,
    };
    const nuevaCompra = await compraService.crearCompra(paqueteId, compraData);
    if (nuevaCompra.id !== undefined) {
      await crearNotificacion( nuevaCompra.id , false);
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
    await compraService.actualizarNotificacionCompra( compraId, {
      cancelado: true});
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

export const crearNotificacion = async (compraId: string, cancelado: boolean): Promise<any> => {
  try {
    // Paso 1: Validar y obtener el ID de compra
    if (!compraId) {
      throw new Error("No hay una compra con ese ID");
    }

    // Paso 2: Verificar que la compra exista
    const compraSnapshot = await db.collection('compras').doc(compraId).get();
    if (!compraSnapshot.exists) {
      throw new Error("No hay compra con ese Id");
    }
    const compra = compraSnapshot.data() as Compra;

    // Paso 3: Obtener datos del usuario asociado a la compra
    const usuarioSnapshot = await db.collection('usuarios').doc(compra.clienteId).get();
    if (!usuarioSnapshot.exists) {
      throw new Error("No hay usuario con ese Id");
    }
    const usuario = usuarioSnapshot.data() as Usuario;
    const nombreCliente = usuario.nombre;

    // Paso 4: Obtener datos del paquete asociado a la compra
    const paqueteSnapshot = await db.collection('paquetes').doc(compra.paqueteId).get();
    if (!paqueteSnapshot.exists) {
      throw new Error("No hay paquete con ese Id");
    }
    const paquete = paqueteSnapshot.data() as Paquete;
    const nombrePaquete = paquete.descripcion;

    // Paso 5: Crear la notificación en el servicio
    const isCancelado = cancelado;
    const notificacion = await compraService.crearNotificacionCompra(compraId, {
      nombreCliente,
      nombrePaquete,
      cancelado,
    });

    return notificacion; // Devuelve los datos de la notificación
  } catch (error: any) {
    console.error("Error al crear la notificación:", error.message || error);
    throw error; // Propaga el error al controlador principal
  }
};

export const getNotificacionByCompraId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { compraId } = req.params;
    if (!compraId) {
      res.status(400).json({ success: false, error: "No hay una compra con ese ID" });
      return;
    }

    const notificacion = await compraService.getNotificacionCompra(compraId);
    if (!notificacion) {
      res.status(404).json({ success: false, error: "No hay notificación con ese ID" });
      return;
    }

    res.status(200).json({
      success: true,
      data: notificacion,
    });
  } catch (error: any) {
    console.error(ERROR_MESSAGES.GENERIC_ERROR, error.message || error);
    res.status(500).json({ success: false, error: ERROR_MESSAGES.GENERIC_ERROR });
  }
}
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


