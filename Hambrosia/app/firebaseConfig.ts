// firebaseConfig.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
    apiKey: "AIzaSyDl66Bf__Iz52ncu-No1yZnrXgYqFaPDCk",
    authDomain: "hambrosia-ec04f.firebaseapp.com",
    projectId: "hambrosia-ec04f",
    storageBucket: "hambrosia-ec04f.firebasestorage.app",
    messagingSenderId: "597880099830",
    appId: "1:597880099830:web:c9e6cedfb90dcd9e73add7"
  };

  const app = initializeApp(firebaseConfig);


const auth = getAuth(app);

export { app, auth };
