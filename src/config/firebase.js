// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics"; // analytics for later
import { getAuth } from "firebase/auth";// for authentication
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCJEqs42m72zip37y90JMMAA5y6z-mLiV4",
  authDomain: "ethio-chat-app-efc96.firebaseapp.com",
  projectId: "ethio-chat-app-efc96",
  storageBucket: "ethio-chat-app-efc96.firebasestorage.app",
  messagingSenderId: "208576881041",
  appId: "1:208576881041:web:0bbc367838c61e3437fa30",
  measurementId: "G-WQELBG0M25",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app); analytics for later

const auth = getAuth(app);
