import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyADEZNS22_lJzUUIY8Q0rT0nrJ17NU3SEw",
  authDomain: "metnumapp.firebaseapp.com",
  projectId: "metnumapp",
  storageBucket: "metnumapp.firebasestorage.app",
  messagingSenderId: "927456589132",
  appId: "1:927456589132:web:b63b138906341edc6c4be9",
  measurementId: "G-0KD72NQWJ0"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
