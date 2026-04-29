import { 
  GoogleAuthProvider, 
  signInWithPopup,
  getRedirectResult,
  signOut as firebaseSignOut 
} from 'firebase/auth';
import { auth } from './firebase';

export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error: any) {
    if (error.code === 'auth/popup-closed-by-user') {
      console.warn("L'utente ha chiuso il popup di login o è stato bloccato dal browser.");
      return null;
    }
    console.error("Error signing in with Google:", error);
    throw error;
  }
};

export const handleRedirectResult = async () => {
  try {
    const result = await getRedirectResult(auth);
    return result?.user || null;
  } catch (error) {
    console.error("Error handling redirect result:", error);
    return null;
  }
};

export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};
