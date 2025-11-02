import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 z-[9999] flex items-center justify-center">
      <div className="flex flex-col items-center text-white">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-600"></div>
        <p className="mt-4 text-xl font-semibold">Cargando datos...</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;