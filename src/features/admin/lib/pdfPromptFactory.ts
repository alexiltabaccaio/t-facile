export type ADMFileType = 'Attivo' | 'Radiato' | 'Emissione';

export interface PromptConfig {
  systemPrompt: string;
  userPrompt: string;
}

/**
 * Analizza il nome del file e il contenuto del testo per determinare categoria e stato forzati
 */
export const getFileMetadata = (fileName: string, textData: string = "") => {
  const fileNameLower = fileName.toLowerCase();
  const textLower = textData.toLowerCase();
  
  const isRadiato = fileNameLower.startsWith('rad_') || textLower.includes('tabacchi radiati');
  const isAttivo = fileNameLower.startsWith('att_') || textLower.includes('listino aggiornato al');
  const isEmissione = fileNameLower.startsWith('emi_') || textLower.includes('livelli di emissione');
  
  let forcedCategory = "";
  const combinedText = fileNameLower + " " + textLower;

  if (combinedText.includes('trinciati')) forcedCategory = "Trinciati";
  else if (combinedText.includes('sigaretti')) forcedCategory = "Sigaretti";
  else if (combinedText.includes('sigari')) forcedCategory = "Sigari";
  else if (combinedText.includes('sigarette')) forcedCategory = "Sigarette";
  else if (combinedText.includes('fiuto') || combinedText.includes('mastico')) forcedCategory = "Fiuto e Mastico";
  else if (combinedText.includes('inalazione') || combinedText.includes('liquidi') || combinedText.includes('senza combustione')) forcedCategory = "Prodotti da inalazione senza combustione";

  const forcedStatus: 'Attivo' | 'Radiato' | '' = isRadiato ? 'Radiato' : ((isAttivo || isEmissione) ? 'Attivo' : '');
  const type: ADMFileType = isEmissione ? 'Emissione' : (isRadiato ? 'Radiato' : 'Attivo');

  return { forcedCategory, forcedStatus, type };
}

/**
 * Factory per la generazione dei prompt basata sul tipo di file e sul chunk di testo
 */
export const createPrompts = (fileName: string, textData: string): PromptConfig => {
  const { forcedCategory, forcedStatus, type } = getFileMetadata(fileName, textData);

  const categoryInstruction = `
CATEGORIE AMMESSE (USA ESATTAMENTE QUESTE):
- Sigarette
- Sigari
- Sigaretti
- Trinciati
- Fiuto e Mastico
- Prodotti da inalazione senza combustione
- Altri Tabacchi
`;

  if (type === 'Emissione') {
    return {
      systemPrompt: `Sei un esperto estrattore dati per listini EMISSIONI ADM (Nicotina, Catrame, Monossido).
          Il tuo compito è trasformare il testo di una tabella in JSON puro.
          ${categoryInstruction}
          
          REGOLE MANDATORIE SUI NUMERI:
          - I valori 'nicotine', 'tar' e 'co' devono essere NUMERI (es. 0.30, 3.00).
          - Usa sempre il punto (.) come separatore decimale. Se nel testo trovi la virgola (,), convertila.
          - Arrotonda a massimo 2 decimali.`,
      userPrompt: `Analizza questo testo estratto da un listino EMISSIONI SIGARETTE ADM.

CONFIGURAZIONE:
- CATEGORIA: Sigarette
- CAMPI DA ESTRARRE: code, name, packageInfo, nicotine, tar, co

ESEMPIO DI ESTRAZIONE (FEW-SHOT):
Input: "7 821 ARGENTO astuccio da 20 pezzi 0,30 3,00 4,00"
Output: { "code": "7", "name": "821 ARGENTO", "packageInfo": "astuccio da 20 pezzi", "nicotine": 0.30, "tar": 3.00, "co": 4.00, "category": "Sigarette" }

Input: "21265 CHE BLACK astuccio da 20 pezzi 0,90 10,00 9,00"
Output: { "code": "21265", "name": "CHE BLACK", "packageInfo": "astuccio da 20 pezzi", "nicotine": 0.90, "tar": 10.00, "co": 9.00, "category": "Sigarette" }

REGOLE LOGICHE:
1. DATA AGGIORNAMENTO: Cerca nel testo una data (es. "AGGIORNATI AL 11/03/2026") e restituiscila nel campo "updateDate" in formato YYYY-MM-DD.
2. NOME vs CONFEZIONE: Il nome è il brand commerciale (es. "CAMEL BLUE"). La confezione descrive il contenitore (es. "astuccio da 20 pezzi").
3. VALORI CHIMICI: Sono gli ultimi tre numeri della riga. Nicotina è il primo dei tre, Catrame il secondo, Monossido l'ultimo.

FORMATO JSON RICHIESTO:
{ 
  "updateDate": "YYYY-MM-DD", 
  "products": [ 
    { "code": "...", "name": "...", "packageInfo": "...", "nicotine": 0.0, "tar": 0.0, "co": 0.0, "category": "Sigarette" } 
  ] 
}

Testo da analizzare:
${textData}`
    };
  }

  if (type === 'Radiato') {
    return {
      systemPrompt: `Sei un esperto estrattore dati specializzato in listini ADM di prodotti RADIATI (fuori commercio).
          ${categoryInstruction}
          Devi estrarre i dati in JSON puro.`,
      userPrompt: `Analizza questo testo di prodotti RADIATI ADM.

CONFIGURAZIONE:
- CATEGORIA: ${forcedCategory || 'Deduci dal contesto'}
- STATO: Radiato

ESEMPIO DI ESTRAZIONE (FEW-SHOT):
Input: "18/06/2018 2206 500 RED astuccio da 20 pezzi 215,00 4,30"
Output: { "radiationDate": "2018-06-18", "code": "2206", "name": "500 RED", "packageInfo": "astuccio da 20 pezzi", "pricePerKg": 215.00, "price": 4.30, "status": "Radiato" }

REGOLE LOGICHE:
1. DATA RADIAZIONE: Ogni riga inizia con una data (DD/MM/YYYY). Convertila in YYYY-MM-DD.
2. PREZZI: Identifica il prezzo unitario della confezione (solitamente l'ultimo numero) e il prezzo al kg (il numero decimale che lo precede). Converti le virgole in punti.
3. NOME: Ferma il nome quando inizia la descrizione della confezione (astuccio, scatola, busta, cartoccio, ecc.).

FORMATO JSON RICHIESTO:
{ 
  "updateDate": "YYYY-MM-DD", 
  "products": [ 
    { "code": "...", "name": "...", "packageInfo": "...", "price": 0.0, "pricePerKg": 0.0, "radiationDate": "...", "category": "...", "status": "Radiato" } 
  ] 
}

Testo da analizzare:
${textData}`
    };
  }

  // DEFAULT / ATTIVO
  return {
    systemPrompt: `Sei un esperto estrattore dati per listini prezzi ADM Tabacchi.
          Il tuo compito è trasformare il testo in JSON strutturato.
          ${categoryInstruction}`,
    userPrompt: `Analizza questo testo estratto da un listino prezzi ADM.

CONFIGURAZIONE:
- CATEGORIA: ${forcedCategory || 'Deduci dal contesto'}
- STATO: ${forcedStatus || 'Attivo'}

ESEMPIO DI ESTRAZIONE (FEW-SHOT):
Input: "3951 MARLBORO GOLD 100'S astuccio da 20 pezzi 250,00 5,00"
Output: { "code": "3951", "name": "MARLBORO GOLD 100'S", "packageInfo": "astuccio da 20 pezzi", "price": 5.00, "pricePerKg": 250.00 }

REGOLE LOGICHE:
1. PREZZI: Il prezzo a confezione è solitamente l'ultimo numero della riga. Il prezzo al kg è il numero decimale che lo precede (più alto). Se c'è un solo prezzo, è quello a confezione.
2. NOME vs CONFEZIONE: Usa la logica semantica. Il nome è il brand (es. "821 BLU"). La confezione è la descrizione fisica (es. "astuccio da 20 pezzi", "da 30 grammi").
3. DATA AGGIORNAMENTO: Cerca nel testo frasi come "AGGIORNATO AL" o "IN VIGORE DAL" per estrarre la data del listino.

FORMATO JSON RICHIESTO:
{ 
  "updateDate": "YYYY-MM-DD", 
  "products": [ 
    { "code": "...", "name": "...", "packageInfo": "...", "price": 0.0, "pricePerKg": 0.0, "category": "...", "status": "..." } 
  ] 
}

Testo da analizzare:
${textData}`
  };
};

