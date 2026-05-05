

interface FirebaseConfig {
  projectId: string;
  firestoreDatabaseId?: string;
}

let cachedConfig: FirebaseConfig | null = null;

export function getFirebaseConfig(): FirebaseConfig {
  if (cachedConfig) return cachedConfig;

  // Load from environment variables
  const config: FirebaseConfig = {
    projectId: process.env.VITE_FIREBASE_PROJECT_ID || 't-facile-public',
    firestoreDatabaseId: process.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || '(default)'
  };


  cachedConfig = config;
  return config;
}
