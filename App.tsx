import React, { useState, useCallback, useEffect } from 'react';
import { Routes, Route, useLocation, Navigate, useNavigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import SidebarCart from './components/SidebarCart';
import MobileNavbar from './components/MobileNavbar';
import SearchModal from './components/SearchModal';
import AdminSidebar from './components/AdminSidebar';
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
import CustomerInfoModal from './components/CustomerInfoModal';
import LoadingSpinner from './components/LoadingSpinner'; // Import new component
import ProductSelectionModal from './components/ProductSelectionModal'; // Import new component
import { useToast } from './contexts/ToastContext';
import AdminLoginModal from './components/AdminLoginModal';
import AccountPage from './pages/AccountPage';
import { ADMIN_USERNAME, ADMIN_PASSWORD, ADMIN_DISPLAY_NAME } from './config/auth';

import { Product, CartItem, HeroImageUpdateFunction, PhoneNumberUpdateFunction, FooterContent, FooterUpdateFunction, DealZoneConfig, DealZoneConfigUpdateFunction, Sale, Brand, GlobalSettings, MenuItem, Category } from './types';
import {
  DEFAULT_HERO_IMAGE_URL,
  DEFAULT_WHATSAPP_PHONE_NUMBER,
  DEFAULT_FOOTER_CONTENT,
  DEFAULT_DEAL_ZONE_CONFIG,
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
  const [loading, setLoading] = useState(true);

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
        const settingsPromise = fetch(`${API_BASE_URL}/settings`, { signal: controller.signal, timeout: 3000 }).catch(() => null);
        const menusPromise = fetch(`${API_BASE_URL}/menus`, { signal: controller.signal, timeout: 3000 }).catch(() => null);
        const categoriesPromise = fetch(`${API_BASE_URL}/categories`, { signal: controller.signal, timeout: 3000 }).catch(() => null);

        const [productsRes, brandsRes, salesRes, settingsRes, menusRes, categoriesRes] = await Promise.all([
          productsPromise, brandsPromise, salesPromise, settingsPromise, menusPromise, categoriesPromise
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

        const fetchedSettings = settingsRes && settingsRes.ok ? await settingsRes.json() : null;
        if (!settingsRes || !settingsRes.ok) {
          failedResources.push('configuración');
        }

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
        setHeroImageUrl(mappedSettings.heroImageUrl);
        setWhatsappPhoneNumber(mappedSettings.whatsappPhoneNumber);
        setFooterContent(mappedSettings.footerContent);
        setDealZoneConfig(mappedSettings.dealZoneConfig);

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
      showSuccess(`Producto "${addedProduct.name}" añadido correctamente.`);
    } catch (err: any) {
      console.error('Error adding product:', err);
      const errorMessage = err?.message || 'Error desconocido';
      showError(`Error al añadir el producto: ${errorMessage}`);
    }
  }, [showSuccess, showError]);

  const updateProduct = useCallback(async (updatedProduct: Product) => {
    try {
      // The `id` from `updatedProduct` is the client-facing ID which maps to Supabase's UUID.
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
      showSuccess(`Producto "${updatedProductResponse.name}" actualizado correctamente.`);
    } catch (err) {
      console.error('Error updating product:', err);
      showError('Error al actualizar el producto.');
    }
  }, [showSuccess, showError]);

  const deleteProduct = useCallback(async (productId: string) => {
    try {
      const productToDelete = products?.find(p => p.id === productId);
      const res = await fetch(`${API_BASE_URL}/products/${productId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete product');
      setProducts(prevProducts => prevProducts ? prevProducts.filter(p => p.id !== productId) : []);
      showSuccess(productToDelete ? `Producto "${productToDelete.name}" eliminado.` : 'Producto eliminado correctamente.');
    } catch (err) {
      console.error('Error deleting product:', err);
      showError('Error al eliminar el producto.');
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
      showSuccess('Precios actualizados masivamente con éxito!');
    } catch (err: any) {
      console.error('Error bulk updating products:', err);
      showError('No se pudieron actualizar los precios. Por favor, intenta nuevamente.');
      throw err;
    }
  }, [showSuccess, showWarning]);

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
      console.error('Error bulk creating products:', err);
      showError('No se pudieron crear los productos. Por favor, intenta nuevamente.');
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
        throw new Error(errorMessage);
      }
      
      const addedBrand = await res.json();
      setBrands(prevBrands => (prevBrands ? [...prevBrands, addedBrand] : [addedBrand]));
      showSuccess(`Marca "${addedBrand.name}" añadida correctamente.`);
    } catch (err: any) {
      console.error('Error adding brand:', err);
      const errorMessage = err?.message || 'Error desconocido';
      showError(`Error al añadir la marca: ${errorMessage}`);
    }
  }, [showSuccess, showError]);

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
      const res = await fetch(`${API_BASE_URL}/brands/${brandId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete brand');
      setBrands(prevBrands => prevBrands ? prevBrands.filter(b => b.id !== brandId) : []);
      // Find the name of the deleted brand to update products
      setProducts(prevProducts => prevProducts ? prevProducts.map(p => {
        return (deletedBrandName && p.brand === deletedBrandName)
          ? { ...p, brandId: undefined, brandLogoUrl: undefined }
          : p;
      }) : []);
      showSuccess(deletedBrandName ? `Marca "${deletedBrandName}" eliminada.` : 'Marca eliminada correctamente.');
    } catch (err) {
      console.error('Error deleting brand:', err);
      showError('Error al eliminar la marca.');
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
      showSuccess('Configuración actualizada con éxito!');
    } catch (err) {
      console.error(`Error updating ${String(key)} setting:`, err);
      showError(`Error al actualizar la configuración de ${String(key)}.`);
    }
  }, [heroImageUrl, whatsappPhoneNumber, footerContent, dealZoneConfig, showSuccess, showError]);

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
    const whatsappUrl = `https://wa.me/${whatsappPhoneNumber}?text=${encodedMessage}`;

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
  const finalWhatsappPhoneNumber = whatsappPhoneNumber || DEFAULT_WHATSAPP_PHONE_NUMBER;
  const finalFooterContent = footerContent || DEFAULT_FOOTER_CONTENT;
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
  ];
  
  const adminMenusFromDB = finalMenus.filter(m => m.location === 'admin-sidebar').sort((a,b) => a.order - b.order);
  const adminMenus = adminMenusFromDB.length > 0 ? adminMenusFromDB : defaultAdminMenus;
  
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
    </div>
  );
};

export default App;