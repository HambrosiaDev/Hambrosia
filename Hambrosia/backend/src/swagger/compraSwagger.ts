export const compraSwagger = {
    "/api/compras/{paqueteId}": {
      post: {
        tags: ["Compra"],
        summary: "Crear una nueva compra",
        description: "Crea una nueva compra para un paquete específico.",
        parameters: [
          {
            name: "paqueteId",
            in: "path",
            required: true,
            description: "ID del paquete a comprar",
            schema: {
              type: "string",
            },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  clienteId: {
                    type: "string",
                    description: "ID del cliente",
                    example: "user123",
                  },
                  restauranteId: {
                    type: "string",
                    description: "ID del restaurante",
                    example: "rest456",
                  },
                  cantidadComprada: {
                    type: "integer",
                    description: "Cantidad de unidades compradas",
                    example: 2,
                  },
                  metodoElegido: {
                    type: "string",
                    description: "Método de pago elegido",
                    example: "DeUna",
                  },
                },
                required: ["clienteId", "restauranteId", "cantidadComprada", "metodoElegido"],
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Compra creada exitosamente",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                      example: true,
                    },
                    message: {
                      type: "string",
                      example: "Compra creada exitosamente",
                    },
                    data: {
                      type: "object",
                      description: "Datos de la compra creada",
                    },
                  },
                },
              },
            },
          },
          "400": {
            description: "Error en la solicitud",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                      example: false,
                    },
                    error: {
                      type: "string",
                      example: "Faltan datos obligatorios",
                    },
                  },
                },
              },
            },
          },
          "404": {
            description: "Cliente o Restaurante no encontrado",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                      example: false,
                    },
                    error: {
                      type: "string",
                      example: "El cliente no existe",
                    },
                  },
                },
              },
            },
          },
          "500": {
            description: "Error interno del servidor",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                      example: false,
                    },
                    error: {
                      type: "string",
                      example: "Error al crear la compra",
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/compras/confirmar/{compraId}": {
      post: {
        tags: ["Compra"],
        summary: "Confirmar una compra",
        description: "Confirma una compra específica usando un código.",
        parameters: [
          {
            name: "compraId",
            in: "path",
            required: true,
            description: "ID de la compra a confirmar",
            schema: {
              type: "string",
            },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  codigo: {
                    type: "string",
                    description: "Código de confirmación",
                    example: "123456",
                  },
                  calificacion: {
                    type: "integer",
                    description: "Calificación de la compra (opcional)",
                    example: 5,
                  },
                },
                required: ["codigo"],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Compra confirmada exitosamente",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                      example: true,
                    },
                    message: {
                      type: "string",
                      example: "Compra confirmada exitosamente",
                    },
                    data: {
                      type: "object",
                      description: "Datos de la compra confirmada",
                    },
                  },
                },
              },
            },
          },
          "400": {
            description: "Error en la solicitud",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                      example: false,
                    },
                    error: {
                      type: "string",
                      example: "El código ingresado no es válido",
                    },
                  },
                },
              },
            },
          },
          "404": {
            description: "Compra no encontrada",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                      example: false,
                    },
                    error: {
                      type: "string",
                      example: "La compra no existe",
                    },
                  },
                },
              },
            },
          },
          "500": {
            description: "Error interno del servidor",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                      example: false,
                    },
                    error: {
                      type: "string",
                      example: "Error al confirmar la compra",
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/compras/cancelar/{compraId}": {
      put: {
        tags: ["Compra"],
        summary: "Cancelar una compra",
        description: "Cancela una compra específica.",
        parameters: [
          {
            name: "compraId",
            in: "path",
            required: true,
            description: "ID de la compra a cancelar",
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          "200": {
            description: "Compra cancelada exitosamente",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                      example: true,
                    },
                    message: {
                      type: "string",
                      example: "Compra cancelada exitosamente",
                    },
                    data: {
                      type: "object",
                      description: "Datos de la compra cancelada",
                    },
                  },
                },
              },
            },
          },
          "404": {
            description: "Compra no encontrada",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                      example: false,
                    },
                    error: {
                      type: "string",
                      example: "La compra no existe",
                    },
                  },
                },
              },
            },
          },
          "500": {
            description: "Error interno del servidor",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                      example: false,
                    },
                    error: {
                      type: "string",
                      example: "Error al cancelar la compra",
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/compras/comisionMensual/{mes}/{restauranteId}": {
      get: {
        tags: ["Compra"],
        summary: "Obtener la comisión mensual de un restaurante",
        description: "Obtiene la comisión mensual acumulada para un restaurante específico.",
        parameters: [
          {
            name: "mes",
            in: "path",
            required: true,
            description: "Mes para el cual se desea obtener la comisión",
            schema: {
              type: "string",
            },
          },
          {
            name: "restauranteId",
            in: "path",
            required: true,
            description: "ID del restaurante",
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          "200": {
            description: "Comisión mensual obtenida exitosamente",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                      example: true,
                    },
                    data: {
                      type: "object",
                      description: "Datos de la comisión mensual",
                    },
                  },
                },
              },
            },
          },
          "400": {
            description: "Solicitud incorrecta",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                      example: false,
                    },
                    error: {
                      type: "string",
                      example: "Faltan datos obligatorios",
                    },
                  },
                },
              },
            },
          },
          "404": {
            description: "Comisión no encontrada para el restaurante en el mes especificado",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                      example: false,
                    },
                    error: {
                      type: "string",
                      example:
                        "No hay comisiones para este restaurante en este mes.",
                    },
                  },
                },
              },
            },
          },
          "500": {
            description:
              "Error interno del servidor al obtener la comisión mensual.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: false },
                    error:{
                      type:"string",
                      example: "Error al obtener la comisión mensual",
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/compras/codigoConf/{compraId}": {
      get: {
        tags: ["Compra"],
        summary: "Obtener el código de confirmación de una compra",
        description: "Obtiene el código de confirmación asociado a una compra específica.",
        parameters: [
          {
            name: "compraId",
            in: "path",
            required: true,
            description: "ID de la compra para obtener el código de confirmación",
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          "200": {
            description: "Código de confirmación obtenido exitosamente",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                      example: true,
                    },
                    data: {
                      type: "object",
                      description: "Datos del código de confirmación",
                    },
                  },
                },
              },
            },
          },
          "400": {
            description: "Solicitud incorrecta",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                      example: false,
                    },
                    error:{
                      type:"string",
                      example:"No hay una compra con ese ID.",
                    },
                  },
                },
              },
            },
          },
          "404": {
            description:
              "Código de confirmación no encontrado para la compra especificada.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success:{
                      type:"boolean",
                      example:false,
                    },
                    error:{
                      type:"string",
                      example:"No hay código de confirmación para esta compra.",
                    },
                  },
                },
              },
            },
          },
          "500": {
            description:
              "Error interno del servidor al obtener el código de confirmación.",
            content:{
              "application/json":{
                schema:{
                  type:"object",
                  properties:{
                    success:{
                      type:"boolean",
                      example:false,
                    },
                    error:{
                      type:"string",
                      example:"Error al obtener el código de confirmación.",
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/compras/activas/{clienteId}": {
      get: {
        tags: ["Compra"],
        summary: "Obtener compras activas de un cliente",
        description: "Obtiene todas las compras activas de un cliente específico.",
        parameters: [
          {
            name: "clienteId",
            in: "path",
            required: true,
            description: "ID del cliente para obtener sus compras activas",
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          "200": {
            description: "Compras activas obtenidas exitosamente",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success:{
                      type:"boolean",
                      example:true,
                    },
                    data:{
                      type:"array",
                      items:{
                        type:"object",
                        description:"Lista de compras activas del cliente.",
                      }
                    }
                  }
                }
              }
            }
          },
          "400": {
            description:"Solicitud incorrecta",
            content:{
              "application/json":{
                schema:{
                  type:"object",
                  properties:{
                    success:{
                      type:"boolean",
                      example:false,
                    },
                    error:{
                      type:"string",
                      example:"Faltan datos obligatorios.",
                    }
                  }
                }
              }
            }
          },
          "404": {
            description:"Compras no encontradas para el cliente especificado.",
            content:{
              "application/json":{
                schema:{
                  type:"object",
                  properties:{
                    success:{
                      type:"boolean",
                      example:false,
                    },
                    error:{
                      type:"string",
                      example:"No hay compras activas para este cliente.",
                    }
                  }
                }
              }
            }
          },
          "500": {
            description:"Error interno del servidor al obtener las compras activas.",
            content:{
              "application/json":{
                schema:{
                  type:"object",
                  properties:{
                    success:{
                      type:"boolean",
                      example:false,
                    },
                    error:{
                      type:"string",
                      example:"Error al obtener las compras activas.",
                    }
                  }
                }
              }
            }
          }
        }
      },
    },
    "/api/compras/completadas/{clienteId}": {
      get: {
        tags: ["Compra"],
        summary: "Obtener compras completadas de un cliente",
        description: "Obtiene todas las compras completadas de un cliente específico.",
        parameters: [
          {
            name: "clienteId",
            in: "path",
            required: true,
            description: "ID del cliente para obtener sus compras completadas",
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          "200": {
            description: "Compras completadas obtenidas exitosamente",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success:{
                      type:"boolean",
                      example:true,
                    },
                    data:{
                      type:"array",
                      items:{
                        type:"object",
                        description:"Lista de compras completadas del cliente.",
                      }
                    }
                  }
                }
              }
            }
          },
          "400": {
            description:"Solicitud incorrecta",
            content:{
              "application/json":{
                schema:{
                  type:"object",
                  properties:{
                    success:{
                      type:"boolean",
                      example:false,
                    },
                    error:{
                      type:"string",
                      example:"Faltan datos obligatorios.",
                    }
                  }
                }
              }
            }
          },
          "404": {
            description:"Compras no encontradas para el cliente especificado.",
            content:{ 
              "application/json":{
                schema:{
                  type:"object",
                  properties:{
                    success:{
                      type:"boolean",
                      example:false,
                    },
                    error:{
                      type:"string",
                      example:"No hay compras completadas para este cliente.",
                    }
                  }
                }
              }
            }
          },
          "500": {
            description:"Error interno del servidor al obtener las compras completadas.",
            content:{
              "application/json":{
                schema:{
                  type:"object",
                  properties:{
                    success:{
                      type:"boolean",
                      example:false,
                    },
                    error:{
                      type:"string",
                      example:"Error al obtener las compras completadas.",
                    }
                  }
                }
              }
            }
          }
        }
      },
    },
    "/api/compras/getCompras/{restauranteId}/{fechaCompra}": {
      get: {
        tags: ["Compra"],
        summary: "Obtener compras por restaurante y fecha",
        description: "Obtiene todas las compras realizadas en un restaurante específico en una fecha dada.",
        parameters: [
          {
            name: "restauranteId",
            in: "path",
            required: true,
            description: "ID del restaurante para obtener sus compras",
            schema: {
              type: "string",
            },
          },
          {
            name: "fechaCompra",
            in: "path",
            required: true,
            description: "Fecha de la compra en formato YYYY-MM-DD",
            schema: {
              type: "string",
              format: "date",
            },
          },
        ],
        responses: {
          "200": {
            description: "Compras obtenidas exitosamente",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success:{
                      type:"boolean",
                      example:true,
                    },
                    data:{
                      type:"array",
                      items:{
                        type:"object",
                        description:"Lista de compras del restaurante en la fecha especificada.",
                      }
                    }
                  }
                }
              }
            }
          },
          "400": {
            description:"Solicitud incorrecta",
            content:{
              "application/json":{
                schema:{
                  type:"object",
                  properties:{
                    success:{
                      type:"boolean",
                      example:false,
                    },
                    error:{
                      type:"string",
                      example:"Faltan datos obligatorios.",
                    }
                  }
                }
              }
            }
          },
          "404": {
            description:"Compras no encontradas para el restaurante y fecha especificados.",
            content:{
              "application/json":{
                schema:{
                  type:"object",
                  properties:{
                    success:{
                      type:"boolean",
                      example:false,
                    },
                    error:{
                      type:"string",
                      example:"No hay compras para este restaurante en esta fecha.",
                    }
                  }
                }
              }
            }
          },
          "500": {
            description:"Error interno del servidor al obtener las compras.",
            content:{
              "application/json":{
                schema:{
                  type:"object",
                  properties:{
                    success:{
                      type:"boolean",
                      example:false,
                    },
                    error:{
                      type:"string",
                      example:"Error al obtener las compras.",
                    }
                  }
                }
              }
            }
          }
        }
      },
    },
    "/api/compras/canceladas/{clienteId}": {
      get: {
        tags: ["Compra"],
        summary: "Obtener compras canceladas de un cliente",
        description: "Obtiene todas las compras canceladas de un cliente específico.",
        parameters: [
          {
            name: "clienteId",
            in: "path",
            required: true,
            description: "ID del cliente para obtener sus compras canceladas",
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          "200": {
            description: "Compras canceladas obtenidas exitosamente",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success:{
                      type:"boolean",
                      example:true,
                    },
                    data:{
                      type:"array",
                      items:{
                        type:"object",
                        description:"Lista de compras canceladas del cliente.",
                      }
                    }
                  }
                }
              }
            }
          },
          "400": {
            description:"Solicitud incorrecta",
            content:{
              "application/json":{
                schema:{
                  type:"object",
                  properties:{
                    success:{
                      type:"boolean",
                      example:false,
                    },
                    error:{
                      type:"string",
                      example:"Faltan datos obligatorios.",
                    }
                  }
                }
              }
            }
          },
          "404": {
            description:"Compras no encontradas para el cliente especificado.",
            content:{
              "application/json":{
                schema:{
                  type:"object",
                  properties:{
                    success:{
                      type:"boolean",
                      example:false,
                    },
                    error:{
                      type:"string",
                      example:"No hay compras canceladas para este cliente.",
                    }
                  }
                }
              }
            }
          },
          "500": {
            description:"Error interno del servidor al obtener las compras canceladas.",
            content:{
              "application/json":{
                schema:{
                  type:"object",
                  properties:{
                    success:{
                      type:"boolean",
                      example:false,
                    },
                    error:{
                      type:"string",
                      example:"Error al obtener las compras canceladas.",
                    }
                  }
                }
              }
            }
          }
        }
      },
    },
  };