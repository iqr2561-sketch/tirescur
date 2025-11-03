// Datos compartidos para funciones serverless (sin dependencias de React)

export const DEFAULT_PRODUCT_IMAGE_URL = 'https://via.placeholder.com/400x300.png?text=Neumático+RedParts';
export const DEFAULT_BRAND_LOGO_URL = 'https://via.placeholder.com/100x50.png?text=Marca';
export const DEFAULT_HERO_IMAGE_URL = 'https://images.unsplash.com/photo-1542282088-fe8426682b8f?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1920&h=600&fit=crop&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format';
export const DEFAULT_WHATSAPP_PHONE_NUMBER = '+5491112345678';

export const INITIAL_BRANDS_DATA = [
  'Treadsure',
  'Michelin',
  'Pirelli',
  'Goodyear',
  'Bridgestone',
  'Continental',
  'BFGoodrich',
  'Hankook',
  'Dunlop',
  'Maxxis'
].map((brandName) => ({
  name: brandName,
  logoUrl: `https://via.placeholder.com/100x50.png?text=${encodeURIComponent(brandName.replace(/\s/g, ''))}`
}));

export const PRODUCTS_DATA = [
  {
    sku: 'SKU: TNR-205-55-R16',
    name: 'Neumático de Verano Ultraligero',
    brand: 'Treadsure',
    brandLogoUrl: INITIAL_BRANDS_DATA.find((b) => b.name === 'Treadsure')?.logoUrl,
    price: 120.0,
    rating: 4.5,
    reviews: 9,
    imageUrl:
      'https://images.unsplash.com/photo-1616896264878-1a5e174e9e4f?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&h=300&fit=crop&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format',
    description:
      'Neumático de alto rendimiento para verano, con excelente agarre en seco y bajo nivel de ruido.',
    tags: ['neumático', 'verano'],
    stock: 25,
    width: '205',
    profile: '55',
    diameter: 'R16'
  },
  {
    sku: 'SKU: TNR-195-60-R15',
    name: 'Neumático All-Season Premium',
    brand: 'Michelin',
    brandLogoUrl: INITIAL_BRANDS_DATA.find((b) => b.name === 'Michelin')?.logoUrl,
    price: 95.0,
    rating: 4.0,
    reviews: 7,
    imageUrl:
      'https://images.unsplash.com/photo-1596773223019-335606d396d3?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&h=300&fit=crop&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format',
    description: 'Neumático todo el año para un rendimiento equilibrado en diferentes condiciones climáticas.',
    tags: ['neumático', 'todo el año'],
    stock: 8,
    width: '195',
    profile: '60',
    diameter: 'R15'
  },
  {
    sku: 'SKU: TNR-225-45-R17',
    name: 'Neumático Deportivo de Competición',
    brand: 'Pirelli',
    brandLogoUrl: INITIAL_BRANDS_DATA.find((b) => b.name === 'Pirelli')?.logoUrl,
    price: 180.0,
    rating: 0,
    reviews: 0,
    imageUrl:
      'https://images.unsplash.com/photo-1620023640226-538d58a8a3a9?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&h=300&fit=crop&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format',
    description:
      'Diseñado para competición, máxima tracción en pista y excelente respuesta en curvas.',
    tags: ['neumático', 'deportivo'],
    stock: 3,
    width: '225',
    profile: '45',
    diameter: 'R17'
  },
  {
    sku: 'SKU: TNR-215-65-R16',
    name: 'Neumático para SUV Todo Terreno',
    brand: 'Goodyear',
    brandLogoUrl: INITIAL_BRANDS_DATA.find((b) => b.name === 'Goodyear')?.logoUrl,
    price: 140.0,
    rating: 4.5,
    reviews: 7,
    imageUrl:
      'https://images.unsplash.com/photo-1590499092410-fc4d6a4c28f6?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&h=300&fit=crop&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format',
    description:
      'Robusto neumático para SUV, ideal para aventuras fuera de carretera con durabilidad superior.',
    tags: ['neumático', 'SUV', 'todo terreno'],
    stock: 12,
    width: '215',
    profile: '65',
    diameter: 'R16'
  },
  {
    sku: 'SKU: TNR-185-55-R15',
    name: 'Neumático Eco-Friendly de Baja Resistencia',
    brand: 'Bridgestone',
    brandLogoUrl: INITIAL_BRANDS_DATA.find((b) => b.name === 'Bridgestone')?.logoUrl,
    price: 85.0,
    rating: 4.0,
    reviews: 3,
    imageUrl:
      'https://images.unsplash.com/photo-1582260656094-1a2f6b3e34b9?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&h=300&fit=crop&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format',
    description: 'Ahorro de combustible y menor impacto ambiental con excelente agarre en ciudad.',
    tags: ['neumático', 'eco', 'ciudad'],
    stock: 0,
    width: '185',
    profile: '55',
    diameter: 'R15'
  },
  {
    sku: 'SKU: TNR-245-40-R18',
    name: 'Neumático de Invierno Extremo',
    brand: 'Continental',
    brandLogoUrl: INITIAL_BRANDS_DATA.find((b) => b.name === 'Continental')?.logoUrl,
    price: 160.0,
    rating: 5.0,
    reviews: 12,
    imageUrl:
      'https://images.unsplash.com/photo-1579308640702-86ee62f92415?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&h=300&fit=crop&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format',
    description: 'Agarre excepcional en nieve y hielo para la máxima seguridad en condiciones invernales.',
    tags: ['neumático', 'invierno'],
    stock: 7,
    width: '245',
    profile: '40',
    diameter: 'R18'
  },
  {
    sku: 'SKU: TNR-205-60-R16',
    name: 'Neumáticos de Camioneta Reforzados (Juego de 4)',
    brand: 'BFGoodrich',
    brandLogoUrl: INITIAL_BRANDS_DATA.find((b) => b.name === 'BFGoodrich')?.logoUrl,
    price: 720.0,
    rating: 4.2,
    reviews: 15,
    imageUrl:
      'https://images.unsplash.com/photo-1577742188448-6c845417431e?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&h=300&fit=crop&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format',
    description:
      'Neumáticos duraderos para camionetas, ideales para carga pesada y terrenos difíciles. Se vende en juego.',
    tags: ['neumático', 'camioneta', 'todo terreno'],
    stock: 4,
    width: '205',
    profile: '60',
    diameter: 'R16'
  },
  {
    sku: 'SKU: TNR-175-70-R13',
    name: 'Neumático Urbano Estándar',
    brand: 'Hankook',
    brandLogoUrl: INITIAL_BRANDS_DATA.find((b) => b.name === 'Hankook')?.logoUrl,
    price: 70.0,
    rating: 3.8,
    reviews: 5,
    imageUrl:
      'https://images.unsplash.com/photo-1621259580457-3a1376f921d7?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&h=300&fit=crop&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format',
    description:
      'Perfecto para la conducción diaria en ciudad, con buena eficiencia de combustible y durabilidad.',
    tags: ['neumático', 'ciudad'],
    stock: 30,
    width: '175',
    profile: '70',
    diameter: 'R13'
  },
  {
    sku: 'SKU: TNR-235-50-R18',
    name: 'Neumático de Rendimiento Premium',
    brand: 'Dunlop',
    brandLogoUrl: INITIAL_BRANDS_DATA.find((b) => b.name === 'Dunlop')?.logoUrl,
    price: 150.0,
    rating: 4.7,
    reviews: 10,
    imageUrl:
      'https://images.unsplash.com/photo-1622312297127-d352c3c6f1a8?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&h=300&fit=crop&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format',
    description:
      'Ofrece una excelente respuesta y control para vehículos deportivos y de alto rendimiento.',
    tags: ['neumático', 'rendimiento', 'deportivo'],
    stock: 9,
    width: '235',
    profile: '50',
    diameter: 'R18'
  },
  {
    sku: 'SKU: TNR-265-70-R17',
    name: 'Neumático M/T para Barro Extremo',
    brand: 'Maxxis',
    brandLogoUrl: INITIAL_BRANDS_DATA.find((b) => b.name === 'Maxxis')?.logoUrl,
    price: 190.0,
    rating: 4.9,
    reviews: 18,
    imageUrl:
      'https://images.unsplash.com/photo-1610427847900-53d9e26e38a2?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&h=300&fit=crop&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format',
    description:
      'Diseñado para los terrenos más desafiantes, con tracción superior en barro y rocas.',
    tags: ['neumático', 'todo terreno', 'barro'],
    stock: 6,
    width: '265',
    profile: '70',
    diameter: 'R17'
  },
  {
    sku: 'SKU: TNR-215-55-R16',
    name: 'Neumático de Verano Ultraligero',
    brand: 'Treadsure',
    brandLogoUrl: INITIAL_BRANDS_DATA.find((b) => b.name === 'Treadsure')?.logoUrl,
    price: 130.0,
    rating: 4.5,
    reviews: 9,
    imageUrl:
      'https://images.unsplash.com/photo-1616896264878-1a5e174e9e4f?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&h=300&fit=crop&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format',
    description:
      'Neumático de alto rendimiento para verano, con excelente agarre en seco y bajo nivel de ruido (Ancho 215).',
    tags: ['neumático', 'verano'],
    stock: 15,
    width: '215',
    profile: '55',
    diameter: 'R16'
  },
  {
    sku: 'SKU: TNR-205-60-R16',
    name: 'Neumático de Verano Ultraligero',
    brand: 'Treadsure',
    brandLogoUrl: INITIAL_BRANDS_DATA.find((b) => b.name === 'Treadsure')?.logoUrl,
    price: 125.0,
    rating: 4.5,
    reviews: 9,
    imageUrl:
      'https://images.unsplash.com/photo-1616896264878-1a5e174e9e4f?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&h=300&fit=crop&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format',
    description:
      'Neumático de alto rendimiento para verano, con excelente agarre en seco y bajo nivel de ruido (Perfil 60).',
    tags: ['neumático', 'verano'],
    stock: 20,
    width: '205',
    profile: '60',
    diameter: 'R16'
  },
  {
    sku: 'SKU: TNR-205-55-R17',
    name: 'Neumático de Verano Ultraligero',
    brand: 'Treadsure',
    brandLogoUrl: INITIAL_BRANDS_DATA.find((b) => b.name === 'Treadsure')?.logoUrl,
    price: 140.0,
    rating: 4.5,
    reviews: 9,
    imageUrl:
      'https://images.unsplash.com/photo-1616896264878-1a5e174e9e4f?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&h=300&fit=crop&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format',
    description:
      'Neumático de alto rendimiento para verano, con excelente agarre en seco y bajo nivel de ruido (Diámetro R17).',
    tags: ['neumático', 'verano'],
    stock: 10,
    width: '205',
    profile: '55',
    diameter: 'R17'
  }
];

export const CATEGORIES_DATA = [
  {
    id: 'cat1',
    name: 'Neumáticos de Verano',
    iconType: 'tire',
    imageUrl:
      'https://images.unsplash.com/photo-1579308640702-86ee62f92415?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=200&h=150&fit=crop&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format'
  },
  {
    id: 'cat2',
    name: 'Neumáticos de Invierno',
    iconType: 'tire',
    imageUrl:
      'https://images.unsplash.com/photo-1616896264878-1a5e174e9e4f?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=200&h=150&fit=crop&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format'
  },
  {
    id: 'cat3',
    name: 'Neumáticos Todo el Año',
    iconType: 'tire',
    imageUrl:
      'https://images.unsplash.com/photo-1596773223019-335606d396d3?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=200&h=150&fit=crop&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format'
  },
  {
    id: 'cat4',
    name: 'Neumáticos para SUV',
    iconType: 'wheel',
    imageUrl:
      'https://images.unsplash.com/photo-1590499092410-fc4d6a4c28f6?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=200&h=150&fit=crop&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format'
  },
  {
    id: 'cat5',
    name: 'Neumáticos de Camioneta',
    iconType: 'wheel',
    imageUrl:
      'https://images.unsplash.com/photo-1577742188448-6c845417431e?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=200&h=150&fit=crop&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format'
  },
  {
    id: 'cat6',
    name: 'Accesorios para Neumáticos',
    iconType: 'accessory',
    imageUrl: DEFAULT_PRODUCT_IMAGE_URL
  },
  {
    id: 'cat7',
    name: 'Válvulas y Sensores',
    iconType: 'valve',
    imageUrl: DEFAULT_PRODUCT_IMAGE_URL
  }
];

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

export const INITIAL_SALES_DATA = [
  {
    customerName: 'Juan Pérez',
    total: 240.0,
    status: 'Completado',
    date: '2023-10-26T10:00:00Z',
    products: [
      { productId: 'prod1', name: 'Neumático de Verano Ultraligero', quantity: 2, price: 120.0 }
    ]
  },
  {
    customerName: 'María García',
    total: 95.0,
    status: 'Pendiente',
    date: '2023-10-26T11:30:00Z',
    products: [
      { productId: 'prod2', name: 'Neumático All-Season Premium', quantity: 1, price: 95.0 }
    ]
  },
  {
    customerName: 'Carlos Ruíz',
    total: 360.0,
    status: 'Cancelado',
    date: '2023-10-25T14:45:00Z',
    products: [
      { productId: 'prod3', name: 'Neumático Deportivo de Competición', quantity: 2, price: 180.0 }
    ]
  }
];

export const DEFAULT_MENU_ITEMS = [
  { name: 'Inicio', path: '/', isExternal: false, order: 10, location: 'header-desktop' },
  { name: 'Tienda', path: '/shop', isExternal: false, order: 20, location: 'header-desktop' },
  { name: 'Blog', path: '/blog', isExternal: false, order: 30, location: 'header-desktop' },
  { name: 'Cuenta', path: '/account', isExternal: false, order: 40, location: 'header-desktop' },
  { name: 'Páginas', path: '/pages', isExternal: false, order: 50, location: 'header-desktop' },
  { name: 'Administración', path: '/admin', isExternal: false, order: 60, location: 'header-desktop' },

  { name: 'Inicio', path: '/', isExternal: false, order: 10, location: 'mobile-navbar', type: 'route' },
  { name: 'Tienda', path: '/shop', isExternal: false, order: 20, location: 'mobile-navbar', type: 'route' },
  { name: 'Buscar', path: 'toggleSearch', isExternal: false, order: 30, location: 'mobile-navbar', type: 'action' },
  { name: 'Carrito', path: 'toggleCart', isExternal: false, order: 40, location: 'mobile-navbar', type: 'action' },
  { name: 'Cuenta', path: '/account', isExternal: false, order: 50, location: 'mobile-navbar', type: 'route' },

  { name: 'Panel', path: '/admin', isExternal: false, order: 10, location: 'admin-sidebar' },
  { name: 'Productos', path: '/admin/products', isExternal: false, order: 20, location: 'admin-sidebar' },
  { name: 'Marcas', path: '/admin/brands', isExternal: false, order: 30, location: 'admin-sidebar' },
  { name: 'Actualizar Precios', path: '/admin/prices', isExternal: false, order: 40, location: 'admin-sidebar' },
  { name: 'Ventas', path: '/admin/sales', isExternal: false, order: 50, location: 'admin-sidebar' },
  { name: 'Ajustes', path: '/admin/settings', isExternal: false, order: 60, location: 'admin-sidebar' },
  { name: 'Gestión de Menús', path: '/admin/menus', isExternal: false, order: 70, location: 'admin-sidebar' },
  { name: 'Categorías', path: '/admin/categories', isExternal: false, order: 75, location: 'admin-sidebar' },
  { name: 'Volver a la Tienda', path: '/', isExternal: false, order: 80, location: 'admin-sidebar' },

  { name: 'Sobre Nosotros', path: '#', isExternal: false, order: 10, location: 'footer-info' },
  { name: 'Información de Envío', path: '#', isExternal: false, order: 20, location: 'footer-info' },
  { name: 'Política de Privacidad', path: '#', isExternal: false, order: 30, location: 'footer-info' },
  { name: 'Términos y Condiciones', path: '#', isExternal: false, order: 40, location: 'footer-info' },
  { name: 'Contáctanos', path: '#', isExternal: false, order: 50, location: 'footer-info' },

  { name: 'Mi Cuenta', path: '#', isExternal: false, order: 10, location: 'footer-account' },
  { name: 'Historial de Pedidos', path: '#', isExternal: false, order: 20, location: 'footer-account' },
  { name: 'Lista de Deseos', path: '#', isExternal: false, order: 30, location: 'footer-account' },
  { name: 'Boletín', path: '#', isExternal: false, order: 40, location: 'footer-account' },
  { name: 'Devoluciones', path: '#', isExternal: false, order: 50, location: 'footer-account' }
];


