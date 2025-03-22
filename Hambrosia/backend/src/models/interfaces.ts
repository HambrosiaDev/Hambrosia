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

// Interfaces
export interface Usuario {
  id: string;
  correo: string;
  cedulaRUC: string;
  rol: Rol;
  // Add other properties as needed
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