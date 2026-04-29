import React from 'react';

interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string;
  showCloseButton?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  title,
  onClose,
  children,
  footer,
  maxWidth = 'max-w-sm',
  showCloseButton = true,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm"
      />

      {/* Modal Content */}
      <div
        className={`relative bg-white dark:bg-dark-card-bg rounded-xl shadow-2xl w-full ${maxWidth} text-light-text dark:text-dark-text-primary border border-neutral-200 dark:border-dark-border flex flex-col overflow-hidden`}
        style={{ maxHeight: '90dvh' }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="flex justify-between items-center p-4 border-b border-neutral-200 dark:border-dark-border flex-shrink-0">
          <h2 id="modal-title" className="text-xl font-bold">
            {title}
          </h2>
          {showCloseButton && (
            <button onClick={onClose} className="text-neutral-500 hover:text-light-text dark:text-dark-text-secondary dark:hover:text-dark-text-primary text-2xl leading-none" aria-label="Chiudi">
              &times;
            </button>
          )}
        </div>
        
        <div className="p-4 overflow-y-auto">
          {children}
        </div>

        {footer && (
          <div className="px-4 py-3 bg-neutral-50 dark:bg-neutral-900/50 flex justify-end items-center gap-3 border-t border-neutral-200 dark:border-dark-border">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
