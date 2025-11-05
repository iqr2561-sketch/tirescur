import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 animate-fade-in">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="rounded-2xl shadow-2xl w-full sm:w-11/12 md:max-w-lg lg:max-w-2xl relative z-50 max-h-[95vh] overflow-y-auto
                  bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 transform transition-all duration-300 scale-100">
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-4 sm:px-6 py-4 rounded-t-2xl sticky top-0 z-10">
          <div className="flex justify-between items-center">
            <h2 className="text-xl sm:text-2xl font-bold">{title}</h2>
            <button 
              onClick={onClose} 
              className="text-white hover:text-red-200 hover:bg-white/10 p-2 rounded-lg transition-all duration-200 active:scale-90" 
              aria-label="Cerrar modal"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>
        <div className="p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;