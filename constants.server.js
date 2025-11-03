// Datos compartidos para funciones serverless (sin dependencias de React)

export const DEFAULT_PRODUCT_IMAGE_URL = 'https://via.placeholder.com/400x300.png?text=Neumático+RedParts';
export const DEFAULT_BRAND_LOGO_URL = 'https://via.placeholder.com/100x50.png?text=Marca';
export const DEFAULT_HERO_IMAGE_URL = 'https://images.unsplash.com/photo-1542282088-fe8426682b8f?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1920&h=600&fit=crop&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format';
export const DEFAULT_WHATSAPP_PHONE_NUMBER = '+5491112345678';

export const DEFAULT_FOOTER_CONTENT = {
  aboutUsText:
    'RedParts es tu destino de confianza para neumáticos de alta calidad. Ofrecemos una amplia selección de marcas líderes para todo tipo de vehículos y necesidades. Nuestro compromiso es brindarte seguridad, rendimiento y el mejor servicio al cliente.',
  contactAddress: '123 Avenida Principal\nCiudad Capital, CP 12345\nPaís',
  contactPhone: '(+54) 11 1234-5678',
  contactEmail: 'info@redparts.com',
  contactHours: 'Lun-Vie: 9am-6pm',
  copyrightText: 'RedParts. Todos los derechos reservados.'
};

export const DEFAULT_DEAL_ZONE_CONFIG = {
  targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
  discountText: 'hasta el 50%',
  buttonText: 'Ver Todas las Ofertas Ahora'
};
