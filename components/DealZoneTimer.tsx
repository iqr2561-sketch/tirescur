import React, { useState, useEffect } from 'react';
import { DealZoneConfig, Product } from '../types';
import ProductCard from './ProductCard';
import { Link } from 'react-router-dom';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface DealZoneTimerProps {
  config: DealZoneConfig;
  products?: Product[];
  onOpenProductSelectionModal?: (product: Product) => void;
}

const calculateTimeLeft = (targetDateString: string): TimeLeft => {
  const targetDate = new Date(targetDateString);
  const now = new Date();
  const difference = targetDate.getTime() - now.getTime();

  let timeLeft: TimeLeft = {
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  };

  if (difference > 0) {
    timeLeft = {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  }
  return timeLeft;
};

const DealZoneTimer: React.FC<DealZoneTimerProps> = ({ config, products = [], onOpenProductSelectionModal }) => {
  const hasTargetDate = Boolean(config.targetDate && config.targetDate.trim());
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(hasTargetDate ? calculateTimeLeft(config.targetDate) : { days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (!hasTargetDate) {
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(config.targetDate));
    }, 1000);

    return () => clearInterval(timer);
  }, [config.targetDate, hasTargetDate]);

  // Filter products on sale - Validar que products sea un array
  const safeProducts = products || [];
  const productsOnSale = safeProducts.filter(p => p.isOnSale).slice(0, 5);

  const timerComponents: React.ReactElement[] = [];

  Object.keys(timeLeft).forEach((interval) => {
    if (interval === 'days' || interval === 'hours' || interval === 'minutes' || interval === 'seconds') {
      const value = timeLeft[interval as keyof TimeLeft];
      timerComponents.push(
        <div key={interval} className="flex flex-col items-center bg-yellow-400 text-gray-900 rounded-lg p-3 mx-1">
          <span className="text-3xl font-bold leading-none">{value < 10 ? `0${value}` : value}</span>
          {/* Traducir la abreviatura del intervalo de tiempo */}
          <span className="text-xs uppercase">
            {interval === 'days' ? 'días' : interval === 'hours' ? 'hrs' : interval === 'minutes' ? 'min' : 'seg'}
          </span>
        </div>
      );
    }
  });

  const backgroundStyle: React.CSSProperties = config.backgroundImage
    ? {
        backgroundImage: `url(${config.backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }
    : {
        backgroundColor: config.backgroundColor || '#1f2937',
      };

  return (
    <div className="text-white py-12 relative" style={backgroundStyle}>
      {config.backgroundImage && (
        <div className="absolute inset-0 bg-black/50"></div>
      )}
      <div className="container mx-auto px-4 text-center relative z-10">
        <h2 className="text-3xl font-bold mb-2">{config.discountText?.trim() ? '¡Atención! Zona de Ofertas' : 'Configura tus promociones'}</h2>
        <p className="text-lg mb-6">
          {config.discountText?.trim()
            ? `¡Date prisa! Descuentos ${config.discountText}`
            : 'Actualmente no hay promociones activas. Ajusta la información desde el panel de administración.'}
        </p>
        {hasTargetDate && (
          <div className="flex justify-center mb-8">
            {timerComponents.length ? timerComponents : <span className="text-xl">¡Oferta Terminada!</span>}
          </div>
        )}
        <Link 
          to="/shop?offer=true"
          className="inline-block bg-red-600 text-white font-semibold py-3 px-8 rounded-full hover:bg-red-700 transition-colors mb-8"
        >
          {config.buttonText?.trim() || 'Ver productos'}
        </Link>
        
        {/* Products on Sale */}
        {productsOnSale.length > 0 && (
          <div className="mt-12">
            <h3 className="text-2xl font-bold mb-6">Productos en Oferta</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              {productsOnSale.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  allProducts={products}
                  onOpenProductSelectionModal={onOpenProductSelectionModal || (() => {})}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DealZoneTimer;