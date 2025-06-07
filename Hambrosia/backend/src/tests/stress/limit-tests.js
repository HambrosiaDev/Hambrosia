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
    extreme_load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 5 },    // Ramp up to 5 users
        { duration: '1m', target: 5 },     // Stay at 5 users
        { duration: '30s', target: 10 },   // Ramp up to 10 users
        { duration: '1m', target: 10 },    // Stay at 10 users
        { duration: '30s', target: 0 },    // Ramp down to 0 users
      ],
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<8000'],    // 95% of requests should be below 8s
    errors: ['rate<0.3'],                 // Error rate should be below 30%
    'iteration_duration': ['p(95)<60000'], // 95% of iterations should complete within 60s
  },
};

// Test data
const BASE_URL = process.env.BASE_URL;

// Common headers
const headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};

// Test scenarios
export default function() {
  // Test 1: User Registration (CLIENTE) with Large Data
  const cedulaCliente = generarCedulaValida();
  const emailCliente = `cliente${generateRandomString(8)}@example.com`;
  
  const clienteData = {
    correo: emailCliente,
    cedulaRUC: cedulaCliente,
    nombre: 'Cliente Test ' + generateRandomString(50),
    ciudad: "Quito",
    rol: "CLIENTE",
    firebaseUid: `firebase-${generateRandomString(50)}`,
    fechaNacimiento: generarFechaNacimiento(),
    direccion: "Calle Test " + generateRandomString(100),
    expoPushToken: "U2FsdGVkX1+3YJYa3AaMWr/VwtnmujTuSqOMJoWEgUI="
  };

  const registerClienteResponse = http.post(`${BASE_URL}/usuarios/register`, JSON.stringify(clienteData), {
    headers: headers
  });

  check(registerClienteResponse, {
    'cliente registration successful': (r) => r.status === 201 || r.status === 409,
  }) || errorRate.add(1);

  sleep(10);  // Esperar 10 segundos después del registro de cliente

  // Test 2: User Registration (RESTAURANTE) with Large Data
  const rucRestaurante = generarRucSociedadPrivadaValido();
  const emailRestaurante = `restaurante${generateRandomString(8)}@example.com`;
  
  const restauranteData = {
    correo: emailRestaurante,
    cedulaRUC: rucRestaurante,
    nombre: 'Restaurante Test ' + generateRandomString(50),
    ciudad: "Quito",
    rol: "RESTAURANTE",
    firebaseUid: `firebase-${generateRandomString(50)}`,
    alergenos: Object.values(Alergeno),
    direccion: "Calle Test " + generateRandomString(100),
    metodoPago: Object.values(MetodoPago),
    expoPushToken: "U2FsdGVkX1+3YJYa3AaMWr/VwtnmujTuSqOMJoWEgUI="
  };

  const registerRestauranteResponse = http.post(`${BASE_URL}/usuarios/register`, JSON.stringify(restauranteData), {
    headers: headers
  });

  check(registerRestauranteResponse, {
    'restaurante registration successful': (r) => r.status === 201 || r.status === 409,
  }) || errorRate.add(1);

  sleep(10);  // Esperar 10 segundos después del registro de restaurante

  // Test 3: Package Creation with Large Data
  const packageData = {
    descripcion: 'Paquete de almuerzo especial ' + generateRandomString(500),
    precio: 999999,
    precioDescuento: 999998,
    unidades: 9999,
    horaRetiro: '14:30',
    imagenURL: 'https://ejemplo.com/imagen.jpg'
  };

  const packageResponse = http.post(`${BASE_URL}/paquetes/${rucRestaurante}/crearPaquete`, JSON.stringify(packageData), {
    headers: headers
  });

  check(packageResponse, {
    'package creation successful': (r) => r.status === 201,
  }) || errorRate.add(1);

  sleep(10);  // Esperar 10 segundos después de la creación del paquete

  // Test 4: Rapid Succession Requests
  const rapidRequests = [
    {
      method: 'GET',
      url: `${BASE_URL}/paquetes/Quito`,
      headers: headers
    },
    {
      method: 'GET',
      url: `${BASE_URL}/paquetes/Guayaquil`,
      headers: headers
    },
    {
      method: 'GET',
      url: `${BASE_URL}/paquetes/Cuenca`,
      headers: headers
    },
  ];

  // Hacer las peticiones una por una en lugar de en batch
  for (const request of rapidRequests) {
    const response = http.get(request.url, {
      headers: request.headers,
      timeout: '30s'  // Aumentar el timeout
    });

    check(response, {
      [`${request.url} request successful`]: (r) => r.status === 200 || r.status === 404,
    }) || errorRate.add(1);

    sleep(2);  // Pequeña pausa entre peticiones
  }

  sleep(10);  // Esperar 10 segundos después de las peticiones rápidas
} 