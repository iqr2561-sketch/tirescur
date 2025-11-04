import React, { useState, useEffect, useCallback } from 'react';
import { HeroImageUpdateFunction, PhoneNumberUpdateFunction, FooterContent, FooterUpdateFunction, DealZoneConfig, DealZoneConfigUpdateFunction, ContactConfig, Popup } from '../types';
import { DEFAULT_FOOTER_CONTENT, DEFAULT_DEAL_ZONE_CONFIG } from '../constants';
import { useToast } from '../contexts/ToastContext';
import ImageUploader from '../components/ImageUploader';
import GoogleMap from '../components/GoogleMap';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';

interface AdminSettingsPageProps {
  heroImageUrl: string;
  onUpdateHeroImage: HeroImageUpdateFunction;
  whatsappPhoneNumber: string;
  onUpdatePhoneNumber: PhoneNumberUpdateFunction;
  footerContent: FooterContent;
  onUpdateFooterContent: FooterUpdateFunction;
  dealZoneConfig: DealZoneConfig;
  onUpdateDealZoneConfig: DealZoneConfigUpdateFunction;
}

const AdminSettingsPageComplete: React.FC<AdminSettingsPageProps> = ({
  heroImageUrl,
  onUpdateHeroImage,
  whatsappPhoneNumber,
  onUpdatePhoneNumber,
  footerContent,
  onUpdateFooterContent,
  dealZoneConfig,
  onUpdateDealZoneConfig,
}) => {
  const [activeTab, setActiveTab] = useState<'sitio' | 'contacto' | 'footer' | 'ofertas' | 'popups'>('sitio');
  const [newHeroImageUrl, setNewHeroImageUrl] = useState(heroImageUrl);
  const [newWhatsappPhoneNumber, setNewWhatsappPhoneNumber] = useState(whatsappPhoneNumber);
  const [editableFooterContent, setEditableFooterContent] = useState<FooterContent>(footerContent);
  const [editableDealZoneConfig, setEditableDealZoneConfig] = useState<DealZoneConfig>(dealZoneConfig);
  const [contactConfig, setContactConfig] = useState<ContactConfig>({
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    phone: '',
    email: '',
    latitude: undefined,
    longitude: undefined,
    mapZoom: 15,
  });
  const [popups, setPopups] = useState<Popup[]>([]);
  const [isPopupModalOpen, setIsPopupModalOpen] = useState(false);
  const [editingPopup, setEditingPopup] = useState<Popup | null>(null);
  const [popupFormData, setPopupFormData] = useState<Partial<Popup>>({
    title: '',
    message: '',
    image_url: '',
    button_text: '',
    button_link: '',
    is_active: true,
    auto_close_seconds: undefined,
    show_on_page_load: true,
    show_once_per_session: true,
    priority: 0,
  });
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; popupId: string | null }>({ isOpen: false, popupId: null });
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const { showSuccess, showError, showWarning } = useToast();

  const API_BASE_URL = '/api';

  // Cargar configuraciones desde la BD
  useEffect(() => {
    loadSettings();
    loadPopups();
  }, []);

  const loadSettings = async () => {
    try {
      // Cargar configuración de contacto
      const contactRes = await fetch(`${API_BASE_URL}/settings?key=contact`);
      if (contactRes.ok) {
        const contactData = await contactRes.json();
        if (contactData?.value) {
          setContactConfig(contactData.value);
        }
      }

      // Cargar configuración de zona de ofertas
      const offerRes = await fetch(`${API_BASE_URL}/settings?key=offer_zone`);
      if (offerRes.ok) {
        const offerData = await offerRes.json();
        if (offerData?.value) {
          setEditableDealZoneConfig(prev => ({ ...prev, ...offerData.value }));
        }
      }

      // Cargar configuración de footer
      const footerRes = await fetch(`${API_BASE_URL}/settings?key=footer`);
      if (footerRes.ok) {
        const footerData = await footerRes.json();
        if (footerData?.value) {
          setEditableFooterContent(prev => ({ ...prev, ...footerData.value }));
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPopups = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/popups`);
      if (res.ok) {
        const data = await res.json();
        setPopups(data || []);
      }
    } catch (error) {
      console.error('Error loading popups:', error);
    }
  };

  // Geocodificación para obtener lat/lng desde dirección
  const geocodeAddress = async (address: string) => {
    if (!address.trim()) return;
    
    try {
      // Usar Google Maps Geocoding API
      const apiKey = process.env.VITE_GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        showWarning('API Key de Google Maps no configurada. Las coordenadas no se actualizarán automáticamente.');
        return;
      }

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`
      );
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        const location = data.results[0].geometry.location;
        setContactConfig(prev => ({
          ...prev,
          latitude: location.lat,
          longitude: location.lng,
        }));
        showSuccess('Coordenadas actualizadas automáticamente desde la dirección');
      }
    } catch (error) {
      console.error('Error geocoding address:', error);
    }
  };

  const handleHeroImageUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64String = reader.result as string;
          const response = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              file: base64String,
              fileName: file.name,
              fileType: file.type,
              entityType: 'hero_image',
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error al subir la imagen');
          }

          const data = await response.json();
          setNewHeroImageUrl(data.url);
          await onUpdateHeroImage(data.url);
          showSuccess('Imagen de héroe subida y guardada correctamente');
        } catch (error: any) {
          showError(`Error al subir la imagen: ${error.message}`);
        } finally {
          setIsUploading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (error: any) {
      showError(`Error al procesar la imagen: ${error.message}`);
      setIsUploading(false);
    }
  };

  const handleHeroImageUrlChange = useCallback((url: string) => {
    setNewHeroImageUrl(url);
  }, []);

  const handleHeroImageUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!newHeroImageUrl.trim()) {
        showError('Por favor, introduce una URL válida o sube una imagen');
        return;
      }
      await onUpdateHeroImage(newHeroImageUrl);
      showSuccess('URL de imagen principal actualizada con éxito!');
    } catch (error: any) {
      showError(`Error al actualizar la imagen: ${error?.message || 'Error desconocido'}`);
    }
  };

  const handlePhoneNumberUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedNumber = newWhatsappPhoneNumber.replace(/\D/g, '');
    if (cleanedNumber.length < 10) {
      showWarning('Por favor, introduce un número de teléfono válido (al menos 10 dígitos).');
      return;
    }
    try {
      await onUpdatePhoneNumber(cleanedNumber);
      showSuccess('Número de teléfono de WhatsApp actualizado con éxito!');
    } catch (error: any) {
      showError(`Error al actualizar el número: ${error?.message || 'Error desconocido'}`);
    }
  };

  const handleContactConfigChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setContactConfig((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleContactConfigUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/settings?key=contact`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: 'contact',
          value: contactConfig,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Error al guardar');
      }

      showSuccess('Configuración de contacto guardada con éxito!');
    } catch (error: any) {
      showError(`Error al guardar contacto: ${error?.message || 'Error desconocido'}`);
    }
  };

  const handleContactImageUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64String = reader.result as string;
          const response = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              file: base64String,
              fileName: file.name,
              fileType: file.type,
              entityType: 'contact',
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error al subir la imagen');
          }

          const data = await response.json();
          // No hay imagen de contacto en el formulario actual, pero podemos agregarla si es necesario
          showSuccess('Imagen subida correctamente');
        } catch (error: any) {
          showError(`Error al subir la imagen: ${error.message}`);
        } finally {
          setIsUploading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (error: any) {
      showError(`Error al procesar la imagen: ${error.message}`);
      setIsUploading(false);
    }
  };

  const handleFooterContentChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditableFooterContent((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSocialMediaChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditableFooterContent((prev) => ({
      ...prev,
      socialMedia: {
        ...prev.socialMedia,
        [name]: value,
      },
    }));
  }, []);

  const handleFooterContentUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onUpdateFooterContent(editableFooterContent);
      showSuccess('Contenido del pie de página actualizado con éxito!');
    } catch (error: any) {
      showError(`Error al actualizar el footer: ${error?.message || 'Error desconocido'}`);
    }
  };

  const handleDealZoneConfigChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditableDealZoneConfig((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleDealZoneImageUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64String = reader.result as string;
          const response = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              file: base64String,
              fileName: file.name,
              fileType: file.type,
              entityType: 'offer_banner',
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error al subir la imagen');
          }

          const data = await response.json();
          setEditableDealZoneConfig(prev => ({ ...prev, backgroundImage: data.url }));
          showSuccess('Imagen de fondo subida correctamente');
        } catch (error: any) {
          showError(`Error al subir la imagen: ${error.message}`);
        } finally {
          setIsUploading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (error: any) {
      showError(`Error al procesar la imagen: ${error.message}`);
      setIsUploading(false);
    }
  };

  const handleDealZoneImageUrlChange = useCallback((url: string) => {
    setEditableDealZoneConfig(prev => ({ ...prev, backgroundImage: url }));
  }, []);

  const handleDealZoneConfigUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log('[Settings] Guardando configuración de ofertas:', editableDealZoneConfig);
      
      const res = await fetch(`${API_BASE_URL}/settings?key=offer_zone`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: 'offer_zone',
          value: editableDealZoneConfig,
        }),
      });

      console.log('[Settings] Response status:', res.status, res.statusText);

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: `Error ${res.status}: ${res.statusText}` }));
        console.error('[Settings] Error response:', errorData);
        throw new Error(errorData.error || `Error ${res.status}: ${res.statusText}`);
      }

      const responseData = await res.json();
      console.log('[Settings] Configuración guardada exitosamente:', responseData);
      
      // Actualizar el estado local con la respuesta del servidor
      const savedConfig = responseData.value || responseData;
      setEditableDealZoneConfig(prev => ({ ...prev, ...savedConfig }));
      
      await onUpdateDealZoneConfig(editableDealZoneConfig);
      showSuccess('✅ Configuración de Zona de Ofertas actualizada con éxito!');
    } catch (error: any) {
      console.error('[Settings] Error al actualizar ofertas:', error);
      showError(`❌ Error al actualizar ofertas: ${error?.message || 'Error desconocido'}`);
    }
  };

  // Popups management
  const handleOpenAddPopupModal = () => {
    setEditingPopup(null);
    setPopupFormData({
      title: '',
      message: '',
      image_url: '',
      button_text: '',
      button_link: '',
      is_active: true,
      auto_close_seconds: undefined,
      show_on_page_load: true,
      show_once_per_session: true,
      priority: 0,
    });
    setIsPopupModalOpen(true);
  };

  const handleOpenEditPopupModal = (popup: Popup) => {
    setEditingPopup(popup);
    setPopupFormData({
      title: popup.title,
      message: popup.message || '',
      image_url: popup.image_url || '',
      button_text: popup.button_text || '',
      button_link: popup.button_link || '',
      is_active: popup.is_active,
      auto_close_seconds: popup.auto_close_seconds,
      show_on_page_load: popup.show_on_page_load,
      show_once_per_session: popup.show_once_per_session,
      priority: popup.priority,
      start_date: popup.start_date,
      end_date: popup.end_date,
    });
    setIsPopupModalOpen(true);
  };

  const handlePopupFormChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setPopupFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : type === 'number' ? parseInt(value) || 0 : value,
    }));
  }, []);

  const handlePopupImageUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64String = reader.result as string;
          const response = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              file: base64String,
              fileName: file.name,
              fileType: file.type,
              entityType: 'popup',
              entityId: editingPopup?.id,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error al subir la imagen');
          }

          const data = await response.json();
          setPopupFormData(prev => ({ ...prev, image_url: data.url }));
          showSuccess('Imagen subida correctamente');
        } catch (error: any) {
          showError(`Error al subir la imagen: ${error.message}`);
        } finally {
          setIsUploading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (error: any) {
      showError(`Error al procesar la imagen: ${error.message}`);
      setIsUploading(false);
    }
  };

  const handlePopupImageUrlChange = useCallback((url: string) => {
    setPopupFormData(prev => ({ ...prev, image_url: url }));
  }, []);

  const handlePopupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingPopup 
        ? `${API_BASE_URL}/popups?id=${editingPopup.id}`
        : `${API_BASE_URL}/popups`;
      
      const res = await fetch(url, {
        method: editingPopup ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(popupFormData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Error al guardar');
      }

      showSuccess(`Popup ${editingPopup ? 'actualizado' : 'creado'} con éxito!`);
      setIsPopupModalOpen(false);
      loadPopups();
    } catch (error: any) {
      showError(`Error al guardar popup: ${error?.message || 'Error desconocido'}`);
    }
  };

  const handleDeletePopup = async () => {
    if (!confirmModal.popupId) return;

    try {
      const res = await fetch(`${API_BASE_URL}/popups?id=${confirmModal.popupId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Error al eliminar');
      }

      showSuccess('Popup eliminado correctamente');
      setConfirmModal({ isOpen: false, popupId: null });
      loadPopups();
    } catch (error: any) {
      showError(`Error al eliminar popup: ${error?.message || 'Error desconocido'}`);
    }
  };

  const getTabClasses = (tabName: typeof activeTab) =>
    `py-2 px-4 rounded-t-lg text-sm font-medium transition-colors duration-200 focus:outline-none
    ${activeTab === tabName
      ? 'bg-white text-red-600 font-semibold border-b-2 border-red-600 dark:bg-gray-800 dark:text-red-500 dark:border-red-500'
      : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
    }`;

  const getInputFieldClasses = () => `
    mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500
    bg-white text-gray-900 placeholder:text-gray-500
    dark:bg-gray-700 dark:text-gray-100 dark:placeholder:text-gray-400 dark:border-gray-600
  `;

  if (isLoading) {
    return (
      <div className="flex-1 p-8 bg-gray-100 overflow-auto dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400">Cargando configuraciones...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 bg-gray-100 overflow-auto dark:bg-gray-900">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 dark:text-gray-100">Ajustes</h1>

      <div className="flex border-b border-gray-200 mb-6 -mt-2 dark:border-gray-700 overflow-x-auto">
        <button onClick={() => setActiveTab('sitio')} className={getTabClasses('sitio')}>
          Configuración del Sitio
        </button>
        <button onClick={() => setActiveTab('contacto')} className={getTabClasses('contacto')}>
          Configuración de Contacto
        </button>
        <button onClick={() => setActiveTab('footer')} className={getTabClasses('footer')}>
          Configuración del Pie de Página
        </button>
        <button onClick={() => setActiveTab('ofertas')} className={getTabClasses('ofertas')}>
          Zona de Ofertas
        </button>
        <button onClick={() => setActiveTab('popups')} className={getTabClasses('popups')}>
          Popups / Modales
        </button>
      </div>

      {/* Tab: Configuración del Sitio */}
      {activeTab === 'sitio' && (
        <div className="p-6 rounded-lg shadow-md mb-8 bg-white dark:bg-gray-800">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 dark:text-gray-100">Configuración del Sitio</h2>
          
          {/* Sección de Subir Imagen */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Subir Imagen del Héroe</label>
            <ImageUploader
              currentImageUrl={newHeroImageUrl || ''}
              onImageSelected={handleHeroImageUpload}
              onImageUrlChange={handleHeroImageUrlChange}
              label="Subir imagen de héroe"
              maxSizeMB={5}
            />
            {newHeroImageUrl && (
              <div className="mt-2">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Vista previa:</p>
                <img src={newHeroImageUrl} alt="Vista previa" className="h-32 w-full object-cover rounded-lg" />
              </div>
            )}
          </div>

          {/* Sección de URL */}
          <form onSubmit={handleHeroImageUpdate} className="space-y-4 mb-6">
            <div>
              <label htmlFor="heroImage" className="block text-sm font-medium text-gray-700 dark:text-gray-200">O introduce una URL de Imagen</label>
              <input
                type="url"
                name="heroImage"
                id="heroImage"
                value={newHeroImageUrl}
                onChange={(e) => setNewHeroImageUrl(e.target.value)}
                className={getInputFieldClasses()}
                placeholder="https://ejemplo.com/imagen.jpg"
              />
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Imagen actual: <a href={heroImageUrl} target="_blank" rel="noopener noreferrer" className="text-red-600 hover:underline">{heroImageUrl.substring(0, Math.min(heroImageUrl.length, 50))}...</a>
              </p>
            </div>
            <button
              type="submit"
              disabled={isUploading}
              className={`bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors flex items-center space-x-2 ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
              <span>{isUploading ? 'Guardando...' : 'Guardar Imagen'}</span>
            </button>
          </form>

          <form onSubmit={handlePhoneNumberUpdate} className="space-y-4">
            <div>
              <label htmlFor="whatsappPhone" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Número de Teléfono de WhatsApp</label>
              <input
                type="tel"
                name="whatsappPhone"
                id="whatsappPhone"
                value={newWhatsappPhoneNumber}
                onChange={(e) => setNewWhatsappPhoneNumber(e.target.value)}
                className={getInputFieldClasses()}
                placeholder="Ej: 5491112345678"
                required
              />
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Este número se usará para todas las comunicaciones por WhatsApp.</p>
            </div>
            <button
              type="submit"
              className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
              <span>Guardar Número</span>
            </button>
          </form>
        </div>
      )}

      {/* Tab: Configuración de Contacto */}
      {activeTab === 'contacto' && (
        <div className="p-6 rounded-lg shadow-md mb-8 bg-white dark:bg-gray-800">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 dark:text-gray-100">Configuración de Contacto</h2>
          <form onSubmit={handleContactConfigUpdate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Dirección</label>
                <input
                  type="text"
                  name="address"
                  id="address"
                  value={contactConfig.address}
                  onChange={handleContactConfigChange}
                  onBlur={() => {
                    if (contactConfig.address) {
                      geocodeAddress(`${contactConfig.address}, ${contactConfig.city}, ${contactConfig.state}, ${contactConfig.country}`);
                    }
                  }}
                  className={getInputFieldClasses()}
                  placeholder="Calle y número"
                />
              </div>
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Ciudad</label>
                <input
                  type="text"
                  name="city"
                  id="city"
                  value={contactConfig.city}
                  onChange={handleContactConfigChange}
                  className={getInputFieldClasses()}
                  placeholder="Ciudad"
                />
              </div>
              <div>
                <label htmlFor="state" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Estado/Provincia</label>
                <input
                  type="text"
                  name="state"
                  id="state"
                  value={contactConfig.state}
                  onChange={handleContactConfigChange}
                  className={getInputFieldClasses()}
                  placeholder="Estado o Provincia"
                />
              </div>
              <div>
                <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Código Postal</label>
                <input
                  type="text"
                  name="zipCode"
                  id="zipCode"
                  value={contactConfig.zipCode}
                  onChange={handleContactConfigChange}
                  className={getInputFieldClasses()}
                  placeholder="Código Postal"
                />
              </div>
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700 dark:text-gray-200">País</label>
                <input
                  type="text"
                  name="country"
                  id="country"
                  value={contactConfig.country}
                  onChange={handleContactConfigChange}
                  className={getInputFieldClasses()}
                  placeholder="País"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Teléfono</label>
                <input
                  type="tel"
                  name="phone"
                  id="phone"
                  value={contactConfig.phone}
                  onChange={handleContactConfigChange}
                  className={getInputFieldClasses()}
                  placeholder="+54 9 11 1234-5678"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Email</label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={contactConfig.email}
                  onChange={handleContactConfigChange}
                  className={getInputFieldClasses()}
                  placeholder="info@ejemplo.com"
                />
              </div>
              <div>
                <label htmlFor="mapZoom" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Zoom del Mapa</label>
                <input
                  type="number"
                  name="mapZoom"
                  id="mapZoom"
                  min="1"
                  max="20"
                  value={contactConfig.mapZoom || 15}
                  onChange={handleContactConfigChange}
                  className={getInputFieldClasses()}
                />
              </div>
            </div>

            {/* Coordenadas manuales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Latitud (opcional)</label>
                <input
                  type="number"
                  step="any"
                  name="latitude"
                  id="latitude"
                  value={contactConfig.latitude || ''}
                  onChange={(e) => setContactConfig(prev => ({ ...prev, latitude: parseFloat(e.target.value) || undefined }))}
                  className={getInputFieldClasses()}
                  placeholder="Ej: -34.6037"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Se actualiza automáticamente desde la dirección, o ingresa manualmente</p>
              </div>
              <div>
                <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Longitud (opcional)</label>
                <input
                  type="number"
                  step="any"
                  name="longitude"
                  id="longitude"
                  value={contactConfig.longitude || ''}
                  onChange={(e) => setContactConfig(prev => ({ ...prev, longitude: parseFloat(e.target.value) || undefined }))}
                  className={getInputFieldClasses()}
                  placeholder="Ej: -58.3816"
                />
              </div>
            </div>

            {/* Vista previa del mapa */}
            {contactConfig.latitude && contactConfig.longitude && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Vista Previa del Mapa</label>
                <GoogleMap
                  latitude={contactConfig.latitude}
                  longitude={contactConfig.longitude}
                  zoom={contactConfig.mapZoom || 15}
                  address={`${contactConfig.address}, ${contactConfig.city}, ${contactConfig.state}, ${contactConfig.country}`}
                  className="w-full h-64 rounded-lg"
                />
              </div>
            )}

            <button
              type="submit"
              className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors flex items-center space-x-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
              <span>Guardar Configuración de Contacto</span>
            </button>
          </form>
        </div>
      )}

      {/* Tab: Configuración del Pie de Página */}
      {activeTab === 'footer' && (
        <div className="p-6 rounded-lg shadow-md mb-8 bg-white dark:bg-gray-800">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 dark:text-gray-100">Configuración del Pie de Página</h2>
          <form onSubmit={handleFooterContentUpdate} className="space-y-4">
            <div>
              <label htmlFor="aboutUsText" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Texto "Sobre Nosotros"</label>
              <textarea
                name="aboutUsText"
                id="aboutUsText"
                rows={4}
                value={editableFooterContent.aboutUsText}
                onChange={handleFooterContentChange}
                className={getInputFieldClasses()}
                placeholder="Texto sobre la empresa para el pie de página"
                required
              ></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="contactAddress" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Dirección de Contacto</label>
                <textarea
                  name="contactAddress"
                  id="contactAddress"
                  rows={2}
                  value={editableFooterContent.contactAddress}
                  onChange={handleFooterContentChange}
                  className={getInputFieldClasses()}
                  placeholder="123 Calle, Ciudad, País"
                  required
                ></textarea>
              </div>
              <div>
                <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Teléfono de Contacto</label>
                <input
                  type="tel"
                  name="contactPhone"
                  id="contactPhone"
                  value={editableFooterContent.contactPhone}
                  onChange={handleFooterContentChange}
                  className={getInputFieldClasses()}
                  placeholder="(888) 888-8888"
                  required
                />
              </div>
              <div>
                <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Email de Contacto</label>
                <input
                  type="email"
                  name="contactEmail"
                  id="contactEmail"
                  value={editableFooterContent.contactEmail}
                  onChange={handleFooterContentChange}
                  className={getInputFieldClasses()}
                  placeholder="info@redparts.com"
                  required
                />
              </div>
              <div>
                <label htmlFor="contactHours" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Horario de Contacto</label>
                <input
                  type="text"
                  name="contactHours"
                  id="contactHours"
                  value={editableFooterContent.contactHours}
                  onChange={handleFooterContentChange}
                  className={getInputFieldClasses()}
                  placeholder="Lun-Vie: 9am-6pm PST"
                  required
                />
              </div>
              <div>
                <label htmlFor="copyrightText" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Texto de Copyright</label>
                <input
                  type="text"
                  name="copyrightText"
                  id="copyrightText"
                  value={editableFooterContent.copyrightText}
                  onChange={handleFooterContentChange}
                  className={getInputFieldClasses()}
                  placeholder="RedParts. Todos los derechos reservados."
                  required
                />
              </div>
            </div>

            {/* Redes Sociales */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 dark:text-gray-100">Redes Sociales</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="facebook" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Facebook URL</label>
                  <input
                    type="url"
                    name="facebook"
                    id="facebook"
                    value={editableFooterContent.socialMedia?.facebook || ''}
                    onChange={handleSocialMediaChange}
                    className={getInputFieldClasses()}
                    placeholder="https://facebook.com/tu-pagina"
                  />
                </div>
                <div>
                  <label htmlFor="instagram" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Instagram URL</label>
                  <input
                    type="url"
                    name="instagram"
                    id="instagram"
                    value={editableFooterContent.socialMedia?.instagram || ''}
                    onChange={handleSocialMediaChange}
                    className={getInputFieldClasses()}
                    placeholder="https://instagram.com/tu-cuenta"
                  />
                </div>
                <div>
                  <label htmlFor="twitter" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Twitter URL</label>
                  <input
                    type="url"
                    name="twitter"
                    id="twitter"
                    value={editableFooterContent.socialMedia?.twitter || ''}
                    onChange={handleSocialMediaChange}
                    className={getInputFieldClasses()}
                    placeholder="https://twitter.com/tu-cuenta"
                  />
                </div>
                <div>
                  <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 dark:text-gray-200">WhatsApp URL</label>
                  <input
                    type="url"
                    name="whatsapp"
                    id="whatsapp"
                    value={editableFooterContent.socialMedia?.whatsapp || ''}
                    onChange={handleSocialMediaChange}
                    className={getInputFieldClasses()}
                    placeholder="https://wa.me/5491112345678"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors flex items-center space-x-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
              <span>Guardar Pie de Página</span>
            </button>
          </form>
        </div>
      )}

      {/* Tab: Zona de Ofertas */}
      {activeTab === 'ofertas' && (
        <div className="p-6 rounded-lg shadow-md mb-8 bg-white dark:bg-gray-800">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 dark:text-gray-100">Configuración de Zona de Ofertas</h2>
          <form onSubmit={handleDealZoneConfigUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Imagen de Fondo</label>
              <ImageUploader
                currentImageUrl={editableDealZoneConfig.backgroundImage || ''}
                onImageSelected={handleDealZoneImageUpload}
                onImageUrlChange={handleDealZoneImageUrlChange}
                label="Imagen de fondo para la zona de ofertas"
                maxSizeMB={5}
              />
              {editableDealZoneConfig.backgroundImage && (
                <div className="mt-2">
                  <img src={editableDealZoneConfig.backgroundImage} alt="Vista previa" className="h-32 w-full object-cover rounded-lg" />
                </div>
              )}
            </div>

            <div>
              <label htmlFor="backgroundColor" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Color de Fondo (si no hay imagen)</label>
              <input
                type="color"
                name="backgroundColor"
                id="backgroundColor"
                value={editableDealZoneConfig.backgroundColor || '#1f2937'}
                onChange={handleDealZoneConfigChange}
                className="mt-1 h-10 w-full rounded-md cursor-pointer"
              />
            </div>

            <div>
              <label htmlFor="targetDate" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Fecha y Hora Límite</label>
              <input
                type="datetime-local"
                name="targetDate"
                id="targetDate"
                value={editableDealZoneConfig.targetDate}
                onChange={handleDealZoneConfigChange}
                className={getInputFieldClasses()}
                required
              />
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Establece la fecha y hora en que termina la oferta.</p>
            </div>

            <div>
              <label htmlFor="discountText" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Texto del Descuento</label>
              <input
                type="text"
                name="discountText"
                id="discountText"
                value={editableDealZoneConfig.discountText}
                onChange={handleDealZoneConfigChange}
                className={getInputFieldClasses()}
                placeholder="Ej: hasta el 70%"
                required
              />
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Ejemplo: "hasta el 70%" o "del 20% al 50%".</p>
            </div>

            <div>
              <label htmlFor="buttonText" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Texto del Botón</label>
              <input
                type="text"
                name="buttonText"
                id="buttonText"
                value={editableDealZoneConfig.buttonText}
                onChange={handleDealZoneConfigChange}
                className={getInputFieldClasses()}
                placeholder="Ej: Ver Todas las Ofertas Disponibles"
                required
              />
            </div>

            <button
              type="submit"
              className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors flex items-center space-x-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
              <span>Guardar Configuración de Ofertas</span>
            </button>
          </form>
        </div>
      )}

      {/* Tab: Popups */}
      {activeTab === 'popups' && (
        <div className="p-6 rounded-lg shadow-md mb-8 bg-white dark:bg-gray-800">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Gestión de Popups</h2>
            <button
              onClick={handleOpenAddPopupModal}
              className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors flex items-center space-x-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
              <span>Crear Nuevo Popup</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Título</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Prioridad</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Auto-cierre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                {popups.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center dark:text-gray-400">
                      No hay popups configurados. Crea uno nuevo para comenzar.
                    </td>
                  </tr>
                ) : (
                  popups.map((popup) => (
                    <tr key={popup.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{popup.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          popup.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {popup.is_active ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{popup.priority}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {popup.auto_close_seconds ? `${popup.auto_close_seconds}s` : 'Manual'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleOpenEditPopupModal(popup)}
                          className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-3"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => setConfirmModal({ isOpen: true, popupId: popup.id })}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal para crear/editar popup */}
      <Modal
        isOpen={isPopupModalOpen}
        onClose={() => setIsPopupModalOpen(false)}
        title={editingPopup ? 'Editar Popup' : 'Crear Nuevo Popup'}
      >
        <form onSubmit={handlePopupSubmit} className="space-y-4">
          <div>
            <label htmlFor="popup-title" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Título</label>
            <input
              type="text"
              name="title"
              id="popup-title"
              value={popupFormData.title || ''}
              onChange={handlePopupFormChange}
              className={getInputFieldClasses()}
              placeholder="Título del popup"
              required
            />
          </div>

          <div>
            <label htmlFor="popup-message" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Mensaje</label>
            <textarea
              name="message"
              id="popup-message"
              rows={3}
              value={popupFormData.message || ''}
              onChange={handlePopupFormChange}
              className={getInputFieldClasses()}
              placeholder="Mensaje del popup"
            />
          </div>

          <div>
            <ImageUploader
              currentImageUrl={popupFormData.image_url || ''}
              onImageSelected={handlePopupImageUpload}
              onImageUrlChange={handlePopupImageUrlChange}
              label="Imagen del Popup (opcional)"
              maxSizeMB={5}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="popup-button-text" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Texto del Botón</label>
              <input
                type="text"
                name="button_text"
                id="popup-button-text"
                value={popupFormData.button_text || ''}
                onChange={handlePopupFormChange}
                className={getInputFieldClasses()}
                placeholder="Ej: Ver Ofertas"
              />
            </div>
            <div>
              <label htmlFor="popup-button-link" className="block text-sm font-medium text-gray-700 dark:text-gray-200">URL del Botón</label>
              <input
                type="url"
                name="button_link"
                id="popup-button-link"
                value={popupFormData.button_link || ''}
                onChange={handlePopupFormChange}
                className={getInputFieldClasses()}
                placeholder="/shop?offer=true"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="popup-auto-close" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Auto-cierre (segundos)</label>
              <input
                type="number"
                name="auto_close_seconds"
                id="popup-auto-close"
                min="0"
                value={popupFormData.auto_close_seconds || ''}
                onChange={handlePopupFormChange}
                className={getInputFieldClasses()}
                placeholder="0 = solo manual"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">0 o vacío = solo se cierra manualmente</p>
            </div>
            <div>
              <label htmlFor="popup-priority" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Prioridad</label>
              <input
                type="number"
                name="priority"
                id="popup-priority"
                value={popupFormData.priority || 0}
                onChange={handlePopupFormChange}
                className={getInputFieldClasses()}
                placeholder="0"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Mayor número = mayor prioridad</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="popup-start-date" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Fecha de Inicio (opcional)</label>
              <input
                type="datetime-local"
                name="start_date"
                id="popup-start-date"
                value={popupFormData.start_date || ''}
                onChange={handlePopupFormChange}
                className={getInputFieldClasses()}
              />
            </div>
            <div>
              <label htmlFor="popup-end-date" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Fecha de Finalización (opcional)</label>
              <input
                type="datetime-local"
                name="end_date"
                id="popup-end-date"
                value={popupFormData.end_date || ''}
                onChange={handlePopupFormChange}
                className={getInputFieldClasses()}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="is_active"
                checked={popupFormData.is_active || false}
                onChange={handlePopupFormChange}
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-200">Popup Activo</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="show_on_page_load"
                checked={popupFormData.show_on_page_load || false}
                onChange={handlePopupFormChange}
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-200">Mostrar al cargar la página</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="show_once_per_session"
                checked={popupFormData.show_once_per_session || false}
                onChange={handlePopupFormChange}
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-200">Mostrar solo una vez por sesión</span>
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setIsPopupModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
            >
              {editingPopup ? 'Guardar Cambios' : 'Crear Popup'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, popupId: null })}
        onConfirm={handleDeletePopup}
        title="Confirmar Eliminación"
        message="¿Estás seguro de que quieres eliminar este popup? Esta acción no se puede deshacer."
      />
    </div>
  );
};

export default AdminSettingsPageComplete;

