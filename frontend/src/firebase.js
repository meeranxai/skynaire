import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyD8Sg8rBwkCS4BYwgVrb_V_KQ4eMd0PkZ0",
    authDomain: "g-network-community.firebaseapp.com",
    projectId: "g-network-community",
    storageBucket: "g-network-community.firebasestorage.app",
    messagingSenderId: "358032029950",
    appId: "1:358032029950:web:a8dc470de9d85ead240daf"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
console.log("🔥 Firebase Initialized");

export const db = getFirestore(app);
export const auth = getAuth(app);

// Ensure persistence is set to local
setPersistence(auth, browserLocalPersistence)
    .catch((error) => {
        console.error("Auth persistence error:", error);
    });

export const storage = getStorage(app);
export default app;
