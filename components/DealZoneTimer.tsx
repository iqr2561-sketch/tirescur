import React, { useState, useEffect } from 'react';
import { DealZoneConfig } from '../types';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface DealZoneTimerProps {
  config: DealZoneConfig;
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

const DealZoneTimer: React.FC<DealZoneTimerProps> = ({ config }) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft(config.targetDate));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(config.targetDate));
    }, 1000);

    return () => clearInterval(timer);
  }, [config.targetDate]);

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

  return (
    <div className="bg-gray-800 text-white py-12">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-2">¡Atención! Zona de Ofertas</h2>
        <p className="text-lg mb-6">¡Date prisa! Descuentos {config.discountText}</p>
        <div className="flex justify-center mb-8">
          {timerComponents.length ? timerComponents : <span className="text-xl">¡Oferta Terminada!</span>}
        </div>
        <button className="bg-red-600 text-white font-semibold py-3 px-8 rounded-full hover:bg-red-700 transition-colors">
          {config.buttonText}
        </button>
      </div>
    </div>
  );
};

export default DealZoneTimer;