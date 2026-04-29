// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDLSZqSWkMUZJsPJCW64ja1vM5DyEw9mBA",
  authDomain: "resqnet-f06b7.firebaseapp.com",
  projectId: "resqnet-f06b7",
  storageBucket: "resqnet-f06b7.firebasestorage.app",
  messagingSenderId: "69030264884",
  appId: "1:69030264884:web:3c988e03bafaf7afde0a61",
  measurementId: "G-J13ZRRXLXQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
