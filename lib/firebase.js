// /lib/firebase.js
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDdr53NXHWjJb-F_01wVDK8M_S2f3D_OE0",
  authDomain: "nassayem-salalah.firebaseapp.com",
  projectId: "nassayem-salalah",
  storageBucket: "nassayem-salalah.firebasestorage.app",
  messagingSenderId: "207335549127",
  appId: "1:207335549127:web:f77ae6d2e755f9f0df36e2",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
export const chatRef = collection(db, "chats");
