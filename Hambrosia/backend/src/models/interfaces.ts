export enum TipoReporte {
  VENTAS = 'VENTAS',
  USUARIOS = 'USUARIOS',
  // Add other report types as needed
}

export enum Rol {
  RESTAURANTE = 'RESTAURANTE',
  CLIENTE = 'CLIENTE',
  ADMIN = 'ADMIN'
}

export enum Alergeno {
  GLUTEN = 'GLUTEN',
  LACTOSA = 'LACTOSA',
  FRUTOS_SECOS = 'FRUTOS_SECOS',
  MARISCOS = 'MARISCOS',
  HUEVO = 'HUEVO',
  SOJA = 'SOJA',
  PESCADO = 'PESCADO',
  MANI = 'MANI',
  TRIGO = 'TRIGO',
  SESAMO = 'SESAMO'
}

export enum Ciudad {
  AMBATO = 'AMBATO',               // Tungurahua
  BABAHOYO = 'BABAHOYO',           // Los Ríos
  CUENCA = 'CUENCA',               // Azuay
  ESMERALDAS = 'ESMERALDAS',       // Esmeraldas
  GUARANDA = 'GUARANDA',           // Bolívar
  GUAYAQUIL = 'GUAYAQUIL',         // Guayas
  IBARRA = 'IBARRA',               // Imbabura
  LATACUNGA = 'LATACUNGA',         // Cotopaxi
  LOJA = 'LOJA',                   // Loja
  MACHALA = 'MACHALA',             // El Oro
  MACAS = 'MACAS',                 // Morona Santiago
  NUEVA_LOJA = 'NUEVA LOJA',       // Sucumbíos
  PUYO = 'PUYO',                   // Pastaza
  PORTOVIEJO = 'PORTOVIEJO',       // Manabí
  QUITO = 'QUITO',                 // Pichincha
  RIOBAMBA = 'RIOBAMBA',           // Chimborazo
  SANTA_ELENA = 'SANTA ELENA',     // Santa Elena
  SANTO_DOMINGO = 'SANTO DOMINGO', // Santo Domingo de los Tsáchilas
  TENA = 'TENA',                   // Napo
  TULCAN = 'TULCAN',               // Carchi
  ZAMORA = 'ZAMORA',               // Zamora Chinchipe
  ZARUMA = 'ZARUMA',               // (Antigua capital de El Oro, actual es Machala)
  FRANCISCO_DE_ORELLANA = 'FRANCISCO DE ORELLANA', // Orellana
  PUERTO_BAQUERIZO_MORENO = 'PUERTO BAQUERIZO MORENO' // Galápagos
}


// Interfaces
export interface Usuario {
  id: string;
  rol: Rol;
  // Login
  correo: string;

  // Identificacion
  cedulaRUC: string; // Identificador unico
  nombre: string; // Nombre completo
  ciudad: Ciudad; // Ciudad de residencia
  direccion: string; // Ciudad y direccion
  firebaseUid: string;

  // Estado del usuario
  activo: boolean; // true = usuario activo, false = baneado por strikes
  intentosFallidos: number; // Contador de intentos fallidos
  bloqueadoHasta?: Date; // Fecha hasta la que el usuario esta bloqueado (por intentos fallidos o strikes)
  motivoBloqueo?: string; // Razón del bloqueo (para mostrar al usuario)

  // Solo Clientes
  fechaNacimiento?: Date;
  strikes?: number;

  // Solo Restaurantes
  alergenos?: Alergeno[];
}

export interface Paquete {
  // Solo los restaurantes pueden crear paquetes
  restauranteId: string;

  // Información del paquete
  nombreRestaurante: string;
  descripcion: string;
  
  precio: number;                // Ingresado manualmente por el restaurante
  descuento?: number;            // Porcentaje de descuento (opcional), calculado en base a precio y precioDescuento
  precioDescuento: number;       // Ingresado manualmente por el restaurante

  unidades: number;              // Mínimo 1
  agotado?: boolean;             // True si ya no hay unidades disponibles

  imagenURL?: string | null;     // URL de la imagen del paquete

  fechaPublicacion: Date;        // Fecha de publicación del paquete
  fechaRetiro: Date;             // Fecha en la que se retirará el paquete (opcional)
  ciudad: Ciudad;    
}


export interface Compra {
  id: string;
  codigo: string;
  confirmacionCodigo: boolean; // true = compra confirmada, false = compra no confirmada
  clienteId: string;
  restauranteId: string;
  paqueteId: string;
  pagado: boolean; // true = compra pagada, false = compra no pagada
  retirado: boolean; // true = compra retirada, false = compra no retirada
  calificacion?: 1|2|3|4|5; // Calificación de la compra (opcional)
  fechaCompra?: Date; // Fecha de la compra
  comision: 0.1; // Comision del restaurante
  valorComision: number; // Valor de la comision
  cantidadComprada: number; // Cantidad comprada del paquete
  cancelado?: boolean; // true = compra cancelada, false = compra no cancelada
  metodoPago: "EFECTIVO" | "TARJETA"; // Método de pago (opcional)
}

export interface Reporte {
  id: string;
  tipo: TipoReporte;
  // Add other properties as needed
}

export interface Comision {
  id: string;
  restauranteId: string;
  // Add other properties as needed
}