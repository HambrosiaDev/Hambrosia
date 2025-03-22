import * as admin from 'firebase-admin';
import * as fb from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase
admin.initializeApp({
  credential: fb.applicationDefault(),
});

// Export Firebase services
export const db = getFirestore();
export const auth = admin.auth();
export const storage = admin.storage();

export default admin;