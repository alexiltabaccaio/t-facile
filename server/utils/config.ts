import fs from 'fs';
import path from 'path';

interface FirebaseConfig {
  projectId: string;
  firestoreDatabaseId?: string;
}

let cachedConfig: FirebaseConfig | null = null;

export function getFirebaseConfig(): FirebaseConfig {
  if (cachedConfig) return cachedConfig;

  // Defaults
  const config: FirebaseConfig = {
    projectId: 't-facile-public'
  };

  try {
    const configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
    if (fs.existsSync(configPath)) {
      const configStr = fs.readFileSync(configPath, 'utf8');
      const parsed = JSON.parse(configStr);
      config.projectId = parsed.projectId || config.projectId;
      config.firestoreDatabaseId = parsed.firestoreDatabaseId || '(default)';
    } else {
      console.warn("firebase-applet-config.json not found, using default project ID");
    }
  } catch (e) {
    console.warn("Error loading firebase-applet-config.json:", e);
  }

  cachedConfig = config;
  return config;
}
