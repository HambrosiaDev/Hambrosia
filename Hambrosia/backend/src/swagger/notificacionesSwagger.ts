export const notificacionesSwagger = {
  "/api/notificaciones/enviar-notificacion/{token}": {
    post: {
      tags: ["Notificaciones"],
      summary: "Enviar notificación push",
      description: "Envía una notificación push a un dispositivo específico usando el token de Expo.",
      parameters: [
        {
          name: "token",
          in: "path",
          required: true,
          description: "Token de Expo Push del dispositivo",
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
                title: {
                  type: "string",
                  description: "Título de la notificación",
                  example: "¡Nueva notificación!",
                },
                body: {
                  type: "string",
                  description: "Contenido de la notificación",
                  example: "Tienes una nueva notificación",
                },
                data: {
                  type: "object",
                  description: "Datos adicionales para la notificación",
                  example: {
                    tipo: "general",
                    id: "123"
                  },
                },
              },
              required: ["title", "body"],
            },
          },
        },
      },
      responses: {
        "200": {
          description: "Notificación enviada exitosamente",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Notificación enviada exitosamente" },
                  data: { type: "object", description: "Datos de la respuesta" },
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
                  success: { type: "boolean", example: false },
                  message: { type: "string", example: "Token, título y cuerpo son requeridos" },
                },
              },
            },
          },
        },
        "500": {
          description: "Error del servidor",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: false },
                  message: { type: "string", example: "Error al enviar la notificación" },
                  error: { type: "string", example: "Token inválido de Expo" },
                },
              },
            },
          },
        },
      },
    },
  },
  "/api/notificaciones/enviar-notificacion-reserva-paquete/{paqueteId}": {
    post: {
      tags: ["Notificaciones"],
      summary: "Enviar notificación de reserva de paquete",
      description: "Envía una notificación push al restaurante cuando se realiza una reserva de paquete.",
      parameters: [
        {
          name: "paqueteId",
          in: "path",
          required: true,
          description: "ID del paquete reservado",
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
                title: {
                  type: "string",
                  description: "Título de la notificación",
                  example: "¡Nuevo pedido confirmado!",
                },
                body: {
                  type: "string",
                  description: "Contenido de la notificación",
                  example: "Un cliente ha reservado uno de tus paquetes. ¡Prepáralo a tiempo para la entrega!",
                },
                data: {
                  type: "object",
                  description: "Datos adicionales para la notificación",
                  example: {
                    tipo: "reserva_paquete",
                    id: "123",
                    estado: "pendiente"
                  },
                },
              },
              required: ["title", "body"],
            },
          },
        },
      },
      responses: {
        "200": {
          description: "Notificación enviada exitosamente",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Notificación enviada exitosamente" },
                  data: { type: "object", description: "Datos de la respuesta" },
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
                  success: { type: "boolean", example: false },
                  message: { type: "string", example: "El ID del paquete es requerido" },
                },
              },
            },
          },
        },
        "404": {
          description: "Recurso no encontrado",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: false },
                  message: { type: "string", example: "No se encontró el restaurante o no tiene un token de notificación configurado" },
                },
              },
            },
          },
        },
        "500": {
          description: "Error del servidor",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: false },
                  message: { type: "string", example: "Error al enviar la notificación" },
                  error: { type: "string", example: "Token inválido de Expo" },
                },
              },
            },
          },
        },
      },
    },
  },
  "/api/notificaciones/enviar-notificacion-compra-cancelada/{compraId}": {
    post: {
      tags: ["Notificaciones"],
      summary: "Enviar notificación de compra cancelada",
      description: "Envía una notificación push al restaurante cuando una compra es cancelada.",
      parameters: [
        {
          name: "compraId",
          in: "path",
          required: true,
          description: "ID de la compra cancelada",
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
                title: {
                  type: "string",
                  description: "Título de la notificación",
                  example: "¡Pedido cancelado!",
                },
                body: {
                  type: "string",
                  description: "Contenido de la notificación",
                  example: "Un cliente canceló su reserva. Entra a la app para conocer más información.",
                },
                data: {
                  type: "object",
                  description: "Datos adicionales para la notificación",
                  example: {
                    tipo: "cancelacion",
                    id: "123",
                    motivo: "cancelado por el usuario"
                  },
                },
              },
              required: ["title", "body"],
            },
          },
        },
      },
      responses: {
        "200": {
          description: "Notificación enviada exitosamente",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Notificación enviada exitosamente" },
                  data: { type: "object", description: "Datos de la respuesta" },
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
                  success: { type: "boolean", example: false },
                  message: { type: "string", example: "El ID de la compra es requerido" },
                },
              },
            },
          },
        },
        "404": {
          description: "Recurso no encontrado",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: false },
                  message: { type: "string", example: "No se encontró el restaurante o no tiene un token de notificación configurado" },
                },
              },
            },
          },
        },
        "500": {
          description: "Error del servidor",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: false },
                  message: { type: "string", example: "Error al enviar la notificación" },
                  error: { type: "string", example: "Token inválido de Expo" },
                },
              },
            },
          },
        },
      },
    },
  },
};
