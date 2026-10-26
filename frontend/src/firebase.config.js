import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAynw_4W8vQOGTbK4BSuctx3jRJ2Mgvhmk",
  authDomain: "ams-project-451507.firebaseapp.com",
  projectId: "ams-project-451507",
  storageBucket: "ams-project-451507.firebasestorage.app",
  messagingSenderId: "518067325095",
  appId: "1:518067325095:web:b44b0b257622c514353382",
  measurementId: "G-R88GX5JXNM",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Configure email verification settings
auth.useDeviceLanguage();

export { auth };
