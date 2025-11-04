import React, { useEffect, useState } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

const ToastComponent: React.FC<ToastProps> = ({ toast, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    // Animación de entrada
    const showTimer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(showTimer);
  }, []);

  useEffect(() => {
    const duration = toast.duration || 5000;
    
    // Barra de progreso
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          clearInterval(progressInterval);
          return 0;
        }
        // Decrementar progreso basado en el tiempo restante
        const decrement = 100 / (duration / 50); // Actualizar cada 50ms
        return Math.max(0, prev - decrement);
      });
    }, 50);

    // Auto-remover después de la duración
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onRemove(toast.id), 300); // Esperar a que termine la animación
    }, duration);

    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
    };
  }, [toast, onRemove]);

  const getIcon = () => {
    const iconClass = "w-6 h-6";
    switch (toast.type) {
      case 'success':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'error':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'warning':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case 'info':
      default:
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const getStyles = () => {
    switch (toast.type) {
      case 'success':
        return {
          bg: 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/90 dark:to-emerald-900/90',
          text: 'text-green-800 dark:text-green-100',
          border: 'border-l-4 border-green-500 dark:border-green-400',
          iconBg: 'bg-green-100 dark:bg-green-800',
          iconColor: 'text-green-600 dark:text-green-300',
          progress: 'bg-green-500 dark:bg-green-400'
        };
      case 'error':
        return {
          bg: 'bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/90 dark:to-rose-900/90',
          text: 'text-red-800 dark:text-red-100',
          border: 'border-l-4 border-red-500 dark:border-red-400',
          iconBg: 'bg-red-100 dark:bg-red-800',
          iconColor: 'text-red-600 dark:text-red-300',
          progress: 'bg-red-500 dark:bg-red-400'
        };
      case 'warning':
        return {
          bg: 'bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/90 dark:to-amber-900/90',
          text: 'text-yellow-800 dark:text-yellow-100',
          border: 'border-l-4 border-yellow-500 dark:border-yellow-400',
          iconBg: 'bg-yellow-100 dark:bg-yellow-800',
          iconColor: 'text-yellow-600 dark:text-yellow-300',
          progress: 'bg-yellow-500 dark:bg-yellow-400'
        };
      case 'info':
      default:
        return {
          bg: 'bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/90 dark:to-cyan-900/90',
          text: 'text-blue-800 dark:text-blue-100',
          border: 'border-l-4 border-blue-500 dark:border-blue-400',
          iconBg: 'bg-blue-100 dark:bg-blue-800',
          iconColor: 'text-blue-600 dark:text-blue-300',
          progress: 'bg-blue-500 dark:bg-blue-400'
        };
    }
  };

  const styles = getStyles();

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onRemove(toast.id), 300);
  };

  return (
    <div
      className={`
        ${styles.bg}
        ${styles.border}
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        p-4 rounded-xl shadow-2xl mb-3
        flex items-start gap-4
        min-w-[320px] max-w-md
        backdrop-blur-md
        transition-all duration-300 ease-out
        hover:shadow-3xl hover:scale-[1.02]
        transform-gpu
      `}
      role="alert"
    >
      {/* Icono con animación */}
      <div className="flex-shrink-0">
        <div className={`${styles.iconBg} p-2 rounded-full ${styles.iconColor} animate-pulse-once`}>
          {getIcon()}
        </div>
      </div>
      
      {/* Contenido */}
      <div className="flex-1 min-w-0">
        <p className={`${styles.text} text-sm font-medium leading-relaxed break-words`}>
          {toast.message}
        </p>
        
        {/* Barra de progreso */}
        <div className="mt-3 h-1 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
          <div
            className={`h-full ${styles.progress} transition-all duration-50 ease-linear rounded-full`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      
      {/* Botón cerrar */}
      <button
        onClick={handleClose}
        className={`flex-shrink-0 ${styles.text} opacity-60 hover:opacity-100 transition-all p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 active:scale-90`}
        aria-label="Cerrar notificación"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

export default ToastComponent;

