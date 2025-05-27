export const reporteSwagger = {
  '/api/reportes/cliente-to-restaurante/{compraId}': {
    post: {
      tags: ['Reportes'],
      summary: 'Crear reporte de cliente a restaurante',
      description: 'Crea un nuevo reporte desde un cliente hacia un restaurante',
      parameters: [
        {
          in: 'path',
          name: 'compraId',
          required: true,
          schema: {
            type: 'string'
          },
          description: 'ID de la compra asociada al reporte'
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['descripcion'],
              properties: {
                descripcion: {
                  type: 'string',
                  description: 'Descripción detallada del reporte'
                }
              }
            }
          }
        }
      },
      responses: {
        '201': {
          description: 'Reporte creado exitosamente',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: true
                  },
                  data: {
                    type: 'object',
                    properties: {
                      id: {
                        type: 'string',
                        description: 'ID del reporte'
                      },
                      compraId: {
                        type: 'string',
                        description: 'ID de la compra'
                      },
                      descripcion: {
                        type: 'string',
                        description: 'Descripción del reporte'
                      },
                      nombreRestaurante: {
                        type: 'string',
                        description: 'Nombre del restaurante'
                      },
                      precio: {
                        type: 'number',
                        description: 'Precio original'
                      },
                      precioDescuento: {
                        type: 'number',
                        description: 'Precio con descuento'
                      },
                      comision: {
                        type: 'number',
                        description: 'Comisión de la compra'
                      },
                      fechaCompra: {
                        type: 'string',
                        format: 'date-time',
                        description: 'Fecha de la compra'
                      },
                      tipoReporte: {
                        type: 'string',
                        enum: ['cliente_to_restaurante'],
                        description: 'Tipo de reporte'
                      }
                    }
                  },
                  message: {
                    type: 'string',
                    example: 'Reporte creado y notificación enviada al equipo de soporte'
                  }
                }
              }
            }
          }
        },
        '400': {
          description: 'Error en la solicitud',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: false
                  },
                  error: {
                    type: 'string',
                    example: 'compraId y descripcion son obligatorios'
                  }
                }
              }
            }
          }
        },
        '404': {
          description: 'Compra no encontrada',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: false
                  },
                  error: {
                    type: 'string',
                    example: 'Compra no encontrada'
                  }
                }
              }
            }
          }
        },
        '500': {
          description: 'Error interno del servidor',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: false
                  },
                  error: {
                    type: 'string',
                    example: 'Error interno del servidor'
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  '/api/reportes/restaurante-to-cliente/{compraId}': {
    post: {
      tags: ['Reportes'],
      summary: 'Crear reporte de restaurante a cliente',
      description: 'Crea un nuevo reporte desde un restaurante hacia un cliente',
      parameters: [
        {
          in: 'path',
          name: 'compraId',
          required: true,
          schema: {
            type: 'string'
          },
          description: 'ID de la compra asociada al reporte'
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['descripcion'],
              properties: {
                descripcion: {
                  type: 'string',
                  description: 'Descripción detallada del reporte'
                }
              }
            }
          }
        }
      },
      responses: {
        '201': {
          description: 'Reporte creado exitosamente',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: true
                  },
                  data: {
                    type: 'object',
                    properties: {
                      id: {
                        type: 'string',
                        description: 'ID del reporte'
                      },
                      compraId: {
                        type: 'string',
                        description: 'ID de la compra'
                      },
                      descripcion: {
                        type: 'string',
                        description: 'Descripción del reporte'
                      },
                      nombreRestaurante: {
                        type: 'string',
                        description: 'Nombre del restaurante'
                      },
                      precio: {
                        type: 'number',
                        description: 'Precio original'
                      },
                      precioDescuento: {
                        type: 'number',
                        description: 'Precio con descuento'
                      },
                      comision: {
                        type: 'number',
                        description: 'Comisión de la compra'
                      },
                      fechaCompra: {
                        type: 'string',
                        format: 'date-time',
                        description: 'Fecha de la compra'
                      },
                      tipoReporte: {
                        type: 'string',
                        enum: ['restaurante_to_cliente'],
                        description: 'Tipo de reporte'
                      }
                    }
                  },
                  message: {
                    type: 'string',
                    example: 'Reporte creado y notificación enviada al equipo de soporte'
                  }
                }
              }
            }
          }
        },
        '400': {
          description: 'Error en la solicitud',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: false
                  },
                  error: {
                    type: 'string',
                    example: 'compraId y descripcion son obligatorios'
                  }
                }
              }
            }
          }
        },
        '404': {
          description: 'Compra no encontrada',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: false
                  },
                  error: {
                    type: 'string',
                    example: 'Compra no encontrada'
                  }
                }
              }
            }
          }
        },
        '500': {
          description: 'Error interno del servidor',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: false
                  },
                  error: {
                    type: 'string',
                    example: 'Error interno del servidor'
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  '/api/reportes/{reporteId}': {
    get: {
      tags: ['Reportes'],
      summary: 'Obtener reporte por ID',
      description: 'Obtiene un reporte específico por su ID',
      parameters: [
        {
          in: 'path',
          name: 'reporteId',
          required: true,
          schema: {
            type: 'string'
          },
          description: 'ID del reporte a obtener'
        }
      ],
      responses: {
        '200': {
          description: 'Reporte encontrado',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  id: {
                    type: 'string',
                    description: 'ID del reporte'
                  },
                  compraId: {
                    type: 'string',
                    description: 'ID de la compra'
                  },
                  descripcion: {
                    type: 'string',
                    description: 'Descripción del reporte'
                  },
                  nombreRestaurante: {
                    type: 'string',
                    description: 'Nombre del restaurante'
                  },
                  precio: {
                    type: 'number',
                    description: 'Precio original'
                  },
                  precioDescuento: {
                    type: 'number',
                    description: 'Precio con descuento'
                  },
                  comision: {
                    type: 'number',
                    description: 'Comisión de la compra'
                  },
                  fechaCompra: {
                    type: 'string',
                    format: 'date-time',
                    description: 'Fecha de la compra'
                  },
                  tipoReporte: {
                    type: 'string',
                    enum: ['cliente_to_restaurante', 'restaurante_to_cliente'],
                    description: 'Tipo de reporte'
                  }
                }
              }
            }
          }
        },
        '404': {
          description: 'Reporte no encontrado',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: {
                    type: 'string',
                    example: 'Reporte no encontrado'
                  }
                }
              }
            }
          }
        },
        '500': {
          description: 'Error interno del servidor',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: {
                    type: 'string',
                    example: 'Error interno del servidor'
                  }
                }
              }
            }
          }
        }
      }
    }
  }
};

export default reporteSwagger; 