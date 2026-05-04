import { auth } from "@/shared/api";

/**
 * Analyzes the text extracted from an ADM PDF using Gemini AI on the server.
 */
export async function analyzeTextWithAI(
  fileName: string,
  textData: string,
  aiModel: string = "gemini-3-flash-preview",
  signal?: AbortSignal
) {
  const token = await auth.currentUser?.getIdToken();
  if (!token) {
    throw new Error("Utente non autenticato per l'analisi IA");
  }

  const response = await fetch('/api/adm/analyze', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ fileName, textData, aiModel }),
    signal
  });

  const data = await response.json();
  if (!response.ok) {
     throw new Error(data.error || `Errore HTTP ${response.status}`);
  }
  if (!data.success) {
     throw new Error(data.error || "Errore sconosciuto dal server AI.");
  }

  return data.result;
}

