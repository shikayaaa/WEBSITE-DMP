// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// const firebaseConfig = {
//   apiKey: "AIzaSyAtSkLMC5eWa5WUjzWyu56RWuPeeBlD9gg",
//   authDomain: "dmpdb-8f26e.firebaseapp.com",
//   projectId: "dmpdb-8f26e",
//   storageBucket: "dmpdb-8f26e.appspot.com", // ✅ fixed from .firebasestorage.app
//   messagingSenderId: "120810655315",
//   appId: "1:120810655315:web:50ecffb2951d652bb7c0a6",
//   measurementId: "G-5HC91PXP3S"
// };

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAtSkLMC5eWa5WUjzWyu56RWuPeeBlD9gg",
  authDomain: "dmpdb-8f26e.firebaseapp.com",
  projectId: "dmpdb-8f26e",
  storageBucket: "dmpdb-8f26e.firebasestorage.app",
  messagingSenderId: "120810655315",
  appId: "1:120810655315:web:50ecffb2951d652bb7c0a6",
  measurementId: "G-5HC91PXP3S"
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);

export { auth, db, analytics };
