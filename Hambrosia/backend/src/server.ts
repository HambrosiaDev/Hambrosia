// Import necessary libraries
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

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




// Load environment variables
dotenv.config();

const { db } = require('./config/firebase');

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


app.get('/api', (req: Request, res: Response) => {
  res.json({
    message: 'Hola Daniel',
  });
});

app.get('/', async (req: Request, res: Response) => {
  const querySnapshot = await db.collection('contacts').get();
  console.log(querySnapshot);

  res.send(querySnapshot.docs[0].data());
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});

