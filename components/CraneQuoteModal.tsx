import React, { useState, useEffect, useMemo } from 'react';
import Modal from './Modal';
import CustomerInfoModal from './CustomerInfoModal';
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
  const [kilometers, setKilometers] = useState<string>('');
  const [passengers, setPassengers] = useState<string>('');
  const [trailers, setTrailers] = useState<string>('');
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setSelectedVehicleType('');
      setKilometers('');
      setPassengers('');
      setTrailers('');
      setSelectedOptions([]);
      setFocusedField(null);
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
    const kmValue = parseFloat(kilometers) || 0;
    total += config.pricePerKilometer * kmValue;

    // Price per passenger
    const passValue = parseFloat(passengers) || 0;
    total += config.pricePerPassenger * passValue;

    // Price per trailer
    const trailValue = parseFloat(trailers) || 0;
    total += config.pricePerTrailer * trailValue;

    // Additional options
    selectedOptions.forEach((optionId) => {
      const option = config.additionalOptions.find((opt: AdditionalOption) => 
        opt.id === optionId || (opt.id && opt.id.toString() === optionId)
      );
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
    // Abrir modal de datos del cliente primero
    setIsCustomerModalOpen(true);
  };

  const handleCustomerInfoConfirmed = (customerName: string) => {
    if (!config || !selectedVehicleType) return;

    const vehicleType = config.vehicleTypes.find((vt: VehicleType) => vt.id === selectedVehicleType);
    const vehicleName = vehicleType?.name || '';

    const kmValue = parseFloat(kilometers) || 0;
    const passValue = parseFloat(passengers) || 0;
    const trailValue = parseFloat(trailers) || 0;

    const message = `🚛 *Cotización de Grúa*\n\n` +
      `👤 *Cliente:* ${customerName}\n\n` +
      `📦 *Tipo de Vehículo:* ${vehicleName}\n` +
      `📍 *Kilómetros:* ${kmValue} km\n` +
      `👥 *Pasajeros:* ${passValue}\n` +
      `🚚 *Trailers:* ${trailValue}\n` +
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
    setIsCustomerModalOpen(false);
    onClose();
  };

  if (!config) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Cotización de Grúa">
      <div className="space-y-6 py-2">
        {/* Tipo de Vehículo */}
        <div className="relative">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
            Tipo de Vehículo <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <select
              value={selectedVehicleType}
              onChange={(e) => setSelectedVehicleType(e.target.value)}
              className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:text-white transition-all duration-200 appearance-none cursor-pointer hover:border-red-400"
              required
            >
              <option value="">Seleccione un tipo de vehículo</option>
                {config.vehicleTypes.map((vehicle: VehicleType) => (
                  <option key={vehicle.id || `vehicle-${vehicle.name}`} value={vehicle.id || ''}>
                    {vehicle.name} - ${vehicle.basePrice.toLocaleString('es-AR')}
                  </option>
                ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Campos numéricos en grid para móvil */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Kilómetros */}
          <div className="relative">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
              <span className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Kilómetros
              </span>
            </label>
            <input
              type="number"
              min="0"
              step="1"
              value={kilometers}
              onChange={(e) => setKilometers(e.target.value)}
              onFocus={() => setFocusedField('kilometers')}
              onBlur={() => setFocusedField(null)}
              placeholder="0"
              className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:text-white transition-all duration-200 hover:border-red-400 text-center text-lg font-medium"
            />
          </div>

          {/* Pasajeros */}
          <div className="relative">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
              <span className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                Pasajeros
              </span>
            </label>
            <input
              type="number"
              min="0"
              step="1"
              value={passengers}
              onChange={(e) => setPassengers(e.target.value)}
              onFocus={() => setFocusedField('passengers')}
              onBlur={() => setFocusedField(null)}
              placeholder="0"
              className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:text-white transition-all duration-200 hover:border-red-400 text-center text-lg font-medium"
            />
          </div>

          {/* Trailers */}
          <div className="relative">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
              <span className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                Trailers
              </span>
            </label>
            <input
              type="number"
              min="0"
              step="1"
              value={trailers}
              onChange={(e) => setTrailers(e.target.value)}
              onFocus={() => setFocusedField('trailers')}
              onBlur={() => setFocusedField(null)}
              placeholder="0"
              className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:text-white transition-all duration-200 hover:border-red-400 text-center text-lg font-medium"
            />
          </div>
        </div>

        {/* Opciones Adicionales */}
        {config.additionalOptions.length > 0 && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
              Opciones Adicionales
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {config.additionalOptions.map((option: AdditionalOption) => (
                <label
                  key={option.id}
                  className="flex items-center space-x-3 cursor-pointer p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 border-2 border-transparent hover:border-red-200 dark:hover:border-red-800"
                >
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={selectedOptions.includes(option.id || '')}
                      onChange={() => handleOptionToggle(option.id || '')}
                      className="w-5 h-5 text-red-600 border-2 border-gray-300 rounded-md focus:ring-red-500 focus:ring-2 cursor-pointer transition-all"
                    />
                    {selectedOptions.includes(option.id || '') && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      {option.name}
                    </span>
                    <span className="ml-2 text-sm font-semibold text-red-600">
                      ${option.price.toLocaleString('es-AR')}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Precio Total - Diseño moderno */}
        <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 p-6 rounded-2xl border-2 border-red-200 dark:border-red-800 shadow-lg">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="bg-red-500 p-3 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                Precio Total:
              </span>
            </div>
            <div className="text-right">
              <span className="text-3xl sm:text-4xl font-bold text-red-600 dark:text-red-400">
                ${totalPrice.toLocaleString('es-AR')}
              </span>
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 font-semibold flex items-center justify-center space-x-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span>Cerrar</span>
          </button>
          <button
            onClick={handleRequestQuote}
            disabled={!selectedVehicleType}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            <span>Solicitar Cotización</span>
          </button>
        </div>
      </div>
      
      {/* Modal de datos del cliente */}
      <CustomerInfoModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        onConfirm={handleCustomerInfoConfirmed}
      />
    </Modal>
  );
};

export default CraneQuoteModal;
