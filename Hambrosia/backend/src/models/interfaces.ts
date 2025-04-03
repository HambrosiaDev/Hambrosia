// Enums
export enum Rol {
  RESTAURANTE = 'RESTAURANTE',
  CLIENTE = 'CLIENTE',
  ADMIN = 'ADMIN'
}

export enum TipoReporte {
  VENTAS = 'VENTAS',
  USUARIOS = 'USUARIOS',
  // Add other report types as needed
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
  correo: string;
  cedulaRUC: string;
  nombre: string;
  rol: Rol;
  firebaseUid: string;
  fechaNacimiento?: Date; // Solo se pide a Cliente
  // direccion?: string; // Solo se pide a Restaurante
  alergenos?: Alergeno[]; // Solo se pide a Restaurante
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