export type ADMFileType = 'Attivo' | 'Radiato' | 'Emissione';

export interface PromptConfig {
  systemPrompt: string;
  userPrompt: string;
}

/**
 * Analyzes the file name and text content to determine forced category and status
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
 * Factory for prompt generation based on file type and text chunk
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
          - Arrotonda a massimo 2 decimali.
          
          REGOLE CONFEZIONE (package):
          - Deve essere un oggetto con: type, quantity, unit.
          - type deve essere uno di: ASTUCCIO, CARTOCCIO, BUSTA, SCATOLA, LATTINA, BARATTOLO, GENERIC.
          - unit deve essere uno di: PIECES, GRAMS, ML.
          - quantity deve essere un NUMERO.`,
      userPrompt: `Analizza questo testo estratto da un listino EMISSIONI SIGARETTE ADM.

CONFIGURAZIONE:
- CATEGORIA: Sigarette
- CAMPI DA ESTRARRE: code, name, package, nicotine, tar, co

ESEMPIO DI ESTRAZIONE (FEW-SHOT):
Input: "7 821 ARGENTO astuccio da 20 pezzi 0,30 3,00 4,00"
Output: { "code": "7", "name": "821 ARGENTO", "package": { "type": "ASTUCCIO", "quantity": 20, "unit": "PIECES" }, "nicotine": 0.30, "tar": 3.00, "co": 4.00, "category": "Sigarette" }

Input: "21265 CHE BLACK astuccio da 20 pezzi 0,90 10,00 9,00"
Output: { "code": "21265", "name": "CHE BLACK", "package": { "type": "ASTUCCIO", "quantity": 20, "unit": "PIECES" }, "nicotine": 0.90, "tar": 10.00, "co": 9.00, "category": "Sigarette" }

REGOLE LOGICHE:
1. DATA AGGIORNAMENTO: Cerca nel testo una data (es. "AGGIORNATI AL 11/03/2026") e restituiscila nel campo "updateDate" in formato YYYY-MM-DD.
2. NOME vs CONFEZIONE: Il nome è il brand commerciale. La confezione descrive il contenitore (astuccio, cartoccio, etc.) e la quantità (20 pezzi, 30 grammi).
3. VALORI CHIMICI: Sono gli ultimi tre numeri della riga. Nicotina è il primo dei tre, Catrame il secondo, Monossido l'ultimo.

FORMATO JSON RICHIESTO:
{ 
  "updateDate": "YYYY-MM-DD", 
  "products": [ 
    { "code": "...", "name": "...", "package": { "type": "...", "quantity": 0, "unit": "..." }, "nicotine": 0.0, "tar": 0.0, "co": 0.0, "category": "Sigarette" } 
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
          Devi estrarre i dati in JSON puro.
          
          REGOLE CONFEZIONE (package):
          - type: ASTUCCIO, CARTOCCIO, BUSTA, SCATOLA, LATTINA, BARATTOLO, GENERIC.
          - unit: PIECES, GRAMS, ML.
          - quantity: numero.`,
      userPrompt: `Analizza questo testo di prodotti RADIATI ADM.

CONFIGURAZIONE:
- CATEGORIA: ${forcedCategory || 'Deduci dal contesto'}
- STATO: Radiato

ESEMPIO DI ESTRAZIONE (FEW-SHOT):
Input: "18/06/2018 2206 500 RED astuccio da 20 pezzi 215,00 4,30"
Output: { "radiationDate": "2018-06-18", "code": "2206", "name": "500 RED", "package": { "type": "ASTUCCIO", "quantity": 20, "unit": "PIECES" }, "pricePerKg": 215.00, "price": 4.30, "status": "Radiato" }

REGOLE LOGICHE:
1. DATA RADIAZIONE: Ogni riga inizia con una data (DD/MM/YYYY). Convertila in YYYY-MM-DD.
2. PREZZI: Identifica il prezzo unitario della confezione (solitamente l'ultimo numero) e il prezzo al kg (il numero decimale che lo precede). Converti le virgole in punti.
3. NOME: Ferma il nome quando inizia la descrizione della confezione (astuccio, scatola, busta, cartoccio, etc.).

FORMATO JSON RICHIESTO:
{ 
  "updateDate": "YYYY-MM-DD", 
  "products": [ 
    { "code": "...", "name": "...", "package": { "type": "...", "quantity": 0, "unit": "..." }, "price": 0.0, "pricePerKg": 0.0, "radiationDate": "...", "category": "...", "status": "Radiato" } 
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
          ${categoryInstruction}
          
          REGOLE CONFEZIONE (package):
          - type: ASTUCCIO, CARTOCCIO, BUSTA, SCATOLA, LATTINA, BARATTOLO, GENERIC.
          - unit: PIECES, GRAMS, ML.
          - quantity: numero.`,
    userPrompt: `Analizza questo testo estratto da un listino prezzi ADM.

CONFIGURAZIONE:
- CATEGORIA: ${forcedCategory || 'Deduci dal contesto'}
- STATO: ${forcedStatus || 'Attivo'}

ESEMPIO DI ESTRAZIONE (FEW-SHOT):
Input: "3951 MARLBORO GOLD 100'S astuccio da 20 pezzi 250,00 5,00"
Output: { "code": "3951", "name": "MARLBORO GOLD 100'S", "package": { "type": "ASTUCCIO", "quantity": 20, "unit": "PIECES" }, "price": 5.00, "pricePerKg": 250.00 }

Input: "4057 CHESTERFIELD da 30 grammi 230,00 6,90"
Output: { "code": "4057", "name": "CHESTERFIELD", "package": { "type": "GENERIC", "quantity": 30, "unit": "GRAMS" }, "price": 6.90, "pricePerKg": 230.00 }

REGOLE LOGICHE:
1. PREZZI: Il prezzo a confezione è solitamente l'ultimo numero della riga. Il prezzo al kg è il numero decimale che lo precede.
2. NOME vs CONFEZIONE: Il nome è il brand. La confezione è la descrizione fisica (es. "astuccio da 20 pezzi", "da 30 grammi").
3. DATA AGGIORNAMENTO: Cerca nel testo frasi come "AGGIORNATO AL" o "IN VIGORE DAL" per estrarre la data del listino.

FORMATO JSON RICHIESTO:
{ 
  "updateDate": "YYYY-MM-DD", 
  "products": [ 
    { "code": "...", "name": "...", "package": { "type": "...", "quantity": 0, "unit": "..." }, "price": 0.0, "pricePerKg": 0.0, "category": "...", "status": "..." } 
  ] 
}

Testo da analizzare:
${textData}`
  };
};

