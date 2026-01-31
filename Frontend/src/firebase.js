// Import the functions you need from Firebase SDKs
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB-tJ4Ei5TsdZl797iLyBpCLsJodHVzUyI",
  authDomain: "agri-ai-b000d.firebaseapp.com",
  databaseURL: "https://agri-ai-b000d-default-rtdb.firebaseio.com",
  projectId: "agri-ai-b000d",
  storageBucket: "agri-ai-b000d.firebasestorage.app",
  messagingSenderId: "1071415403496",
  appId: "1:1071415403496:web:85332aa1f348616df7fa5d",
  measurementId: "G-D5DN77QNSW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);        // ✅ Authentication
const db = getFirestore(app);     // ✅ Firestore database
const analytics = getAnalytics(app); // ✅ Analytics

// Export everything you want to use in other files
export { auth, db, analytics };
