// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDMFGD5BGlHaRjrMC_P1w7tAIOti9CLVyM",
  authDomain: "redheart-d841c.firebaseapp.com",
  projectId: "redheart-d841c",
  storageBucket: "redheart-d841c.firebasestorage.app",
  messagingSenderId: "333075210636",
  appId: "1:333075210636:web:6c0c738fa5d63c037bf6a9",
  measurementId: "G-X798EE5RY4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const storage = getStorage(app);