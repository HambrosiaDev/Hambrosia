import * as admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import * as path from 'path';

// Prevenir múltiples inicializaciones
if (!admin.apps.length) {
  // Initialize Firebase
  try {
    // Opción 1: Variables de entorno (para Render/producción)
    if (process.env.FIREBASE_PRIVATE_KEY) {
      console.log('🔍 Inicializando Firebase con variables de entorno...');
      console.log('Project ID:', process.env.FIREBASE_PROJECT_ID);
      console.log('Client Email:', process.env.FIREBASE_CLIENT_EMAIL);
      
      // Validar que la private key tenga el formato correcto
      const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
      console.log('Private Key comienza con:', privateKey.substring(0, 30));
      console.log('Private Key termina con:', privateKey.substring(privateKey.length - 30));
      console.log('Private Key tiene', (privateKey.match(/\n/g) || []).length, 'saltos de línea');
      
      const serviceAccount = {
        type: 'service_account',
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: privateKey,
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: 'https://accounts.google.com/o/oauth2/auth',
        token_uri: 'https://oauth2.googleapis.com/token',
        auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
        client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
        universe_domain: 'googleapis.com',
      };

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
      });
      
      console.log('✅ Firebase inicializado con variables de entorno');
    } 
    // Opción 2: Archivo local (para desarrollo)
    else {
      const serviceAccountPath = path.join(__dirname, '../../serviceAccountKey.json');
      const serviceAccount = require(serviceAccountPath);
      
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      
      console.log('✅ Firebase inicializado con service account key');
    }
  } catch (error: any) {
    console.error('❌ Error al inicializar Firebase:', error.message);
    console.error('Stack:', error.stack);
    throw error;
  }
} else {
  console.log('⚠️  Firebase ya estaba inicializado, usando instancia existente');
}

// Export Firebase services
export const db = getFirestore();
export const auth = admin.auth();
export const storage = admin.storage();

export default admin;