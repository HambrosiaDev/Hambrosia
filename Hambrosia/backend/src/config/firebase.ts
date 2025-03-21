import * as admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

// Inicializa Firebase Admin con las credenciales de servicio
const firebaseConfig = {
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  }),
};

// Inicializa la app solo si no se ha hecho ya
if (!admin.apps.length) {
  admin.initializeApp(firebaseConfig);
}

// Exporta las instancias de Firestore, Auth, etc.
export const db = admin.firestore();
export const auth = admin.auth();
export const storage = admin.storage();

export default admin;