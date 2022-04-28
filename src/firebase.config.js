import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAajPBqpJjwuMMtXwvBf8STH0o60-m7-ns",
  authDomain: "promotion-code-app-78fac.firebaseapp.com",
  projectId: "promotion-code-app-78fac",
  storageBucket: "promotion-code-app-78fac.appspot.com",
  messagingSenderId: "177869554423",
  appId: "1:177869554423:web:520023af50738c1cd4c9f2"
};

// Initialize Firebase
initializeApp(firebaseConfig);
export const db = getFirestore()

