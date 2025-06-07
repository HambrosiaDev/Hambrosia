// Enums para validación
const Alergeno = {
  LECHE: 'LECHE',
  HUEVO: 'HUEVO',
  PESCADO: 'PESCADO',
  CRUSTACEOS_MARISCOS: 'CRUSTACEOS_MARISCOS',
  FRUTOS_SECOS: 'FRUTOS_SECOS',
  MANI_CACAHUATE: 'MANI_CACAHUATE',
  TRIGO: 'TRIGO',
  GRANOS_DE_SOYA: 'GRANOS_DE_SOYA',
  SESAMO: 'SESAMO'
};

const MetodoPago = {
  TARJETA_CREDITO: 'TARJETA_CREDITO',
  TARJETA_DEBITO: 'TARJETA_DEBITO',
  EFECTIVO: 'EFECTIVO',
  TRANSFERENCIA: 'TRANSFERENCIA',
  DEUNA: 'DEUNA'
};

// Helper functions
function generateRandomString(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Función para generar fecha de nacimiento válida
function generarFechaNacimiento() {
  const year = Math.floor(Math.random() * (2000 - 1950) + 1950);
  const month = Math.floor(Math.random() * 12) + 1;
  const day = Math.floor(Math.random() * 28) + 1;
  return `${day.toString().padStart(2, '0')}-${month.toString().padStart(2, '0')}-${year}`;
}

// Función para generar cédula válida
function generarCedulaValida() {
  // Generar los primeros 9 dígitos
  let cedula = '';
  // Primeros dos dígitos (provincia) entre 1 y 24
  cedula += Math.floor(Math.random() * 24 + 1).toString().padStart(2, '0');
  // Tercer dígito entre 0 y 5
  cedula += Math.floor(Math.random() * 6).toString();
  // Resto de dígitos
  for (let i = 0; i < 6; i++) {
    cedula += Math.floor(Math.random() * 10).toString();
  }

  // Calcular el dígito verificador
  const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
  let sumatoria = 0;
  for (let i = 0; i < 9; i++) {
    const digito = parseInt(cedula[i]);
    const resultado = digito * coeficientes[i];
    sumatoria += resultado >= 10 ? resultado - 9 : resultado;
  }

  const digitoVerificador = sumatoria % 10 === 0 ? 0 : 10 - (sumatoria % 10);
  cedula += digitoVerificador.toString();

  return cedula;
}

// Función para generar RUC válido para sociedad privada
function generarRucSociedadPrivadaValido() {
  // Generar una cédula válida y agregar 001 al final
  const cedula = generarCedulaValida();
  return cedula + '001';
}

// Función para logging de errores
function logError(context, response) {
  console.log(`Error en ${context}:`, {
    status: response.status,
    body: response.body,
    headers: response.headers,
    requestData: response.request ? {
      url: response.request.url,
      method: response.request.method,
      body: response.request.body
    } : null
  });
}

export {
  Alergeno,
  MetodoPago,
  generateRandomString,
  generarFechaNacimiento,
  generarCedulaValida,
  generarRucSociedadPrivadaValido,
  logError
}; 