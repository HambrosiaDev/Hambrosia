import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';
import {
  Alergeno,
  MetodoPago,
  generateRandomString,
  generarFechaNacimiento,
  generarCedulaValida,
  generarRucSociedadPrivadaValido,
  logError
} from './utils.js';

// Custom metrics
const errorRate = new Rate('errors');

// Test configuration
export const options = {
  scenarios: {
    concurrent_users: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 5 },   // Ramp up to 5 users
        { duration: '1m', target: 5 },    // Stay at 5 users
        { duration: '30s', target: 10 },  // Ramp up to 10 users
        { duration: '1m', target: 10 },   // Stay at 10 users
        { duration: '30s', target: 0 },   // Ramp down to 0 users
      ],
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<5000'], // 95% of requests should be below 5s
    errors: ['rate<0.3'],              // Error rate should be below 30%
  },
};

// Test data
const BASE_URL = 'https://hambrosia.onrender.com/api';

// Common headers
const headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};

// Test scenarios
export default function() {
  // Test 1: User Registration (CLIENTE)
  const cedulaCliente = generarCedulaValida();
  const emailCliente = `cliente${generateRandomString(8)}@example.com`;
  const firebaseUidCliente = `firebase-${generateRandomString(20)}`;
  
  const clienteData = {
    correo: emailCliente,
    cedulaRUC: cedulaCliente,
    nombre: `Cliente Test ${generateRandomString(5)}`,
    ciudad: "Quito",
    rol: "CLIENTE",
    firebaseUid: firebaseUidCliente,
    fechaNacimiento: generarFechaNacimiento(),
    direccion: "Calle Test 123",
    expoPushToken: "U2FsdGVkX1+3YJYa3AaMWr/VwtnmujTuSqOMJoWEgUI="
  };

  const registerClienteResponse = http.post(`${BASE_URL}/usuarios/register`, JSON.stringify(clienteData), {
    headers: headers
  });

  check(registerClienteResponse, {
    'cliente registration successful': (r) => r.status === 201 || r.status === 409,
    'cliente registration response has data': (r) => r.status === 409 || r.json('data') !== undefined,
  }) || errorRate.add(1);

  if (registerClienteResponse.status !== 201 && registerClienteResponse.status !== 409) {
    logError('registro de cliente', registerClienteResponse);
    return;
  }

  // Aumentar el tiempo de espera después del registro
  sleep(5);  // Esperar 5 segundos después del registro

  // Verificar que el cliente existe y obtener su ID hasheado
  const verifyClienteResponse = http.get(`${BASE_URL}/usuarios/${cedulaCliente}`, {
    headers: headers
  });

  if (verifyClienteResponse.status !== 200) {
    logError('verificación de cliente', verifyClienteResponse);
    return;
  }

  const clienteInfo = verifyClienteResponse.json('data');
  if (!clienteInfo || !clienteInfo.id) {
    logError('ID hasheado de cliente no encontrado', { clienteInfo });
    return;
  }

  const clienteIdHash = clienteInfo.id;

  sleep(2);

  // Test 2: User Registration (RESTAURANTE)
  const rucRestaurante = generarRucSociedadPrivadaValido();
  const emailRestaurante = `restaurante${generateRandomString(8)}@example.com`;
  const firebaseUidRestaurante = `firebase-${generateRandomString(20)}`;
  
  const restauranteData = {
    correo: emailRestaurante,
    cedulaRUC: rucRestaurante,
    nombre: `Restaurante Test ${generateRandomString(5)}`,
    ciudad: "Quito",
    rol: "RESTAURANTE",
    firebaseUid: firebaseUidRestaurante,
    alergenos: [
      Alergeno.LECHE,
      Alergeno.HUEVO,
      Alergeno.PESCADO
    ],
    direccion: "Calle Test 123",
    metodoPago: [
      MetodoPago.TARJETA_CREDITO,
      MetodoPago.EFECTIVO
    ],
    expoPushToken: "U2FsdGVkX1+3YJYa3AaMWr/VwtnmujTuSqOMJoWEgUI="
  };

  const registerRestauranteResponse = http.post(`${BASE_URL}/usuarios/register`, JSON.stringify(restauranteData), {
    headers: headers
  });

  check(registerRestauranteResponse, {
    'restaurante registration successful': (r) => r.status === 201 || r.status === 409,
    'restaurante registration response has data': (r) => r.status === 409 || r.json('data') !== undefined,
  }) || errorRate.add(1);

  if (registerRestauranteResponse.status !== 201 && registerRestauranteResponse.status !== 409) {
    logError('registro de restaurante', registerRestauranteResponse);
    return;
  }

  // Esperar a que el restaurante se persista
  sleep(3);

  // Verificar que el restaurante existe y obtener su ID hasheado
  const verifyRestauranteResponse = http.get(`${BASE_URL}/usuarios/${rucRestaurante}`, {
    headers: headers
  });

  if (verifyRestauranteResponse.status !== 200) {
    logError('verificación de restaurante', verifyRestauranteResponse);
    return;
  }

  const restauranteInfo = verifyRestauranteResponse.json('data');
  if (!restauranteInfo || !restauranteInfo.id) {
    logError('ID hasheado de restaurante no encontrado', { restauranteInfo });
    return;
  }

  // Verificar que el restaurante tiene métodos de pago disponibles
  if (!restauranteInfo.metodoPago || !Array.isArray(restauranteInfo.metodoPago) || restauranteInfo.metodoPago.length === 0) {
    logError('restaurante no tiene métodos de pago configurados', { restauranteInfo });
    return;
  }

  const restauranteIdHash = restauranteInfo.id;
  const metodosPagoDisponibles = restauranteInfo.metodoPago;

  sleep(2);

  // Test 3: Package Creation
  const unidadesDisponibles = 10;
  const cantidadComprada = Math.floor(Math.random() * (unidadesDisponibles - 1)) + 1;
  
  const packageData = {
    descripcion: "Paquete de almuerzo especial " + generateRandomString(5),
    precio: 15.99,
    precioDescuento: 12.99,
    unidades: unidadesDisponibles,
    horaRetiro: "14:30",
    imagenURL: "https://ejemplo.com/imagen.jpg"
  };

  const packageResponse = http.post(`${BASE_URL}/paquetes/${rucRestaurante}/crearPaquete`, JSON.stringify(packageData), {
    headers: headers
  });

  check(packageResponse, {
    'package creation successful': (r) => r.status === 201,
    'package response has data': (r) => r.json('data') !== undefined,
  }) || errorRate.add(1);

  if (packageResponse.status !== 201) {
    logError('creación de paquete', packageResponse);
    return;
  }

  const packageId = packageResponse.json('data.id');
  if (!packageId) {
    logError('obtención de ID de paquete', packageResponse);
    return;
  }

  // Esperar a que el paquete se persista
  sleep(3);

  // Verificar que el paquete existe usando la ruta correcta
  const verifyPackageResponse = http.get(`${BASE_URL}/paquetes/Quito`, {
    headers: headers
  });

  if (verifyPackageResponse.status !== 200) {
    logError('verificación de paquete', verifyPackageResponse);
    return;
  }

  const paquetes = verifyPackageResponse.json('data');
  if (!Array.isArray(paquetes)) {
    logError('formato de respuesta inválido', { paquetes });
    return;
  }

  // Buscar el paquete por ID en la lista de paquetes
  const paqueteEncontrado = paquetes.find(p => p.id === packageId);
  if (!paqueteEncontrado) {
    logError('paquete no encontrado en la lista', { packageId, paquetes });
    return;
  }

  sleep(2);

  // Test 4: Purchase Creation
  // Seleccionar un método de pago aleatorio de los disponibles
  const metodoPagoElegido = metodosPagoDisponibles[Math.floor(Math.random() * metodosPagoDisponibles.length)];

  const purchaseData = {
    clienteId: clienteIdHash,
    restauranteId: restauranteIdHash,
    cantidadComprada: cantidadComprada,
    metodoElegido: metodoPagoElegido
  };

  const purchaseResponse = http.post(`${BASE_URL}/compras/${packageId}`, JSON.stringify(purchaseData), {
    headers: headers
  });

  check(purchaseResponse, {
    'purchase creation successful': (r) => r.status === 201,
    'purchase response has data': (r) => r.json('data') !== undefined,
  }) || errorRate.add(1);

  if (purchaseResponse.status !== 201) {
    logError('creación de compra', purchaseResponse);
    return;
  }

  const purchaseId = purchaseResponse.json('data.id');
  if (!purchaseId) {
    logError('obtención de ID de compra', purchaseResponse);
    return;
  }

  sleep(2);

  // Test 5: Report Creation
  const reportData = {
    cedulaRUC: clienteIdHash,
    compraId: purchaseId,
    correo: clienteInfo.correo,
    descripcion: "El paquete llegó frío",
    fechaCompra: new Date().toISOString(),
    nombreRestaurante: restauranteInfo.nombre,
    precio: paqueteEncontrado.precio,
    precioDescuento: paqueteEncontrado.precioDescuento,
    comision: 0
  };

  const reportResponse = http.post(`${BASE_URL}/reportes/cliente-to-restaurante/${purchaseId}`, JSON.stringify(reportData), {
    headers: headers
  });

  check(reportResponse, {
    'report creation successful': (r) => r.status === 201,
    'report response has data': (r) => r.json('data') !== undefined,
  }) || errorRate.add(1);

  if (reportResponse.status !== 201) {
    logError('creación de reporte', reportResponse);
  }
} 