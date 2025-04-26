export const usuarioSwagger = {
    "/usuario/register": {
      post: {
        tags: ["Usuario"],
        summary: "Registrar un nuevo usuario",
        description: "Registra un nuevo usuario en el sistema.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  correo: {
                    type: "string",
                    description: "Correo electrónico del usuario",
                    example: "usuario@example.com",
                  },
                  cedulaRUC: {
                    type: "string",
                    description: "Cédula o RUC del usuario",
                    example: "1723920832001",
                  },
                  nombre: {
                    type: "string",
                    description: "Nombre del usuario",
                    example: "Juan Pérez",
                  },
                  ciudad: {
                    type: "string",
                    description: "Ciudad del usuario",
                    example: "Quito",
                  },
                  rol: {
                    type: "string",
                    description: "Rol del usuario (CLIENTE o RESTAURANTE)",
                    example: "CLIENTE",
                  },
                  firebaseUid: {
                    type: "string",
                    description: "UID del usuario en Firebase",
                    example: "someFirebaseUID",
                  },
                  fechaNacimiento: {
                    type: "string",
                    description: "Fecha de nacimiento del usuario (opcional, solo para clientes)",
                    example: "01-01-1990",
                  },
                  alergenos: {
                    type: "array",
                    description: "Alérgenos del restaurante (opcional, solo para restaurantes)",
                    items: {
                      type: "string",
                    },
                    example: ["GLUTEN", "LACTEOS"],
                  },
                   direccion: {
                    type: "string",
                    description: "Direccion del usuario o restaurante (opcional)",
                    example: "Calle 123",
                  }
                },
                required: ["correo", "cedulaRUC", "nombre", "ciudad", "rol", "firebaseUid"],
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Usuario registrado exitosamente",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: { type: "object", description: "Datos del usuario registrado" },
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
                    error: { type: "string", example: "Todos los campos son obligatorios" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/usuario/login/intentoFallido": {
      post: {
        tags: ["Usuario"],
        summary: "Registrar un intento fallido de inicio de sesión",
        description: "Registra un intento fallido de inicio de sesión para un usuario.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  correo: {
                    type: "string",
                    description: "Correo electrónico del usuario",
                    example: "usuario@example.com",
                  },
                },
                required: ["correo"],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Intento fallido registrado",
            content: {
              "application/json": {
                 schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    error: { type: "string", example: "Intento Fallido Registrado" },
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
                    error: { type: "string", example: "Correo es requerido" },
                  },
                },
              },
            },
          },
            "401": {
            description: "Credenciales invalidas",
            content: {
              "application/json": {
                 schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: false },
                    error: { type: "string", example: "Credenciales inválidas" },
                  },
                },
              },
            },
          },
             "403": {
            description: "Usuario bloqueado",
            content: {
              "application/json": {
                 schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: false },
                    error: { type: "string", example: "Su cuenta ha sido bloqueada por exceder el límite de intentos fallidos de inicio de sesión. Por favor, restablezca su contraseña para desbloquear su cuenta." },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/usuario/login/resetearIntentos": {
      post: {
        tags: ["Usuario"],
        summary: "Resetear intentos fallidos",
        description: "Resetea los intentos fallidos de inicio de sesión para un usuario.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  correo: {
                    type: "string",
                    description: "Correo electrónico del usuario",
                    example: "usuario@example.com",
                  },
                },
                required: ["correo"],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Intentos fallidos reseteados",
            content: {
              "application/json": {
                 schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                     data: { type: "object", description: "Datos del usuario" },
                    message: { type: "string", example: "Intentos fallidos reseteados exitosamente" },
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
                    error: { type: "string", example: "Correo es requerido" },
                  },
                },
              },
            },
          },
            "404": {
            description: "Usuario no encontrado",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: false },
                    error: { type: "string", example: "Usuario no encontrado" },
                  },
                },
              },
            },
          },
        },
      },
    },
      "/usuario/login/resetearStrikes": {
      post: {
        tags: ["Usuario"],
        summary: "Resetear Strikes",
        description: "Resetea los strikes de un usuario.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  correo: {
                    type: "string",
                    description: "Correo electrónico del usuario",
                    example: "usuario@example.com",
                  },
                },
                required: ["correo"],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Strikes reseteados",
            content: {
              "application/json": {
                 schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: { type: "object", description: "Datos del usuario" },
                    message: { type: "string", example: "Strikes reseteados exitosamente" },
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
                    error: { type: "string", example: "Correo es requerido" },
                  },
                },
              },
            },
          },
            "404": {
            description: "Usuario no encontrado",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: false },
                    error: { type: "string", example: "Usuario no encontrado" },
                  },
                },
              },
            },
          },
        },
      },
    },
      "/usuario/desbloquear": {
      post: {
        tags: ["Usuario"],
        summary: "Desbloquear Usuario",
        description: "Desbloquea a un usuario.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  correo: {
                    type: "string",
                    description: "Correo electrónico del usuario",
                    example: "usuario@example.com",
                  },
                },
                required: ["correo"],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Usuario desbloqueado",
            content: {
              "application/json": {
                 schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: { type: "object", description: "Datos del usuario" },
                    message: { type: "string", example: "Usuario desbloqueado exitosamente" },
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
                    error: { type: "string", example: "Correo es requerido" },
                  },
                },
              },
            },
          },
            "404": {
            description: "Usuario no encontrado",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: false },
                    error: { type: "string", example: "Usuario no encontrado" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/usuario/restaurantes": {
      get: {
        tags: ["Usuario"],
        summary: "Obtener todos los restaurantes",
        description: "Obtiene una lista de todos los restaurantes.",
        responses: {
          "200": {
            description: "Lista de restaurantes",
            content: {
              "application/json": {
                 schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: { type: "array", description: "Lista de restaurantes" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/usuario/{id}": {
      get: {
        tags: ["Usuario"],
        summary: "Obtener un usuario por ID",
        description: "Obtiene un usuario específico por su ID.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "ID del usuario",
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          "200": {
            description: "Usuario encontrado",
            content: {
              "application/json": {
                 schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: { type: "object", description: "Datos del usuario" },
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
                    error: { type: "string", example: "ID es requerido" },
                  },
                },
              },
            },
          },
          "404": {
            description: "Usuario no encontrado",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: false },
                    error: { type: "string", example: "Usuario no encontrado" },
                  },
                },
              },
            },
          },
        },
      },
        put: {
        tags: ["Usuario"],
        summary: "Actualizar un usuario por ID",
        description: "Actualiza un usuario específico por su ID.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "ID del usuario",
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
                   description: "data of user",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Usuario actualizado",
            content: {
              "application/json": {
                 schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: { type: "object", description: "Datos del usuario" },
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
                    error: { type: "string", example: "ID es requerido" },
                  },
                },
              },
            },
          },
          "404": {
            description: "Usuario no encontrado",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: false },
                    error: { type: "string", example: "Usuario no encontrado" },
                  },
                },
              },
            },
          },
        },
      },
       delete: {
        tags: ["Usuario"],
        summary: "Eliminar un usuario por ID",
        description: "Elimina un usuario específico por su ID.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "ID del usuario",
            schema: {
              type: "string",
            },
          },
        ],
       
        responses: {
          "200": {
            description: "Usuario eliminado",
            content: {
              "application/json": {
                 schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "Usuario eliminado correctamente" },
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
                    error: { type: "string", example: "ID es requerido" },
                  },
                },
              },
            },
          },
          "404": {
            description: "Usuario no encontrado",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: false },
                    error: { type: "string", example: "Usuario no encontrado" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/usuario": {
      get: {
        tags: ["Usuario"],
        summary: "Obtener todos los usuarios",
        description: "Obtiene una lista de todos los usuarios.",
        responses: {
          "200": {
            description: "Lista de usuarios",
            content: {
              "application/json": {
                 schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: { type: "array", description: "Lista de usuarios" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/usuario/{id}/incrementar-strike": {
      post: {
        tags: ["Usuario"],
        summary: "Incrementar strike a un usuario",
        description: "Incrementa el strike de un usuario específico.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "ID del usuario",
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          "200": {
            description: "Strike incrementado",
            content: {
              "application/json": {
                   schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: { type: "object", description: "Datos del usuario" },
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
                    error: { type: "string", example: "ID de usuario es requerido" },
                  },
                },
              },
            },
          },
           "404": {
            description: "Usuario no encontrado",
            content: {
              "application/json": {
                   schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: false },
                    error: { type: "string", example: "Usuario no encontrado" },
                  },
                },
              },
            },
          },
        },
      },
    },
     "/usuario/{id}/Verificar-bloqueo": {
      get: {
        tags: ["Usuario"],
        summary: "Verificar si el usuario está bloqueado",
        description: "Verifica si un usuario específico está bloqueado.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "ID del usuario",
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          "200": {
            description: "Estado de bloqueo del usuario",
            content: {
              "application/json": {
                    schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: { type: "object", description: "Datos del usuario" },
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
                    error: { type: "string", example: "ID de usuario es requerido" },
                  },
                },
              },
            },
          },
           "404": {
            description: "Usuario no encontrado",
            content: {
              "application/json": {
                   schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: false },
                    error: { type: "string", example: "Usuario no encontrado" },
                  },
                },
              },
            },
          },
        },
      },
    },
  };