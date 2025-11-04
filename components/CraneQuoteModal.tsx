import React, { useState, useEffect, useMemo } from 'react';
import Modal from './Modal';
import { CraneQuoteConfig, VehicleType, AdditionalOption } from '../types';

interface CraneQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: CraneQuoteConfig | null;
  whatsappNumber?: string;
}

const CraneQuoteModal: React.FC<CraneQuoteModalProps> = ({
  isOpen,
  onClose,
  config,
  whatsappNumber,
}) => {
  const [selectedVehicleType, setSelectedVehicleType] = useState<string>('');
  const [kilometers, setKilometers] = useState<number>(0);
  const [passengers, setPassengers] = useState<number>(0);
  const [trailers, setTrailers] = useState<number>(0);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setSelectedVehicleType('');
      setKilometers(0);
      setPassengers(0);
      setTrailers(0);
      setSelectedOptions([]);
    }
  }, [isOpen]);

  // Calculate total price
  const totalPrice = useMemo(() => {
    if (!config) return 0;

    let total = 0;

    // Base price from vehicle type
    const vehicleType = config.vehicleTypes.find((vt: VehicleType) => vt.id === selectedVehicleType);
    if (vehicleType) {
      total += vehicleType.basePrice;
    }

    // Price per kilometer
    total += config.pricePerKilometer * kilometers;

    // Price per passenger
    total += config.pricePerPassenger * passengers;

    // Price per trailer
    total += config.pricePerTrailer * trailers;

    // Additional options
    selectedOptions.forEach((optionId) => {
      const option = config.additionalOptions.find((opt: AdditionalOption) => opt.id === optionId);
      if (option) {
        total += option.price;
      }
    });

    return total;
  }, [config, selectedVehicleType, kilometers, passengers, trailers, selectedOptions]);

  const handleOptionToggle = (optionId: string) => {
    setSelectedOptions((prev) =>
      prev.includes(optionId)
        ? prev.filter((id) => id !== optionId)
        : [...prev, optionId]
    );
  };

  const handleRequestQuote = () => {
    if (!config || !selectedVehicleType) return;

    const vehicleType = config.vehicleTypes.find((vt: VehicleType) => vt.id === selectedVehicleType);
    const vehicleName = vehicleType?.name || '';

    const message = `🚛 *Cotización de Grúa*\n\n` +
      `📦 *Tipo de Vehículo:* ${vehicleName}\n` +
      `📍 *Kilómetros:* ${kilometers} km\n` +
      `👥 *Pasajeros:* ${passengers}\n` +
      `🚚 *Trailers:* ${trailers}\n` +
      (selectedOptions.length > 0 ? `\n*Opciones Adicionales:*\n${selectedOptions.map(optId => {
        const opt = config.additionalOptions.find((o: AdditionalOption) => o.id === optId);
        return opt ? `• ${opt.name}` : '';
      }).filter(Boolean).join('\n')}\n` : '') +
      `\n💰 *Precio Total:* $${totalPrice.toLocaleString('es-AR')}\n\n` +
      `¿Desea confirmar esta cotización?`;

    const phoneNumber = whatsappNumber || config.whatsappNumber || '+5492245506078';
    const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, '_blank');
    onClose();
  };

  if (!config) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Cotización de Grúa">
      <div className="space-y-6">
        {/* Tipo de Vehículo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            Tipo de Vehículo <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedVehicleType}
            onChange={(e) => setSelectedVehicleType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            required
          >
            <option value="">Seleccione un tipo de vehículo</option>
            {config.vehicleTypes.map((vehicle: VehicleType) => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.name} - ${vehicle.basePrice.toLocaleString('es-AR')}
              </option>
            ))}
          </select>
        </div>

        {/* Kilómetros */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            Kilómetros
          </label>
          <input
            type="number"
            min="0"
            value={kilometers}
            onChange={(e) => setKilometers(parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        {/* Pasajeros */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            Pasajeros
          </label>
          <input
            type="number"
            min="0"
            value={passengers}
            onChange={(e) => setPassengers(parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        {/* Trailers */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            Trailers
          </label>
          <input
            type="number"
            min="0"
            value={trailers}
            onChange={(e) => setTrailers(parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        {/* Opciones Adicionales */}
        {config.additionalOptions.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Opciones Adicionales
            </label>
            <div className="space-y-2">
              {config.additionalOptions.map((option: AdditionalOption) => (
                <label
                  key={option.id}
                  className="flex items-center space-x-2 cursor-pointer p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <input
                    type="checkbox"
                    checked={selectedOptions.includes(option.id || '')}
                    onChange={() => handleOptionToggle(option.id || '')}
                    className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-200">
                    {option.name} - ${option.price.toLocaleString('es-AR')}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Precio Total */}
        <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              Precio Total:
            </span>
            <span className="text-2xl font-bold text-red-600">
              ${totalPrice.toLocaleString('es-AR')}
            </span>
          </div>
        </div>

        {/* Botones */}
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cerrar
          </button>
          <button
            onClick={handleRequestQuote}
            disabled={!selectedVehicleType}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            <span>Solicitar Cotización</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default CraneQuoteModal;

