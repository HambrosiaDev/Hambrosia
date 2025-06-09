/**
 * Enumerador para los tipos de identificación
 */
export enum TipoIdentificacionEnum {
    CEDULA,
    RUC_PERSONA_NATURAL,
    RUC_SOCIEDAD_PRIVADA,
    RUC_SOCIEDAD_PUBLICA,
  }
  
  /**
   * Validates Ecuadorian identification numbers (cédula and RUC)
   * @param identificacion Identification number to validate
   * @returns Object with validation result and type if valid
   */
  export function validarIdentificacionEcuatoriana(identificacion: string): {
    isValid: boolean;
    type?: TipoIdentificacionEnum;
  } {
    if (isNullOrEmpty(identificacion)) {
      return { isValid: false };
    }
  
    const longitud = identificacion.length;
  
    if (longitud === 10) {
      const isValid = esCedulaValida(identificacion);
      return { isValid, type: isValid ? TipoIdentificacionEnum.CEDULA : undefined };
    } else if (longitud === 13) {
      const tercerDigito = parseInt(identificacion.substring(2, 3), 10);
  
      if (0 <= tercerDigito && tercerDigito <= 5) {
        const isValid = esRucPersonaNaturalValido(identificacion);
        return {
          isValid,
          type: isValid ? TipoIdentificacionEnum.RUC_PERSONA_NATURAL : undefined,
        };
      } else if (tercerDigito === 6) {
        const isValid = esRucSociedadPublicaValido(identificacion);
        return {
          isValid,
          type: isValid ? TipoIdentificacionEnum.RUC_SOCIEDAD_PUBLICA : undefined,
        };
      } else if (tercerDigito === 9) {
        const isValid = esRucSociedadPrivadaValido(identificacion);
        return {
          isValid,
          type: isValid ? TipoIdentificacionEnum.RUC_SOCIEDAD_PRIVADA : undefined,
        };
      }
    }
  
    return { isValid: false };
  }
  
  // Helper functions (copied from your original class)
  
  function isNullOrEmpty(contenido: any): boolean {
    return undefined === contenido || null === contenido || '' === contenido;
  }
  
  function esCedulaValida(numeroCedula: string): boolean {
    const esIdentificacionValida = validacionesPrevias(
      numeroCedula,
      10,
      TipoIdentificacionEnum.CEDULA
    );
  
    if (!esIdentificacionValida) {
      return false;
    }
  
    const ultimoDigito = parseInt(numeroCedula.charAt(9), 10);
    return algoritmoVerificaIdentificacion(
      numeroCedula,
      ultimoDigito,
      TipoIdentificacionEnum.CEDULA
    );
  }
  
  function esRucPersonaNaturalValido(numeroRuc: string): boolean {
    const esIdentificacionValida = validacionesPrevias(
      numeroRuc,
      13,
      TipoIdentificacionEnum.RUC_PERSONA_NATURAL
    );
  
    if (!esIdentificacionValida) {
      return false;
    }
  
    const ultimoDigito = parseInt(numeroRuc.charAt(9), 10);
    return algoritmoVerificaIdentificacion(
      numeroRuc,
      ultimoDigito,
      TipoIdentificacionEnum.RUC_PERSONA_NATURAL
    );
  }
  
  function esRucSociedadPrivadaValido(numeroRuc: string): boolean {
    const esIdentificacionValida = validacionesPrevias(
      numeroRuc,
      13,
      TipoIdentificacionEnum.RUC_SOCIEDAD_PRIVADA
    );
  
    if (!esIdentificacionValida) {
      return false;
    }
  
    const ultimoDigito = parseInt(numeroRuc.charAt(9), 10);
    return algoritmoVerificaIdentificacion(
      numeroRuc,
      ultimoDigito,
      TipoIdentificacionEnum.RUC_SOCIEDAD_PRIVADA
    );
  }
  
  function esRucSociedadPublicaValido(numeroRuc: string): boolean {
    const esIdentificacionValida = validacionesPrevias(
      numeroRuc,
      13,
      TipoIdentificacionEnum.RUC_SOCIEDAD_PUBLICA
    );
  
    if (!esIdentificacionValida) {
      return false;
    }
  
    const ultimoDigito = parseInt(numeroRuc.charAt(8), 10);
    return algoritmoVerificaIdentificacion(
      numeroRuc,
      ultimoDigito,
      TipoIdentificacionEnum.RUC_SOCIEDAD_PUBLICA
    );
  }
  
  function validacionesPrevias(
    identificacion: string,
    longitud: number,
    tipoIdentificacion: TipoIdentificacionEnum
  ): boolean {
    return (
      esNumeroIdentificacionValida(identificacion, longitud) &&
      esCodigoProvinciaValido(identificacion) &&
      esTercerDigitoValido(identificacion, tipoIdentificacion) &&
      (tipoIdentificacion !== TipoIdentificacionEnum.CEDULA
        ? esCodigoEstablecimientoValido(identificacion)
        : true)
    );
  }
  
  function esNumeroIdentificacionValida(
    numeroIdentificacion: string,
    longitud: number
  ): boolean {
    return (
      numeroIdentificacion.length === longitud && /^\d+$/.test(numeroIdentificacion)
    );
  }
  
  function esCodigoProvinciaValido(numeroCedula: string): boolean {
    const numeroProvincia = parseInt(numeroCedula.substring(0, 2), 10);
    return numeroProvincia > 0 && numeroProvincia <= 24;
  }
  
  function esCodigoEstablecimientoValido(numeroRuc: string): boolean {
    const ultimosTresDigitos = parseInt(numeroRuc.substring(10, 13), 10);
    return ultimosTresDigitos > 0;
  }
  
  function esTercerDigitoValido(
    numeroCedula: string,
    tipoIdentificacion: TipoIdentificacionEnum
  ): boolean {
    const tercerDigito = parseInt(numeroCedula.substring(2, 3), 10);
  
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
  
  function algoritmoVerificaIdentificacion(
    numeroIdentificacion: string,
    ultimoDigito: number,
    tipoIdentificacion: TipoIdentificacionEnum
  ): boolean {
    const sumatoria = sumarDigitosIdentificacion(
      numeroIdentificacion,
      tipoIdentificacion
    );
    const digitoVerificador = obtenerDigitoVerificador(
      sumatoria,
      tipoIdentificacion
    );
    return ultimoDigito === digitoVerificador;
  }
  
  function sumarDigitosIdentificacion(
    numeroIdentificacion: string,
    tipoIdentificacion: TipoIdentificacionEnum
  ): number {
    const coeficientes = obtenerCoeficientes(tipoIdentificacion);
    const identificacion = numeroIdentificacion.split('');
    let sumatoriaTotal = 0;
  
    for (let posicion = 0; posicion < coeficientes.length; posicion++) {
      const resultado =
        parseInt(identificacion[posicion], 10) * coeficientes[posicion];
      sumatoriaTotal += sumatoriaMultiplicacion(resultado, tipoIdentificacion);
    }
  
    return sumatoriaTotal;
  }
  
  function obtenerCoeficientes(
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
  
  function obtenerDigitoVerificador(
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
  
  function sumatoriaMultiplicacion(
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

