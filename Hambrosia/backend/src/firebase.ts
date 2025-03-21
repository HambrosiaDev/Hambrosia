const { applicationDefault, initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

initializeApp({
  credential: applicationDefault()
});

const firebaseDb = getFirestore();

module.exports = { firebaseDb };
