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

// Interfaces
export interface Usuario {
  id: string;
  rol: Rol;
  // Login
  correo: string;

  // Identificacion
  cedulaRUC: string; // Identificador unico
  nombre: string; // Nombre completo
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

  // Auditoria
  // createdAt: Date;
  // updatedAt: Date;
}

export interface Paquete {
  id: string;
  restauranteId: string;
  visibilidad: boolean;
  agotado: boolean;
  // Add other properties as needed
}

export interface Compra {
  id: string;
  codigo: string;
  usuarioId: string;
  paqueteId: string;
  // Add other properties as needed
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