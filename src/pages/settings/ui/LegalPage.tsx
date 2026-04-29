import React from 'react';
import { Scale, Cookie, UserCheck, ShieldCheck } from 'lucide-react';

const LegalPage: React.FC = () => {
  return (
    <div className="flex-grow overflow-y-auto bg-white dark:bg-neutral-900/40 min-h-full">
      <div className="p-4 max-w-lg mx-auto space-y-6 pb-20">
        <section className="bg-neutral-50 dark:bg-dark-card-bg border border-neutral-100 dark:border-neutral-800 rounded-2xl p-6 space-y-3">
          <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400">
            <Scale className="w-6 h-6" />
            <h2 className="font-bold uppercase tracking-widest text-xs">Note Legali</h2>
          </div>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed italic">
            T-Facile è uno strumento indipendente di supporto alla vendita. I dati riportati (nomi, prezzi, pesi) sono di dominio pubblico, estratti dai listini ufficiali pubblicati dall'Agenzia delle Dogane e dei Monopoli (ADM). 
          </p>
          <div className="pt-2 text-[10px] text-neutral-400 dark:text-neutral-600 flex items-center gap-2">
            <ShieldCheck className="w-3 h-3" />
            <span>Ultima verifica dati: 22 Aprile 2026</span>
          </div>
        </section>

        <section className="bg-white dark:bg-dark-card-bg border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 space-y-3 shadow-sm">
          <div className="flex items-center gap-3 text-green-600 dark:text-green-400">
            <UserCheck className="w-6 h-6" />
            <h2 className="font-bold uppercase tracking-widest text-xs">Trattamento Dati (GDPR)</h2>
          </div>
          <div className="space-y-4 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
            <p>
              Utilizzando l'accesso con Google, trattiamo il tuo <strong>indirizzo email</strong> e la tua immagine profilo esclusivamente per identificarti e garantirti l'accesso protetto alle funzioni admin dell'app.
            </p>
            <p>
              Questi dati non vengono venduti, ceduti o utilizzati per scopi di marketing o profilazione commerciale.
            </p>
          </div>
        </section>

        <section className="bg-white dark:bg-dark-card-bg border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 space-y-3 shadow-sm">
          <div className="flex items-center gap-3 text-amber-600 dark:text-amber-400">
            <Cookie className="w-6 h-6" />
            <h2 className="font-bold uppercase tracking-widest text-xs">Cache Web & Offline</h2>
          </div>
          <div className="space-y-4 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
            <p>
              L'app utilizza il <strong>Local Storage</strong> del browser per salvare una copia del catalogo prezzi sul tuo dispositivo. 
            </p>
            <p>
              Questo meccanismo tecnico è essenziale per garantirti una velocità di ricerca istantanea e il funzionamento dell'app anche in assenza di connessione internet.
            </p>
            <p className="text-xs border-l-2 border-amber-200 dark:border-amber-900 pl-3 italic">
              Nessun "cookie di profilazione" è utilizzato da questa applicazione.
            </p>
          </div>
        </section>

        <div className="pt-8 text-center">
          <p className="text-[10px] text-neutral-400 dark:text-neutral-600 uppercase tracking-[0.2em]">In vigore dal: 22/04/2026</p>
        </div>
      </div>
    </div>
  );
};

export default LegalPage;
