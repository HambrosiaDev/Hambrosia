export const compraSwagger = {
    "/api/compra/{paqueteId}": {
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
                  metodoPago: {
                    type: "string",
                    description: "Método de pago",
                    example: "Tarjeta de Crédito",
                  },
                },
                required: ["clienteId", "restauranteId", "cantidadComprada", "metodoPago"],
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
    "/api/compra/confirmar/{compraId}": {
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
    "/api/compra/cancelar/{compraId}": {
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
      "/api/compra/notificacion/{compraId}": {
      get: {
        tags: ["Compra"],
        summary: "Obtener la notificación de una compra",
        description: "Obtiene la notificación asociada a una compra específica.",
        parameters: [
          {
            name: "compraId",
            in: "path",
            required: true,
            description: "ID de la compra para obtener la notificación",
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          "200": {
            description: "Notificación obtenida exitosamente",
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
                      description: "Datos de la notificación",
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
                      example: "No hay una compra con ese ID",
                    },
                  },
                },
              },
            },
          },
          "404": {
            description: "Notificación no encontrada",
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
                      example: "No hay notificación con ese ID",
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
                      example: "Error en la operación",
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  };