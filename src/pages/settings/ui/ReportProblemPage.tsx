import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/app/providers/AuthProvider';
import { db } from '@/shared/api/firebase/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const ReportProblemPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await addDoc(collection(db, 'support_tickets'), {
        userId: user?.uid || 'anonymous',
        userEmail: user?.email || 'anonymous',
        message: message.trim(),
        createdAt: serverTimestamp(),
        status: 'new'
      });
      setIsSuccess(true);
      setMessage('');
    } catch (err) {
      console.error('Error submitting support ticket:', err);
      setError('Si è verificato un errore durante l\'invio. Riprova più tardi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center p-6 text-center space-y-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600"
        >
          <CheckCircle2 className="w-10 h-10" />
        </motion.div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold">Inviato con successo!</h2>
          <p className="text-neutral-500 text-sm">
            Grazie per la tua segnalazione. La prenderemo in carico il prima possibile.
          </p>
        </div>
        <button
          onClick={() => navigate('/settings')}
          className="mt-4 px-8 py-3 bg-neutral-900 dark:bg-white text-white dark:text-black font-bold rounded-xl text-sm transition-transform active:scale-95"
        >
          Torna alle impostazioni
        </button>
      </div>
    );
  }

  return (
    <div className="flex-grow overflow-y-auto bg-white dark:bg-neutral-900/40 min-h-full">
      <div className="p-6 max-w-lg mx-auto space-y-6">
        <div className="space-y-2">
          <p className="text-sm text-neutral-500 leading-relaxed">
            Hai riscontrato un bug, un errore nei prezzi o hai un suggerimento per migliorare T-Facile? Scrivici qui sotto.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Descrivi il problema o il suggerimento..."
              className="w-full h-48 p-4 bg-neutral-50 dark:bg-dark-card-bg border border-neutral-200 dark:border-neutral-800 rounded-2xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-neutral-400"
              disabled={isSubmitting}
              maxLength={2000}
            />
            <div className="absolute bottom-3 right-3 text-[10px] text-neutral-400">
              {message.length}/2000
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 rounded-xl flex items-center gap-2 text-xs text-red-600 dark:text-red-400"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={isSubmitting || !message.trim()}
            className="w-full flex items-center justify-center gap-2 py-4 bg-neutral-900 dark:bg-white text-white dark:text-black font-bold rounded-2xl text-sm transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Invio in corso...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Invia segnalazione
              </>
            )}
          </button>
        </form>

        <div className="pt-4 flex items-center gap-2 text-[10px] text-neutral-400 dark:text-neutral-600">
          <CheckCircle2 className="w-3 h-3" />
          <span>La tua segnalazione aiuterà a migliorare l'app per tutti i tabaccai.</span>
        </div>
      </div>
    </div>
  );
};

export default ReportProblemPage;
