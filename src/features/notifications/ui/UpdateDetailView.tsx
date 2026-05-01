import React from 'react';
import { UpdateRecord } from '@/entities/notification';
import { PlusCircle, AlertTriangle, MinusCircle, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface UpdateDetailViewProps {
  update: UpdateRecord;
}

const UpdateDetailView: React.FC<UpdateDetailViewProps> = ({ update }) => {
    const { t } = useTranslation();
    
    return (
        <div className="p-4 w-full">
            <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm">
                <h2 className="text-xl font-bold text-light-text dark:text-dark-text-primary text-center mb-1 leading-tight">{update.title}</h2>
                <p className="text-xs text-neutral-500 dark:text-dark-text-secondary text-center mb-6 italic">
                    {update.date === "Non disponibile" || update.date.includes('non rilevata') 
                      ? t('notifications.noDateDetected') 
                      : t('notifications.dated', { date: update.date })}
                </p>
                
                {update.stats && (
                    <div className="grid grid-cols-3 gap-2 mb-8">
                        <div className="bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30 p-2 rounded-lg flex flex-col items-center justify-center">
                            <span className="text-sm font-bold text-green-700 dark:text-green-400">{update.stats.new}</span>
                            <span className="text-[9px] uppercase font-bold text-green-600/60">{t('notifications.stats.new')}</span>
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 p-2 rounded-lg flex flex-col items-center justify-center">
                            <span className="text-sm font-bold text-blue-700 dark:text-blue-400">{update.stats.price}</span>
                            <span className="text-[9px] uppercase font-bold text-blue-600/60">{t('notifications.stats.prices')}</span>
                        </div>
                        <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 p-2 rounded-lg flex flex-col items-center justify-center">
                            <span className="text-sm font-bold text-red-700 dark:text-red-400">{update.stats.status}</span>
                            <span className="text-[9px] uppercase font-bold text-red-600/60">{t('notifications.stats.retired')}</span>
                        </div>
                    </div>
                )}

                <div className="space-y-3 mt-4">
                    <h3 className="text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-widest px-1">{t('notifications.modDetails')}</h3>
                    {update.variations && update.variations.length > 0 ? (
                        <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-lg border border-neutral-200 dark:border-neutral-800 p-2 space-y-1">
                            {update.variations.map((v: string, i: number) => {
                                const isNew = v.startsWith('NUOVO:');
                                const isStatus = v.includes('Stato');
                                
                                return (
                                    <div key={i} className="flex items-start gap-2 p-2 rounded hover:bg-white dark:hover:bg-neutral-800 transition-colors border-b border-neutral-100 dark:border-neutral-700/50 last:border-0">
                                        <div className="mt-0.5 shrink-0">
                                            {isNew ? (
                                                <PlusCircle className="w-3 h-3 text-green-500" />
                                            ) : isStatus ? (
                                                <MinusCircle className="w-3 h-3 text-red-500" />
                                            ) : (
                                                <AlertTriangle className="w-3 h-3 text-blue-500" />
                                            )}
                                        </div>
                                        <div className="flex flex-col gap-0.5 overflow-hidden">
                                            {v.includes(':') ? (() => {
                                                const [name, rest] = v.split(/:(.+)/);
                                                return (
                                                    <>
                                                        <span className="text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-tight truncate">
                                                            {name.trim()}
                                                        </span>
                                                        <span className={`text-xs font-semibold leading-tight ${isNew ? 'text-green-700 dark:text-green-400' : isStatus ? 'text-red-700 dark:text-red-400' : 'text-neutral-800 dark:text-neutral-200'}`}>
                                                            {rest.includes('→') ? (
                                                                <span className="flex items-center gap-1.5 flex-wrap">
                                                                    {rest.split('→').map((part, index) => (
                                                                        <React.Fragment key={index}>
                                                                            {index > 0 && <span className="text-[10px] text-neutral-400 opacity-50">→</span>}
                                                                            <span className={index === 0 ? 'opacity-60 font-normal line-through decoration-1' : 'text-blue-600 dark:text-blue-400 font-bold'}>
                                                                                {part.trim()}
                                                                            </span>
                                                                        </React.Fragment>
                                                                    ))}
                                                                </span>
                                                            ) : (
                                                                rest.trim()
                                                            )}
                                                        </span>
                                                    </>
                                                );
                                            })() : (
                                                <span className={`text-xs font-medium leading-relaxed ${isNew ? 'text-green-800 dark:text-green-300' : isStatus ? 'text-red-800 dark:text-red-300' : 'text-neutral-700 dark:text-neutral-300'}`}>
                                                    {v}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="p-4 text-center rounded-lg border border-dashed border-neutral-300 dark:border-neutral-700">
                           <Info className="w-5 h-5 text-neutral-400 mx-auto mb-2" />
                           <p className="text-xs text-neutral-500 dark:text-neutral-400">{t('notifications.noDetails')}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UpdateDetailView;
