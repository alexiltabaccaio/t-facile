import { auth } from '@/shared/api/firebase/firebase';

export interface Listino {
  url: string;
  title: string;
  date: string;
  category: string;
  status: string;
  type: string;
  selected?: boolean;
}

export async function fetchListini(): Promise<Listino[]> {
  if (!auth.currentUser) throw new Error("Utente non autenticato");
  const token = await auth.currentUser.getIdToken();
  const headers = { 'Authorization': `Bearer ${token}` };

  const res = await fetch('/api/adm/listini', { headers });
  const textResponse = await res.text();
  
  let data;
  try {
    data = JSON.parse(textResponse);
  } catch (parseError) {
    throw new Error(`Errore dal server (${res.status}): ${textResponse}`);
  }
  
  if (!res.ok) {
    throw new Error(data?.error || `Errore server: HTTP ${res.status}`);
  }
  
  if (!data.success) throw new Error(data.error);
  return data.listini.map((l: any) => ({ ...l, selected: true }));
}

export async function downloadListinoAsFile(listino: Listino, signal?: AbortSignal): Promise<File> {
  if (!auth.currentUser) throw new Error("Utente non autenticato");
  const token = await auth.currentUser.getIdToken();
  const headers = { 'Authorization': `Bearer ${token}` };

  const dlRes = await fetch(`/api/adm/download?url=${encodeURIComponent(listino.url)}`, { headers, signal });
  
  const dlText = await dlRes.text();
  let dlData;
  try {
    dlData = JSON.parse(dlText);
  } catch (parseError) {
    throw new Error(`Errore dal server durante il download (${dlRes.status}): ${dlText}`);
  }

  if (!dlRes.ok) {
     throw new Error(dlData?.error || `Errore server: HTTP ${dlRes.status}`);
  }
  
  if (!dlData.success) {
    throw new Error(dlData.error || "Download fallito");
  }
  
  const base64Pdf = dlData.base64;
  const byteCharacters = atob(base64Pdf);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], {type: 'application/pdf'});
  
  let prefix = 'att';
  if (listino.status === 'Radiato') prefix = 'rad';
  if (listino.status === 'Emissione') prefix = 'emi';
  
  return new File([blob], `${prefix}_${listino.category.toLowerCase()}_${listino.date.replace(/\//g, '.')}.pdf`, { type: 'application/pdf' });
}
