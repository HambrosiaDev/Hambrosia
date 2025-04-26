export const paqueteSwagger = {
    "/paquete/{cedRuc}/crearPaquete": {
      post: {
        tags: ["Paquete"],
        summary: "Crear un nuevo paquete",
        description: "Crea un nuevo paquete para un restaurante específico.",
        parameters: [
          {
            name: "cedRuc",
            in: "path",
            required: true,
            description: "Cédula o RUC del restaurante",
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
                  descripcion: {
                    type: "string",
                    description: "Descripción del paquete",
                    example: "Paquete de almuerzo especial",
                  },
                  precio: {
                    type: "number",
                    description: "Precio original del paquete",
                    example: 10.0,
                  },
                  precioDescuento: {
                    type: "number",
                    description: "Precio con descuento del paquete",
                    example: 8.0,
                  },
                  unidades: {
                    type: "integer",
                    description: "Número de unidades disponibles",
                    example: 20,
                  },
                  horaRetiro: {
                    type: "string",
                    description: "Hora de retiro en formato HH:MM",
                    example: "14:30",
                  },
                  imagenURL: {
                    type: "string",
                    description: "URL de la imagen del paquete",
                    example: "https://ejemplo.com/imagen.jpg",
                    nullable: true,
                  },
                },
                required: ["descripcion", "precio", "precioDescuento", "unidades", "horaRetiro"],
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Paquete creado exitosamente",
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
                      example: "Paquete publicado exitosamente",
                    },
                    data: {
                      type: "object",
                      description: "Datos del paquete creado",
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
                      example: "Todos los campos obligatorios deben ser proporcionados",
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
                      example: "Error al publicar el paquete",
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/paquete/{ciudad}": {
      get: {
        tags: ["Paquete"],
        summary: "Obtener paquetes por ciudad",
        description: "Obtiene todos los paquetes disponibles en una ciudad específica.",
        parameters: [
          {
            name: "ciudad",
            in: "path",
            required: true,
            description: "Ciudad para filtrar los paquetes",
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          "200": {
            description: "Lista de paquetes encontrados",
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
                      type: "array",
                      description: "Lista de paquetes",
                      items: {
                        type: "object",
                      },
                    },
                  },
                },
              },
            },
          },
          "404": {
            description: "No se encontraron paquetes para la ciudad especificada",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                      example: false,
                    },
                    message: {
                      type: "string",
                      example: "No se encontraron paquetes para esta ciudad",
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
                      example: "Error al obtener paquetes por ciudad",
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