// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { get } from "lodash";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
	apiKey: "AIzaSyDmxUlWwLZx_3VRLfXZ79BAD3hYOjjV3n4",
	authDomain: "easemyitinerary-b66c1.firebaseapp.com",
	projectId: "easemyitinerary-b66c1",
	storageBucket: "easemyitinerary-b66c1.firebasestorage.app",
	messagingSenderId: "1016136679747",
	appId: "1:1016136679747:web:cdfc24df7fbc0161ddeff6",
	measurementId: "G-4D1836DVY6",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
// const analytics = getAnalytics(app);
