import React, { useState, useEffect } from 'react';

export interface Popup {
  id: string;
  title: string;
  message?: string;
  image_url?: string;
  button_text?: string;
  button_link?: string;
  auto_close_seconds?: number;
  show_once_per_session?: boolean;
}

interface PopupModalProps {
  popup: Popup;
  onClose: () => void;
}

const PopupModal: React.FC<PopupModalProps> = ({ popup, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    // Animación de entrada
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Auto-cierre si está configurado
    if (popup.auto_close_seconds && popup.auto_close_seconds > 0) {
      const totalDuration = popup.auto_close_seconds * 1000;
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev <= 0) {
            clearInterval(interval);
            handleClose();
            return 0;
          }
          return prev - (100 / (totalDuration / 50));
        });
      }, 50);

      const timer = setTimeout(() => {
        handleClose();
      }, totalDuration);

      return () => {
        clearInterval(interval);
        clearTimeout(timer);
      };
    }
  }, [popup.auto_close_seconds]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleButtonClick = () => {
    if (popup.button_link) {
      window.location.href = popup.button_link;
    }
    handleClose();
  };

  if (!isVisible && isClosing) return null;

  return (
    <div
      className={`fixed inset-0 z-[10000] flex items-center justify-center p-4 transition-all duration-300 ${
        isVisible && !isClosing ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleClose}
    >
      {/* Backdrop con blur */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>

      {/* Modal */}
      <div
        className={`relative z-10 w-full max-w-2xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-2xl transform transition-all duration-300 ${
          isVisible && !isClosing ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botón cerrar */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-all duration-200 hover:scale-110 active:scale-95 shadow-lg"
          aria-label="Cerrar popup"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Imagen si existe */}
        {popup.image_url && (
          <div className="relative w-full h-64 overflow-hidden rounded-t-2xl">
            <img
              src={popup.image_url}
              alt={popup.title}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            />
            {/* Overlay sutil */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          </div>
        )}

        {/* Contenido */}
        <div className="p-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 pr-8">
            {popup.title}
          </h2>

          {popup.message && (
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
              {popup.message}
            </p>
          )}

          {/* Botón de acción */}
          {popup.button_text && (
            <button
              onClick={handleButtonClick}
              className="w-full bg-gradient-to-r from-red-600 to-red-500 text-white font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl hover:from-red-500 hover:to-red-600 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {popup.button_text}
            </button>
          )}

          {/* Barra de progreso si tiene auto-cierre */}
          {popup.auto_close_seconds && popup.auto_close_seconds > 0 && (
            <div className="mt-6 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-600 to-red-500 transition-all duration-50 ease-linear rounded-full"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PopupModal;

