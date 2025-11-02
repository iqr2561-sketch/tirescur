import React, { useState, useCallback, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import SidebarCart from './components/SidebarCart';
import MobileNavbar from './components/MobileNavbar';
import SearchModal from './components/SearchModal';
import AdminSidebar from './components/AdminSidebar';
import HomePage from './pages/HomePage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminProductManagementPage from './pages/AdminProductManagementPage';
import AdminBrandManagementPage from './pages/AdminBrandManagementPage';
import AdminPriceManagementPage from './pages/AdminPriceManagementPage';
import AdminSalesPage from './pages/AdminSalesPage';
import AdminSettingsPage from './pages/AdminSettingsPage';
import AdminMenuManagementPage from './pages/AdminMenuManagementPage'; // New Admin page
import CustomerInfoModal from './components/CustomerInfoModal';
import LoadingSpinner from './components/LoadingSpinner'; // Import new component
import ProductSelectionModal from './components/ProductSelectionModal'; // Import new component

import { Product, CartItem, HeroImageUpdateFunction, PhoneNumberUpdateFunction, FooterContent, FooterUpdateFunction, DealZoneConfig, DealZoneConfigUpdateFunction, Sale, Brand, GlobalSettings, MenuItem } from './types';
import {
  DEFAULT_HERO_IMAGE_URL,
  DEFAULT_WHATSAPP_PHONE_NUMBER,
  DEFAULT_FOOTER_CONTENT,
  DEFAULT_DEAL_ZONE_CONFIG,
  PRODUCTS_DATA, // Used for initial seeding by API, but kept as a fallback if API fails
  INITIAL_BRANDS_DATA, // Same
  INITIAL_SALES_DATA, // Same
  DEFAULT_MENU_ITEMS // Same
} from './constants';

// Detectar si estamos en desarrollo local (localhost)
const isLocalhost = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || 
   window.location.hostname === '127.0.0.1' || 
   window.location.hostname === '');

// En desarrollo local, Vite proxy redirige /api a Vercel automáticamente
// En producción (Vercel), usar ruta relativa
const API_BASE_URL = '/api';

const App: React.FC = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModal] = useState(false);
  const [isCustomerInfoModalOpen, setIsCustomerInfoModalOpen] = useState(false);
  const [pendingOrder, setPendingOrder] = useState<{ products: Sale['products'], total: number } | null>(null);

  const [products, setProducts] = useState<Product[] | null>(null);
  const [brands, setBrands] = useState<Brand[] | null>(null);
  const [sales, setSales] = useState<Sale[] | null>(null);
  const [menus, setMenus] = useState<MenuItem[] | null>(null); // New state for menus
  const [heroImageUrl, setHeroImageUrl] = useState<string | null>(null);
  const [whatsappPhoneNumber, setWhatsappPhoneNumber] = useState<string | null>(null);
  const [footerContent, setFooterContent] = useState<FooterContent | null>(null);
  const [dealZoneConfig, setDealZoneConfig] = useState<DealZoneConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for the new ProductSelectionModal
  const [isProductSelectionModalOpen, setIsProductSelectionModalOpen] = useState(false);
  const [selectedProductForModal, setSelectedProductForModal] = useState<Product | null>(null);

  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setIsDarkMode(e.matches);
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [isDarkMode]);

  // Initial data fetching
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Add timeout to prevent hanging
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

        const productsPromise = fetch(`${API_BASE_URL}/products`, { signal: controller.signal }).catch(() => null);
        const brandsPromise = fetch(`${API_BASE_URL}/brands`, { signal: controller.signal }).catch(() => null);
        const salesPromise = fetch(`${API_BASE_URL}/sales`, { signal: controller.signal }).catch(() => null);
        const settingsPromise = fetch(`${API_BASE_URL}/settings`, { signal: controller.signal }).catch(() => null);
        const menusPromise = fetch(`${API_BASE_URL}/menus`, { signal: controller.signal }).catch(() => null);

        const [productsRes, brandsRes, salesRes, settingsRes, menusRes] = await Promise.all([
          productsPromise, brandsPromise, salesPromise, settingsPromise, menusPromise
        ]);

        clearTimeout(timeoutId);

        // If any request failed or returned null, use fallback data
        if (!productsRes || !productsRes.ok || !brandsRes || !brandsRes.ok || !salesRes || !salesRes.ok || 
            !settingsRes || !settingsRes.ok || !menusRes || !menusRes.ok) {
          console.warn('⚠️ API no disponible. Verificando errores...');
          
          // Intentar obtener más información del error de products
          if (productsRes && !productsRes.ok) {
            try {
              const errorData = await productsRes.json().catch(() => null);
              if (errorData) {
                console.error(`❌ Error en /products: ${productsRes.status} ${productsRes.statusText}`);
                console.error('Detalles del error:', errorData);
                if (errorData.hint) {
                  console.warn('💡 Hint:', errorData.hint);
                }
              } else {
                console.error(`❌ Error en /products: ${productsRes.status} ${productsRes.statusText}`);
              }
            } catch (parseError) {
              console.error(`❌ Error en /products: ${productsRes.status} ${productsRes.statusText}`);
            }
          }
          
          if (isLocalhost) {
            console.warn('💡 Desarrollo local detectado. Las APIs deberían redirigirse a Vercel automáticamente.');
            console.warn('💡 URL de Vercel: https://tirescur.vercel.app');
            console.warn('💡 Si ves este error, verifica que el servidor de desarrollo esté corriendo y reinícialo.');
          }
          throw new Error('API no disponible, usando datos predeterminados');
        }

        const fetchedProductsData = await productsRes.json();
        const fetchedBrandsData = await brandsRes.json();
        const fetchedSalesData = await salesRes.json();
        const fetchedSettings = await settingsRes.json();
        const fetchedMenusData = await menusRes.json(); // Process fetched menus

        // Map Supabase product data to client-side Product interface
        const mappedProducts: Product[] = fetchedProductsData.map((p: any) => ({
          ...p,
          brand: p.brand_name, // Map brand_name from DB to 'brand' for client
          brandId: p.brand_id, // Keep brand_id for potential use
          brandLogoUrl: p.brand_logo_url,
        }));
        
        // Map Supabase settings data to client-side GlobalSettings interface
        const mappedSettings: GlobalSettings = {
          heroImageUrl: fetchedSettings.heroImageUrl || DEFAULT_HERO_IMAGE_URL,
          whatsappPhoneNumber: fetchedSettings.whatsappPhoneNumber || DEFAULT_WHATSAPP_PHONE_NUMBER,
          footerContent: fetchedSettings.footerContent || DEFAULT_FOOTER_CONTENT,
          dealZoneConfig: fetchedSettings.dealZoneConfig || DEFAULT_DEAL_ZONE_CONFIG,
        };

        setProducts(mappedProducts);
        setBrands(fetchedBrandsData);
        setSales(fetchedSalesData);
        setMenus(fetchedMenusData); // Set menus state
        setHeroImageUrl(mappedSettings.heroImageUrl);
        setWhatsappPhoneNumber(mappedSettings.whatsappPhoneNumber);
        setFooterContent(mappedSettings.footerContent);
        setDealZoneConfig(mappedSettings.dealZoneConfig);

      } catch (err: any) {
        console.warn('Error fetching initial data:', err);
        setError(`Error al cargar los datos iniciales: ${err.message || 'Error de red desconocido'}. Usando datos predeterminados.`);
        // Fallback to default constants if API fails
        setProducts(PRODUCTS_DATA as Product[]); // Cast as Product[] for consistency
        setBrands(INITIAL_BRANDS_DATA as Brand[]); // Cast as Brand[]
        setSales(INITIAL_SALES_DATA as Sale[]); // Cast as Sale[]
        setMenus(DEFAULT_MENU_ITEMS as MenuItem[]); // Fallback for menus
        setHeroImageUrl(DEFAULT_HERO_IMAGE_URL);
        setWhatsappPhoneNumber(DEFAULT_WHATSAPP_PHONE_NUMBER);
        setFooterContent(DEFAULT_FOOTER_CONTENT);
        setDealZoneConfig(DEFAULT_DEAL_ZONE_CONFIG);
        // Don't show alert in development to avoid blocking the UI
        // alert(`Error al cargar los datos iniciales del servidor. Puede que algunas funcionalidades no estén disponibles. Detalle: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Cart items state (local, derived from products fetched from DB)
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const toggleCart = useCallback(() => {
    setIsCartOpen((prev) => !prev);
  }, []);

  const toggleSearchModal = useCallback(() => {
    setIsSearchModal((prev) => !prev);
  }, []);

  const openCustomerInfoModal = useCallback(() => {
    setIsCustomerInfoModalOpen(true);
  }, []);

  const closeCustomerInfoModal = useCallback(() => {
    setIsCustomerInfoModalOpen(false);
    setPendingOrder(null);
  }, []);

  const handleOpenProductSelectionModal = useCallback((product: Product) => {
    setSelectedProductForModal(product);
    setIsProductSelectionModalOpen(true);
  }, []);

  const handleCloseProductSelectionModal = useCallback(() => {
    setIsProductSelectionModalOpen(false);
    setSelectedProductForModal(null);
  }, []);

  const addProduct = useCallback(async (newProduct: Omit<Product, 'id'>) => {
    try {
      const res = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct),
      });
      if (!res.ok) throw new Error('Failed to add product');
      const addedProduct = await res.json();
      setProducts(prevProducts => (prevProducts ? [...prevProducts, {
        ...addedProduct,
        brand: addedProduct.brand_name, // Map back for client
        brandId: addedProduct.brand_id,
        brandLogoUrl: addedProduct.brand_logo_url,
      }] : [{
        ...addedProduct,
        brand: addedProduct.brand_name,
        brandId: addedProduct.brand_id,
        brandLogoUrl: addedProduct.brand_logo_url,
      }]));
      alert('Producto añadido con éxito!');
    } catch (err) {
      console.error('Error adding product:', err);
      alert('Error al añadir el producto.');
    }
  }, []);

  const updateProduct = useCallback(async (updatedProduct: Product) => {
    try {
      // The `id` from `updatedProduct` is the client-facing ID which maps to Supabase's `id`.
      // The body sent to the API should not contain `id` as `id` is handled by the URL param.
      const { id, ...productDataToSend } = updatedProduct;
      const res = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productDataToSend),
      });
      if (!res.ok) throw new Error('Failed to update product');
      const updatedProductResponse = await res.json();
      setProducts(prevProducts => prevProducts ? prevProducts.map(p => p.id === updatedProduct.id ? {
        ...updatedProductResponse,
        brand: updatedProductResponse.brand_name,
        brandId: updatedProductResponse.brand_id,
        brandLogoUrl: updatedProductResponse.brand_logo_url,
      } : p) : []);
      alert('Producto actualizado con éxito!');
    } catch (err) {
      console.error('Error updating product:', err);
      alert('Error al actualizar el producto.');
    }
  }, []);

  const deleteProduct = useCallback(async (productId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/products/${productId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete product');
      setProducts(prevProducts => prevProducts ? prevProducts.filter(p => p.id !== productId) : []);
      alert('Producto eliminado con éxito!');
    } catch (err) {
      console.error('Error deleting product:', err);
      alert('Error al eliminar el producto.');
    }
  }, []);

  const updateProductsBulk = useCallback(async (newProductsArray: Product[]) => {
    try {
      // For bulk update, we send an array of products, expecting `id` to be present for filtering
      const res = await fetch(`${API_BASE_URL}/products/bulk`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProductsArray),
      });
      
      // Check if response is valid JSON (not TypeScript code)
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('API no disponible en desarrollo local, usando datos en memoria');
      }
      
      if (!res.ok) throw new Error('Failed to bulk update products');
      
      // Re-fetch products to ensure state is fully consistent after bulk operation
      const productsRes = await fetch(`${API_BASE_URL}/products`);
      const productsContentType = productsRes.headers.get('content-type');
      
      if (!productsContentType || !productsContentType.includes('application/json')) {
        throw new Error('API no disponible en desarrollo local');
      }
      
      const updatedFetchedProductsData = await productsRes.json();
      const mappedUpdatedProducts: Product[] = updatedFetchedProductsData.map((p: any) => ({
        ...p,
        brand: p.brand_name,
        brandId: p.brand_id,
        brandLogoUrl: p.brand_logo_url,
      }));
      setProducts(mappedUpdatedProducts);
      alert('Precios actualizados masivamente con éxito!');
    } catch (err: any) {
      console.warn('Error bulk updating products (usando datos locales):', err);
      // Fallback: update products locally
      setProducts(prevProducts => {
        if (!prevProducts) return [];
        const updatedMap = new Map(newProductsArray.map(p => [p.id, p]));
        return prevProducts.map(p => updatedMap.get(p.id) || p);
      });
      alert('Precios actualizados localmente (desarrollo local - cambios no persistirán)');
    }
  }, []);

  const addProductsBulk = useCallback(async (newProductsArray: Omit<Product, 'id'>[]) => {
    if (newProductsArray.length === 0) return [];
    try {
      const res = await fetch(`${API_BASE_URL}/products/bulk-create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProductsArray),
      });
      
      // Check if response is valid JSON (not TypeScript code)
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('API no disponible en desarrollo local, usando datos en memoria');
      }
      
      if (!res.ok) throw new Error('Failed to bulk create products');
      
      const addedProducts = await res.json();
      const mappedAddedProducts: Product[] = addedProducts.map((p: any) => ({
        ...p,
        brand: p.brand_name,
        brandId: p.brand_id,
        brandLogoUrl: p.brand_logo_url,
      }));
      setProducts(prevProducts => prevProducts ? [...prevProducts, ...mappedAddedProducts] : [...mappedAddedProducts]);
      return mappedAddedProducts;
    } catch (err: any) {
      console.warn('Error bulk creating products (usando datos locales):', err);
      // Fallback: add products locally with generated IDs
      const localProducts: Product[] = newProductsArray.map((p, index) => ({
        ...p,
        id: `local-${Date.now()}-${index}`,
        brand: p.brand || '',
        brandId: undefined,
        brandLogoUrl: p.brandLogoUrl,
      }));
      setProducts(prevProducts => prevProducts ? [...prevProducts, ...localProducts] : [...localProducts]);
      console.log(`Se agregaron ${localProducts.length} productos localmente (desarrollo)`);
      return localProducts;
    }
  }, []);

  const addBrand = useCallback(async (newBrand: Omit<Brand, 'id'>) => {
    try {
      const res = await fetch(`${API_BASE_URL}/brands`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBrand),
      });
      if (!res.ok) throw new Error('Failed to add brand');
      const addedBrand = await res.json();
      setBrands(prevBrands => (prevBrands ? [...prevBrands, addedBrand] : [addedBrand]));
      alert('Marca añadida con éxito!');
    } catch (err) {
      console.error('Error adding brand:', err);
      alert('Error al añadir la marca.');
    }
  }, []);

  const updateBrand = useCallback(async (updatedBrand: Brand) => {
    try {
      const { id, ...brandDataToSend } = updatedBrand;
      const res = await fetch(`${API_BASE_URL}/brands/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(brandDataToSend),
      });
      if (!res.ok) throw new Error('Failed to update brand');
      const updatedBrandResponse = await res.json();
      setBrands(prevBrands => prevBrands ? prevBrands.map(b => b.id === updatedBrand.id ? updatedBrandResponse : b) : []);
      // Also update products that use this brand to reflect the new logoUrl
      setProducts(prevProducts => prevProducts ? prevProducts.map(p =>
        p.brand === updatedBrandResponse.name ? { ...p, brandLogoUrl: updatedBrandResponse.logoUrl } : p
      ) : []);
      alert('Marca actualizada con éxito!');
    } catch (err) {
      console.error('Error updating brand:', err);
      alert('Error al actualizar la marca.');
    }
  }, []);

  const deleteBrand = useCallback(async (brandId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/brands/${brandId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete brand');
      setBrands(prevBrands => prevBrands ? prevBrands.filter(b => b.id !== brandId) : []);
      // Find the name of the deleted brand to update products
      const deletedBrandName = brands?.find(b => b.id === brandId)?.name;
      setProducts(prevProducts => prevProducts ? prevProducts.map(p => {
        return (deletedBrandName && p.brand === deletedBrandName)
          ? { ...p, brandId: undefined, brandLogoUrl: undefined } // Remove logo if brand is deleted
          : p;
      }) : []);
      alert('Marca eliminada con éxito!');
    } catch (err) {
      console.error('Error deleting brand:', err);
      alert('Error al eliminar la marca.');
    }
  }, [brands]);

  // Menu item CRUD operations
  const addMenu = useCallback(async (newMenuItem: Omit<MenuItem, 'id'>) => {
    try {
      const res = await fetch(`${API_BASE_URL}/menus`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMenuItem),
      });
      if (!res.ok) throw new Error('Failed to add menu item');
      const addedMenu = await res.json();
      setMenus(prevMenus => (prevMenus ? [...prevMenus, addedMenu].sort((a,b) => a.order - b.order) : [addedMenu]));
      alert('Elemento de menú añadido con éxito!');
    } catch (err) {
      console.error('Error adding menu item:', err);
      alert('Error al añadir el elemento de menú.');
    }
  }, []);

  const updateMenu = useCallback(async (updatedMenuItem: MenuItem) => {
    try {
      const { id, ...menuDataToSend } = updatedMenuItem;
      const res = await fetch(`${API_BASE_URL}/menus/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(menuDataToSend),
      });
      if (!res.ok) throw new Error('Failed to update menu item');
      const updatedMenuResponse = await res.json();
      setMenus(prevMenus => prevMenus ? prevMenus.map(m => m.id === updatedMenuItem.id ? updatedMenuResponse : m).sort((a,b) => a.order - b.order) : []);
      alert('Elemento de menú actualizado con éxito!');
    } catch (err) {
      console.error('Error updating menu item:', err);
      alert('Error al actualizar el elemento de menú.');
    }
  }, []);

  const deleteMenu = useCallback(async (menuId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/menus/${menuId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete menu item');
      setMenus(prevMenus => prevMenus ? prevMenus.filter(m => m.id !== menuId) : []);
      alert('Elemento de menú eliminado con éxito!');
    } catch (err) {
      console.error('Error deleting menu item:', err);
      alert('Error al eliminar el elemento de menú.');
    }
  }, []);


  const addToCart = useCallback((product: Product) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id);
      if (existingItem) {
        return prevItems.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [...prevItems, { ...product, quantity: 1 }];
      }
    });
    // setIsCartOpen(true); // Don't open cart here, modal handles confirmation
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    setCartItems((prevItems) => {
      if (quantity <= 0) {
        return prevItems.filter((item) => item.id !== productId);
      }
      return prevItems.map((item) =>
        item.id === productId ? { ...item, quantity: quantity } : item
      );
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== productId));
  }, []);

  const handleUpdateSettings = useCallback(async (key: keyof GlobalSettings, value: any) => {
    try {
      // Ensure we have current settings to merge with, using defaults if not yet loaded
      const currentSettings: GlobalSettings = {
        heroImageUrl: heroImageUrl || DEFAULT_HERO_IMAGE_URL,
        whatsappPhoneNumber: whatsappPhoneNumber || DEFAULT_WHATSAPP_PHONE_NUMBER,
        footerContent: footerContent || DEFAULT_FOOTER_CONTENT,
        dealZoneConfig: dealZoneConfig || DEFAULT_DEAL_ZONE_CONFIG,
      };
      
      const updatedSettings = { ...currentSettings, [key as string]: value };

      const res = await fetch(`${API_BASE_URL}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSettings),
      });
      if (!res.ok) throw new Error('Failed to update setting');
      const responseData = await res.json();
      // Update individual states with the response from the server
      setHeroImageUrl(responseData.heroImageUrl);
      setWhatsappPhoneNumber(responseData.whatsappPhoneNumber);
      setFooterContent(responseData.footerContent);
      setDealZoneConfig(responseData.dealZoneConfig);
      alert('Configuración actualizada con éxito!');
    } catch (err) {
      console.error(`Error updating ${String(key)} setting:`, err);
      alert(`Error al actualizar la configuración de ${String(key)}.`);
    }
  }, [heroImageUrl, whatsappPhoneNumber, footerContent, dealZoneConfig]);

  const handleUpdateHeroImage: HeroImageUpdateFunction = useCallback((url: string) => {
    handleUpdateSettings('heroImageUrl', url);
  }, [handleUpdateSettings]);

  const handleUpdatePhoneNumber: PhoneNumberUpdateFunction = useCallback((phoneNumber: string) => {
    handleUpdateSettings('whatsappPhoneNumber', phoneNumber);
  }, [handleUpdateSettings]);

  const handleUpdateFooterContent: FooterUpdateFunction = useCallback((newContent: FooterContent) => {
    handleUpdateSettings('footerContent', newContent);
  }, [handleUpdateSettings]);

  const handleUpdateDealZoneConfig: DealZoneConfigUpdateFunction = useCallback((newConfig: DealZoneConfig) => {
    handleUpdateSettings('dealZoneConfig', newConfig);
  }, [handleUpdateSettings]);

  const addSale = useCallback(async (newSale: Omit<Sale, 'id'>) => {
    try {
      const res = await fetch(`${API_BASE_URL}/sales`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSale),
      });
      if (!res.ok) throw new Error('Failed to add sale');
      const addedSale = await res.json();
      setSales(prevSales => (prevSales ? [...prevSales, addedSale] : [addedSale]));
      alert('Venta registrada con éxito!');
    } catch (err) {
      console.error('Error adding sale:', err);
      alert('Error al registrar la venta.');
    }
  }, []);

  const initiateOrder = useCallback((products: Sale['products'], total: number) => {
    setPendingOrder({ products, total });
    openCustomerInfoModal();
  }, [openCustomerInfoModal]);


  const handleCustomerInfoConfirmed = useCallback(async (customerName: string) => {
    if (!pendingOrder) return;

    const newSale: Omit<Sale, 'id'> = { // Backend will generate _id
      customerName: customerName,
      total: pendingOrder.total,
      status: 'Pendiente',
      date: new Date().toISOString(),
      products: pendingOrder.products,
    };

    await addSale(newSale); // Use the async addSale function

    let message = `¡Hola ${customerName}! Me gustaría hacer un pedido con los siguientes productos:\n\n`;
    pendingOrder.products.forEach((item) => {
      message += `- ${item.name} (x${item.quantity}) - $${(item.price * item.quantity).toFixed(2)}\n`;
    });
    message += `\nTotal del pedido: $${pendingOrder.total.toFixed(2)}\n`;
    message += 'Por favor, confírmame la disponibilidad y cómo puedo proceder con el pago. ¡Gracias!';

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${whatsappPhoneNumber}?text=${encodedMessage}`;

    window.open(whatsappUrl, '_blank');

    setPendingOrder(null);
    closeCustomerInfoModal();
    setCartItems([]);
  }, [pendingOrder, addSale, whatsappPhoneNumber, closeCustomerInfoModal]);


  const totalItemsInCart = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Show loading spinner if data is not yet loaded
  if (loading || products === null || brands === null || sales === null || menus === null || heroImageUrl === null || whatsappPhoneNumber === null || footerContent === null || dealZoneConfig === null) {
    return <LoadingSpinner />;
  }

  // Filter menus by location
  const headerMenus = menus.filter(m => m.location === 'header-desktop').sort((a,b) => a.order - b.order);
  const mobileMenus = menus.filter(m => m.location === 'mobile-navbar').sort((a,b) => a.order - b.order);
  const adminMenus = menus.filter(m => m.location === 'admin-sidebar').sort((a,b) => a.order - b.order);
  const footerInfoMenus = menus.filter(m => m.location === 'footer-info').sort((a,b) => a.order - b.order);
  const footerAccountMenus = menus.filter(m => m.location === 'footer-account').sort((a,b) => a.order - b.order);


  return (
    <div className={`flex flex-col min-h-screen ${!isAdminRoute ? 'pb-16' : 'pb-0'} bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100`}>
      {!isAdminRoute && 
        <Header 
          toggleCart={toggleCart} 
          cartItems={cartItems} 
          whatsappPhoneNumber={whatsappPhoneNumber} 
          toggleSearchModal={toggleSearchModal} 
          headerMenus={headerMenus} // Pass header menus
        />
      }

      {isAdminRoute ? (
        <div className="flex flex-1">
          <AdminSidebar adminMenus={adminMenus} /> {/* Pass admin menus */}
          <main className="flex-1 flex flex-col overflow-hidden">
            <Routes>
              <Route path="/admin" element={<AdminDashboardPage totalProducts={products.length} />} />
              <Route
                path="/admin/products"
                element={
                  <AdminProductManagementPage
                    products={products}
                    brands={brands}
                    onAddProduct={addProduct}
                    onUpdateProduct={updateProduct}
                    onDeleteProduct={deleteProduct}
                  />
                }
              />
              <Route
                path="/admin/brands"
                element={
                  <AdminBrandManagementPage
                    brands={brands}
                    onAddBrand={addBrand}
                    onUpdateBrand={updateBrand}
                    onDeleteBrand={deleteBrand}
                  />
                }
              />
              <Route
                path="/admin/prices"
                element={
                  <AdminPriceManagementPage
                    products={products}
                    brands={brands} // Pass brands for new product creation lookup
                    onUpdateProductsBulk={updateProductsBulk}
                    onAddProductsBulk={addProductsBulk} // New prop
                  />
                }
              />
              <Route path="/admin/sales" element={<AdminSalesPage salesData={sales} />} />
              <Route
                path="/admin/settings"
                element={
                  <AdminSettingsPage
                    heroImageUrl={heroImageUrl}
                    onUpdateHeroImage={handleUpdateHeroImage}
                    whatsappPhoneNumber={whatsappPhoneNumber}
                    onUpdatePhoneNumber={handleUpdatePhoneNumber}
                    footerContent={footerContent}
                    onUpdateFooterContent={handleUpdateFooterContent}
                    dealZoneConfig={dealZoneConfig}
                    onUpdateDealZoneConfig={handleUpdateDealZoneConfig}
                  />
                }
              />
              <Route
                path="/admin/menus" // New route for menu management
                element={
                  <AdminMenuManagementPage
                    menus={menus}
                    onAddMenu={addMenu}
                    onUpdateMenu={updateMenu}
                    onDeleteMenu={deleteMenu}
                  />
                }
              />
            </Routes>
          </main>
        </div>
      ) : (
        <main className="flex-grow">
          <Routes>
            <Route
              path="/"
              element={
                <HomePage
                  onAddToCart={addToCart}
                  heroImageUrl={heroImageUrl}
                  whatsappPhoneNumber={whatsappPhoneNumber}
                  dealZoneConfig={dealZoneConfig}
                  products={products} // Pass all products for variations
                  onInitiateOrder={initiateOrder}
                  onOpenProductSelectionModal={handleOpenProductSelectionModal} // Pass new prop
                />
              }
            />
          </Routes>
        </main>
      )}

      {!isAdminRoute && <Footer footerContent={footerContent} footerInfoMenus={footerInfoMenus} footerAccountMenus={footerAccountMenus} />} {/* Pass footer menus */}

      <SidebarCart
        isOpen={isCartOpen}
        toggleCart={toggleCart}
        cartItems={cartItems}
        updateQuantity={updateQuantity}
        removeFromCart={removeFromCart}
        whatsappPhoneNumber={whatsappPhoneNumber}
        onInitiateOrder={initiateOrder}
      />

      {!isAdminRoute && <MobileNavbar toggleCart={toggleCart} totalItemsInCart={totalItemsInCart} toggleSearchModal={toggleSearchModal} mobileMenus={mobileMenus} />} {/* Pass mobile menus */}

      <SearchModal isOpen={isSearchModalOpen} onClose={toggleSearchModal} products={products} />

      <CustomerInfoModal
        isOpen={isCustomerInfoModalOpen}
        onClose={closeCustomerInfoModal}
        onConfirm={handleCustomerInfoConfirmed}
      />

      {/* New ProductSelectionModal */}
      <ProductSelectionModal
        isOpen={isProductSelectionModalOpen}
        onClose={handleCloseProductSelectionModal}
        product={selectedProductForModal} // The base product to display variations for
        allProducts={products} // All products to find variations from
        onAddToCart={addToCart}
        whatsappPhoneNumber={whatsappPhoneNumber}
        onInitiateOrder={initiateOrder}
      />
    </div>
  );
};

export default App;