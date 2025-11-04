import React, { useState, useEffect, useCallback } from 'react';

interface PopupModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl?: string;
  title: string;
  content: string;
  linkUrl?: string;
  autoCloseDelay?: number; // in seconds, 0 for no auto-close
}

const PopupModal: React.FC<PopupModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  title,
  content,
  linkUrl,
  autoCloseDelay = 0,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setProgress(100);
      
      if (autoCloseDelay > 0) {
        const totalDuration = autoCloseDelay * 1000;
        const interval = setInterval(() => {
          if (!isHovered) {
            setProgress((prev) => {
              if (prev <= 0) {
                clearInterval(interval);
                setIsVisible(false);
                setTimeout(onClose, 300);
                return 0;
              }
              return prev - (100 / (totalDuration / 50));
            });
          }
        }, 50);

        const timer = setTimeout(() => {
          if (!isHovered) {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }
        }, totalDuration);

        return () => {
          clearInterval(interval);
          clearTimeout(timer);
        };
      }
    } else {
      setIsVisible(false);
    }
  }, [isOpen, autoCloseDelay, isHovered, onClose]);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  }, [onClose]);

  const handleButtonClick = useCallback(() => {
    if (linkUrl) {
      window.location.href = linkUrl;
    }
    handleClose();
  }, [linkUrl, handleClose]);

  if (!isOpen && !isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[10000] flex items-center justify-center p-4 transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      aria-modal="true"
      role="dialog"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
      ></div>

      {/* Modal Content */}
      <div
        className={`relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-3xl border border-gray-700/50
          w-full max-w-lg transform transition-all duration-500 ease-out
          ${isVisible ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}
          ${isHovered ? 'scale-[1.02] shadow-4xl' : ''}
        `}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-white bg-gray-700/50 hover:bg-red-600 rounded-full p-2 transition-all duration-200 z-10"
          aria-label="Cerrar promoción"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {imageUrl && (
          <div className="relative h-48 overflow-hidden rounded-t-2xl">
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/70 to-transparent"></div>
          </div>
        )}

        <div className="p-6 text-center">
          <h3 className="text-3xl font-bold text-red-500 mb-3">{title}</h3>
          <p className="text-gray-300 text-lg mb-6">{content}</p>

          {linkUrl && (
            <button
              onClick={handleButtonClick}
              className="inline-block bg-red-600 text-white font-semibold py-3 px-8 rounded-full shadow-lg hover:bg-red-700 transition-all duration-200 transform hover:scale-105 active:scale-95"
            >
              Ver Oferta
            </button>
          )}

          {/* Progress bar for auto-close */}
          {autoCloseDelay > 0 && (
            <div className="mt-4 h-1 bg-black/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-500 transition-all duration-50 ease-linear rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PopupModal;
