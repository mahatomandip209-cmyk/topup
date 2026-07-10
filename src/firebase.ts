import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyC5YNfzuFDHR-4ylV4aL3QUZVnp545ESok",
  authDomain: "topup-b69c7.firebaseapp.com",
  databaseURL: "https://topup-b69c7-default-rtdb.firebaseio.com",
  projectId: "topup-b69c7",
  storageBucket: "topup-b69c7.firebasestorage.app",
  messagingSenderId: "114492491939",
  appId: "1:114492491939:web:0ece9ea7b0d474b6c6d716",
  measurementId: "G-2MDHKNTW3S"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
