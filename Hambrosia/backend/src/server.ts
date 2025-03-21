import { Request, Response } from 'express';

const cors = require('cors');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const express = require('express');

const { firebaseDb } = require("./firebase");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

app.get('/', async (req: Request, res: Response) => {
  const querySnapshot = await firebaseDb.collection('contacts').get()
  console.log(querySnapshot);
  
  res.send(querySnapshot.docs[0].data());
});

app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});


