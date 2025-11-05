import React, { useState, useCallback, useEffect } from 'react';
import { Routes, Route, useLocation, Navigate, useNavigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import SidebarCart from './components/SidebarCart';
import MobileNavbar from './components/MobileNavbar';
import SearchModal from './components/SearchModal';
import AdminSidebar from './components/AdminSidebar';
import FloatingCartButton from './components/FloatingCartButton';
import ProductAddedToast from './components/ProductAddedToast';
import InstallPrompt from './components/InstallPrompt';
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminProductManagementPage from './pages/AdminProductManagementPage';
import AdminBrandManagementPage from './pages/AdminBrandManagementPage';
import AdminPriceManagementPage from './pages/AdminPriceManagementPage';
import AdminSalesPage from './pages/AdminSalesPage';
import AdminSettingsPage from './pages/AdminSettingsPage';
import AdminMenuManagementPage from './pages/AdminMenuManagementPage'; // New Admin page
import AdminCategoryManagementPage from './pages/AdminCategoryManagementPage';
import AdminUsersManagementPage from './pages/AdminUsersManagementPage';
import AdminCraneQuotePage from './pages/AdminCraneQuotePage';
import CustomerInfoModal from './components/CustomerInfoModal';
import LoadingSpinner from './components/LoadingSpinner'; // Import new component
import ProductSelectionModal from './components/ProductSelectionModal'; // Import new component
import PopupModal from './components/PopupModal';
import { useToast } from './contexts/ToastContext';
import AdminLoginModal from './components/AdminLoginModal';
import AccountPage from './pages/AccountPage';
import { ADMIN_USERNAME, ADMIN_PASSWORD, ADMIN_DISPLAY_NAME } from './config/auth';

import { Product, CartItem, HeroImageUpdateFunction, PhoneNumberUpdateFunction, FooterContent, FooterUpdateFunction, DealZoneConfig, DealZoneConfigUpdateFunction, Sale, Brand, GlobalSettings, MenuItem, Category, Popup, CraneQuoteConfig } from './types';
import {
  DEFAULT_HERO_IMAGE_URL,
  DEFAULT_WHATSAPP_PHONE_NUMBER,
  DEFAULT_FOOTER_CONTENT,
  DEFAULT_DEAL_ZONE_CONFIG,
  DEFAULT_SITE_NAME,
  DEFAULT_SITE_LOGO,
  TireIcon,
  WheelIcon,
  AccessoryIcon,
  ValveSensorIcon
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
  const [categories, setCategories] = useState<Category[] | null>(null); // New state for categories
  const [heroImageUrl, setHeroImageUrl] = useState<string | null>(null);
  const [whatsappPhoneNumber, setWhatsappPhoneNumber] = useState<string | null>(null);
  const [footerContent, setFooterContent] = useState<FooterContent | null>(null);
  const [dealZoneConfig, setDealZoneConfig] = useState<DealZoneConfig | null>(null);
  const [siteName, setSiteName] = useState<string>(DEFAULT_SITE_NAME);
  const [siteLogo, setSiteLogo] = useState<string>(DEFAULT_SITE_LOGO);
  const [craneQuoteConfig, setCraneQuoteConfig] = useState<CraneQuoteConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [popups, setPopups] = useState<Popup[]>([]);
  const [activePopup, setActivePopup] = useState<Popup | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  // State for the new ProductSelectionModal
  const [isProductSelectionModalOpen, setIsProductSelectionModalOpen] = useState(false);
  const [selectedProductForModal, setSelectedProductForModal] = useState<Product | null>(null);

  const location = useLocation();
  const navigate = useNavigate();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const { showSuccess, showError, showWarning, showInfo } = useToast();

  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    if (typeof window === 'undefined') {
      return false;
    }
    return sessionStorage.getItem('admin-authenticated') === 'true';
  });

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const openAdminLogin = useCallback(() => {
    setIsAdminLoginOpen(true);
  }, []);

  const closeAdminLogin = useCallback(() => {
    setIsAdminLoginOpen(false);
  }, []);

  const handleAdminAuthenticate = useCallback(async ({ username, password }: { username: string; password: string }) => {
    const sanitizedUsername = username.trim();
    const sanitizedPassword = password.trim();

    try {
      const res = await fetch(`${API_BASE_URL}/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: sanitizedUsername,
          password: sanitizedPassword,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        showError(error.error || 'Usuario o contraseña incorrectos.');
        throw new Error(error.error || 'Usuario o contraseña incorrectos.');
      }

      const data = await res.json();
      if (data.success && data.user) {
        setIsAdminAuthenticated(true);
        showSuccess(`Bienvenido ${data.user.display_name || data.user.username}.`);
        closeAdminLogin();
        navigate('/admin');
        return true;
      }

      showError('Usuario o contraseña incorrectos.');
      throw new Error('Usuario o contraseña incorrectos.');
    } catch (err: any) {
      console.error('Error en autenticación:', err);
      if (err.message && err.message !== 'Usuario o contraseña incorrectos.') {
        showError('Error al verificar credenciales. Intenta nuevamente.');
      }
      throw err;
    }
  }, [closeAdminLogin, navigate, showError, showSuccess]);

  const handleAdminLogout = useCallback(() => {
    setIsAdminAuthenticated(false);
    showInfo('Sesión administrativa cerrada.');
    navigate('/');
  }, [navigate, showInfo]);

  const handleAccountAccess = useCallback(() => {
    if (isAdminAuthenticated) {
      navigate('/admin');
      return;
    }
    navigate('/account');
    openAdminLogin();
  }, [isAdminAuthenticated, navigate, openAdminLogin]);

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

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    if (isAdminAuthenticated) {
      sessionStorage.setItem('admin-authenticated', 'true');
    } else {
      sessionStorage.removeItem('admin-authenticated');
    }
  }, [isAdminAuthenticated]);

  useEffect(() => {
    if (isAdminRoute && !isAdminAuthenticated) {
      setIsAdminLoginOpen(true);
      showWarning('Ingresa tus credenciales de administrador para acceder al panel.');
    }
  }, [isAdminRoute, isAdminAuthenticated, showWarning]);

  // Removed auto-open login modal - users can access /account directly and click button to login

  // Initial data fetching
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Add timeout to prevent hanging - reducido a 3 segundos
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

        const productsPromise = fetch(`${API_BASE_URL}/products`, { signal: controller.signal, timeout: 3000 }).catch(() => null);
        const brandsPromise = fetch(`${API_BASE_URL}/brands`, { signal: controller.signal, timeout: 3000 }).catch(() => null);
        const salesPromise = fetch(`${API_BASE_URL}/sales`, { signal: controller.signal, timeout: 3000 }).catch(() => null);
        const menusPromise = fetch(`${API_BASE_URL}/menus`, { signal: controller.signal, timeout: 3000 }).catch(() => null);
        const categoriesPromise = fetch(`${API_BASE_URL}/categories`, { signal: controller.signal, timeout: 3000 }).catch(() => null);
        const popupsPromise = fetch(`${API_BASE_URL}/popups?active=true`, { signal: controller.signal, timeout: 3000 }).catch(() => null);
        const craneQuotePromise = fetch(`${API_BASE_URL}/crane-quote`, { signal: controller.signal, timeout: 3000 }).catch(() => null);

        const [productsRes, brandsRes, salesRes, menusRes, categoriesRes, popupsRes, craneQuoteRes] = await Promise.all([
          productsPromise, brandsPromise, salesPromise, menusPromise, categoriesPromise, popupsPromise, craneQuotePromise
        ]);

        clearTimeout(timeoutId);
        const failedResources: string[] = [];

        const fetchedProductsData = productsRes && productsRes.ok ? await productsRes.json() : [];
        if (!productsRes || !productsRes.ok) {
          failedResources.push('productos');
        }

        const fetchedBrandsData = brandsRes && brandsRes.ok ? await brandsRes.json() : [];
        if (!brandsRes || !brandsRes.ok) {
          failedResources.push('marcas');
        }

        const fetchedSalesData = salesRes && salesRes.ok ? await salesRes.json() : [];
        if (!salesRes || !salesRes.ok) {
          failedResources.push('ventas');
        }

        const fetchedMenusData = menusRes && menusRes.ok ? await menusRes.json() : [];
        if (!menusRes || !menusRes.ok) {
          failedResources.push('menús');
        }

        const fetchedCategoriesData = categoriesRes && categoriesRes.ok ? await categoriesRes.json() : [];
        if (!categoriesRes || !categoriesRes.ok) {
          failedResources.push('categorías');
        }

        const fetchedPopups = popupsRes && popupsRes.ok ? await popupsRes.json() : [];
        if (!popupsRes || !popupsRes.ok) {
          // Popups no son críticos, no agregar a failedResources
        }

        let fetchedCraneQuoteConfig = null;
        if (craneQuoteRes && craneQuoteRes.ok) {
          try {
            fetchedCraneQuoteConfig = await craneQuoteRes.json();
            console.log('[App] Crane quote config loaded:', fetchedCraneQuoteConfig);
          } catch (e) {
            console.error('[App] Error parsing crane quote config:', e);
          }
        }
        if (!craneQuoteRes || !craneQuoteRes.ok) {
          console.warn('[App] Crane quote config not loaded, using defaults');
          // Crane quote no es crítico
        }

        // Cargar configuraciones individuales
        const heroImageRes = await fetch(`${API_BASE_URL}/settings?key=heroImageUrl`).catch(() => null);
        const whatsappRes = await fetch(`${API_BASE_URL}/settings?key=whatsappPhoneNumber`).catch(() => null);
        const footerRes = await fetch(`${API_BASE_URL}/settings?key=footer`).catch(() => null);
        const offerZoneRes = await fetch(`${API_BASE_URL}/settings?key=offer_zone`).catch(() => null);
        const siteNameRes = await fetch(`${API_BASE_URL}/settings?key=siteName`).catch(() => null);
        const siteLogoRes = await fetch(`${API_BASE_URL}/settings?key=siteLogo`).catch(() => null);

        const heroImageData = heroImageRes && heroImageRes.ok ? await heroImageRes.json() : null;
        const whatsappData = whatsappRes && whatsappRes.ok ? await whatsappRes.json() : null;
        const footerData = footerRes && footerRes.ok ? await footerRes.json() : null;
        const offerZoneData = offerZoneRes && offerZoneRes.ok ? await offerZoneRes.json() : null;
        const siteNameData = siteNameRes && siteNameRes.ok ? await siteNameRes.json() : null;
        const siteLogoData = siteLogoRes && siteLogoRes.ok ? await siteLogoRes.json() : null;

        const fetchedSettings = {
          heroImageUrl: heroImageData?.value || DEFAULT_HERO_IMAGE_URL,
          whatsappPhoneNumber: whatsappData?.value || DEFAULT_WHATSAPP_PHONE_NUMBER,
          footerContent: footerData?.value || DEFAULT_FOOTER_CONTENT,
          dealZoneConfig: offerZoneData?.value || DEFAULT_DEAL_ZONE_CONFIG,
          siteName: siteNameData?.value || DEFAULT_SITE_NAME,
          siteLogo: siteLogoData?.value || DEFAULT_SITE_LOGO,
        };

        // Map Supabase product data to client-side Product interface
        const mappedProducts: Product[] = fetchedProductsData.map((p: any) => ({
          ...p,
          brand: p.brand_name,
          brandId: p.brand_id,
          brandLogoUrl: p.brand_logo_url,
        }));

        const mappedSales: Sale[] = fetchedSalesData.map((row: any) => ({
          ...row,
          total: Number(row.total),
        }));

        const mappedMenus: MenuItem[] = fetchedMenusData.map((menu: any) => ({
          ...menu,
          order: menu.order ?? 0,
        }));

        // Map Supabase settings data to client-side GlobalSettings interface
        const mappedSettings: GlobalSettings = {
          heroImageUrl: fetchedSettings?.heroImageUrl || DEFAULT_HERO_IMAGE_URL,
          whatsappPhoneNumber: fetchedSettings?.whatsappPhoneNumber || DEFAULT_WHATSAPP_PHONE_NUMBER,
          footerContent: fetchedSettings?.footerContent || DEFAULT_FOOTER_CONTENT,
          dealZoneConfig: fetchedSettings?.dealZoneConfig || DEFAULT_DEAL_ZONE_CONFIG,
        };

        // Map categories with icons based on iconType
        const iconMap: { [key: string]: React.ReactElement } = {
          tire: TireIcon,
          wheel: WheelIcon,
          accessory: AccessoryIcon,
          valve: ValveSensorIcon,
        };

        const mappedCategories: Category[] = fetchedCategoriesData.map((cat: any) => ({
          ...cat,
          icon: iconMap[cat.iconType || 'tire'] || TireIcon,
        }));

        setProducts(mappedProducts);
        setBrands(fetchedBrandsData);
        setSales(mappedSales);
        setMenus(mappedMenus);
        setCategories(mappedCategories);
        setHeroImageUrl(fetchedSettings.heroImageUrl);
        setWhatsappPhoneNumber(fetchedSettings.whatsappPhoneNumber);
        setFooterContent(fetchedSettings.footerContent);
        setDealZoneConfig(fetchedSettings.dealZoneConfig);
        setSiteName(fetchedSettings.siteName);
        setSiteLogo(fetchedSettings.siteLogo);
        setPopups(fetchedPopups || []);
        setCraneQuoteConfig(fetchedCraneQuoteConfig);
        console.log('[App] Crane quote config set to state:', fetchedCraneQuoteConfig);
        
        // Actualizar título de la página y manifest dinámicamente
        if (fetchedSettings.siteName) {
          document.title = fetchedSettings.siteName;
          // Actualizar manifest.json dinámicamente
          updateManifest(fetchedSettings.siteName, fetchedSettings.siteLogo);
        }

        // Determinar popup activo a mostrar
        if (fetchedPopups && fetchedPopups.length > 0) {
          const now = new Date();
          const validPopups = fetchedPopups.filter((popup: Popup) => {
            if (!popup.is_active || !popup.show_on_page_load) return false;
            if (popup.start_date && new Date(popup.start_date) > now) return false;
            if (popup.end_date && new Date(popup.end_date) < now) return false;
            return true;
          });

          if (validPopups.length > 0) {
            // Ordenar por prioridad y tomar el primero
            validPopups.sort((a: Popup, b: Popup) => (b.priority || 0) - (a.priority || 0));
            const popupToShow = validPopups[0];

            // Verificar si ya se mostró en esta sesión
            if (popupToShow.show_once_per_session) {
              const shownKey = `popup_shown_${popupToShow.id}`;
              if (!sessionStorage.getItem(shownKey)) {
                setActivePopup(popupToShow);
                setIsPopupOpen(true);
                sessionStorage.setItem(shownKey, 'true');
              }
            } else {
              setActivePopup(popupToShow);
              setIsPopupOpen(true);
            }
          }
        }

        if (failedResources.length > 0) {
          showWarning(`No se pudieron cargar completamente: ${failedResources.join(', ')}.`);
        } else {
          showSuccess('Datos cargados correctamente.');
        }
      } catch (err: any) {
        console.warn('Error fetching initial data:', err);
        const message = err?.name === 'AbortError'
          ? 'Se superó el tiempo de espera al cargar los datos.'
          : 'No se pudieron cargar los datos iniciales.';
        showError(`${message} Por favor, intenta nuevamente.`);
        setProducts([]);
        setBrands([]);
        setSales([]);
        setMenus([]);
        setCategories([]);
        setHeroImageUrl(DEFAULT_HERO_IMAGE_URL);
        setWhatsappPhoneNumber(DEFAULT_WHATSAPP_PHONE_NUMBER);
        setFooterContent(DEFAULT_FOOTER_CONTENT);
        setDealZoneConfig(DEFAULT_DEAL_ZONE_CONFIG);
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
      
      if (!res.ok) {
        // Intentar obtener el mensaje de error del servidor
        let errorMessage = 'Failed to add product';
        try {
          const errorData = await res.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (parseError) {
          // Si no se puede parsear el error, usar el status text
          errorMessage = `${res.status} ${res.statusText}`;
        }
        throw new Error(errorMessage);
      }
      
      const addedProduct = await res.json();
      const mappedProduct: Product = {
        ...addedProduct,
        brand: addedProduct.brand_name || addedProduct.brand,
        brandId: addedProduct.brand_id || addedProduct.brandId,
        brandLogoUrl: addedProduct.brand_logo_url || addedProduct.brandLogoUrl,
        isActive: addedProduct.is_active !== undefined ? addedProduct.is_active : addedProduct.isActive !== undefined ? addedProduct.isActive : true,
      };
      
      setProducts(prevProducts => prevProducts ? [...prevProducts, mappedProduct] : [mappedProduct]);
      showSuccess(`✅ Producto "${mappedProduct.name}" añadido correctamente`, 6000);
    } catch (err: any) {
      console.error('Error adding product:', err);
      const errorMessage = err?.message || 'Error desconocido';
      
      // Mensajes más específicos según el tipo de error
      if (errorMessage.includes('is_active') || errorMessage.includes('column')) {
        showError(`❌ Error de configuración: La columna 'is_active' no existe. Ejecuta la migración en Supabase.`);
      } else if (errorMessage.includes('duplicate') || errorMessage.includes('unique')) {
        showWarning(`⚠️ El SKU ya existe. Por favor, usa un SKU diferente.`);
      } else {
        showError(`❌ Error al añadir el producto: ${errorMessage}`);
      }
    }
  }, [showSuccess, showError]);

  const updateProduct = useCallback(async (updatedProduct: Product) => {
    try {
      // The `id` from `updatedProduct` is the client-facing ID which maps to Supabase's UUID.
      // The body sent to the API should not contain `id` as `id` is handled by the URL param.
      const { id, ...productDataToSend } = updatedProduct;
      const url = `${API_BASE_URL}/products/${id}`;
      
      console.log('[App] Update product request:', {
        url,
        method: 'PUT',
        productId: id,
        productName: updatedProduct.name,
        hasIsActive: 'isActive' in productDataToSend,
        isActive: productDataToSend.isActive,
        isOnSale: productDataToSend.isOnSale,
        salePrice: productDataToSend.salePrice,
        discountPercentage: productDataToSend.discountPercentage
      });
      
      const res = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productDataToSend),
      });
      
      console.log('[App] Update product response:', {
        status: res.status,
        statusText: res.statusText,
        contentType: res.headers.get('content-type'),
        ok: res.ok
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: `Error ${res.status}: ${res.statusText}` }));
        console.error('[App] Update product error:', errorData);
        
        // Si el error es sobre constraint de sale_price
        if (errorData.error?.includes('check_sale_price') || errorData.error?.includes('sale_price')) {
          throw new Error('El precio de oferta debe ser menor que el precio regular.');
        }
        
        throw new Error(errorData.error || errorData.message || `Error ${res.status}: ${res.statusText}`);
      }
      
      const updatedProductResponse = await res.json();
      console.log('[App] Update product success:', {
        id: updatedProductResponse.id,
        name: updatedProductResponse.name,
        hasIsActive: 'is_active' in updatedProductResponse,
        isActive: updatedProductResponse.is_active,
        isOnSale: updatedProductResponse.is_on_sale,
        salePrice: updatedProductResponse.sale_price
      });
      
      const mappedProduct: Product = {
        ...updatedProductResponse,
        brand: updatedProductResponse.brand_name || updatedProductResponse.brand,
        brandId: updatedProductResponse.brand_id || updatedProductResponse.brandId,
        brandLogoUrl: updatedProductResponse.brand_logo_url || updatedProductResponse.brandLogoUrl,
        isActive: updatedProductResponse.is_active !== undefined ? updatedProductResponse.is_active : updatedProductResponse.isActive !== undefined ? updatedProductResponse.isActive : true,
        isOnSale: updatedProductResponse.is_on_sale || false,
        salePrice: updatedProductResponse.sale_price ? Number(updatedProductResponse.sale_price) : undefined,
        discountPercentage: updatedProductResponse.discount_percentage || undefined,
      };
      
      setProducts(prevProducts => prevProducts ? prevProducts.map(p => p.id === updatedProduct.id ? mappedProduct : p) : []);
      showSuccess(`✅ Producto "${mappedProduct.name}" guardado y actualizado correctamente`, 6000);
    } catch (err: any) {
      console.error('[App] Error updating product:', err);
      const errorMessage = err?.message || 'Error desconocido';
      
      // Mensajes más específicos según el tipo de error
      if (errorMessage.includes('405') || errorMessage.includes('Method not allowed')) {
        showError(`❌ Error de conexión: El servidor no acepta esta petición. Intenta nuevamente.`);
      } else if (errorMessage.includes('is_active') || errorMessage.includes('column')) {
        showError(`❌ Error de configuración: La columna 'is_active' no existe. Ejecuta la migración en Supabase.`);
      } else if (errorMessage.includes('404') || errorMessage.includes('not found')) {
        showError(`❌ Producto no encontrado. Por favor, recarga la página.`);
      } else if (errorMessage.includes('sale_price') || errorMessage.includes('precio de oferta')) {
        showError(`❌ ${errorMessage}`);
      } else {
        showError(`❌ Error al actualizar el producto: ${errorMessage}`);
      }
      throw err; // Re-lanzar para que el componente pueda manejar el error
    }
  }, [showSuccess, showError]);

  const deleteProduct = useCallback(async (productId: string) => {
    try {
      const productToDelete = products?.find(p => p.id === productId);
      const res = await fetch(`${API_BASE_URL}/products/${productId}`, {
        method: 'DELETE',
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: 'Error desconocido' }));
        throw new Error(errorData.message || `Error ${res.status}: ${res.statusText}`);
      }
      
      setProducts(prevProducts => prevProducts ? prevProducts.filter(p => p.id !== productId) : []);
      showSuccess(`✅ Producto "${productToDelete?.name || 'eliminado'}" eliminado correctamente`, 5000);
    } catch (err: any) {
      console.error('Error deleting product:', err);
      showError(`❌ Error al eliminar el producto: ${err?.message || 'Error desconocido'}`);
    }
  }, [products, showSuccess, showError]);

  const updateProductsBulk = useCallback(async (newProductsArray: Product[]) => {
    try {
      // For bulk update, we send an array of products, expecting `id` to be present for filtering
      const res = await fetch(`${API_BASE_URL}/products/bulk`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProductsArray),
      });
      
      // Check if response is valid JSON
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        let errorMessage = 'Error al conectar con la API';
        try {
          const text = await res.text();
          if (text.includes('error') || text.includes('Error')) {
            errorMessage = `Error del servidor: ${res.status} ${res.statusText}`;
          }
        } catch (e) {
          // Ignore text parsing errors
        }
        throw new Error(errorMessage);
      }
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: `Error ${res.status}: ${res.statusText}` }));
        throw new Error(errorData.error || `Error ${res.status}: ${res.statusText}`);
      }
      
      // Re-fetch products to ensure state is fully consistent after bulk operation
      const productsRes = await fetch(`${API_BASE_URL}/products`);
      const productsContentType = productsRes.headers.get('content-type');
      
      if (!productsContentType || !productsContentType.includes('application/json')) {
        throw new Error('Error al obtener productos actualizados');
      }
      
      if (!productsRes.ok) {
        throw new Error(`Error ${productsRes.status}: ${productsRes.statusText}`);
      }
      
      const updatedFetchedProductsData = await productsRes.json();
      const mappedUpdatedProducts: Product[] = updatedFetchedProductsData.map((p: any) => ({
        ...p,
        brand: p.brand_name || p.brand,
        brandId: p.brand_id || p.brandId,
        brandLogoUrl: p.brand_logo_url || p.brandLogoUrl,
      }));
      setProducts(mappedUpdatedProducts);
      showSuccess('Precios actualizados masivamente con éxito!');
    } catch (err: any) {
      console.error('Error bulk updating products:', err);
      const errorMessage = err?.message || 'Error desconocido al actualizar productos';
      showError(`No se pudieron actualizar los precios: ${errorMessage}`);
      throw err;
    }
  }, [showSuccess, showError]);

  const addProductsBulk = useCallback(async (newProductsArray: Omit<Product, 'id'>[]) => {
    if (newProductsArray.length === 0) return [];
    try {
      // Usar /api/products y dejar que el servidor detecte automáticamente bulk-create
      const url = `${API_BASE_URL}/products?bulk=true`;
      console.log('[App] Bulk create request:', {
        url,
        method: 'POST',
        productCount: newProductsArray.length,
        sampleProduct: newProductsArray[0] ? {
          sku: newProductsArray[0].sku,
          name: newProductsArray[0].name,
          brand: newProductsArray[0].brand,
          hasIsActive: 'isActive' in newProductsArray[0],
          isActive: newProductsArray[0].isActive
        } : null
      });

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProductsArray),
      });
      
      console.log('[App] Bulk create response:', {
        status: res.status,
        statusText: res.statusText,
        contentType: res.headers.get('content-type'),
        ok: res.ok
      });
      
      // Check if response is valid JSON
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        // Try to get error message from response
        let errorMessage = 'Error al conectar con la API';
        try {
          const text = await res.text();
          if (text.includes('error') || text.includes('Error')) {
            errorMessage = `Error del servidor: ${res.status} ${res.statusText}`;
          }
        } catch (e) {
          // Ignore text parsing errors
        }
        const error = new Error(errorMessage);
        (error as any).status = res.status;
        throw error;
      }
      
      if (!res.ok) {
        let errorData: any = {};
        try {
          errorData = await res.json();
        } catch (parseError) {
          errorData = { error: `Error ${res.status}: ${res.statusText}` };
        }
        
        // Construir mensaje de error más detallado
        const errorMessage = errorData.error || errorData.message || `Error ${res.status}: ${res.statusText}`;
        const errorDetails = errorData.details || '';
        const errorCode = errorData.code || '';
        const errorHint = errorData.hint || '';
        
        const fullError = new Error(errorMessage);
        (fullError as any).details = errorDetails;
        (fullError as any).code = errorCode;
        (fullError as any).hint = errorHint;
        (fullError as any).status = res.status;
        
        throw fullError;
      }
      
      const addedProducts = await res.json();
      const mappedAddedProducts: Product[] = addedProducts.map((p: any) => ({
        ...p,
        brand: p.brand_name || p.brand,
        brandId: p.brand_id || p.brandId,
        brandLogoUrl: p.brand_logo_url || p.brandLogoUrl,
      }));
      
      // Re-fetch products to ensure state is fully consistent after bulk create
      // This ensures all products are up-to-date and properly formatted
      try {
        const productsRes = await fetch(`${API_BASE_URL}/products`);
        const productsContentType = productsRes.headers.get('content-type');
        
        if (productsContentType && productsContentType.includes('application/json') && productsRes.ok) {
          const fetchedProductsData = await productsRes.json();
          const mappedAllProducts: Product[] = fetchedProductsData.map((p: any) => ({
            ...p,
            brand: p.brand_name || p.brand,
            brandId: p.brand_id || p.brandId,
            brandLogoUrl: p.brand_logo_url || p.brandLogoUrl,
          }));
          setProducts(mappedAllProducts);
          console.log('[App] Products refreshed after bulk create:', mappedAllProducts.length, 'total products');
        } else {
          // Fallback: add the new products to existing state if re-fetch fails
          console.warn('[App] Re-fetch failed, using fallback state update');
          setProducts(prevProducts => prevProducts ? [...prevProducts, ...mappedAddedProducts] : [...mappedAddedProducts]);
        }
      } catch (fetchError) {
        // Fallback: add the new products to existing state if re-fetch fails
        console.error('[App] Error re-fetching products after bulk create:', fetchError);
        setProducts(prevProducts => prevProducts ? [...prevProducts, ...mappedAddedProducts] : [...mappedAddedProducts]);
      }
      
      return mappedAddedProducts;
    } catch (err: any) {
      console.error('Error bulk creating products:', err);
      console.error('Error details:', {
        message: err?.message,
        details: err?.details,
        code: err?.code,
        hint: err?.hint,
        status: err?.status
      });
      
      const errorMessage = err?.message || 'Error desconocido al crear productos';
      const errorDetails = err?.details || '';
      const errorCode = err?.code || '';
      const errorHint = err?.hint || '';
      
      // Construir mensaje de error más detallado
      let userMessage = '';
      
      if (errorMessage.includes('405') || errorMessage.includes('Method not allowed')) {
        userMessage = `❌ Error de conexión: El servidor rechazó la petición. Verifica que el endpoint esté disponible.`;
      } else if (errorMessage.includes('is_active') || errorMessage.includes('column') || errorMessage.includes('schema')) {
        userMessage = `❌ Error de configuración: La columna 'is_active' no existe. Ejecuta la migración en Supabase.`;
      } else if (errorMessage.includes('duplicate') || errorMessage.includes('SKUs sean únicos')) {
        userMessage = `❌ ${errorMessage}${errorDetails ? `\n\nDetalles: ${errorDetails}` : ''}`;
      } else if (errorMessage.includes('Marca no encontrada') || errorMessage.includes('foreign key')) {
        userMessage = `❌ ${errorMessage}${errorDetails ? `\n\nDetalles: ${errorDetails}` : ''}`;
      } else if (errorMessage.includes('Campos requeridos') || errorMessage.includes('null value')) {
        userMessage = `❌ ${errorMessage}${errorDetails ? `\n\nDetalles: ${errorDetails}` : ''}`;
      } else {
        userMessage = `❌ No se pudieron crear los productos: ${errorMessage}`;
        if (errorDetails) userMessage += `\n\nDetalles: ${errorDetails}`;
        if (errorHint) userMessage += `\n\n💡 Sugerencia: ${errorHint}`;
        if (errorCode) userMessage += `\n\nCódigo de error: ${errorCode}`;
      }
      
      showError(userMessage);
      throw err;
    }
  }, [showError]);

  const addBrand = useCallback(async (newBrand: Omit<Brand, 'id'>) => {
    try {
      const res = await fetch(`${API_BASE_URL}/brands`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBrand),
      });
      
      if (!res.ok) {
        // Intentar obtener el mensaje de error del servidor
        let errorMessage = 'Failed to add brand';
        try {
          const errorData = await res.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (parseError) {
          // Si no se puede parsear el error, usar el status text
          errorMessage = `${res.status} ${res.statusText}`;
        }
        
        // Mostrar notificación específica si la marca ya existe
        if (res.status === 409 || errorMessage.includes('Ya existe')) {
          showWarning(`La marca "${newBrand.name}" ya existe. Por favor, usa un nombre diferente.`);
          throw new Error(errorMessage);
        }
        
        throw new Error(errorMessage);
      }
      
      const addedBrand = await res.json();
      setBrands(prevBrands => (prevBrands ? [...prevBrands, addedBrand] : [addedBrand]));
      showSuccess(`Marca "${addedBrand.name}" añadida correctamente.`);
    } catch (err: any) {
      console.error('Error adding brand:', err);
      // Solo mostrar error si no se mostró antes (para evitar duplicados)
      if (!err?.message?.includes('Ya existe') && res?.status !== 409) {
        const errorMessage = err?.message || 'Error desconocido';
        showError(`Error al añadir la marca: ${errorMessage}`);
      }
    }
  }, [showSuccess, showError, showWarning]);

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
      showSuccess(`Marca "${updatedBrandResponse.name}" actualizada.`);
    } catch (err) {
      console.error('Error updating brand:', err);
      showError('Error al actualizar la marca.');
    }
  }, [showSuccess, showError]);

  const deleteBrand = useCallback(async (brandId: string) => {
    try {
      const deletedBrandName = brands?.find(b => b.id === brandId)?.name;
      const res = await fetch(`${API_BASE_URL}/brands?id=${brandId}`, {
        method: 'DELETE',
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: `Error ${res.status}: ${res.statusText}` }));
        throw new Error(errorData.error || errorData.message || `Error ${res.status}: ${res.statusText}`);
      }
      
      setBrands(prevBrands => prevBrands ? prevBrands.filter(b => b.id !== brandId) : []);
      // Update products that reference this brand
      setProducts(prevProducts => prevProducts ? prevProducts.map(p =>
        (deletedBrandName && p.brand === deletedBrandName)
          ? { ...p, brand: '', brandId: undefined, brandLogoUrl: undefined }
          : p
      ) : []);
      showSuccess(`✅ Marca "${deletedBrandName || 'eliminada'}" eliminada correctamente`, 5000);
    } catch (err: any) {
      console.error('Error deleting brand:', err);
      showError(`❌ Error al eliminar la marca: ${err?.message || 'Error desconocido'}`);
    }
  }, [brands, showSuccess, showError]);

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
      showSuccess('Elemento de menú añadido con éxito!');
    } catch (err) {
      console.error('Error adding menu item:', err);
      showError('Error al añadir el elemento de menú.');
    }
  }, [showSuccess, showError]);

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
      showSuccess('Elemento de menú actualizado con éxito!');
    } catch (err) {
      console.error('Error updating menu item:', err);
      showError('Error al actualizar el elemento de menú.');
    }
  }, [showSuccess, showError]);

  const deleteMenu = useCallback(async (menuId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/menus/${menuId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete menu item');
      setMenus(prevMenus => prevMenus ? prevMenus.filter(m => m.id !== menuId) : []);
      showSuccess('Elemento de menú eliminado con éxito!');
    } catch (err) {
      console.error('Error deleting menu item:', err);
      showError('Error al eliminar el elemento de menú.');
    }
  }, [showSuccess, showError]);


  const [lastAddedProduct, setLastAddedProduct] = useState<{ name: string; show: boolean } | null>(null);

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
    
    // Mostrar notificación de producto agregado
    setLastAddedProduct({ name: product.name, show: true });
    
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

  const handleUpdateSettings = useCallback(async (key: string, value: any) => {
    try {
      // Para heroImageUrl y whatsappPhoneNumber, necesitamos enviar como JSON string
      // porque el API espera JSONB y hace JSON.parse
      let valueToSend = value;
      if (key === 'heroImageUrl' || key === 'whatsappPhoneNumber') {
        // Si es un string simple, convertirlo a JSON string válido
        valueToSend = typeof value === 'string' ? JSON.stringify(value) : value;
      }
      
      const res = await fetch(`${API_BASE_URL}/settings?key=${encodeURIComponent(key)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key,
          value: valueToSend,
        }),
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: `Error ${res.status}: ${res.statusText}` }));
        throw new Error(errorData.error || 'Failed to update setting');
      }
      
      const responseData = await res.json();
      const settingValue = responseData.value;
      
      // Actualizar el estado correspondiente según la key
      if (key === 'heroImageUrl') {
        // Si es un objeto JSONB, extraer el valor
        const heroUrl = typeof settingValue === 'string' ? settingValue : (settingValue || heroImageUrl);
        setHeroImageUrl(heroUrl);
      } else if (key === 'whatsappPhoneNumber') {
        const phoneNumber = typeof settingValue === 'string' ? settingValue : (settingValue || whatsappPhoneNumber);
        setWhatsappPhoneNumber(phoneNumber);
      } else       if (key === 'footer') {
        setFooterContent(settingValue);
      } else if (key === 'offer_zone') {
        setDealZoneConfig(settingValue);
      } else if (key === 'siteName') {
        const siteNameValue = typeof settingValue === 'string' ? settingValue : (settingValue || DEFAULT_SITE_NAME);
        setSiteName(siteNameValue);
        document.title = siteNameValue;
        updateManifest(siteNameValue, siteLogo);
      } else if (key === 'siteLogo') {
        const siteLogoValue = typeof settingValue === 'string' ? settingValue : (settingValue || DEFAULT_SITE_LOGO);
        setSiteLogo(siteLogoValue);
        updateManifest(siteName, siteLogoValue);
      }
      
      showSuccess('Configuración actualizada con éxito!');
    } catch (err: any) {
      console.error(`Error updating ${key} setting:`, err);
      showError(`Error al actualizar la configuración: ${err?.message || 'Error desconocido'}`);
    }
  }, [showSuccess, showError, heroImageUrl, whatsappPhoneNumber, siteName, siteLogo]);
  
  // Función para actualizar el manifest dinámicamente
  const updateManifest = useCallback((name: string, logoUrl?: string) => {
    try {
      const manifestLink = document.querySelector('link[rel="manifest"]') as HTMLLinkElement;
      if (manifestLink) {
        fetch('/manifest.json')
          .then(res => res.json())
          .then(manifest => {
            manifest.name = name;
            manifest.short_name = name.length > 12 ? name.substring(0, 12) : name;
            if (logoUrl && logoUrl.trim() !== '') {
              // Si hay logo, actualizar iconos
              manifest.icons = [
                {
                  src: logoUrl,
                  sizes: "192x192",
                  type: "image/png",
                  purpose: "any maskable"
                },
                {
                  src: logoUrl,
                  sizes: "512x512",
                  type: "image/png",
                  purpose: "any maskable"
                }
              ];
            }
            const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            manifestLink.href = url;
          })
          .catch(err => console.error('Error updating manifest:', err));
      }
    } catch (error) {
      console.error('Error en updateManifest:', error);
    }
  }, []);

  const handleUpdateHeroImage: HeroImageUpdateFunction = useCallback((url: string) => {
    handleUpdateSettings('heroImageUrl', url);
  }, [handleUpdateSettings]);

  const handleUpdatePhoneNumber: PhoneNumberUpdateFunction = useCallback((phoneNumber: string) => {
    handleUpdateSettings('whatsappPhoneNumber', phoneNumber);
  }, [handleUpdateSettings]);

  const handleUpdateFooterContent: FooterUpdateFunction = useCallback((newContent: FooterContent) => {
    handleUpdateSettings('footer', newContent);
  }, [handleUpdateSettings]);

  const handleUpdateDealZoneConfig: DealZoneConfigUpdateFunction = useCallback((newConfig: DealZoneConfig) => {
    handleUpdateSettings('offer_zone', newConfig);
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
      showSuccess('Venta registrada con éxito!');
    } catch (err) {
      console.error('Error adding sale:', err);
      showError('Error al registrar la venta.');
    }
  }, [showSuccess, showError]);

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
    
    // Asegurarse de que el número de teléfono sea siempre una cadena válida
    const phoneNumber = String(
      (typeof whatsappPhoneNumber === 'string' && whatsappPhoneNumber) || 
      '+5492245506078'
    );
    const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;

    window.open(whatsappUrl, '_blank');

    setPendingOrder(null);
    closeCustomerInfoModal();
    setCartItems([]);
  }, [pendingOrder, addSale, whatsappPhoneNumber, closeCustomerInfoModal]);


  const totalItemsInCart = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Show loading spinner if data is not yet loaded
  // Mostrar spinner solo si todavía está cargando y no hay datos predeterminados
  if (loading && products === null && brands === null) {
    return <LoadingSpinner />;
  }
  
  // Usar valores predeterminados si los datos son null
  const finalProducts = products ?? [];
  const finalBrands = brands ?? [];
  const finalSales = sales ?? [];
  const finalMenus = menus ?? [];
  const finalCategories = categories ?? [];
  const finalHeroImageUrl = heroImageUrl || DEFAULT_HERO_IMAGE_URL;
  // Asegurarse de que finalWhatsappPhoneNumber sea siempre una cadena válida
  const finalWhatsappPhoneNumber = String(
    (typeof whatsappPhoneNumber === 'string' && whatsappPhoneNumber) || 
    (DEFAULT_WHATSAPP_PHONE_NUMBER || '+5492245506078')
  );
  const finalFooterContent: FooterContent = footerContent ? {
    aboutUsText: footerContent.aboutUsText || DEFAULT_FOOTER_CONTENT.aboutUsText,
    contactAddress: footerContent.contactAddress || DEFAULT_FOOTER_CONTENT.contactAddress,
    contactPhone: footerContent.contactPhone || DEFAULT_FOOTER_CONTENT.contactPhone,
    contactEmail: footerContent.contactEmail || DEFAULT_FOOTER_CONTENT.contactEmail,
    contactHours: footerContent.contactHours || DEFAULT_FOOTER_CONTENT.contactHours,
    copyrightText: footerContent.copyrightText || DEFAULT_FOOTER_CONTENT.copyrightText,
    socialMedia: footerContent.socialMedia || DEFAULT_FOOTER_CONTENT.socialMedia,
  } : DEFAULT_FOOTER_CONTENT;
  const finalDealZoneConfig = dealZoneConfig || DEFAULT_DEAL_ZONE_CONFIG;

  // Filter menus by location
  const headerMenus = finalMenus.filter(m => m.location === 'header-desktop').sort((a,b) => a.order - b.order);
  const mobileMenus = finalMenus.filter(m => m.location === 'mobile-navbar').sort((a,b) => a.order - b.order);
  
  // Menús admin con fallback si no hay datos en BD
  const defaultAdminMenus: MenuItem[] = [
    { id: 'admin-dashboard', name: 'Dashboard', path: '/admin', isExternal: false, order: 1, location: 'admin-sidebar', type: 'route' },
    { id: 'admin-products', name: 'Productos', path: '/admin/products', isExternal: false, order: 10, location: 'admin-sidebar', type: 'route' },
    { id: 'admin-brands', name: 'Marcas', path: '/admin/brands', isExternal: false, order: 20, location: 'admin-sidebar', type: 'route' },
    { id: 'admin-categories', name: 'Categorías', path: '/admin/categories', isExternal: false, order: 75, location: 'admin-sidebar', type: 'route' },
    { id: 'admin-prices', name: 'Precios', path: '/admin/prices', isExternal: false, order: 30, location: 'admin-sidebar', type: 'route' },
    { id: 'admin-sales', name: 'Ventas', path: '/admin/sales', isExternal: false, order: 40, location: 'admin-sidebar', type: 'route' },
    { id: 'admin-users', name: 'Usuarios', path: '/admin/users', isExternal: false, order: 70, location: 'admin-sidebar', type: 'route' },
    { id: 'admin-settings', name: 'Configuración', path: '/admin/settings', isExternal: false, order: 50, location: 'admin-sidebar', type: 'route' },
    { id: 'admin-menus', name: 'Menús', path: '/admin/menus', isExternal: false, order: 60, location: 'admin-sidebar', type: 'route' },
    { id: 'admin-crane-quote', name: 'Cotización de Grúa', path: '/admin/crane-quote', isExternal: false, order: 65, location: 'admin-sidebar', type: 'route' },
  ];
  
  const adminMenusFromDB = finalMenus.filter(m => m.location === 'admin-sidebar').sort((a,b) => a.order - b.order);
  // Asegurar que "Cotización de Grúa" siempre esté presente
  const craneQuoteMenu = defaultAdminMenus.find(m => m.id === 'admin-crane-quote');
  const hasCraneQuoteInDB = adminMenusFromDB.some(m => m.id === 'admin-crane-quote');
  const adminMenus = adminMenusFromDB.length > 0 
    ? (hasCraneQuoteInDB ? adminMenusFromDB : [...adminMenusFromDB, craneQuoteMenu!].sort((a,b) => a.order - b.order))
    : defaultAdminMenus;
  
  const footerInfoMenus = finalMenus.filter(m => m.location === 'footer-info').sort((a,b) => a.order - b.order);
  const footerAccountMenus = finalMenus.filter(m => m.location === 'footer-account').sort((a,b) => a.order - b.order);


  return (
    <div className={`flex flex-col min-h-screen ${!isAdminRoute ? 'pb-16' : 'pb-0'} bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100`}>
      {!isAdminRoute && 
        <Header 
          toggleCart={toggleCart} 
          cartItems={cartItems} 
          whatsappPhoneNumber={finalWhatsappPhoneNumber} 
          toggleSearchModal={toggleSearchModal} 
          headerMenus={headerMenus} // Pass header menus
          onAccountClick={handleAccountAccess}
        />
      }

      {isAdminRoute ? (
        <div className="flex flex-1">
          <AdminSidebar adminMenus={adminMenus} /> {/* Pass admin menus */}
          <main className="flex-1 flex flex-col overflow-hidden">
            <Routes>
              <Route
                path="/admin"
                element={
                  isAdminAuthenticated ? (
                    <AdminDashboardPage 
                      totalProducts={finalProducts.length} 
                      sales={finalSales}
                      totalUsers={0}
                    />
                  ) : (
                    <Navigate to="/account" replace />
                  )
                }
              />
              <Route
                path="/admin/products"
                element={
                  isAdminAuthenticated ? (
                    <AdminProductManagementPage
                      products={finalProducts}
                      brands={finalBrands}
                      onAddProduct={addProduct}
                      onUpdateProduct={updateProduct}
                      onDeleteProduct={deleteProduct}
                    />
                  ) : (
                    <Navigate to="/account" replace />
                  )
                }
              />
              <Route
                path="/admin/brands"
                element={
                  isAdminAuthenticated ? (
                    <AdminBrandManagementPage
                      brands={finalBrands}
                      onAddBrand={addBrand}
                      onUpdateBrand={updateBrand}
                      onDeleteBrand={deleteBrand}
                    />
                  ) : (
                    <Navigate to="/account" replace />
                  )
                }
              />
              <Route
                path="/admin/prices"
                element={
                  isAdminAuthenticated ? (
                    <AdminPriceManagementPage
                      products={finalProducts}
                      brands={finalBrands} // Pass brands for new product creation lookup
                      onUpdateProductsBulk={updateProductsBulk}
                      onAddProductsBulk={addProductsBulk} // New prop
                    />
                  ) : (
                    <Navigate to="/account" replace />
                  )
                }
              />
              <Route
                path="/admin/sales"
                element={
                  isAdminAuthenticated ? (
                    <AdminSalesPage salesData={finalSales} />
                  ) : (
                    <Navigate to="/account" replace />
                  )
                }
              />
              <Route
                path="/admin/crane-quote"
                element={
                  isAdminAuthenticated ? (
                    <AdminCraneQuotePage />
                  ) : (
                    <Navigate to="/account" replace />
                  )
                }
              />
              <Route
                path="/admin/settings"
                element={
                  isAdminAuthenticated ? (
                    <AdminSettingsPage
                      heroImageUrl={finalHeroImageUrl}
                      onUpdateHeroImage={handleUpdateHeroImage}
                      whatsappPhoneNumber={finalWhatsappPhoneNumber}
                      onUpdatePhoneNumber={handleUpdatePhoneNumber}
                      footerContent={finalFooterContent}
                      onUpdateFooterContent={handleUpdateFooterContent}
                      dealZoneConfig={finalDealZoneConfig}
                      onUpdateDealZoneConfig={handleUpdateDealZoneConfig}
                      siteName={siteName}
                      onUpdateSiteName={(name: string) => handleUpdateSettings('siteName', name)}
                      siteLogo={siteLogo}
                      onUpdateSiteLogo={(logoUrl: string) => handleUpdateSettings('siteLogo', logoUrl)}
                    />
                  ) : (
                    <Navigate to="/account" replace />
                  )
                }
              />
              <Route
                path="/admin/menus" // New route for menu management
                element={
                  isAdminAuthenticated ? (
                    <AdminMenuManagementPage
                      menus={finalMenus}
                      onAddMenu={addMenu}
                      onUpdateMenu={updateMenu}
                      onDeleteMenu={deleteMenu}
                    />
                  ) : (
                    <Navigate to="/account" replace />
                  )
                }
              />
              <Route
                path="/admin/categories" // New route for category management
                element={
                  isAdminAuthenticated ? (
                    <AdminCategoryManagementPage
                      categories={finalCategories}
                    />
                  ) : (
                    <Navigate to="/account" replace />
                  )
                }
              />
              <Route
                path="/admin/users" // New route for users management
                element={
                  isAdminAuthenticated ? (
                    <AdminUsersManagementPage />
                  ) : (
                    <Navigate to="/account" replace />
                  )
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
                  heroImageUrl={finalHeroImageUrl}
                  whatsappPhoneNumber={finalWhatsappPhoneNumber}
                  dealZoneConfig={finalDealZoneConfig}
                  products={finalProducts} // Pass all products for variations
                  categories={finalCategories}
                  onInitiateOrder={initiateOrder}
                  onOpenProductSelectionModal={handleOpenProductSelectionModal} // Pass new prop
                  craneQuoteConfig={craneQuoteConfig}
                />
              }
            />
            <Route
              path="/shop"
              element={
                <ShopPage
                  products={finalProducts}
                  brands={finalBrands}
                  onAddToCart={addToCart}
                  onOpenProductSelectionModal={handleOpenProductSelectionModal}
                />
              }
            />
            <Route
              path="/account"
              element={
                <AccountPage
                  isAdminAuthenticated={isAdminAuthenticated}
                  onOpenAdminLogin={openAdminLogin}
                  onLogout={handleAdminLogout}
                />
              }
            />
          </Routes>
        </main>
      )}

      {!isAdminRoute && <Footer footerContent={finalFooterContent} footerInfoMenus={footerInfoMenus} footerAccountMenus={footerAccountMenus} />} {/* Pass footer menus */}

      <SidebarCart
        isOpen={isCartOpen}
        toggleCart={toggleCart}
        cartItems={cartItems}
        updateQuantity={updateQuantity}
        removeFromCart={removeFromCart}
        whatsappPhoneNumber={finalWhatsappPhoneNumber}
        onInitiateOrder={initiateOrder}
      />

      {!isAdminRoute && (
        <MobileNavbar
          toggleCart={toggleCart}
          totalItemsInCart={totalItemsInCart}
          toggleSearchModal={toggleSearchModal}
          mobileMenus={mobileMenus}
          onAccountClick={handleAccountAccess}
        />
      )} {/* Pass mobile menus */}

      <SearchModal isOpen={isSearchModalOpen} onClose={toggleSearchModal} products={finalProducts} />

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
        allProducts={finalProducts} // All products to find variations from
        onAddToCart={addToCart}
        whatsappPhoneNumber={finalWhatsappPhoneNumber}
        onInitiateOrder={initiateOrder}
      />

      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={closeAdminLogin}
        onAuthenticate={handleAdminAuthenticate}
      />

      {/* Botón flotante del carrito */}
      {!isAdminRoute && (
        <FloatingCartButton
          totalItems={totalItemsInCart}
          onClick={toggleCart}
        />
      )}

      {/* Notificación de producto agregado */}
      {lastAddedProduct && (
        <ProductAddedToast
          productName={lastAddedProduct.name}
          isVisible={lastAddedProduct.show}
          onClose={() => setLastAddedProduct(null)}
        />
      )}

      {/* Popup Modal */}
      {activePopup && (
        <PopupModal
          isOpen={isPopupOpen}
          onClose={() => {
            setIsPopupOpen(false);
            setActivePopup(null);
          }}
          imageUrl={activePopup.image_url}
          title={activePopup.title}
          content={activePopup.message || ''}
          linkUrl={activePopup.button_link}
          autoCloseDelay={activePopup.auto_close_seconds || 0}
        />
      )}
    </div>
  );
};

export default App;