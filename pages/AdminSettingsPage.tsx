import React, { useState, useEffect, useCallback } from 'react';
import { HeroImageUpdateFunction, PhoneNumberUpdateFunction, FooterContent, FooterUpdateFunction, DealZoneConfig, DealZoneConfigUpdateFunction } from '../types';
import { DEFAULT_FOOTER_CONTENT, DEFAULT_DEAL_ZONE_CONFIG } from '../constants';
import { useToast } from '../contexts/ToastContext';

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

const AdminSettingsPage: React.FC<AdminSettingsPageProps> = ({
  heroImageUrl,
  onUpdateHeroImage,
  whatsappPhoneNumber,
  onUpdatePhoneNumber,
  footerContent,
  onUpdateFooterContent,
  dealZoneConfig,
  onUpdateDealZoneConfig,
}) => {
  const [activeTab, setActiveTab] = useState<'sitio' | 'contacto' | 'footer' | 'ofertas'>('sitio');

  const [newHeroImageUrl, setNewHeroImageUrl] = useState(heroImageUrl);
  const [newWhatsappPhoneNumber, setNewWhatsappPhoneNumber] = useState(whatsappPhoneNumber);

  const [editableFooterContent, setEditableFooterContent] = useState<FooterContent>(footerContent);

  const [editableDealZoneConfig, setEditableDealZoneConfig] = useState<DealZoneConfig>(dealZoneConfig);

  const { showSuccess, showWarning } = useToast();

  useEffect(() => {
    setNewHeroImageUrl(heroImageUrl);
  }, [heroImageUrl]);

  useEffect(() => {
    setNewWhatsappPhoneNumber(whatsappPhoneNumber);
  }, [whatsappPhoneNumber]);

  useEffect(() => {
    setEditableFooterContent(footerContent);
  }, [footerContent]);

  useEffect(() => {
    setEditableDealZoneConfig(dealZoneConfig);
  }, [dealZoneConfig]);

  const handleHeroImageUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateHeroImage(newHeroImageUrl);
    showSuccess('URL de imagen principal actualizada con éxito!');
  };

  const handlePhoneNumberUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedNumber = newWhatsappPhoneNumber.replace(/\D/g, '');
    if (cleanedNumber.length < 10) {
      showWarning('Por favor, introduce un número de teléfono válido (al menos 10 dígitos).');
      return;
    }
    onUpdatePhoneNumber(cleanedNumber);
    showSuccess('Número de teléfono de WhatsApp actualizado con éxito!');
  };

  const handleFooterContentChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditableFooterContent((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleFooterContentUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateFooterContent(editableFooterContent);
    showSuccess('Contenido del pie de página actualizado con éxito!');
  };

  const handleDealZoneConfigChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditableDealZoneConfig((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleDealZoneConfigUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateDealZoneConfig(editableDealZoneConfig);
    showSuccess('Configuración de Zona de Ofertas actualizada con éxito!');
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

  return (
    <div className="flex-1 p-8 bg-gray-100 overflow-auto dark:bg-gray-900">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 dark:text-gray-100">Ajustes</h1>

      <div className="flex border-b border-gray-200 mb-6 -mt-2 dark:border-gray-700">
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
          Configuración de Zona de Ofertas
        </button>
      </div>

      {activeTab === 'sitio' && (
        <div className="p-6 rounded-lg shadow-md mb-8 bg-white dark:bg-gray-800">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 dark:text-gray-100">Configuración del Sitio</h2>
          <form onSubmit={handleHeroImageUpdate} className="space-y-4 mb-6">
            <div>
              <label htmlFor="heroImage" className="block text-sm font-medium text-gray-700 dark:text-gray-200">URL de Imagen Principal del Héroe</label>
              <input
                type="url"
                name="heroImage"
                id="heroImage"
                value={newHeroImageUrl}
                onChange={(e) => setNewHeroImageUrl(e.target.value)}
                className={getInputFieldClasses()}
                placeholder="Introduce una URL de imagen válida"
                required
              />
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">La imagen actual es: <a href={heroImageUrl} target="_blank" rel="noopener noreferrer" className="text-red-600 hover:underline">{heroImageUrl.substring(0, Math.min(heroImageUrl.length, 50))}...</a></p>
            </div>
            <button
              type="submit"
              className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors flex items-center space-x-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
              <span>Guardar Imagen</span>
            </button>
          </form>
        </div>
      )}

      {activeTab === 'contacto' && (
        <div className="p-6 rounded-lg shadow-md mb-8 bg-white dark:bg-gray-800">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 dark:text-gray-100">Configuración de Contacto</h2>
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
                aria-label="Texto de la sección Sobre Nosotros en el pie de página"
              ></textarea>
            </div>
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
                aria-label="Dirección de contacto en el pie de página"
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
                aria-label="Número de teléfono de contacto en el pie de página"
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
                aria-label="Email de contacto en el pie de página"
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
                aria-label="Horario de contacto en el pie de página"
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
                aria-label="Texto de copyright en el pie de página"
              />
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

      {activeTab === 'ofertas' && (
        <div className="p-6 rounded-lg shadow-md bg-white dark:bg-gray-800">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 dark:text-gray-100">Configuración de Zona de Ofertas</h2>
          <form onSubmit={handleDealZoneConfigUpdate} className="space-y-4">
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
                aria-label="Fecha y hora de finalización de la oferta"
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
                aria-label="Texto que describe el porcentaje de descuento"
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
                aria-label="Texto del botón para ver las ofertas"
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
    </div>
  );
};

export default AdminSettingsPage;