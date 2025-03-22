import { Request, Response } from 'express';

import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';

// Import routes
import usuarioRoutes from './routes/usuarioRoutes';
import paqueteRoutes from './routes/paqueteRoutes';
import compraRoutes from './routes/compraRoutes';
import reporteRoutes from './routes/reporteRoutes';
import comisionRoutes from './routes/comisionRoutes';

// Load environment variables
dotenv.config();

const { db } = require("./config/firebase");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/paquetes', paqueteRoutes);
app.use('/api/compras', compraRoutes);
app.use('/api/reportes', reporteRoutes);
app.use('/api/comisiones', comisionRoutes);

app.get('/', async (req: Request, res: Response) => {
  const querySnapshot = await db.collection('contacts').get()
  console.log(querySnapshot);
  
  res.send(querySnapshot.docs[0].data());
});

app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});


