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
  "/api/notificaciones/enviar-notificacion-reserva-compra/{token}": {
    post: {
      tags: ["Notificaciones"],
      summary: "Enviar notificación de reserva/compra",
      description: "Envía una notificación push específica para reservas o compras.",
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
                  example: "¡Reserva confirmada!",
                },
                body: {
                  type: "string",
                  description: "Contenido de la notificación",
                  example: "Tu reserva ha sido confirmada",
                },
                data: {
                  type: "object",
                  description: "Datos adicionales para la notificación",
                  example: {
                    tipo: "reserva",
                    id: "123",
                    estado: "confirmada"
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
  "/api/notificaciones/enviar-notificacion-compra-cancelada/{token}": {
    post: {
      tags: ["Notificaciones"],
      summary: "Enviar notificación de compra cancelada",
      description: "Envía una notificación push cuando una compra es cancelada.",
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
                  example: "Compra cancelada",
                },
                body: {
                  type: "string",
                  description: "Contenido de la notificación",
                  example: "Tu compra ha sido cancelada",
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
