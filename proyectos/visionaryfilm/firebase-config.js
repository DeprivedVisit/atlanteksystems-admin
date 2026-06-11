// MODO DEMO — datos en localStorage, sin Firebase
// Para conectar Firebase real: reemplazar este archivo con la config real
// y cambiar el import en admin.js a los SDK de Firebase CDN

export {
  db, auth,
  collection, doc, addDoc, setDoc, getDoc, getDocs,
  updateDoc, deleteDoc, onSnapshot, query, orderBy, limit, where,
  signInWithEmailAndPassword, signOut, onAuthStateChanged
} from './firebase-mock.js';
