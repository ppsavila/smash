// Firebase configuration and initialization

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration from environment variables
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Validate Firebase configuration
console.log('🔥 Firebase Config:', {
    apiKey: firebaseConfig.apiKey ? '✅ Loaded' : '❌ Missing',
    authDomain: firebaseConfig.authDomain ? '✅ Loaded' : '❌ Missing',
    projectId: firebaseConfig.projectId ? '✅ Loaded' : '❌ Missing',
    storageBucket: firebaseConfig.storageBucket ? '✅ Loaded' : '❌ Missing',
    messagingSenderId: firebaseConfig.messagingSenderId ? '✅ Loaded' : '❌ Missing',
    appId: firebaseConfig.appId ? '✅ Loaded' : '❌ Missing'
});

// Check if all required fields are present
const missingFields = [];
if (!firebaseConfig.apiKey) missingFields.push('VITE_FIREBASE_API_KEY');
if (!firebaseConfig.authDomain) missingFields.push('VITE_FIREBASE_AUTH_DOMAIN');
if (!firebaseConfig.projectId) missingFields.push('VITE_FIREBASE_PROJECT_ID');
if (!firebaseConfig.storageBucket) missingFields.push('VITE_FIREBASE_STORAGE_BUCKET');
if (!firebaseConfig.messagingSenderId) missingFields.push('VITE_FIREBASE_MESSAGING_SENDER_ID');
if (!firebaseConfig.appId) missingFields.push('VITE_FIREBASE_APP_ID');

if (missingFields.length > 0) {
    console.error('❌ Firebase configuration error!');
    console.error('Missing environment variables:', missingFields);
    console.error('Please check your .env file and restart the dev server.');
    alert(`Firebase não configurado!\n\nVariáveis faltando: ${missingFields.join(', ')}\n\nVerifique o arquivo .env e reinicie o servidor com: npm run dev`);
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Export app for other uses
export default app;
