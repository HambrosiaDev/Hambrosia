import * as admin from 'firebase-admin';
import * as fb from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as path from 'path';

// Initialize Firebase
const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || 
  path.join(__dirname, '../../serviceAccountKey.json');

try {
  // Intentar inicializar con archivo de credenciales si existe
  const serviceAccount = require(serviceAccountPath);
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  
  console.log('✅ Firebase inicializado con service account key');
} catch (error) {
  // Fallback a credenciales por defecto (para producción)
  console.log('⚠️  Service account key no encontrado, usando credenciales por defecto');
  admin.initializeApp({
    credential: fb.applicationDefault(),
  });
}

// Export Firebase services
export const db = getFirestore();
export const auth = admin.auth();
export const storage = admin.storage();

export default admin;