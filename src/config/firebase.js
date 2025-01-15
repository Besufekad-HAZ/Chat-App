// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics"; // analytics for later
import {
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
} from "firebase/auth"; // for authentication
import { doc, getFirestore, setDoc } from "firebase/firestore";
// import { toast } from "react-toastify";
// use react toastify after importing it

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
const db = getFirestore(app);

// create signup method
const signup = async (username, email, password) => {
  try {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    const user = res.user;
    await setDoc(doc(db, "users", user.uid), {
      id: user.uid,
      username: username.toLowerCase(),
      email,
      name: "",
      avatar: "",
      bio: "Hey There, I am using Ethio-Chat App",
      lastSeen: Date.now(),
    });
    await setDoc(doc(db, "chats", user.uid), {
      chatData: [],
    });
  } catch (err) {
    console.error(err);
    throw err;
  }
};

// create login method
const login = async (email, password) => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export { signup, login };
