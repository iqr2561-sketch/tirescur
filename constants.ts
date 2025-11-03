import React from 'react';
import { Product, Category, FooterContent, DealZoneConfig, Sale, Brand, MenuItem } from './types';

// Icons for categories
export const TireIcon: React.ReactElement = React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-6 w-6", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: "2" },
  React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 14v-4m0 0V6a2 2 0 10-4 0v4m4 0h4m-4 0a2 2 0 100 4 2 2 0 000-4zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" })
);
export const AccessoryIcon: React.ReactElement = React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-6 w-6", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: "2" },
  React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.001 12.001 0 002.924 12c0 3.078 1.137 5.968 3.076 8.125l.001.001C7.618 21.365 9.773 22 12 22c2.227 0 4.382-.635 6.099-1.875l.001-.001c1.939-2.157 3.076-5.047 3.076-8.125a12.001 12.001 0 00-2.382-7.06" })
);
export const WheelIcon: React.ReactElement = React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-6 w-6", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: "2" },
  React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 14c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-3.313 0-6 2.687-6 6h12c0-3.313-2.687-6-6-6z" })
);
export const ValveSensorIcon: React.ReactElement = React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-6 w-6", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: "2" },
  React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M8 9H7a2 2 0 00-2 2v5a2 2 0 002 2h7a2 2 0 002-2V9a2 2 0 00-2-2h-1m-6 9l3-3m0 0l3 3m-3-3v8m-6-13h2m-6 4h4" })
);

// Icon for Admin Sales
export const ShoppingBagIcon: React.ReactElement = React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5 mr-3", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: "2" },
  React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" })
);

// Icons for Brand Management
export const TagIcon: React.ReactElement = React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5 mr-3", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: "2" },
  React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" })
);

// Icons for Price Management
export const DollarSignIcon: React.ReactElement = React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5 mr-3", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: "2" },
  React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V9m0 3v2m0 4.5V20m-5-11h10a2 2 0 012 2v2a2 2 0 01-2 2H7a2 2 0 01-2-2v-2a2 2 0 012-2z" })
);

export const DEFAULT_PRODUCT_IMAGE_URL = 'https://via.placeholder.com/400x300.png?text=Neumático+RedParts';
export const DEFAULT_BRAND_LOGO_URL = 'https://via.placeholder.com/100x50.png?text=Marca';
export const DEFAULT_HERO_IMAGE_URL = 'https://images.unsplash.com/photo-1542282088-fe8426682b8f?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1920&h=600&fit=crop&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format';
export const DEFAULT_WHATSAPP_PHONE_NUMBER = '+5491112345678'; // Example number


// Automatically generate initial brands for seeding first
const tempUniqueBrandNames = Array.from(new Set([
  'Treadsure', 'Michelin', 'Pirelli', 'Goodyear', 'Bridgestone', 'Continental', 'BFGoodrich', 'Hankook', 'Dunlop', 'Maxxis'
]));
export const INITIAL_BRANDS_DATA: Omit<Brand, 'id'>[] = tempUniqueBrandNames.map((brandName) => ({
  name: brandName,
  logoUrl: `https://via.placeholder.com/100x50.png?text=${encodeURIComponent(brandName.replace(/\s/g, ''))}`,
}));

// Define base products for seeding, without 'id' as Supabase will generate UUID
export const PRODUCTS_DATA: Omit<Product, 'id'>[] = [
  {
    sku: 'SKU: TNR-205-55-R16',
    name: 'Neumático de Verano Ultraligero',
    brand: 'Treadsure',
    brandLogoUrl: INITIAL_BRANDS_DATA.find(b => b.name === 'Treadsure')?.logoUrl,
    price: 120.00,
    rating: 4.5,
    reviews: 9,
    imageUrl: 'https://images.unsplash.com/photo-1616896264878-1a5e174e9e4f?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&h=300&fit=crop&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format',
    description: 'Neumático de alto rendimiento para verano, con excelente agarre en seco y bajo nivel de ruido.',
    tags: ['neumático', 'verano'],
    stock: 25,
    width: '205',
    profile: '55',
    diameter: 'R16',
  },
  {
    sku: 'SKU: TNR-195-60-R15',
    name: 'Neumático All-Season Premium',
    brand: 'Michelin',
    brandLogoUrl: INITIAL_BRANDS_DATA.find(b => b.name === 'Michelin')?.logoUrl,
    price: 95.00,
    rating: 4.0,
    reviews: 7,
    imageUrl: 'https://images.unsplash.com/photo-1596773223019-335606d396d3?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&h=300&fit=crop&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format',
    description: 'Neumático todo el año para un rendimiento equilibrado en diferentes condiciones climáticas.',
    tags: ['neumático', 'todo el año'],
    stock: 8,
    width: '195',
    profile: '60',
    diameter: 'R15',
  },
  {
    sku: 'SKU: TNR-225-45-R17',
    name: 'Neumático Deportivo de Competición',
    brand: 'Pirelli',
    brandLogoUrl: INITIAL_BRANDS_DATA.find(b => b.name === 'Pirelli')?.logoUrl,
    price: 180.00,
    rating: 0,
    reviews: 0,
    imageUrl: 'https://images.unsplash.com/photo-1620023640226-538d58a8a3a9?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&h=300&fit=crop&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format',
    description: 'Diseñado para competición, máxima tracción en pista y excelente respuesta en curvas.',
    tags: ['neumático', 'deportivo'],
    stock: 3,
    width: '225',
    profile: '45',
    diameter: 'R17',
  },
  {
    sku: 'SKU: TNR-215-65-R16',
    name: 'Neumático para SUV Todo Terreno',
    brand: 'Goodyear',
    brandLogoUrl: INITIAL_BRANDS_DATA.find(b => b.name === 'Goodyear')?.logoUrl,
    price: 140.00,
    rating: 4.5,
    reviews: 7,
    imageUrl: 'https://images.unsplash.com/photo-1590499092410-fc4d6a4c28f6?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&h=300&fit=crop&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format',
    description: 'Robusto neumático para SUV, ideal para aventuras fuera de carretera con durabilidad superior.',
    tags: ['neumático', 'SUV', 'todo terreno'],
    stock: 12,
    width: '215',
    profile: '65',
    diameter: 'R16',
  },
  {
    sku: 'SKU: TNR-185-55-R15',
    name: 'Neumático Eco-Friendly de Baja Resistencia',
    brand: 'Bridgestone',
    brandLogoUrl: INITIAL_BRANDS_DATA.find(b => b.name === 'Bridgestone')?.logoUrl,
    price: 85.00,
    rating: 4.0,
    reviews: 3,
    imageUrl: 'https://images.unsplash.com/photo-1582260656094-1a2f6b3e34b9?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&h=300&fit=crop&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format',
    description: 'Ahorro de combustible y menor impacto ambiental con excelente agarre en ciudad.',
    tags: ['neumático', 'eco', 'ciudad'],
    stock: 0,
    width: '185',
    profile: '55',
    diameter: 'R15',
  },
  {
    sku: 'SKU: TNR-245-40-R18',
    name: 'Neumático de Invierno Extremo',
    brand: 'Continental',
    brandLogoUrl: INITIAL_BRANDS_DATA.find(b => b.name === 'Continental')?.logoUrl,
    price: 160.00,
    rating: 5.0,
    reviews: 12,
    imageUrl: 'https://images.unsplash.com/photo-1579308640702-86ee62f92415?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&h=300&fit=crop&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format',
    description: 'Agarre excepcional en nieve y hielo para la máxima seguridad en condiciones invernales.',
    tags: ['neumático', 'invierno'],
    stock: 7,
    width: '245',
    profile: '40',
    diameter: 'R18',
  },
  {
    sku: 'SKU: TNR-205-60-R16',
    name: 'Neumáticos de Camioneta Reforzados (Juego de 4)',
    brand: 'BFGoodrich',
    brandLogoUrl: INITIAL_BRANDS_DATA.find(b => b.name === 'BFGoodrich')?.logoUrl,
    price: 720.00,
    rating: 4.2,
    reviews: 15,
    imageUrl: 'https://images.unsplash.com/photo-1577742188448-6c845417431e?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&h=300&fit=crop&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format',
    description: 'Neumáticos duraderos para camionetas, ideales para carga pesada y terrenos difíciles. Se vende en juego.',
    tags: ['neumático', 'camioneta', 'todo terreno'],
    stock: 4, // 1 set of 4
    width: '205',
    profile: '60',
    diameter: 'R16',
  },
  {
    sku: 'SKU: TNR-175-70-R13',
    name: 'Neumático Urbano Estándar',
    brand: 'Hankook',
    brandLogoUrl: INITIAL_BRANDS_DATA.find(b => b.name === 'Hankook')?.logoUrl,
    price: 70.00,
    rating: 3.8,
    reviews: 5,
    imageUrl: 'https://images.unsplash.com/photo-1621259580457-3a1376f921d7?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&h=300&fit=crop&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format',
    description: 'Perfecto para la conducción diaria en ciudad, con buena eficiencia de combustible y durabilidad.',
    tags: ['neumático', 'ciudad'],
    stock: 30,
    width: '175',
    profile: '70',
    diameter: 'R13',
  },
  {
    sku: 'SKU: TNR-235-50-R18',
    name: 'Neumático de Rendimiento Premium',
    brand: 'Dunlop',
    brandLogoUrl: INITIAL_BRANDS_DATA.find(b => b.name === 'Dunlop')?.logoUrl,
    price: 150.00,
    rating: 4.7,
    reviews: 10,
    imageUrl: 'https://images.unsplash.com/photo-1622312297127-d352c3c6f1a8?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&h=300&fit=crop&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format',
    description: 'Ofrece una excelente respuesta y control para vehículos deportivos y de alto rendimiento.',
    tags: ['neumático', 'rendimiento', 'deportivo'],
    stock: 9,
    width: '235',
    profile: '50',
    diameter: 'R18',
  },
  {
    sku: 'SKU: TNR-265-70-R17',
    name: 'Neumático M/T para Barro Extremo',
    brand: 'Maxxis',
    brandLogoUrl: INITIAL_BRANDS_DATA.find(b => b.name === 'Maxxis')?.logoUrl,
    price: 190.00,
    rating: 4.9,
    reviews: 18,
    imageUrl: 'https://images.unsplash.com/photo-1610427847900-53d9e26e38a2?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&h=300&fit=crop&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format',
    description: 'Diseñado para los terrenos más desafiantes, con tracción superior en barro y rocas.',
    tags: ['neumático', 'todo terreno', 'barro'],
    stock: 6,
    width: '265',
    profile: '70',
    diameter: 'R17',
  },
  // Adding variations for "Neumático de Verano Ultraligero"
  {
    sku: 'SKU: TNR-215-55-R16',
    name: 'Neumático de Verano Ultraligero',
    brand: 'Treadsure',
    brandLogoUrl: INITIAL_BRANDS_DATA.find(b => b.name === 'Treadsure')?.logoUrl,
    price: 130.00,
    rating: 4.5,
    reviews: 9,
    imageUrl: 'https://images.unsplash.com/photo-1616896264878-1a5e174e9e4f?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&h=300&fit=crop&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format',
    description: 'Neumático de alto rendimiento para verano, con excelente agarre en seco y bajo nivel de ruido (Ancho 215).',
    tags: ['neumático', 'verano'],
    stock: 15,
    width: '215',
    profile: '55',
    diameter: 'R16',
  },
  {
    sku: 'SKU: TNR-205-60-R16',
    name: 'Neumático de Verano Ultraligero',
    brand: 'Treadsure',
    brandLogoUrl: INITIAL_BRANDS_DATA.find(b => b.name === 'Treadsure')?.logoUrl,
    price: 125.00,
    rating: 4.5,
    reviews: 9,
    imageUrl: 'https://images.unsplash.com/photo-1616896264878-1a5e174e9e4f?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&h=300&fit=crop&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format',
    description: 'Neumático de alto rendimiento para verano, con excelente agarre en seco y bajo nivel de ruido (Perfil 60).',
    tags: ['neumático', 'verano'],
    stock: 20,
    width: '205',
    profile: '60',
    diameter: 'R16',
  },
  {
    sku: 'SKU: TNR-205-55-R17',
    name: 'Neumático de Verano Ultraligero',
    brand: 'Treadsure',
    brandLogoUrl: INITIAL_BRANDS_DATA.find(b => b.name === 'Treadsure')?.logoUrl,
    price: 140.00,
    rating: 4.5,
    reviews: 9,
    imageUrl: 'https://images.unsplash.com/photo-1616896264878-1a5e174e9e4f?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&h=300&fit=crop&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format',
    description: 'Neumático de alto rendimiento para verano, con excelente agarre en seco y bajo nivel de ruido (Diámetro R17).',
    tags: ['neumático', 'verano'],
    stock: 10,
    width: '205',
    profile: '55',
    diameter: 'R17',
  },
];


export const CATEGORIES_DATA: Category[] = [
  { id: 'cat1', name: 'Neumáticos de Verano', icon: TireIcon, imageUrl: 'https://images.unsplash.com/photo-1579308640702-86ee62f92415?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=200&h=150&fit=crop&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format' },
  { id: 'cat2', name: 'Neumáticos de Invierno', icon: TireIcon, imageUrl: 'https://images.unsplash.com/photo-1616896264878-1a5e174e9e4f?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=200&h=150&fit=crop&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format' },
  { id: 'cat3', name: 'Neumáticos Todo el Año', icon: TireIcon, imageUrl: 'https://images.unsplash.com/photo-1596773223019-335606d396d3?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=200&h=150&fit=crop&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format' },
  { id: 'cat4', name: 'Neumáticos para SUV', icon: WheelIcon, imageUrl: 'https://images.unsplash.com/photo-1590499092410-fc4d6a4c28f6?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=200&h=150&fit=crop&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format' },
  { id: 'cat5', name: 'Neumáticos de Camioneta', icon: WheelIcon, imageUrl: 'https://images.unsplash.com/photo-1577742188448-6c845417431e?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=200&h=150&fit=crop&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format' },
  { id: 'cat6', name: 'Accesorios para Neumáticos', icon: AccessoryIcon, imageUrl: DEFAULT_PRODUCT_IMAGE_URL },
  { id: 'cat7', name: 'Válvulas y Sensores', icon: ValveSensorIcon, imageUrl: DEFAULT_PRODUCT_IMAGE_URL },
];

export const WIDTHS = ['Ancho', '175', '185', '195', '205', '215', '225', '235', '245', '265'];
export const PROFILES = ['Perfil', '40', '45', '50', '55', '60', '65', '70'];
export const DIAMETERS = ['Diámetro', 'R13', 'R14', 'R15', 'R16', 'R17', 'R18'];

// Default footer content
export const DEFAULT_FOOTER_CONTENT: FooterContent = {
  aboutUsText: `RedParts es tu destino de confianza para neumáticos de alta calidad. Ofrecemos una amplia selección de marcas líderes para todo tipo de vehículos y necesidades. Nuestro compromiso es brindarte seguridad, rendimiento y el mejor servicio al cliente.`,
  contactAddress: `123 Avenida Principal\nCiudad Capital, CP 12345\nPaís`,
  contactPhone: '(+54) 11 1234-5678',
  contactEmail: 'info@redparts.com',
  contactHours: 'Lun-Vie: 9am-6pm',
  copyrightText: 'RedParts. Todos los derechos reservados.',
};

// Default deal zone configuration
export const DEFAULT_DEAL_ZONE_CONFIG: DealZoneConfig = {
  targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16), // 7 days from now, format YYYY-MM-DDTHH:MM
  discountText: 'hasta el 50%',
  buttonText: 'Ver Todas las Ofertas Ahora',
};

// Initial sales data (for mock purposes to be seeded)
export const INITIAL_SALES_DATA: Omit<Sale, 'id'>[] = [
  {
    customerName: 'Juan Pérez',
    total: 240.00,
    status: 'Completado',
    date: '2023-10-26T10:00:00Z',
    products: [{ productId: 'prod1', name: 'Neumático de Verano Ultraligero', quantity: 2, price: 120.00 }],
  },
  {
    customerName: 'María García',
    total: 95.00,
    status: 'Pendiente',
    date: '2023-10-26T11:30:00Z',
    products: [{ productId: 'prod2', name: 'Neumático All-Season Premium', quantity: 1, price: 95.00 }],
  },
  {
    customerName: 'Carlos Ruíz',
    total: 360.00,
    status: 'Cancelado',
    date: '2023-10-25T14:45:00Z',
    products: [{ productId: 'prod3', name: 'Neumático Deportivo de Competición', quantity: 2, price: 180.00 }],
  },
];


// Default Menu Items for seeding the database
export const DEFAULT_MENU_ITEMS: Omit<MenuItem, 'id'>[] = [
  // Header Desktop Menus
  { name: 'Inicio', path: '/', isExternal: false, order: 10, location: 'header-desktop' },
  { name: 'Tienda', path: '/shop', isExternal: false, order: 20, location: 'header-desktop' },
  { name: 'Blog', path: '/blog', isExternal: false, order: 30, location: 'header-desktop' },
  { name: 'Cuenta', path: '/account', isExternal: false, order: 40, location: 'header-desktop' },
  { name: 'Páginas', path: '/pages', isExternal: false, order: 50, location: 'header-desktop' },
  { name: 'Administración', path: '/admin', isExternal: false, order: 60, location: 'header-desktop' },
  
  // Mobile Navbar Menus
  { name: 'Inicio', path: '/', isExternal: false, order: 10, location: 'mobile-navbar', type: 'route' },
  { name: 'Tienda', path: '/shop', isExternal: false, order: 20, location: 'mobile-navbar', type: 'route' },
  { name: 'Buscar', path: 'toggleSearch', isExternal: false, order: 30, location: 'mobile-navbar', type: 'action' },
  { name: 'Carrito', path: 'toggleCart', isExternal: false, order: 40, location: 'mobile-navbar', type: 'action' },
  { name: 'Cuenta', path: '/account', isExternal: false, order: 50, location: 'mobile-navbar', type: 'route' },

  // Admin Sidebar Menus
  { name: 'Panel', path: '/admin', isExternal: false, order: 10, location: 'admin-sidebar' },
  { name: 'Productos', path: '/admin/products', isExternal: false, order: 20, location: 'admin-sidebar' },
  { name: 'Marcas', path: '/admin/brands', isExternal: false, order: 30, location: 'admin-sidebar' },
  { name: 'Actualizar Precios', path: '/admin/prices', isExternal: false, order: 40, location: 'admin-sidebar' },
  { name: 'Ventas', path: '/admin/sales', isExternal: false, order: 50, location: 'admin-sidebar' },
  { name: 'Ajustes', path: '/admin/settings', isExternal: false, order: 60, location: 'admin-sidebar' },
  { name: 'Gestión de Menús', path: '/admin/menus', isExternal: false, order: 70, location: 'admin-sidebar' }, // New menu item for AdminMenuManagementPage
  { name: 'Categorías', path: '/admin/categories', isExternal: false, order: 75, location: 'admin-sidebar' }, // New menu item for AdminCategoryManagementPage
  { name: 'Volver a la Tienda', path: '/', isExternal: false, order: 80, location: 'admin-sidebar' },

  // Footer Info Menus
  { name: 'Sobre Nosotros', path: '#', isExternal: false, order: 10, location: 'footer-info' },
  { name: 'Información de Envío', path: '#', isExternal: false, order: 20, location: 'footer-info' },
  { name: 'Política de Privacidad', path: '#', isExternal: false, order: 30, location: 'footer-info' },
  { name: 'Términos y Condiciones', path: '#', isExternal: false, order: 40, location: 'footer-info' },
  { name: 'Contáctanos', path: '#', isExternal: false, order: 50, location: 'footer-info' },

  // Footer Account Menus
  { name: 'Mi Cuenta', path: '#', isExternal: false, order: 10, location: 'footer-account' },
  { name: 'Historial de Pedidos', path: '#', isExternal: false, order: 20, location: 'footer-account' },
  { name: 'Lista de Deseos', path: '#', isExternal: false, order: 30, location: 'footer-account' },
  { name: 'Boletín', path: '#', isExternal: false, order: 40, location: 'footer-account' },
  { name: 'Devoluciones', path: '#', isExternal: false, order: 50, location: 'footer-account' },
];