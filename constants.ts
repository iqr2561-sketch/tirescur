import React from 'react';
import { FooterContent, DealZoneConfig } from './types';

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

// Default product image URL
export const DEFAULT_PRODUCT_IMAGE_URL = '';
export const DEFAULT_BRAND_LOGO_URL = '';
export const DEFAULT_HERO_IMAGE_URL = '';
export const DEFAULT_WHATSAPP_PHONE_NUMBER = '';

export const WIDTHS = ['Ancho', '175', '185', '195', '205', '215', '225', '235', '245', '265'];
export const PROFILES = ['Perfil', '40', '45', '50', '55', '60', '65', '70'];
export const DIAMETERS = ['Diámetro', 'R13', 'R14', 'R15', 'R16', 'R17', 'R18'];

// Default footer content
export const DEFAULT_FOOTER_CONTENT: FooterContent = {
  aboutUsText: '',
  contactAddress: '',
  contactPhone: '',
  contactEmail: '',
  contactHours: '',
  copyrightText: '',
};

// Default deal zone configuration
export const DEFAULT_DEAL_ZONE_CONFIG: DealZoneConfig = {
  targetDate: '',
  discountText: '',
  buttonText: '',
};
