// Import necessary libraries
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';
// Import routes
import usuarioRoutes from './routes/usuarioRoutes';
import paqueteRoutes from './routes/paqueteRoutes';
import compraRoutes from './routes/compraRoutes';
import reporteRoutes from './routes/reporteRoutes';
import notificacionesRoutes from './routes/notificacionesRoutes';
// Import swagger configurations
import { compraSwagger } from './swagger/compraSwagger';
import { paqueteSwagger } from './swagger/paqueteSwagger';
import { reporteSwagger } from './swagger/reporteSwagger';
import { usuarioSwagger } from './swagger/usuarioSwagger';
import { notificacionesSwagger } from './swagger/notificacionesSwagger';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;


app.use(cors());
app.use(bodyParser.json());

// Configuration for swagger documentation
const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'API Documentation',
    version: '1.0.0',
    description: 'Documentation for the API',
  },
  paths: {
    ...compraSwagger,
    ...reporteSwagger,
    ...usuarioSwagger,
    ...paqueteSwagger,
    ...notificacionesSwagger
  },
};

// Routes
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/paquetes', paqueteRoutes);
app.use('/api/compras', compraRoutes);
app.use('/api/reportes', reporteRoutes);
app.use('/api/notificaciones', notificacionesRoutes);


// Routes for the API documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error('Error details:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    body: req.body,
    query: req.query,
    params: req.params
  });

  // Determinar el código de estado apropiado
  const statusCode = err.statusCode || 500;
  
  // Enviar respuesta de error
  res.status(statusCode).json({
    error: {
      message: err.message || 'Something went wrong',
      code: err.code || 'INTERNAL_SERVER_ERROR',
      path: req.path,
      timestamp: new Date().toISOString()
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});

