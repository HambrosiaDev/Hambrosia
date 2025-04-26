export const reporteSwagger = {
    "/api/reportes/crearReporte/{compraId}": {
      post: {
        tags: ["Reporte"],
        summary: "Crear un nuevo reporte",
        description: "Crea un nuevo reporte asociado a una compra específica.",
        parameters: [
          {
            name: "compraId",
            in: "path",
            required: true,
            description: "ID de la compra asociada al reporte",
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
                    description: "Descripción del reporte",
                    example: "El cliente canceló la compra.",
                  },
                },
                required: ["descripcion"],
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Reporte creado exitosamente",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    id: {
                      type: "string",
                      description: "ID del reporte creado",
                      example: "reporte123",
                    },
                    compraId: {
                      type: "string",
                      description: "ID de la compra asociada al reporte",
                      example: "compra456",
                    },
                    descripcion: {
                      type: "string",
                      description: "Descripción del reporte",
                      example: "El cliente canceló la compra.",
                    },
                    nombreRestaurante: {
                        type: "string",
                        description: "Nombre del restaurante",
                        example: "restaurante la 2",
                    },
                     precio: {
                        type: "number",
                        description: "precio del producto",
                        example: 20.5,
                    },
                     precioDescuento: {
                        type: "number",
                        description: "precio descuento del producto",
                        example: 15.5,
                    },
                    comision:{
                      type: "number",
                      description: "valor de la comision",
                      example: 2.0,
                    },
                     fechaCompra:{
                      type: "string",
                      format: "date-time",
                      description: "fecha de la compra",
                      example: "2023-10-27T10:00:00Z",
                    },
                    correo: {
                      type: "string",
                      description: "correo del restaurante",
                      example: "restaurante@gmail.com",
                    },
                     cedulaRUC: {
                      type: "string",
                      description: "cedulaRUC del restaurante",
                      example: "1723920832001",
                    }
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
                    error: {
                      type: "string",
                      example: "compraId y descripcion son obligatorios",
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
                    error: {
                      type: "string",
                      example: "Compra no encontrada",
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
                    error: {
                      type: "string",
                      example: "Error interno del servidor",
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/reportes/{reporteId}": {
      get: {
        tags: ["Reporte"],
        summary: "Obtener un reporte por ID",
        description: "Obtiene un reporte específico por su ID.",
        parameters: [
          {
            name: "reporteId",
            in: "path",
            required: true,
            description: "ID del reporte a obtener",
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          "200": {
            description: "Reporte encontrado",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    id: {
                      type: "string",
                      description: "ID del reporte",
                      example: "reporte123",
                    },
                     compraId: {
                      type: "string",
                      description: "ID de la compra asociada al reporte",
                      example: "compra456",
                    },
                    descripcion: {
                      type: "string",
                      description: "Descripción del reporte",
                      example: "El cliente canceló la compra.",
                    },
                    nombreRestaurante: {
                        type: "string",
                        description: "Nombre del restaurante",
                        example: "restaurante la 2",
                    },
                     precio: {
                        type: "number",
                        description: "precio del producto",
                        example: 20.5,
                    },
                     precioDescuento: {
                        type: "number",
                        description: "precio descuento del producto",
                        example: 15.5,
                    },
                    comision:{
                      type: "number",
                      description: "valor de la comision",
                      example: 2.0,
                    },
                     fechaCompra:{
                      type: "string",
                      format: "date-time",
                      description: "fecha de la compra",
                      example: "2023-10-27T10:00:00Z",
                    },
                    correo: {
                      type: "string",
                      description: "correo del restaurante",
                      example: "restaurante@gmail.com",
                    },
                     cedulaRUC: {
                      type: "string",
                      description: "cedulaRUC del restaurante",
                      example: "1723920832001",
                    }
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
                    error: {
                      type: "string",
                      example: "reporteId es obligatorio",
                    },
                  },
                },
              },
            },
          },
          "404": {
            description: "Reporte no encontrado",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: {
                      type: "string",
                      example: "Reporte no encontrado",
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
                    error: {
                      type: "string",
                      example: "Error interno del servidor",
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