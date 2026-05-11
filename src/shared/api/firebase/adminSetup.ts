import { doc, setDoc } from "firebase/firestore";
import { db } from "./firebase";

/**
 * Adds a user to the admin collection in Firestore.
 * This should be used to initialize the first admin.
 */
export async function setupInitialAdmin(uid: string) {
  try {
    console.log(`Tentativo di promozione admin per UID: ${uid}`);
    const adminRef = doc(db, 'admins', uid);
    await setDoc(adminRef, {
      role: 'admin',
      addedAt: new Date().toISOString(),
      bootstrap: true
    });
    console.log(`Utente ${uid} promosso con successo.`);
    return true;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Errore dettagliato promozione:", {
        message: error.message,
        name: error.name,
        uid: uid
      });
    } else {
      console.error("Errore promozione (tipo sconosciuto):", error);
    }
    throw error;
  }
}
