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
      systemPrompt: `Sei un esperto estrattore dati per listini EMISSIONI ADM.
          Estrai i prodotti in JSON. Per ogni prodotto cerca code, name, packageInfo, tar, nicotine, co.
          Usa la categoria "Sigarette" come default.
          ${categoryInstruction}
          REGOLE MANDATORIE SUI NUMERI:
          - Assicurati che tar, nicotine e co siano restituiti come NUMERI NEL JSON (es. 0.30, 3.00, non stringhe).
          - Usa SOLO il punto (.) come separatore decimale.
          - Converti eventuali virgole (,) in punti (.).
          - Se un valore è minore di 1, scrivi 0.X (es. 0.50).
          - NON USARE MAI la notazione scientifica (es. no 1e-10).
          - Arrotonda a massimo 2 decimali.`,
      userPrompt: `Analizza questo testo estratto da un listino EMISSIONI SIGARETTE ADM.
            
CONFIGURAZIONE FORZATA:
- CATEGORIA: Sigarette
- TIPO: DATI EMISSIONI (Nicotina, Catrame, Monossido)

STRUTTURA TABELLA (ORDINE COLONNE):
1. Codice (ADM)
2. Sigarette (Nome Prodotto)
3. Conf.ne (Informazione Confezione, es: astuccio da 20 pezzi)
4. Nicotina (mg)
5. Catrame (mg)
6. Monossido di Carbonio (mg)

DATI AGGIUNTIVI:
- updateDate: Cerca nel testo diciture come "AGGIORNATI AL [DATA]" o "PUBBLICATI IL [DATA]". Estrai la data in formato YYYY-MM-DD. Se non la trovi, non includere il campo o lascialo vuoto.

REGOLE DI ESTRAZIONE:
1. Ignora la riga di intestazione: "Codice Sigarette Conf.ne Nicotina Catrame Monossido..."
2. Ignora il titolo: "LIVELLI DI EMISSIONE DELLE SIGARETTE AGGIORNATI AL..."
3. Ogni riga valida inizia con un CODICE numerico.
4. ESTRAZIONE VALORI:
   - packageInfo: Prendi esattamente la scritta dopo il nome (es: "astuccio da 20 pezzi").
   - nicotine: È il primo dei tre valori numerici finali (es: 0.30).
   - tar: È il secondo dei tre valori numerici finali (es: 3.00).
   - co: È l'ultimo valore numerico della riga (es: 4.00).
5. FORMATO JSON RICHIESTO: { "updateDate": "YYYY-MM-DD", "products": [ { "code": "...", "name": "...", "packageInfo": "...", "nicotine": 0.0, "tar": 0.0, "co": 0.0, "category": "Sigarette" }, ... ] }

Testo da analizzare:
${textData}`
    };
  }

  if (type === 'Radiato') {
    return {
      systemPrompt: `Sei un estrattore dati specializzato in listini ADM. 
Estrai i prodotti RADIATI in formato JSON puro.
${categoryInstruction}
Devi separare in modo estremamente accurato il 'name' dalla 'packageInfo'. La confezione solitamente inizia con "astuccio", "cartoccio", "scatola", "da", "grammi", "pezzi".
Devi estrarre sistematicamente 'radiationDate', 'pricePerKg' e 'price'. I prezzi devono essere numeri (es 4.30).`,
      userPrompt: `Analizza questo testo estratto da un listino ADM di prodotti RADIATI.

CONFIGURAZIONE FORZATA (PRIORITÀ MASSIMA):
- CATEGORIA DA USARE: ${forcedCategory || 'Deduci dal testo'}
- STATO DA USARE: Radiato

STRUTTURA TIPICA DELLA RIGA DEI RADIATI:
L'ordine delle informazioni in una riga è tipicamente:
[Data] [Codice] [Nome Prodotto] [Confezione] [Prezzo al kg] [Prezzo a confezione]
Esempio: "18/06/2018 2206 500 RED astuccio da 20 pezzi 215,00 4,30"

DATI AGGIUNTIVI:
- updateDate: Cerca nel testo diciture come "ELENCO DEI TABACCHI RADIATI AGGIORNATO AL [DATA]". Estrai la data in formato YYYY-MM-DD.

REGOLE DI ESTRAZIONE:
1. Ogni riga rappresenta un prodotto radiato.
2. radiationDate: La data trovata all'inizio della riga (nel formato DD/MM/YYYY, se possibile converti in YYYY-MM-DD o mantieni l'originale).
3. code: Il numero intero identificativo (es. 2206) subito dopo la data.
4. name: Il nome commerciale. IMPORTANTISSIMO: Ferma il nome PRIMA delle parole che descrivono il contenitore (come "astuccio", "cartoccio", "metallo", "busta", "da", "pezzi", "grammi"). Nell'esempio, il nome è solo "500 RED". Nessuna informazione sulla confezione deve finire qui.
5. packageInfo: Estrai la dicitura dell'imballaggio (es. "astuccio da 20 pezzi", "da 30 grammi").
6. pricePerKg: Il penultimo numero della riga (es. 215.00). Inserisci sempre il punto per i decimali.
7. price: L'ultimo numero della riga, ovvero il prezzo finale della confezione (es. 4.30). Inserisci sempre il punto per i decimali.
8. FORMATO JSON RICHIESTO: { "updateDate": "YYYY-MM-DD", "products": [ { "code": "...", "name": "...", "packageInfo": "...", "price": 0.0, "pricePerKg": 0.0, "radiationDate": "...", "category": "...", "status": "Radiato" }, ... ] }

Testo da analizzare:
${textData}`
    };
  }

  // DEFAULT / ATTIVO
  return {
    systemPrompt: `Sei un estrattore dati specializzato in listini ADM. 
Usa i metadati forniti (Categoria e Stato) come verita' assoluta. 
Estrai i prodotti in formato JSON puro. Il risultato deve essere un OGGETTO JSON con una chiave "products" che contiene un array di oggetti prodotto.

${categoryInstruction}

Assicurati di estrarre correttamente il 'packageInfo' (es. "da 20 pezzi", "da 30 grammi", "da 70 grammi"). 
I prezzi devono essere numeri (es. 5.50). Estrai pricePerKg se riconosciuto.
Se lo stato e' 'Radiato', popola radiationDate se trovi una data nella riga.`,
    userPrompt: `Analizza questo testo estratto da un listino ADM (Tabacchi). 

CONFIGURAZIONE FORZATA (PRIORITÀ MASSIMA):
- CATEGORIA DA USARE: ${forcedCategory || 'Deduci dal testo'}
- STATO DA USARE: ${forcedStatus || 'Deduci dal testo'}

REGOLE DI ESTRAZIONE:
1. Ogni riga rappresenta un prodotto.
2. CODICE: Il primo numero isolato della riga (Codice ADM).
3. NOME: Il testo descrittivo del prodotto (es. MARLBORO GOLD, HEETS AMBER SELECTION).
4. CONFEZIONE (packageInfo): Identifica la tipologia di confezionamento e il peso/quantità. Cerca diciture come "da 20 pezzi", "da 30 grammi", "da 70 grammi" o simili. Si trova solitamente tra il NOME e il PREZZO.
5. PREZZO: L'ultimo numero decimale della riga (Prezzo unitario confezione). ESTRAI ANCHE IL PREZZO AL KG (pricePerKg) se presente prima del prezzo a confezione (es. 225,00 in una riga che finisce with 225,00 4,50).
6. updateDate: Cerca nel testo diciture come "LISTINO AGGIORNATO AL [DATA]". Estrai la data in formato YYYY-MM-DD.
7. FORMATO JSON RICHIESTO: { "updateDate": "YYYY-MM-DD", "products": [ { "code": "...", "name": "...", "packageInfo": "...", "price": 0.0, "pricePerKg": 0.0, "category": "...", "status": "..." }, ... ] }

Testo da analizzare:
${textData}`
  };
};
