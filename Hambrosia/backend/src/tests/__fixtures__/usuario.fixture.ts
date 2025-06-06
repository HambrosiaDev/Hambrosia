import { Rol, Usuario } from '../../models/interfaces';

// Test data
export const cedulaCliente = '1722966650';

export const usuarioClienteFixture: Usuario = {
  id: 'hashed_id_123',
  correo: 'cliente@example.com',
  cedulaRUC: cedulaCliente,
  nombre: 'Juan Pérez',
  ciudad: 'Quito',
  fechaNacimiento: new Date('1969-01-01'),
  rol: 'CLIENTE' as Rol,
  firebaseUid: 'firebase_cliente_123',
  expoPushToken: 'token_expo_cliente',
  activo: true,
  intentosFallidos: 0,
  strikes: 0,
  bloqueadoHasta: undefined,
  motivoBloqueo: undefined
};

export const usuarioRestauranteFixture: Usuario = {
  id: 'hashed_id_456',
  correo: 'restaurante@example.com',
  cedulaRUC: '1000339992001',
  nombre: 'Restaurante Test',
  ciudad: 'Quito',
  fechaNacimiento: new Date('1990-01-01'),
  rol: 'RESTAURANTE' as Rol,
  firebaseUid: 'firebase_restaurante_123',
  expoPushToken: 'token_expo_restaurante',
  activo: true,
  intentosFallidos: 0,
  strikes: 0,
  bloqueadoHasta: undefined,
  motivoBloqueo: undefined
};
