
import * as CryptoJS from 'crypto-js';
import * as dotenv from "dotenv";

dotenv.config();

const SECRET_KEY =
  process.env.HASH_SECRET_KEY || "default_secret_key_never_use_in_production";

/**
 * Genera un hash SHA-256 determinístico de una cédula usando una clave secreta
 * Esta función siempre retorna el mismo hash para la misma cédula
 * @param cedula - La cédula que se desea hashear
 * @returns El hash de la cédula que puede usarse como identificador
 */
export function hashCedula(cedula: string): string {
  return CryptoJS.HmacSHA256(
    `${cedula}:${SECRET_KEY}`, 
    SECRET_KEY
  ).toString(CryptoJS.enc.Hex);
}


/**
 * Helper para validar cédulas y RUCs en Ecuador.
 */

// Enumerador para los tipos de identificación
export enum TipoIdentificacionEnum {
  CEDULA,
  RUC_PERSONA_NATURAL,
  RUC_SOCIEDAD_PRIVADA,
  RUC_SOCIEDAD_PUBLICA,
}

/**
 * Clase con métodos estáticos para validar identificaciones.
 */
export class ValidacionCedulaRuc {
  /**
   * Valida cualquier número de identificación (cédula o RUC).
   * @param identificacion Número de identificación a validar.
   * @returns `true` si es válida, `false` en caso contrario.
   */
  static esIdentificacionValida(identificacion: string): boolean {
    if (this.isNullOrEmpty(identificacion)) {
      return false;
    }

    const longitud: number = identificacion.length;

    if (longitud === 10) {
      return this.esCedulaValida(identificacion);
    } else if (longitud === 13) {
      const tercerDigito: number = parseInt(identificacion.substring(2, 3), 10);

      if (0 <= tercerDigito && tercerDigito <= 5) {
        return this.esRucPersonaNaturalValido(identificacion);
      } else if (tercerDigito === 6) {
        return this.esRucSociedadPublicaValido(identificacion);
      } else if (tercerDigito === 9) {
        return this.esRucSociedadPrivadaValido(identificacion);
      }
    }

    return false;
  }

  /**
   * Verifica si una cédula es válida.
   * @param numeroCedula Número de cédula a validar.
   * @returns `true` si es válida, `false` en caso contrario.
   */
  static esCedulaValida(numeroCedula: string): boolean {
    const esIdentificacionValida = this.validacionesPrevias(
      numeroCedula,
      10,
      TipoIdentificacionEnum.CEDULA
    );

    if (!esIdentificacionValida) {
      return false;
    }

    const ultimoDigito: number = parseInt(numeroCedula.charAt(9), 10);
    return this.algoritmoVerificaIdentificacion(
      numeroCedula,
      ultimoDigito,
      TipoIdentificacionEnum.CEDULA
    );
  }

  /**
   * Verifica si un RUC es válido (cualquier tipo).
   * @param numeroRuc Número de RUC a validar.
   * @returns `true` si es válido, `false` en caso contrario.
   */
  static esRucValido(numeroRuc: string): boolean {
    return (
      this.esRucPersonaNaturalValido(numeroRuc) ||
      this.esRucSociedadPrivadaValido(numeroRuc) ||
      this.esRucSociedadPublicaValido(numeroRuc)
    );
  }

  /**
   * Verifica si un RUC de persona natural es válido.
   * @param numeroRuc Número de RUC a validar.
   * @returns `true` si es válido, `false` en caso contrario.
   */
  static esRucPersonaNaturalValido(numeroRuc: string): boolean {
    const esIdentificacionValida = this.validacionesPrevias(
      numeroRuc,
      13,
      TipoIdentificacionEnum.RUC_PERSONA_NATURAL
    );

    if (!esIdentificacionValida) {
      return false;
    }

    const ultimoDigito: number = parseInt(numeroRuc.charAt(9), 10);
    return this.algoritmoVerificaIdentificacion(
      numeroRuc,
      ultimoDigito,
      TipoIdentificacionEnum.RUC_PERSONA_NATURAL
    );
  }

  /**
   * Verifica si un RUC de sociedad privada es válido.
   * @param numeroRuc Número de RUC a validar.
   * @returns `true` si es válido, `false` en caso contrario.
   */
  static esRucSociedadPrivadaValido(numeroRuc: string): boolean {
    const esIdentificacionValida = this.validacionesPrevias(
      numeroRuc,
      13,
      TipoIdentificacionEnum.RUC_SOCIEDAD_PRIVADA
    );

    if (!esIdentificacionValida) {
      return false;
    }

    const ultimoDigito: number = parseInt(numeroRuc.charAt(9), 10);
    return this.algoritmoVerificaIdentificacion(
      numeroRuc,
      ultimoDigito,
      TipoIdentificacionEnum.RUC_SOCIEDAD_PRIVADA
    );
  }

  /**
   * Verifica si un RUC de sociedad pública es válido.
   * @param numeroRuc Número de RUC a validar.
   * @returns `true` si es válido, `false` en caso contrario.
   */
  static esRucSociedadPublicaValido(numeroRuc: string): boolean {
    const esIdentificacionValida = this.validacionesPrevias(
      numeroRuc,
      13,
      TipoIdentificacionEnum.RUC_SOCIEDAD_PUBLICA
    );

    if (!esIdentificacionValida) {
      return false;
    }

    const ultimoDigito: number = parseInt(numeroRuc.charAt(8), 10);
    return this.algoritmoVerificaIdentificacion(
      numeroRuc,
      ultimoDigito,
      TipoIdentificacionEnum.RUC_SOCIEDAD_PUBLICA
    );
  }

  // Métodos auxiliares

  /**
   * Valida si una cadena es nula o vacía.
   * @param contenido Cadena a verificar.
   * @returns `true` si es nula o vacía, `false` en caso contrario.
   */
  private static isNullOrEmpty(contenido: any): boolean {
    return undefined === contenido || null === contenido || '' === contenido;
  }

  /**
   * Realiza validaciones previas comunes a cédulas y RUCs.
   * @param identificacion Número de identificación a validar.
   * @param longitud Longitud esperada del número.
   * @param tipoIdentificacion Tipo de identificación (enum).
   * @returns `true` si pasa las validaciones previas, `false` en caso contrario.
   */
  private static validacionesPrevias(
    identificacion: string,
    longitud: number,
    tipoIdentificacion: TipoIdentificacionEnum
  ): boolean {
    return (
      this.esNumeroIdentificacionValida(identificacion, longitud) &&
      this.esCodigoProvinciaValido(identificacion) &&
      this.esTercerDigitoValido(identificacion, tipoIdentificacion) &&
      (tipoIdentificacion !== TipoIdentificacionEnum.CEDULA
        ? this.esCodigoEstablecimientoValido(identificacion)
        : true)
    );
  }

  /**
   * Verifica si el número de identificación tiene la longitud correcta y es numérico.
   * @param numeroIdentificacion Número de identificación.
   * @param longitud Longitud esperada.
   * @returns `true` si es válido, `false` en caso contrario.
   */
  private static esNumeroIdentificacionValida(
    numeroIdentificacion: string,
    longitud: number
  ): boolean {
    return numeroIdentificacion.length === longitud && /^\d+$/.test(numeroIdentificacion);
  }

  /**
   * Verifica si el código de provincia es válido (entre 1 y 24).
   * @param numeroCedula Número de cédula o RUC.
   * @returns `true` si es válido, `false` en caso contrario.
   */
  private static esCodigoProvinciaValido(numeroCedula: string): boolean {
    const numeroProvincia: number = parseInt(numeroCedula.substring(0, 2), 10);
    return numeroProvincia > 0 && numeroProvincia <= 24;
  }

  /**
   * Verifica si el código de establecimiento es válido (últimos 3 dígitos mayores a 0).
   * @param numeroRuc Número de RUC.
   * @returns `true` si es válido, `false` en caso contrario.
   */
  private static esCodigoEstablecimientoValido(numeroRuc: string): boolean {
    const ultimosTresDigitos: number = parseInt(numeroRuc.substring(10, 13), 10);
    return ultimosTresDigitos > 0;
  }

  /**
   * Verifica si el tercer dígito es válido según el tipo de identificación.
   * @param numeroCedula Número de cédula o RUC.
   * @param tipoIdentificacion Tipo de identificación.
   * @returns `true` si es válido, `false` en caso contrario.
   */
  private static esTercerDigitoValido(
    numeroCedula: string,
    tipoIdentificacion: TipoIdentificacionEnum
  ): boolean {
    const tercerDigito: number = parseInt(numeroCedula.substring(2, 3), 10);

    switch (tipoIdentificacion) {
      case TipoIdentificacionEnum.CEDULA:
        return tercerDigito >= 0 && tercerDigito <= 5;
      case TipoIdentificacionEnum.RUC_PERSONA_NATURAL:
        return tercerDigito >= 0 && tercerDigito <= 5;
      case TipoIdentificacionEnum.RUC_SOCIEDAD_PUBLICA:
        return tercerDigito === 6;
      case TipoIdentificacionEnum.RUC_SOCIEDAD_PRIVADA:
        return tercerDigito === 9;
      default:
        return false;
    }
  }

  /**
   * Algoritmo principal para verificar la validez de una identificación.
   * @param numeroIdentificacion Número de identificación.
   * @param ultimoDigito Último dígito del número.
   * @param tipoIdentificacion Tipo de identificación.
   * @returns `true` si es válido, `false` en caso contrario.
   */
  private static algoritmoVerificaIdentificacion(
    numeroIdentificacion: string,
    ultimoDigito: number,
    tipoIdentificacion: TipoIdentificacionEnum
  ): boolean {
    const sumatoria: number = this.sumarDigitosIdentificacion(
      numeroIdentificacion,
      tipoIdentificacion
    );
    const digitoVerificador: number = this.obtenerDigitoVerificador(
      sumatoria,
      tipoIdentificacion
    );
    return ultimoDigito === digitoVerificador;
  }

  /**
   * Suma los dígitos de la identificación según los coeficientes.
   * @param numeroIdentificacion Número de identificación.
   * @param tipoIdentificacion Tipo de identificación.
   * @returns La sumatoria total.
   */
  private static sumarDigitosIdentificacion(
    numeroIdentificacion: string,
    tipoIdentificacion: TipoIdentificacionEnum
  ): number {
    const coeficientes: number[] = this.obtenerCoeficientes(tipoIdentificacion);
    const identificacion = numeroIdentificacion.split('');
    let sumatoriaTotal = 0;

    for (let posicion = 0; posicion < coeficientes.length; posicion++) {
      const resultado: number =
        parseInt(identificacion[posicion], 10) * coeficientes[posicion];
      sumatoriaTotal += this.sumatoriaMultiplicacion(resultado, tipoIdentificacion);
    }

    return sumatoriaTotal;
  }

  /**
   * Obtiene los coeficientes según el tipo de identificación.
   * @param tipoIdentificacion Tipo de identificación.
   * @returns Array de coeficientes.
   */
  private static obtenerCoeficientes(
    tipoIdentificacion: TipoIdentificacionEnum
  ): number[] {
    switch (tipoIdentificacion) {
      case TipoIdentificacionEnum.CEDULA:
      case TipoIdentificacionEnum.RUC_PERSONA_NATURAL:
        return [2, 1, 2, 1, 2, 1, 2, 1, 2];
      case TipoIdentificacionEnum.RUC_SOCIEDAD_PRIVADA:
        return [4, 3, 2, 7, 6, 5, 4, 3, 2];
      case TipoIdentificacionEnum.RUC_SOCIEDAD_PUBLICA:
        return [3, 2, 7, 6, 5, 4, 3, 2];
      default:
        return [];
    }
  }

  /**
   * Calcula el dígito verificador según la sumatoria y el tipo de identificación.
   * @param sumatoria Sumatoria de los dígitos.
   * @param tipoIdentificacion Tipo de identificación.
   * @returns El dígito verificador.
   */
  private static obtenerDigitoVerificador(
    sumatoria: number,
    tipoIdentificacion: TipoIdentificacionEnum
  ): number {
    let residuo = 0;

    if (
      tipoIdentificacion === TipoIdentificacionEnum.CEDULA ||
      tipoIdentificacion === TipoIdentificacionEnum.RUC_PERSONA_NATURAL
    ) {
      residuo = sumatoria % 10;
      return residuo === 0 ? 0 : 10 - residuo;
    } else {
      residuo = sumatoria % 11;
      return residuo === 0 ? 0 : 11 - residuo;
    }
  }

  /**
   * Calcula la sumatoria de multiplicación según el tipo de identificación.
   * @param multiplicacionValores Valor resultante de la multiplicación.
   * @param tipoIdentificacion Tipo de identificación.
   * @returns La sumatoria ajustada.
   */
  private static sumatoriaMultiplicacion(
    multiplicacionValores: number,
    tipoIdentificacion: TipoIdentificacionEnum
  ): number {
    if (tipoIdentificacion === TipoIdentificacionEnum.CEDULA) {
      return multiplicacionValores >= 10 ? multiplicacionValores - 9 : multiplicacionValores;
    } else if (
      tipoIdentificacion === TipoIdentificacionEnum.RUC_PERSONA_NATURAL
    ) {
      const digitos = String(multiplicacionValores).split('');
      return digitos.reduce((sum, digito) => sum + parseInt(digito, 10), 0);
    } else {
      return multiplicacionValores;
    }
  }
}

export function generarCodigoAleatorioSeguro(): string {
  // Generar bytes aleatorios con CryptoJS (3 bytes = 24 bits)
  const randomWordArray = CryptoJS.lib.WordArray.random(3);
  
  // Convertir a hexadecimal y luego a un número
  const hexString = randomWordArray.toString(CryptoJS.enc.Hex);
  const decimalValue = parseInt(hexString, 16);
  
  // Obtener un número de 6 dígitos (módulo 1000000)
  const numeroSeisDígitos = (decimalValue % 1000000).toString().padStart(6, "0");
  
  return numeroSeisDígitos;
}

export function verificarCodigo(codigoIngresado: string, codigoAlmacenado: string): boolean {
  const codigoVerif = hashCedula(codigoIngresado);
  return codigoVerif === codigoAlmacenado;
}