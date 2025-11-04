import React from 'react';

export interface Brand {
  id: string; // Supabase UUID
  name: string;
  logoUrl?: string; // Optional logo URL for the brand
}

export interface Product {
  id: string; // Supabase UUID
  sku: string;
  name: string;
  brand: string; // The name of the brand
  brandId?: string; // Supabase brand_id for foreign key relationship
  brandLogoUrl?: string; // Added to Product for direct display
  price: number;
  rating: number;
  reviews: number;
  imageUrl?: string;
  description: string;
  tags?: string[];
  stock: number;
  width: string;
  profile: string;
  diameter: string;
  // New fields for deals/offers
  isOnSale?: boolean; // Mark product as on sale
  salePrice?: number; // Special sale price
  discountPercentage?: number; // Discount percentage
  categoryId?: string; // Category ID for filtering
  // Product status/availability
  isActive?: boolean; // Product is active and visible to customers
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Category {
  id: string;
  name: string;
  icon: React.ReactElement; // SVG icon
  imageUrl?: string;
  description?: string; // Optional description
  order?: number; // For sorting categories
  isActive?: boolean; // To show/hide category
}

export interface TireFilter {
  width: string;
  profile: string;
  diameter: string;
}

export interface AdminProductFormData {
  id?: string; // Optional for new products
  sku: string;
  name: string;
  brand: string; // Keep as string for form input (selected brand name)
  price: string; // Keep as string for form input
  rating: string; // Keep as string for form input
  reviews: string; // Keep as string for form input
  imageUrl: string;
  description: string;
  tags?: string; // Comma-separated string for input
  stock: string; // Added stock to form data, keeping it as string for input
  width: string;
  profile: string;
  diameter: string;
  // New fields for deals/offers
  isOnSale?: boolean;
  salePrice?: string; // Keep as string for form input
  discountPercentage?: string; // Keep as string for form input
  categoryId?: string;
  // Product status
  isActive?: boolean; // Product is active and visible to customers
}

export interface AdminSettingsFormData {
  heroImageUrl: string;
  whatsappPhoneNumber: string;
}

export interface FooterContent {
  aboutUsText: string;
  contactAddress: string;
  contactPhone: string;
  contactEmail: string;
  contactHours: string;
  copyrightText: string;
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    whatsapp?: string;
  };
}

export interface DealZoneConfig {
  targetDate: string; // ISO string format for date and time (YYYY-MM-DDTHH:MM)
  discountText: string; // e.g., "hasta el 70%"
  buttonText: string; // e.g., "Ver Todas las Ofertas Disponibles"
  backgroundImage?: string; // URL de imagen de fondo
  backgroundColor?: string; // Color de fondo si no hay imagen
}

export interface ContactConfig {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  email: string;
  latitude?: number;
  longitude?: number;
  mapZoom?: number;
}

export interface Popup {
  id: string;
  title: string;
  message?: string;
  image_url?: string;
  button_text?: string;
  button_link?: string;
  is_active: boolean;
  auto_close_seconds?: number;
  show_on_page_load: boolean;
  show_once_per_session: boolean;
  priority: number;
  start_date?: string;
  end_date?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Sale {
  id: string; // Supabase UUID
  customerName: string;
  total: number;
  status: 'Pendiente' | 'Completado' | 'Cancelado';
  date: string; // ISO string or similar
  products: { productId: string; name: string; quantity: number; price: number; }[];
}

// For API settings document (internal to backend, but useful to define)
export interface GlobalSettings {
  // id handled internally by API for 'app_settings'
  heroImageUrl: string;
  whatsappPhoneNumber: string;
  footerContent: FooterContent;
  dealZoneConfig: DealZoneConfig;
}

export type HeroImageUpdateFunction = (url: string) => void;
export type PhoneNumberUpdateFunction = (phoneNumber: string) => void;
export type FooterUpdateFunction = (newContent: FooterContent) => void;
export type DealZoneConfigUpdateFunction = (newConfig: DealZoneConfig) => void;

// For Excel Import
export interface ExcelProductRow {
  Marca: string;
  Modelo: string;
  Size: string; // e.g., "155/70R12" - might contain width/profile/diameter
  RIM: string | number; // e.g., "12" or "R12" - specifically for diameter
  Precio: number | string; // Can be string in Excel, needs parsing
  Imagen?: string; // Optional image URL
}

// New interface for Menu Items
export interface MenuItem {
  id: string; // Supabase UUID
  name: string;
  path: string; // The route or external URL
  isExternal: boolean; // True if it's an external link
  order: number; // For sorting menu items
  location: 'header-desktop' | 'mobile-navbar' | 'footer-info' | 'footer-account' | 'admin-sidebar'; // Where the menu item appears
  type?: 'route' | 'external' | 'action'; // Specific for mobile-navbar: 'action' for special functions like toggleCart
}

// Interface for Admin Users
export interface AdminUser {
  id: string; // Supabase UUID
  username: string;
  display_name?: string;
  role: 'admin' | 'editor' | 'viewer';
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}