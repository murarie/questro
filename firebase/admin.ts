import { initializeApp, cert, getApps, getApp, App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

let adminApp: App;

const ensureEnv = () => {
  if (!process.env.FIREBASE_PROJECT_ID) {
    throw new Error("Missing env: FIREBASE_PROJECT_ID");
  }
  if (!process.env.FIREBASE_CLIENT_EMAIL) {
    throw new Error("Missing env: FIREBASE_CLIENT_EMAIL");
  }
  if (!process.env.FIREBASE_PRIVATE_KEY) {
    throw new Error("Missing env: FIREBASE_PRIVATE_KEY");
  }
};

try {
  // Validate env early (will show helpful message in logs if missing)
  ensureEnv();

  if (!getApps().length) {
    // Replace escaped newlines if the private key was set via env var
    const privateKey = process.env.FIREBASE_PRIVATE_KEY!.includes("\\n")
      ? process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, "\n")
      : process.env.FIREBASE_PRIVATE_KEY!;

    adminApp = initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey,
      } as any),
    });
    // eslint-disable-next-line no-console
    console.log("✅ Firebase admin initialized");
  } else {
    adminApp = getApp();
  }
} catch (err) {
  // If env is missing, log a clear error for dev/prod troubleshooting
  // eslint-disable-next-line no-console
  console.error("❌ Firebase admin initialization error:", err);
  // Re-throw so server startup fails loudly if credentials are missing
  throw err;
}

// Firestore and Auth exports
export const db = getFirestore(adminApp);
// Avoid Firestore "Cannot use 'undefined' as a Firestore value" errors
try {
  db.settings({ ignoreUndefinedProperties: true });
} catch {
  // ignore if the SDK version doesn't support settings in this env
}

export const auth = getAuth(adminApp);
export default adminApp;


