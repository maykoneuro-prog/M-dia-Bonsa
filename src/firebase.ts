import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDvDPdRauEaWjFffz5TACDwbr1FRklzoIM",
  authDomain: "gen-lang-client-0258827102.firebaseapp.com",
  projectId: "gen-lang-client-0258827102",
  storageBucket: "gen-lang-client-0258827102.firebasestorage.app",
  messagingSenderId: "570298452148",
  appId: "1:570298452148:web:8f3225089bae70c00aefe1"
};

const app = initializeApp(firebaseConfig);

// Initialize with the specific databaseId provisioned by AI Studio
const db = getFirestore(app, "ai-studio-5f49a379-993e-4a4b-9e31-ab1eb8c3ea2c");

export { db };
