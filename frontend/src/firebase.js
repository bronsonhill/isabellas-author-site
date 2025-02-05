// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDo0Yi1NZhV2vKE8Op33LrI6fjZrhkDBN4",
  authDomain: "isabellaeichleronus-ac8fb.firebaseapp.com",
  projectId: "isabellaeichleronus-ac8fb",
  storageBucket: "isabellaeichleronus-ac8fb.firebasestorage.app",
  messagingSenderId: "385161622269",
  appId: "1:385161622269:web:8218f0e1080d5ae8750494",
  measurementId: "G-18FDCJGWJD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);