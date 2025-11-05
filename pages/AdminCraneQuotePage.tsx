import React, { useState, useEffect, useCallback } from 'react';
import { CraneQuoteConfig, VehicleType, AdditionalOption } from '../types';
import { useToast } from '../contexts/ToastContext';

const AdminCraneQuotePage: React.FC = () => {
  const [config, setConfig] = useState<CraneQuoteConfig>({
    pricePerKilometer: 2000,
    pricePerPassenger: 3000,
    pricePerTrailer: 600,
    whatsappNumber: '+5492245506078',
    vehicleTypes: [],
    additionalOptions: [],
  });

  const [newVehicleName, setNewVehicleName] = useState('');
  const [newVehiclePrice, setNewVehiclePrice] = useState('');
  const [newOptionName, setNewOptionName] = useState('');
  const [newOptionPrice, setNewOptionPrice] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { showSuccess, showError } = useToast();

  const API_BASE_URL = '/api';

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${API_BASE_URL}/crane-quote`);
      if (!res.ok) {
        throw new Error('Error al cargar configuración');
      }
      const data = await res.json();
      setConfig(data);
    } catch (err: any) {
      console.error('Error fetching crane quote config:', err);
      showError('Error al cargar la configuración');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      console.log('[AdminCraneQuotePage] Saving config:', JSON.stringify(config, null, 2));
      
      const res = await fetch(`${API_BASE_URL}/crane-quote`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      console.log('[AdminCraneQuotePage] Response status:', res.status, res.statusText);

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Error desconocido' }));
        console.error('[AdminCraneQuotePage] Error response:', errorData);
        throw new Error(errorData.error || errorData.message || 'Error al guardar configuración');
      }

      const updatedConfig = await res.json();
      console.log('[AdminCraneQuotePage] Updated config received:', updatedConfig);
      setConfig(updatedConfig); // Actualizar con los datos del servidor (incluye IDs generados)
      showSuccess('✅ Configuración guardada correctamente', 5000);
    } catch (err: any) {
      console.error('[AdminCraneQuotePage] Error saving config:', err);
      showError(`❌ Error al guardar la configuración: ${err?.message || 'Error desconocido'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddVehicle = () => {
    if (!newVehicleName.trim() || !newVehiclePrice.trim()) {
      showError('Por favor, completa todos los campos');
      return;
    }

    const price = parseFloat(newVehiclePrice);
    if (isNaN(price) || price < 0) {
      showError('El precio debe ser un número válido');
      return;
    }

    // Usar ID temporal que se reemplazará con el ID real de la BD al guardar
    const newVehicle: VehicleType = {
      id: `temp-${Date.now()}`,
      name: newVehicleName.trim(),
      basePrice: price,
    };

    setConfig((prev) => ({
      ...prev,
      vehicleTypes: [...prev.vehicleTypes, newVehicle],
    }));

    setNewVehicleName('');
    setNewVehiclePrice('');
  };

  const handleDeleteVehicle = (id: string) => {
    setConfig((prev) => ({
      ...prev,
      vehicleTypes: prev.vehicleTypes.filter((v) => v.id !== id),
    }));
  };

  const handleAddOption = () => {
    if (!newOptionName.trim() || !newOptionPrice.trim()) {
      showError('Por favor, completa todos los campos');
      return;
    }

    const price = parseFloat(newOptionPrice);
    if (isNaN(price) || price < 0) {
      showError('El precio debe ser un número válido');
      return;
    }

    // Usar ID temporal que se reemplazará con el ID real de la BD al guardar
    const newOption: AdditionalOption = {
      id: `temp-${Date.now()}`,
      name: newOptionName.trim(),
      price: price,
    };

    setConfig((prev) => ({
      ...prev,
      additionalOptions: [...prev.additionalOptions, newOption],
    }));

    setNewOptionName('');
    setNewOptionPrice('');
  };

  const handleDeleteOption = (id: string) => {
    setConfig((prev) => ({
      ...prev,
      additionalOptions: prev.additionalOptions.filter((o) => o.id !== id),
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600 dark:text-gray-400">Cargando configuración...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6">
        Configuración del Cotizador de Grúa
      </h1>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-6">
        {/* Costos Base */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
            Costos Base
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Precio por Kilómetro
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={config.pricePerKilometer}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    pricePerKilometer: parseFloat(e.target.value) || 0,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Precio por Pasajero
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={config.pricePerPassenger}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    pricePerPassenger: parseFloat(e.target.value) || 0,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Precio por Trailer
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={config.pricePerTrailer}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    pricePerTrailer: parseFloat(e.target.value) || 0,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Número de WhatsApp
              </label>
              <input
                type="text"
                value={config.whatsappNumber}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    whatsappNumber: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="+5492245506078"
              />
            </div>
          </div>
        </div>

        {/* Tipos de Vehículo */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
            Tipos de Vehículo
          </h2>
          <div className="space-y-4">
            {config.vehicleTypes.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-sm italic">No hay tipos de vehículos configurados</p>
            ) : (
              config.vehicleTypes.map((vehicle) => (
                <div
                  key={vehicle.id || `vehicle-${vehicle.name}`}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <span className="text-gray-800 dark:text-gray-200">
                    {vehicle.name} - $ {vehicle.basePrice.toLocaleString('es-AR')}
                  </span>
                  <button
                    onClick={() => handleDeleteVehicle(vehicle.id || '')}
                    className="text-red-600 hover:text-red-800 transition-colors"
                    aria-label={`Eliminar ${vehicle.name}`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              ))
            )}
            <div className="flex space-x-2">
              <input
                type="text"
                value={newVehicleName}
                onChange={(e) => setNewVehicleName(e.target.value)}
                placeholder="Nombre"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <input
                type="number"
                min="0"
                step="0.01"
                value={newVehiclePrice}
                onChange={(e) => setNewVehiclePrice(e.target.value)}
                placeholder="Precio Base"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <button
                onClick={handleAddVehicle}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Opciones Adicionales */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
            Opciones Adicionales
          </h2>
          <div className="space-y-4">
            {config.additionalOptions.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-sm italic">No hay opciones adicionales configuradas</p>
            ) : (
              config.additionalOptions.map((option) => (
                <div
                  key={option.id || `option-${option.name}`}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <span className="text-gray-800 dark:text-gray-200">
                    {option.name} - $ {option.price.toLocaleString('es-AR')}
                  </span>
                  <button
                    onClick={() => handleDeleteOption(option.id || '')}
                    className="text-red-600 hover:text-red-800 transition-colors"
                    aria-label={`Eliminar ${option.name}`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              ))
            )}
            <div className="flex space-x-2">
              <input
                type="text"
                value={newOptionName}
                onChange={(e) => setNewOptionName(e.target.value)}
                placeholder="Nombre"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <input
                type="number"
                min="0"
                step="0.01"
                value={newOptionPrice}
                onChange={(e) => setNewOptionPrice(e.target.value)}
                placeholder="Precio"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <button
                onClick={handleAddOption}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Botón Guardar */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isSaving ? (
              <>
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                <span>Guardar Configuración</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminCraneQuotePage;

