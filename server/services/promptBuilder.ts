import { getPromptTemplate } from '../repositories/promptRepository.js';
import { getFileMetadata } from '../utils/documentClassifier.js';

/**
 * Builds the system and user prompts for the AI analysis.
 */
export async function createBackendPrompts(fileName: string, textData: string) {
  const { forcedCategory, forcedStatus, type } = getFileMetadata(fileName, textData);
  
  // Fetch the actual template from DB
  const template = await getPromptTemplate(type);

  // Apply template replacements
  let finalUserPrompt = template.userPromptTemplate
    .replace(/{{textData}}/g, textData)
    .replace(/{{forcedCategory}}/g, forcedCategory || 'Deduci dal contesto')
    .replace(/{{forcedStatus}}/g, forcedStatus || 'Attivo');

  finalUserPrompt += `
  
ATTENZIONE (REGOLE CRITICHE AGGIUNTIVE SUI CODICI E NOMI):
1. In alcuni documenti (come per i "Sigari" o le variazioni di prezzo), la colonna "Codice" potrebbe NON ESSERE PRESENTE nella tabella.
2. SE IL CODICE NON E' PRESENTE, DEVI COMUNQUE ESTRARRE IL PRODOTTO! Non ignorare nessun prodotto solo perché manca il codice.
3. In questi casi, imposta il campo "code" a una stringa vuota ("").
4. Estrai sempre tutti i prodotti presenti nel testo fornito.
5. NOME DEL PRODOTTO: Il campo "name" deve essere ESATTAMENTE IDENTICO a come è scritto nel documento. NON rimuovere MAI numeri, quantità o parole finali dal nome per "pulirlo". Se il documento riporta "WINSTON CHURCHILL CHURCHILL 4", il campo "name" DEVE essere "WINSTON CHURCHILL CHURCHILL 4", anche se inserisci "4" come quantità. Non troncare mai i nomi.
6. PREZZO AL CHILO PRECEDENTE: Se il documento riporta un prezzo al chilo precedente (spesso indicato con "Da €/Kg conv.le"), estrailo nel campo "oldPricePerKg" (numero).
  `;

  return {
    systemPrompt: template.systemPrompt,
    userPrompt: finalUserPrompt
  };
}
