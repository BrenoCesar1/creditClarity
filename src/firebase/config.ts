// This file is intentionally left blank.
// The Firebase configuration will be injected by the environment.
// In your local development environment, you can create a .env.local file
// with the following content:
//
// NEXT_PUBLIC_FIREBASE_API_KEY="your-api-key"
// NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-auth-domain"
// NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
// NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-storage-bucket"
// NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your-messaging-sender-id"
// NEXT_PUBLIC_FIREBASE_APP_ID="your-app-id"

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export function getFirebaseConfig() {
    if (!firebaseConfig.apiKey) {
        console.warn("Firebase config not found, using dummy values. Please set up your .env file.");
        return {
            apiKey: "dummy-key",
            authDomain: "dummy-project.firebaseapp.com",
            projectId: "dummy-project",
            storageBucket: "dummy-project.appspot.com",
            messagingSenderId: "dummy-sender-id",
            appId: "dummy-app-id",
        };
    }
    return firebaseConfig;
}
