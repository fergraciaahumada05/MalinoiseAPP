// src/firebase/config.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDNUGO2Jsy5-LrxbX7Opch9bTiABcYwrhA",
  authDomain: "malinoiseapp.firebaseapp.com",
  projectId: "malinoiseapp",
  storageBucket: "malinoiseapp.appspot.com",
  messagingSenderId: "121047401745",
  appId: "1:121047401745:web:090e97d37d84c7ed7638b0",
  measurementId: "G-J9YV83B25R"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
