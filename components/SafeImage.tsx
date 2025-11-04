import React, { useMemo, useState } from 'react';

interface SafeImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  fallbackText?: string;
  fallbackIcon?: React.ReactNode;
}

const sanitizeClassName = (className?: string) => {
  if (!className) return '';
  // Elimina clases específicas de imágenes que no aplican a contenedores
  return className
    .split(' ')
    .filter((cls) => cls && !/^object-/.test(cls))
    .join(' ');
};

const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt,
  className,
  fallbackText = 'Sin imagen',
  fallbackIcon,
}) => {
  const [hasError, setHasError] = useState(false);

  const sanitizedClassName = useMemo(() => sanitizeClassName(className), [className]);

  if (!src || hasError) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-200 text-gray-500 text-xs font-semibold uppercase tracking-wide ${sanitizedClassName}`.trim()}
      >
        {fallbackIcon ?? fallbackText}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setHasError(true)}
    />
  );
};

export default SafeImage;


