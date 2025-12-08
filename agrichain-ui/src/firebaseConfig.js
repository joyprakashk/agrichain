// ✅ src/firebase/firebaseConfig.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, onAuthStateChanged } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// 🔐 Your project credentials
const firebaseConfig = {
  apiKey: "AIzaSyAivJU6vdNkbo40wSTSpm2rLVndFQzMuVs",
  authDomain: "agrichain-4ac23.firebaseapp.com",
  projectId: "agrichain-4ac23",
  storageBucket: "agrichain-4ac23.appspot.com", // ✅ small fix: remove `.app`
  messagingSenderId: "241376539743",
  appId: "1:241376539743:web:2b336192b75bf869d757ea",
  measurementId: "G-BHYHT34KEM",
};

// ✅ Avoid duplicate initialization
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Keep refreshed token in localStorage
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const token = await user.getIdToken(true);
    localStorage.setItem("idToken", token);
  } else {
    localStorage.removeItem("idToken");
  }
});

export { app, auth, db, storage, RecaptchaVerifier, signInWithPhoneNumber };
