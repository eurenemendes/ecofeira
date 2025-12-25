
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  HashRouter as Router,
  Routes,
  Route,
  useNavigate,
  useLocation,
  Link,
  useParams
} from 'react-router-dom';
import { 
  Search, ShoppingCart, Store as StoreIcon, Trash2, History, X, Moon, Sun, 
  Tag, ArrowUp, ChevronRight, Package, Check, AlertTriangle, LayoutGrid, 
  List, ArrowLeft, MapPin, BookOpen, ChevronUp, Bell, BellOff, Info, 
  TrendingDown, Sparkles, Clock, ArrowUpDown, Heart, Scale, BarChart2,
  ShoppingBasket, Plus, Menu as MenuIcon, Filter, Percent
} from 'lucide-react';
import { searchProductsWithGemini } from './services/geminiService';
import { ProductOffer, CartItem, Store, AppNotification } from './types';
import { INITIAL_SUGGESTIONS, MOCK_STORES, RAW_PRODUCTS } from './constants';
import ProductCard from './components/ProductCard';
import CartOptimizer from './components/CartOptimizer';
import BannerCarousel from './components/BannerCarousel';
import InlineAdBanner from './components/InlineAdBanner';
import StoreFlyer from './components/StoreFlyer';
import PartnerTicker from './components/PartnerTicker';

type SortOption = 'price_asc' | 'price_desc' | 'name_asc' | 'discount_desc';
type ViewMode = 'grid' | 'list';

interface SuggestionItem {
  name: string;
  type: 'product' | 'category' | 'store' | 'neighborhood';
}

interface RenderItem {
  type: 'product' | 'ad';
  data?: ProductOffer;
  id: string;
}

// Função para normalizar texto (remover acentos e minúsculas)
const normalizeText = (text: string) => {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
};

const formatTime = (timestamp: number) => {
  const diff = Date.now() - timestamp;
  if (diff < 60000) return 'Agora';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m atrás`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h atrás`;
  return new Date(timestamp).toLocaleDateString();
};

function StoreDetailView({ 
  onAddToCart, 
  onStoreClick,
  onToggleFavorite,
  favorites,
  compareList,
  onToggleCompare
}: { 
  onAddToCart: (p: ProductOffer) => void,
  onStoreClick: (id: string) => void,
  onToggleFavorite: (p: ProductOffer) => void,
  favorites: string[],
  compareList: ProductOffer[],
  onToggleCompare: (p: ProductOffer) => void
}) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [isFlyerExpanded, setIsFlyerExpanded] = useState(false);

  const store = useMemo(() => MOCK_STORES.find(s => s.id === id), [id]);
  
  const storeProducts = useMemo(() => {
    if (!store) return [];
    return RAW_PRODUCTS.filter(p => p.supermercado === store.name).map(p => ({
      id: `prod_${p.id}_${store.id}`,
      baseProductId: String(p.id),
      name: p.produto,
      category: p.categoria,
      storeId: store.id,
      storeName: store.name,
      storeColor: store.color,
      price: p.promocao ? (p.preco_promocional || p.preco_normal) : p.preco_normal,
      originalPrice: p.preco_normal,
      unit: p.produto.split(' ').slice(-1)[0],
      imageUrl: "",
      isPromo: p.promocao
    }));
  }, [store]);

  const renderLogo = (logo: string, size: string = '1em', alt: string = '') => {
    if (logo.startsWith('http')) {
      return <img src={logo} alt={alt} style={{ width: size, height: size, objectFit: 'contain', borderRadius: '4px' }} />;
    }
    return logo;
  };

  if (!store) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px' }}>
        <h2 style={{ fontWeight: 800 }}>Loja não encontrada</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>O supermercado solicitado não existe ou foi removido.</p>
        <button className="btn btn-primary" onClick={() => navigate('/stores')}>Ver todas as lojas</button>
      </div>
    );
  }

  return (
    <div className="animate">
      <div style={{ marginBottom: '40px' }}>
        <div className="flex items-center justify-between" style={{ marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div className="flex items-center gap-4">
            <button className="btn btn-ghost" onClick={() => navigate('/stores')} data-tooltip="Voltar para lojas" style={{padding: '10px'}}><ArrowLeft size={20} /></button>
            <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
              <div style={{fontSize: '2.5rem', width: '64px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--card-bg)', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)'}}>
                {renderLogo(store.logo, '40px', store.name)}
              </div>
              <div>
                <h2 style={{fontWeight: 800, fontSize: '1.8rem', color: 'var(--text-main)'}}>{store.name}</h2>
                <div style={{color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, lineHeight: 1.4}}>
                  <MapPin size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }} />
                  {store.address.street}, {store.address.number}, {store.address.neighborhood}
                  <br />
                  <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>Ref: {store.address.reference}</span>
                </div>
              </div>
            </div>
          </div>
          {store.flyerUrl && (
            <button className={`btn ${isFlyerExpanded ? 'btn-ghost' : 'btn-primary'}`} onClick={() => setIsFlyerExpanded(!isFlyerExpanded)} style={{ borderRadius: '14px', gap: '10px', padding: '12px 24px', boxShadow: isFlyerExpanded ? 'none' : '0 8px 20px rgba(16, 185, 129, 0.25)' }}>
              {isFlyerExpanded ? <ChevronUp size={20} /> : <BookOpen size={20} />}
              <span style={{ fontWeight: 800 }}>{isFlyerExpanded ? 'Ocultar Panfleto' : 'Ver Panfleto'}</span>
            </button>
          )}
        </div>
        {isFlyerExpanded && store.flyerUrl && <StoreFlyer store={store} />}
      </div>
      <div className="flex items-center justify-between" style={{ marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
        <div className="flex items-center gap-4">
          <div style={{ display: 'flex', background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '4px' }}>
            <button onClick={() => setViewMode('grid')} className={`btn-icon ${viewMode === 'grid' ? 'active' : ''}`} data-tooltip="Visualização em grade"><LayoutGrid size={18} /></button>
            <button onClick={() => setViewMode('list')} className={`btn-icon ${viewMode === 'list' ? 'active' : ''}`} data-tooltip="Visualização em lista"><List size={18} /></button>
          </div>
        </div>
      </div>
      <div className={viewMode === 'grid' ? "product-grid" : "product-list-view"}>
        {storeProducts.map(product => (
          <ProductCard 
            key={product.id} 
            product={product} 
            onAdd={onAddToCart} 
            layout={viewMode} 
            isFavorite={favorites.includes(product.id)}
            onToggleFavorite={onToggleFavorite}
            isComparing={compareList.some(p => p.id === product.id)}
            onToggleCompare={onToggleCompare}
          />
        ))}
      </div>
    </div>
  );
}

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [query, setQuery] = useState('');
  const [storeQuery, setStoreQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [storeSuggestions, setStoreSuggestions] = useState<SuggestionItem[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showStoreSuggestions, setShowStoreSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<ProductOffer[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [compareList, setCompareList] = useState<ProductOffer[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('ecofeira_theme') === 'dark');
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  
  // Estados para Filtros de Promoção
  const [promoSearch, setPromoSearch] = useState('');
  const [selectedPromoCategory, setSelectedPromoCategory] = useState<string | null>(null);
  const [selectedPromoStore, setSelectedPromoStore] = useState<string | null>(null);
  const [promoSortBy, setPromoSortBy] = useState<SortOption>('discount_desc');

  const searchRef = useRef<HTMLDivElement>(null);
  const storeSearchRef = useRef<HTMLDivElement>(null);
  const headerSearchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedStore, setSelectedStore] = useState<string | null>(null);
  const [onlyPromos, setOnlyPromos] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('price_asc');

  // Efeito para estatísticas dinâmicas do Hero
  const stats = useMemo(() => ({
    totalProducts: RAW_PRODUCTS.length,
    totalStores: MOCK_STORES.length,
    totalPromos: RAW_PRODUCTS.filter(p => p.promocao).length
  }), []);

  // EFEITO PARA GOOGLE ANALYTICS E TÍTULOS DINÂMICOS
  useEffect(() => {
    let pageTitle = "EcoFeira";
    const path = location.pathname;

    if (path === '/') {
      pageTitle = "EcoFeira | Economia Inteligente";
    } else if (path === '/stores') {
      pageTitle = "EcoFeira | Supermercados Parceiros";
    } else if (path === '/favorites') {
      pageTitle = "EcoFeira | Meus Favoritos";
    } else if (path === '/promocoes') {
      pageTitle = "EcoFeira | Ofertas do Dia";
    } else if (path === '/cart') {
      pageTitle = "EcoFeira | Minha Lista de Compras";
    } else if (path.startsWith('/search')) {
      const params = new URLSearchParams(location.search);
      const q = params.get('q');
      pageTitle = q ? `EcoFeira | Resultados para "${q}"` : "EcoFeira | Pesquisa";
    } else if (path.startsWith('/store/')) {
      const storeId = path.split('/').pop();
      const store = MOCK_STORES.find(s => s.id === storeId);
      pageTitle = store ? `EcoFeira | ${store.name}` : "EcoFeira | Detalhes da Loja";
    }

    document.title = pageTitle;

    if (typeof (window as any).gtag === 'function') {
      (window as any).gtag('config', 'G-DCSKFBSG8T', {
        page_title: pageTitle,
        page_path: location.pathname + location.search,
      });
    }
  }, [location]);

  const categories = useMemo(() => Array.from(new Set(RAW_PRODUCTS.map(p => p.categoria))), []);

  const filteredStores = useMemo(() => {
    const normalizedQuery = normalizeText(storeQuery);
    if (!normalizedQuery) return MOCK_STORES;
    return MOCK_STORES.filter(s => 
      normalizeText(s.name).includes(normalizedQuery) || 
      normalizeText(s.address.neighborhood).includes(normalizedQuery)
    );
  }, [storeQuery]);

  useEffect(() => {
    if (isDarkMode) {
      document.body.setAttribute('data-theme', 'dark');
      localStorage.setItem('ecofeira_theme', 'dark');
    } else {
      document.body.removeAttribute('data-theme');
      localStorage.setItem('ecofeira_theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        (searchRef.current && !searchRef.current.contains(event.target as Node)) &&
        (headerSearchRef.current && !headerSearchRef.current.contains(event.target as Node))
      ) {
        setShowSuggestions(false);
      }
      if (storeSearchRef.current && !storeSearchRef.current.contains(event.target as Node)) {
        setShowStoreSuggestions(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Hydration
  useEffect(() => {
    const savedHistory = localStorage.getItem('ecofeira_history');
    if (savedHistory) try { setSearchHistory(JSON.parse(savedHistory)); } catch (e) {}
    
    const savedCart = localStorage.getItem('ecofeira_cart');
    if (savedCart) try { setCart(JSON.parse(savedCart)); } catch (e) {}

    const savedFavorites = localStorage.getItem('ecofeira_favorites');
    if (savedFavorites) try { setFavorites(JSON.parse(savedFavorites)); } catch (e) {}

    const savedNotifs = localStorage.getItem('ecofeira_notifs');
    if (savedNotifs) try { setNotifications(JSON.parse(savedNotifs)); } catch (e) {}
  }, []);

  useEffect(() => { localStorage.setItem('ecofeira_history', JSON.stringify(searchHistory)); }, [searchHistory]);
  useEffect(() => { localStorage.setItem('ecofeira_cart', JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem('ecofeira_favorites', JSON.stringify(favorites)); }, [favorites]);
  useEffect(() => { localStorage.setItem('ecofeira_notifs', JSON.stringify(notifications)); }, [notifications]);

  const toggleFavorite = useCallback((product: ProductOffer) => {
    setFavorites(prev => {
      if (prev.includes(product.id)) {
        return prev.filter(id => id !== product.id);
      }
      return [...prev, product.id];
    });
  }, []);

  const toggleCompare = useCallback((product: ProductOffer) => {
    setCompareList(prev => {
      const isAlreadyIn = prev.some(p => p.id === product.id);
      if (isAlreadyIn) {
        return prev.filter(p => p.id !== product.id);
      }
      if (prev.length >= 3) {
        return prev;
      }
      return [...prev, product];
    });
  }, []);

  const clearCompare = () => setCompareList([]);

  const favoriteProducts = useMemo(() => {
    const allOffers: ProductOffer[] = RAW_PRODUCTS.flatMap(p => {
      const store = MOCK_STORES.find(s => s.name === p.supermercado);
      if (!store) return [];
      return [{
        id: `prod_${p.id}_${store.id}`,
        baseProductId: String(p.id),
        name: p.produto,
        category: p.categoria,
        storeId: store.id,
        storeName: store.name,
        storeColor: store.color,
        price: p.promocao ? (p.preco_promocional || p.preco_normal) : p.preco_normal,
        originalPrice: p.preco_normal,
        unit: p.produto.split(' ').slice(-1)[0],
        imageUrl: "",
        isPromo: p.promocao
      }];
    });

    return allOffers.filter(offer => favorites.includes(offer.id));
  }, [favorites]);

  const basePromos = useMemo(() => {
    return RAW_PRODUCTS.filter(p => p.promocao).map(p => {
      const store = MOCK_STORES.find(s => s.name === p.supermercado) || MOCK_STORES[0];
      return {
        id: `prod_${p.id}_${store.id}`,
        baseProductId: String(p.id),
        name: p.produto,
        category: p.categoria,
        storeId: store.id,
        storeName: store.name,
        storeColor: store.color,
        price: p.preco_promocional || p.preco_normal,
        originalPrice: p.preco_normal,
        unit: p.produto.split(' ').slice(-1)[0],
        imageUrl: "",
        isPromo: true
      };
    });
  }, []);

  const filteredAndSortedPromos = useMemo(() => {
    let result = [...basePromos];
    
    // Filtro Texto
    if (promoSearch.trim()) {
      const search = normalizeText(promoSearch);
      result = result.filter(p => normalizeText(p.name).includes(search));
    }

    // Filtro Categoria
    if (selectedPromoCategory) {
      result = result.filter(p => p.category === selectedPromoCategory);
    }

    // Filtro Loja
    if (selectedPromoStore) {
      result = result.filter(p => p.storeId === selectedPromoStore);
    }

    // Ordenação
    result.sort((a, b) => {
      if (promoSortBy === 'price_asc') return a.price - b.price;
      if (promoSortBy === 'price_desc') return b.price - a.price;
      if (promoSortBy === 'discount_desc') {
        const discA = ((a.originalPrice - a.price) / a.originalPrice);
        const discB = ((b.originalPrice - b.price) / b.originalPrice);
        return discB - discA;
      }
      return a.name.localeCompare(b.name);
    });

    return result;
  }, [basePromos, promoSearch, selectedPromoCategory, selectedPromoStore, promoSortBy]);

  const promoItemsToRender = useMemo<RenderItem[]>(() => {
    const products: RenderItem[] = filteredAndSortedPromos.map(p => ({
      type: 'product',
      data: p,
      id: p.id
    }));
    // Insere banner a cada 5 produtos ou na posição 3 para visibilidade
    if (products.length >= 3) {
      products.splice(3, 0, { type: 'ad', id: 'inline-promo-banner' });
    }
    return products;
  }, [filteredAndSortedPromos]);

  // Automated Notifications
  useEffect(() => {
    if (cart.length === 0 && searchHistory.length === 0) return;

    const generateNotifications = () => {
      const newNotifs: AppNotification[] = [];
      cart.forEach(item => {
        const others = RAW_PRODUCTS.filter(p => p.produto === item.name && p.supermercado !== item.storeName);
        others.forEach(other => {
          const otherPrice = other.promocao ? (other.preco_promocional || other.preco_normal) : other.preco_normal;
          if (otherPrice < item.price) {
            const id = `notif_better_${item.id}_${other.supermercado}`;
            if (!notifications.some(n => n.id === id)) {
              newNotifs.push({
                id,
                type: 'BETTER_DEAL',
                title: 'Preço melhor encontrado!',
                message: `${item.name} está mais barato no ${other.supermercado}: R$ ${otherPrice.toFixed(2).replace('.', ',')}`,
                timestamp: Date.now(),
                isRead: false,
                relatedSearchTerm: item.name,
                discountPercentage: Math.round(((item.price - otherPrice) / item.price) * 100)
              });
            }
          }
        });
      });

      searchHistory.slice(0, 3).forEach(term => {
        const matchingPromos = RAW_PRODUCTS.filter(p => p.produto.toLowerCase().includes(term.toLowerCase()) && p.promocao);
        matchingPromos.forEach(promo => {
          const id = `notif_promo_${term}_${promo.id}`;
          if (!notifications.some(n => n.id === id)) {
            newNotifs.push({
              id,
              type: 'PROMO',
              title: 'Promoção para você!',
              message: `Vimos que buscou por "${term}". O ${promo.produto} está em oferta no ${promo.supermercado}!`,
              timestamp: Date.now(),
              isRead: false,
              relatedSearchTerm: term,
              discountPercentage: Math.round(((promo.preco_normal - (promo.preco_promocional || 0)) / promo.preco_normal) * 100)
            });
          }
        });
      });

      if (newNotifs.length > 0) {
        setNotifications(prev => [...newNotifs, ...prev].slice(0, 20));
      }
    };

    const timer = setTimeout(generateNotifications, 3000);
    return () => clearTimeout(timer);
  }, [cart, searchHistory, notifications.length]);

  const handleInputChange = (val: string) => {
    setQuery(val);
    if (val.trim().length > 0) {
      const normalizedVal = normalizeText(val);
      const categoryMatches: SuggestionItem[] = categories
        .filter(cat => normalizeText(cat).includes(normalizedVal))
        .map(name => ({ name, type: 'category' }));
      const productMatches: SuggestionItem[] = Array.from(new Set(RAW_PRODUCTS
        .filter(p => normalizeText(p.produto).includes(normalizedVal))
        .map(p => p.produto)))
        .map(name => ({ name, type: 'product' }));
      const combined = [...categoryMatches, ...productMatches].slice(0, 8);
      setSuggestions(combined);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleStoreInputChange = (val: string) => {
    setStoreQuery(val);
    if (val.trim().length > 0) {
      const normalizedVal = normalizeText(val);
      const nameMatches: SuggestionItem[] = MOCK_STORES
        .filter(s => normalizeText(s.name).includes(normalizedVal))
        .map(s => ({ name: s.name, type: 'store' }));
      const neighborhoodMatches: SuggestionItem[] = Array.from(new Set(MOCK_STORES
        .filter(s => normalizeText(s.address.neighborhood).includes(normalizedVal))
        .map(s => s.address.neighborhood)))
        .map(name => ({ name, type: 'neighborhood' }));
      
      const combined = [...nameMatches, ...neighborhoodMatches].slice(0, 6);
      setStoreSuggestions(combined);
      setShowStoreSuggestions(true);
    } else {
      setStoreSuggestions([]);
      setShowStoreSuggestions(false);
    }
  };

  const handleSearch = async (e?: React.FormEvent, queryOverride?: string, type?: 'product' | 'category') => {
    if (e) e.preventDefault();
    const term = queryOverride || query;
    if (!term.trim()) return;
    setQuery(term);
    setShowSuggestions(false);
    setSearchHistory(prev => [term, ...prev.filter(i => i !== term)].slice(0, 5));
    setIsSearching(true);
    
    navigate(`/search?q=${encodeURIComponent(term)}`);

    setSelectedCategory(type === 'category' ? term : null);
    setSelectedStore(null);
    setOnlyPromos(false);
    try {
      const results = await searchProductsWithGemini(term);
      setSearchResults(results);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleStoreSelect = (name: string) => {
    setStoreQuery(name);
    setShowStoreSuggestions(false);
  };

  const handleStoreClick = useCallback((storeId: string) => {
    navigate(`/store/${storeId}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [navigate]);

  const filteredAndSortedResults = useMemo(() => {
    let results = [...searchResults];
    if (selectedCategory) results = results.filter(p => p.category === selectedCategory);
    if (selectedStore) results = results.filter(p => p.storeId === selectedStore);
    if (onlyPromos) results = results.filter(p => p.isPromo);
    
    results.sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      return a.name.localeCompare(b.name);
    });
    return results;
  }, [searchResults, selectedCategory, selectedStore, onlyPromos, sortBy]);

  const itemsToRender = useMemo<RenderItem[]>(() => {
    const products: RenderItem[] = filteredAndSortedResults.map(p => ({
      type: 'product',
      data: p,
      id: p.id
    }));
    if (products.length >= 1) {
      products.splice(1, 0, { type: 'ad', id: 'inline-ad-banner' });
    }
    return products;
  }, [filteredAndSortedResults]);

  const addToCart = useCallback((product: ProductOffer) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { ...product, quantity: 1 }];
    });
  }, []);

  const decrementInCart = useCallback((id: string) => {
    setCart(prev => prev.map(item => item.id === id ? { ...item, quantity: Math.max(1, item.quantity - 1) } : item));
  }, []);

  const removeFromCart = useCallback((id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  }, []);

  const clearCart = () => {
    setCart([]);
    setIsClearModalOpen(false);
  };

  const markAllNotifsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
    setIsNotifOpen(false);
  };

  const unreadCount = useMemo(() => notifications.filter(n => !n.isRead).length, [notifications]);
  const totalItemsCount = useMemo(() => cart.reduce((acc, item) => acc + item.quantity, 0), [cart]);
  const favoritesCount = useMemo(() => favorites.length, [favorites]);
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const renderLogo = (logo: string, size: string = '1em', alt: string = '') => {
    if (logo.startsWith('http')) {
      return <img src={logo} alt={alt} style={{ width: size, height: size, objectFit: 'contain', borderRadius: '4px' }} />;
    }
    return logo;
  };

  return (
    <div className="app-wrapper">
      <header>
        <div className="container flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Link to="/" className="logo">
              <div className="logo-icon"><StoreIcon size={20} /></div>
              <span>EcoFeira</span>
            </Link>
          </div>

          <nav className="header-nav flex gap-4 items-center">
            <Link to="/promocoes" className={`nav-link ${location.pathname === '/promocoes' ? 'active' : ''}`} data-tooltip="Ofertas do momento">
              Promoções
            </Link>
            <Link to="/stores" className={`nav-link ${location.pathname === '/stores' ? 'active' : ''}`} data-tooltip="Listar supermercados parceiros">
              Supermercados
            </Link>
            {location.pathname !== '/' && location.pathname !== '/stores' && location.pathname !== '/favorites' && location.pathname !== '/promocoes' && (
              <div className="search-container" ref={headerSearchRef}>
                <form onSubmit={(e) => handleSearch(e)}>
                  <Search className="search-icon" size={18} />
                  <input type="text" className="search-input" placeholder="Buscar..." value={query} onChange={(e) => handleInputChange(e.target.value)} onFocus={() => query.length > 0 && setShowSuggestions(true)} />
                </form>
                {showSuggestions && <SuggestionsList list={suggestions} onSelect={handleSearch} />}
              </div>
            )}
          </nav>

          <div className="flex gap-2 items-center">
            {/* Supermercados Mobile Button */}
            <Link to="/stores" className="btn btn-ghost mobile-only" style={{ padding: '10px' }} data-tooltip="Supermercados">
              <StoreIcon size={20} />
            </Link>

            {/* Favoritos Icon Button (Desktop) - Replaces the text link as requested */}
            <Link to="/favorites" className={`btn btn-ghost hide-mobile ${location.pathname === '/favorites' ? 'active' : ''}`} style={{ padding: '10px', position: 'relative' }} data-tooltip="Meus Favoritos">
              <Heart size={20} fill={favoritesCount > 0 && location.pathname === '/favorites' ? 'currentColor' : 'none'} />
              {favoritesCount > 0 && <span className="badge-count animate-pop" style={{ position: 'absolute', top: '2px', right: '2px', width: '16px', height: '16px', fontSize: '0.6rem' }}>{favoritesCount}</span>}
            </Link>

            {/* Desktop-only: Theme Switcher */}
            <button className="btn btn-ghost hide-mobile" onClick={() => setIsDarkMode(!isDarkMode)} style={{ padding: '10px' }} data-tooltip={isDarkMode ? "Ativar modo claro" : "Ativar modo escuro"}>
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <div style={{ position: 'relative' }} ref={notifRef}>
              <button className={`btn btn-ghost ${unreadCount > 0 ? 'notif-pulse' : ''}`} onClick={() => { setIsNotifOpen(!isNotifOpen); if (!isNotifOpen) markAllNotifsRead(); }} style={{ padding: '10px' }} data-tooltip="Notificações e alertas">
                {notifications.length === 0 ? <BellOff size={20} /> : <Bell size={20} />}
                {unreadCount > 0 && <span className="badge-count animate-pop" style={{ background: '#f59e0b' }}>{unreadCount}</span>}
              </button>
              {isNotifOpen && (
                <div className="notif-dropdown animate-pop">
                  <div className="flex justify-between items-center" style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}>
                    <h4 style={{ fontWeight: 800, fontSize: '0.9rem' }}>Alertas de Preço</h4>
                    <button onClick={clearNotifications} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer' }}>LIMPAR</button>
                  </div>
                  <div className="notif-scroll-area">
                    {notifications.length === 0 ? (
                      <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <Info size={24} style={{ opacity: 0.3, marginBottom: '8px' }} />
                        <p style={{ fontSize: '0.8rem' }}>Você não tem alertas no momento.</p>
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} className="notif-item" onClick={() => { if (n.relatedSearchTerm) handleSearch(undefined, n.relatedSearchTerm); setIsNotifOpen(false); }}>
                          <div className={`notif-type-icon ${n.type}`}>{n.type === 'PROMO' ? <Sparkles size={14} /> : <TrendingDown size={14} />}</div>
                          <div style={{ flex: 1 }}>
                            <div className="flex justify-between items-start">
                              <h5 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-main)' }}>{n.title}</h5>
                              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={10} /> {formatTime(n.timestamp)}</span>
                            </div>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px', lineHeight: 1.3 }}>{n.message}</p>
                            {n.discountPercentage && <span style={{ display: 'inline-block', marginTop: '6px', background: 'var(--primary-light)', color: 'var(--primary)', fontSize: '0.65rem', fontWeight: 800, padding: '2px 6px', borderRadius: '4px' }}>ECONOMIA DE {n.discountPercentage}%</span>}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div style={{ padding: '12px', textAlign: 'center', background: 'var(--bg)', fontSize: '0.7rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border)' }}>Monitoramos preços em tempo real para você.</div>
                </div>
              )}
            </div>

            <Link to="/cart" className="btn btn-ghost" style={{ position: 'relative', padding: '10px' }} data-tooltip="Ver minha lista de compras">
              <ShoppingCart size={20} />
              {totalItemsCount > 0 && <span className="badge-count animate-pop">{totalItemsCount}</span>}
            </Link>

            <button 
              className="btn btn-ghost mobile-only" 
              onClick={() => setIsMenuOpen(true)}
              style={{ padding: '10px' }}
            >
              <MenuIcon size={24} />
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar Mobile Menu */}
      {isMenuOpen && (
        <>
          <div className="sidebar-overlay" onClick={() => setIsMenuOpen(false)} />
          <div className="sidebar-menu animate-slide-left">
            <div className="sidebar-header">
              <div className="logo">
                <div className="logo-icon"><StoreIcon size={18} /></div>
                <span>EcoFeira</span>
              </div>
              <button className="btn btn-ghost" onClick={() => setIsMenuOpen(false)} style={{ padding: '8px' }}>
                <X size={24} />
              </button>
            </div>
            
            <div className="sidebar-content">
              <Link to="/" className="sidebar-link" onClick={() => setIsMenuOpen(false)}>
                <LayoutGrid size={20} /> Início
              </Link>
              <Link to="/promocoes" className="sidebar-link" onClick={() => setIsMenuOpen(false)}>
                <Tag size={20} /> Promoções
              </Link>
              <Link to="/stores" className="sidebar-link" onClick={() => setIsMenuOpen(false)}>
                <StoreIcon size={20} /> Supermercados
              </Link>
              <Link to="/favorites" className="sidebar-link" onClick={() => setIsMenuOpen(false)}>
                <div style={{ position: 'relative' }}>
                  <Heart size={20} />
                  {favoritesCount > 0 && <span className="badge-count" style={{ position: 'absolute', top: '-8px', right: '-8px', width: '16px', height: '16px', fontSize: '0.6rem' }}>{favoritesCount}</span>}
                </div>
                Meus Favoritos
              </Link>
              
              <button className="sidebar-link" onClick={() => { setIsNotifOpen(true); setIsMenuOpen(false); markAllNotifsRead(); }} style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}>
                <div style={{ position: 'relative' }}>
                  <Bell size={20} />
                  {unreadCount > 0 && <span className="badge-count" style={{ position: 'absolute', top: '-8px', right: '-8px', width: '16px', height: '16px', fontSize: '0.6rem', background: '#f59e0b' }}>{unreadCount}</span>}
                </div>
                Alertas de Preço
              </button>
              
              <div style={{ margin: '20px 0', borderTop: '1px solid var(--border)' }} />
              
              <button className="sidebar-link" onClick={() => { setIsDarkMode(!isDarkMode); setIsMenuOpen(false); }} style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}>
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                Modo {isDarkMode ? 'Claro' : 'Escuro'}
              </button>
            </div>
            
            <div className="sidebar-footer">
               <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center' }}>EcoFeira v1.2.0 • Economize inteligente</p>
            </div>
          </div>
        </>
      )}

      <main className="container" style={{paddingTop: '30px', paddingBottom: '80px'}}>
        <Routes>
          <Route path="/" element={
            <div className="animate" style={{textAlign: 'center', maxWidth: '800px', margin: '60px auto'}}>
              <h1 style={{fontSize: '3.2rem', fontWeight: 800, marginBottom: '16px', lineHeight: 1.1}}>Compare e <span style={{color: 'var(--primary)'}}>economize</span>.</h1>
              <p style={{color: 'var(--text-muted)', marginBottom: '30px', fontSize: '1.1rem'}}>
                Os melhores preços de {stats.totalProducts} produtos em {stats.totalStores} supermercados locais, incluindo {stats.totalPromos} promoções imperdíveis.
              </p>
              
              <PartnerTicker />

              <BannerCarousel />
              <div style={{position: 'relative', marginBottom: '40px'}} ref={searchRef}>
                 <Search style={{position: 'absolute', left: '20px', top: '18px', color: 'var(--primary)', zIndex: 10}} size={24} />
                 <form onSubmit={(e) => handleSearch(e)}>
                  <input type="text" placeholder="O que você precisa hoje?" style={{width: '100%', padding: '18px 120px 18px 55px', borderRadius: '20px', border: '2px solid var(--border)', background: 'var(--card-bg)', color: 'var(--text-main)', fontSize: '1.1rem', outline: 'none', boxShadow: 'var(--shadow-md)', position: 'relative', zIndex: 5}} value={query} onChange={(e) => handleInputChange(e.target.value)} onFocus={() => query.length > 0 && setShowSuggestions(true)} />
                  <button type="submit" className="btn btn-primary" style={{position: 'absolute', right: '8px', top: '8px', bottom: '8px', borderRadius: '14px', zIndex: 10}}>Buscar</button>
                 </form>
                 {showSuggestions && <SuggestionsList list={suggestions} onSelect={handleSearch} />}
              </div>
              {searchHistory.length > 0 && (
                <div style={{ marginBottom: '30px', textAlign: 'left' }}>
                  <div className="flex justify-between items-center" style={{ marginBottom: '12px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}><History size={14} /> BUSCAS RECENTES</span>
                    <button onClick={() => setSearchHistory([])} style={{ background: 'none', border: 'none', color: 'var(--danger)', fontSize: '0.75rem', cursor: 'pointer' }}>Limpar</button>
                  </div>
                  <div className="flex gap-2" style={{flexWrap: 'wrap'}}>
                    {searchHistory.map(term => (<button key={term} onClick={() => handleSearch(undefined, term)} className="btn btn-ghost" style={{ fontSize: '0.8rem', padding: '6px 14px', borderRadius: '10px' }}>{term}</button>))}
                  </div>
                </div>
              )}
              <div style={{ textAlign: 'left' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '12px' }}>SUGESTÕES POPULARES</span>
                <div className="flex gap-2" style={{flexWrap: 'wrap'}}>
                  {INITIAL_SUGGESTIONS.map(s => (<button key={s} onClick={() => handleSearch(undefined, s)} className="btn btn-ghost" style={{fontSize: '0.8rem', padding: '6px 14px', borderRadius: '10px'}}>{s}</button>))}
                </div>
              </div>
            </div>
          } />

          <Route path="/promocoes" element={
            <div className="animate">
              {/* Promo Header with Integrated Search */}
              <div className="promo-page-hero">
                <div className="flex items-center gap-4" style={{ marginBottom: '24px' }}>
                  <div className="promo-badge-icon"><Percent size={28} /></div>
                  <div>
                    <h2 style={{fontWeight: 800, fontSize: '2.4rem', lineHeight: 1.1}}>Promoções <span style={{ color: 'var(--danger)' }}>Exclusivas</span></h2>
                    <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Encontramos {filteredAndSortedPromos.length} ofertas imperdíveis para você economizar hoje.</p>
                  </div>
                </div>

                <div className="promo-controls-grid">
                  {/* Internal Search */}
                  <div className="promo-search-bar">
                    <Search size={20} className="promo-search-icon" />
                    <input 
                      type="text" 
                      placeholder="Pesquisar nas promoções..." 
                      value={promoSearch}
                      onChange={(e) => setPromoSearch(e.target.value)}
                    />
                  </div>
                  
                  {/* Sorter */}
                  <div className="promo-sort-select">
                    <ArrowUpDown size={18} />
                    <select value={promoSortBy} onChange={(e) => setPromoSortBy(e.target.value as SortOption)}>
                      <option value="discount_desc">Maior Desconto %</option>
                      <option value="price_asc">Menor Preço R$</option>
                      <option value="price_desc">Maior Preço R$</option>
                      <option value="name_asc">Nome (A-Z)</option>
                    </select>
                  </div>

                  {/* View Toggle */}
                  <div className="view-mode-toggle-box">
                    <button onClick={() => setViewMode('grid')} className={viewMode === 'grid' ? 'active' : ''}><LayoutGrid size={20} /></button>
                    <button onClick={() => setViewMode('list')} className={viewMode === 'list' ? 'active' : ''}><List size={20} /></button>
                  </div>
                </div>
              </div>

              {/* Horizontal Filters (Category & Store) */}
              <div className="promo-filters-scroll">
                <div className="filter-group">
                  <span className="filter-label"><Filter size={12} /> Categorias:</span>
                  <button 
                    onClick={() => setSelectedPromoCategory(null)} 
                    className={`filter-pill ${!selectedPromoCategory ? 'active' : ''}`}
                  >
                    Todas
                  </button>
                  {categories.map(cat => (
                    <button 
                      key={cat} 
                      onClick={() => setSelectedPromoCategory(selectedPromoCategory === cat ? null : cat)} 
                      className={`filter-pill ${selectedPromoCategory === cat ? 'active' : ''}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                <div className="filter-divider" />
                <div className="filter-group">
                  <span className="filter-label"><StoreIcon size={12} /> Lojas:</span>
                  <button 
                    onClick={() => setSelectedPromoStore(null)} 
                    className={`filter-pill ${!selectedPromoStore ? 'active' : ''}`}
                  >
                    Todas
                  </button>
                  {MOCK_STORES.map(store => (
                    <button 
                      key={store.id} 
                      onClick={() => setSelectedPromoStore(selectedPromoStore === store.id ? null : store.id)} 
                      className={`filter-pill ${selectedPromoStore === store.id ? 'active' : ''}`}
                    >
                      {renderLogo(store.logo, '16px')} {store.name}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Product Grid / List with Ad Integration */}
              {promoItemsToRender.length > 0 ? (
                <div className={viewMode === 'grid' ? "product-grid" : "product-list-view"}>
                  {promoItemsToRender.map(item => (
                    item.type === 'product' && item.data ? (
                      <ProductCard 
                        key={item.id} 
                        product={item.data} 
                        onAdd={addToCart} 
                        onStoreClick={handleStoreClick}
                        layout={viewMode}
                        isFavorite={favorites.includes(item.data.id)}
                        onToggleFavorite={toggleFavorite}
                        isComparing={compareList.some(p => p.id === item.data.id)}
                        onToggleCompare={toggleCompare}
                      />
                    ) : (
                      <InlineAdBanner key={item.id} layout={viewMode} />
                    )
                  ))}
                </div>
              ) : (
                <div className="empty-state-box animate">
                   <AlertTriangle size={48} opacity={0.3} />
                   <p>Nenhuma promoção encontrada para os filtros aplicados.</p>
                   <button className="btn btn-ghost" onClick={() => { setPromoSearch(''); setSelectedPromoCategory(null); setSelectedPromoStore(null); }}>Limpar Filtros</button>
                </div>
              )}
            </div>
          } />

          <Route path="/stores" element={
            <div className="animate">
              <div className="store-page-header" style={{ marginBottom: '30px' }}>
                <h2 className="store-page-title">Supermercados Parceiros</h2>
                <div className="store-search-container" ref={storeSearchRef}>
                  <Search size={18} className="store-search-icon" />
                  <input 
                    type="text" 
                    placeholder="Nome ou Bairro..." 
                    className="store-search-input"
                    value={storeQuery} 
                    onChange={(e) => handleStoreInputChange(e.target.value)} 
                    onFocus={() => storeQuery.length > 0 && setShowStoreSuggestions(true)}
                  />
                  {showStoreSuggestions && <SuggestionsList list={storeSuggestions} onSelect={(_, name) => handleStoreSelect(name)} isStoreSearch />}
                </div>
              </div>
              <div className="store-grid">
                {filteredStores.map(store => (
                  <div key={store.id} className="card store-card" onClick={() => handleStoreClick(store.id)} style={{cursor: 'pointer', padding: '24px', textAlign: 'center'}}>
                    <div style={{height: '80px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem'}}>{renderLogo(store.logo, '80px', store.name)}</div>
                    <h3 style={{fontWeight: 800, fontSize: '1.15rem', marginBottom: '8px', lineHeight: 1.2, height: '2.4em', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{store.name}</h3>
                    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px', color: 'var(--text-muted)', fontSize: '0.8rem', lineHeight: 1.3}}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={14} /> <span>{store.address.street}, {store.address.number}</span>
                      </div>
                      <span style={{ fontWeight: 700 }}>{store.address.neighborhood}</span>
                      <span style={{ fontSize: '0.7rem', opacity: 0.7, fontStyle: 'italic' }}>Ref: {store.address.reference}</span>
                    </div>
                    <button className="btn btn-ghost" style={{marginTop: '20px', width: '100%', borderRadius: '12px'}}>Ver Ofertas</button>
                  </div>
                ))}
              </div>
            </div>
          } />

          <Route path="/favorites" element={
            <div className="animate">
              <h2 style={{fontWeight: 800, fontSize: '2rem', marginBottom: '30px'}}>Meus Favoritos</h2>
              {favoriteProducts.length === 0 ? (
                <div style={{textAlign: 'center', padding: '60px', border: '2px dashed var(--border)', borderRadius: '30px'}}>
                  <Heart size={48} style={{ color: 'var(--text-muted)', opacity: 0.3, marginBottom: '16px' }} />
                  <p style={{color: 'var(--text-muted)', marginBottom: '20px'}}>Você ainda não favoritou nenhum produto.</p>
                  <button className="btn btn-primary" onClick={() => navigate('/')}>Buscar Produtos</button>
                </div>
              ) : (
                <div className="product-grid">
                  {favoriteProducts.map(product => (
                    <ProductCard 
                      key={product.id} 
                      product={product} 
                      onAdd={addToCart} 
                      onStoreClick={handleStoreClick}
                      isFavorite={true}
                      onToggleFavorite={toggleFavorite}
                      isComparing={compareList.some(p => p.id === product.id)}
                      onToggleCompare={toggleCompare}
                    />
                  ))}
                </div>
              )}
            </div>
          } />

          <Route path="/search" element={
            <div className="animate">
              <div className="flex items-center justify-between" style={{ marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
                <div className="flex items-center gap-2">
                  <button className="btn btn-ghost" onClick={() => navigate('/')} data-tooltip="Fechar resultados" style={{ padding: '8px' }}><X size={20} /></button>
                  <h2 style={{fontWeight: 800, fontSize: '1.25rem'}}>{filteredAndSortedResults.length} resultados para "{query}"</h2>
                </div>
              </div>
              <div className="flex items-center justify-between" style={{ marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
                <div className="flex items-center gap-4">
                  <div style={{ display: 'flex', background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '4px' }}>
                    <button onClick={() => setViewMode('grid')} className={`btn-icon ${viewMode === 'grid' ? 'active' : ''}`} data-tooltip="Grelha"><LayoutGrid size={18} /></button>
                    <button onClick={() => setViewMode('list')} className={`btn-icon ${viewMode === 'list' ? 'active' : ''}`} data-tooltip="Lista"><List size={18} /></button>
                  </div>
                  <div className="flex items-center gap-2">
                    <ArrowUpDown size={16} color="var(--text-muted)" />
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortOption)} style={{ background: 'var(--card-bg)', color: 'var(--text-main)', border: '1px solid var(--border)', padding: '6px 12px', borderRadius: '10px', fontSize: '0.85rem', outline: 'none' }}>
                      <option value="price_asc">Preço (Menor para Maior)</option>
                      <option value="price_desc">Preço (Maior para Menor)</option>
                      <option value="name_asc">Nome (A-Z)</option>
                    </select>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '8px', scrollbarWidth: 'none' }}>
                <button onClick={() => setOnlyPromos(!onlyPromos)} className={`btn ${onlyPromos ? 'btn-primary' : 'btn-ghost'}`} style={{ fontSize: '0.75rem', padding: '6px 12px', whiteSpace: 'nowrap' }}><Tag size={14} /> Em Promoção</button>
                <div style={{ width: '1px', background: 'var(--border)', margin: '0 5px' }}></div>
                {categories.map(cat => (<button key={cat} onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)} className={`btn ${selectedCategory === cat ? 'btn-primary' : 'btn-ghost'}`} style={{ fontSize: '0.75rem', padding: '6px 12px', whiteSpace: 'nowrap' }}>{cat}</button>))}
                <div style={{ width: '1px', background: 'var(--border)', margin: '0 5px' }}></div>
                {MOCK_STORES.map(store => (<button key={store.id} onClick={() => setSelectedStore(selectedStore === store.id ? null : store.id)} className={`btn ${selectedStore === store.id ? 'btn-primary' : 'btn-ghost'}`} style={{ fontSize: '0.75rem', padding: '6px 12px', whiteSpace: 'nowrap' }}>{renderLogo(store.logo, '16px', store.name)} {store.name}</button>))}
              </div>
              {isSearching ? (
                <div style={{ textAlign: 'center', padding: '80px 0' }}>
                  <div className="logo-icon animate" style={{ margin: '0 auto 20px', width: '50px', height: '50px' }}><StoreIcon size={24} /></div>
                  <p style={{color: 'var(--text-muted)', fontWeight: 600}}>Sincronizando ofertas locais...</p>
                </div>
              ) : itemsToRender.length > 0 ? (
                <div className={viewMode === 'grid' ? "product-grid" : "product-list-view"}>
                  {itemsToRender.map(item => (
                    item.type === 'product' && item.data ? (
                      <ProductCard 
                        key={item.id} 
                        product={item.data} 
                        onAdd={addToCart} 
                        onStoreClick={handleStoreClick} 
                        layout={viewMode}
                        isFavorite={favorites.includes(item.data.id)}
                        onToggleFavorite={toggleFavorite}
                        isComparing={compareList.some(p => p.id === item.data.id)}
                        onToggleCompare={toggleCompare}
                      />
                    ) : (
                      <InlineAdBanner key={item.id} layout={viewMode} />
                    )
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '60px', border: '2px dashed var(--border)', borderRadius: '20px' }}>
                  <p style={{ color: 'var(--text-muted)' }}>Nenhum produto encontrado. Tente ajustar os filtros ou pesquisar outro termo.</p>
                  <button className="btn btn-ghost" style={{ marginTop: '16px' }} onClick={() => { setSelectedCategory(null); setSelectedStore(null); setOnlyPromos(false); }}>Limpar Filtros</button>
                </div>
              )}
            </div>
          } />

          <Route path="/store/:id" element={<StoreDetailView onAddToCart={addToCart} onStoreClick={handleStoreClick} onToggleFavorite={toggleFavorite} favorites={favorites} compareList={compareList} onToggleCompare={toggleCompare} />} />
          
          {MOCK_STORES.map(s => (
            <Route key={`alias-${s.id}`} path={`/${s.id}`} element={<StoreDetailView onAddToCart={addToCart} onStoreClick={handleStoreClick} onToggleFavorite={toggleFavorite} favorites={favorites} compareList={compareList} onToggleCompare={toggleCompare} />} />
          ))}

          <Route path="/cart" element={
            <div className="animate" style={{maxWidth: '800px', margin: '0 auto'}}>
              <div className="flex items-center justify-between" style={{ marginBottom: '30px' }}>
                <h2 style={{fontWeight: 800, fontSize: '2rem'}}>Minha Lista</h2>
                {cart.length > 0 && (
                  <button className="btn btn-ghost" style={{ color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.2)' }} onClick={() => setIsClearModalOpen(true)}>
                    <Trash2 size={18} /> Limpar
                  </button>
                )}
              </div>
              {cart.length === 0 ? (
                <div style={{textAlign: 'center', padding: '60px', border: '2px dashed var(--border)', borderRadius: '30px'}}>
                  <ShoppingCart size={48} style={{ color: 'var(--text-muted)', opacity: 0.3, marginBottom: '16px' }} />
                  <p style={{color: 'var(--text-muted)', marginBottom: '20px'}}>Sua lista está vazia.</p>
                  <button className="btn btn-primary" onClick={() => navigate('/')}>Buscar Produtos</button>
                </div>
              ) : (
                <div style={{display: 'grid', gap: '24px'}}>
                  <div style={{background: 'var(--card-bg)', borderRadius: '24px', padding: '24px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)'}}>
                    {cart.map(item => (
                      <div key={item.id} className="flex justify-between items-center" style={{padding: '15px 0', borderBottom: '1px solid var(--border)'}}>
                        <div>
                          <h4 style={{fontWeight: 700, color: 'var(--text-main)'}}>{item.name}</h4>
                          <p style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>{item.storeName} • {item.quantity} un.</p>
                        </div>
                        <div style={{textAlign: 'right'}}>
                          <p style={{fontWeight: 800, color: 'var(--primary)', fontSize: '1.2rem', marginBottom: '8px'}}>R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}</p>
                          <div className="flex items-center justify-end gap-3">
                            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: '10px', background: 'var(--bg)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
                              <button onClick={() => decrementInCart(item.id)} style={{ background: 'none', color: 'var(--text-main)', border: 'none', padding: '6px 14px', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', transition: 'background 0.2s' }} className="qty-btn">-</button>
                              <span style={{ background: 'var(--card-bg)', color: 'var(--text-main)', padding: '6px 0', minWidth: '40px', textAlign: 'center', fontWeight: 800, fontSize: '0.95rem', borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)' }}>{item.quantity}</span>
                              <button onClick={() => addToCart(item)} style={{ background: 'none', color: 'var(--text-main)', border: 'none', padding: '6px 14px', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', transition: 'background 0.2s' }} className="qty-btn">+</button>
                            </div>
                            <button onClick={() => removeFromCart(item.id)} data-tooltip="Remover item da lista" style={{ color: 'var(--danger)', background: 'rgba(239, 68, 68, 0.08)', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer', transition: 'all 0.2s' }} className="delete-btn"><Trash2 size={18} /></button>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '2px solid var(--border)', textAlign: 'right' }}>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>VALOR TOTAL ESTIMADO</p>
                      <p style={{ fontSize: '2.4rem', fontWeight: 900, color: 'var(--text-main)' }}>R$ {cart.reduce((acc, item) => acc + (item.price * item.quantity), 0).toFixed(2).replace('.', ',')}</p>
                    </div>
                  </div>
                  <CartOptimizer cart={cart} onAdd={addToCart} onDecrement={decrementInCart} onRemove={removeFromCart} />
                </div>
              )}
            </div>
          } />
        </Routes>
      </main>

      {/* Floating Compare Bar - Moved to Left Side (Desktop) */}
      {compareList.length > 0 && (
        <div className="compare-floating-bar animate-pop">
          <div className="compare-bar-layout">
            <div className="compare-header">
              <Scale size={20} color="var(--primary)" />
              <span className="compare-count-label">{compareList.length}/3</span>
            </div>
            
            <div className="compare-items-stack">
              {compareList.map(item => (
                <div key={item.id} className="compare-mini-item" data-tooltip={`Remover ${item.name}`}>
                  <ShoppingBasket size={18} color="var(--primary)" style={{ opacity: 0.5 }} />
                  <button onClick={() => toggleCompare(item)} className="mini-remove"><X size={10} /></button>
                </div>
              ))}
              {Array.from({ length: 3 - compareList.length }).map((_, i) => (
                <div key={`empty-${i}`} className="compare-mini-item empty">
                  <Plus size={14} color="var(--border)" />
                </div>
              ))}
            </div>

            <div className="compare-actions-stack">
              <button 
                className="btn btn-primary btn-compare-main" 
                onClick={() => setIsCompareModalOpen(true)}
                disabled={compareList.length < 2}
                data-tooltip={compareList.length < 2 ? "Selecione ao menos 2 itens" : "Comparar agora"}
              >
                <BarChart2 size={18} />
              </button>
              <button className="btn btn-ghost btn-clear-mini" onClick={clearCompare} data-tooltip="Limpar tudo">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comparison Modal */}
      {isCompareModalOpen && (
        <div className="modal-overlay" onClick={() => setIsCompareModalOpen(false)}>
          <div className="modal-content comparison-modal animate-pop" onClick={e => e.stopPropagation()} style={{ maxWidth: '900px', width: '95%' }}>
            <div className="flex justify-between items-center" style={{ marginBottom: '24px' }}>
              <div className="flex items-center gap-2">
                <Scale size={24} color="var(--primary)" />
                <h3 style={{ fontWeight: 800, fontSize: '1.4rem' }}>Comparativo Side-by-Side</h3>
              </div>
              <button className="btn btn-ghost" onClick={() => setIsCompareModalOpen(false)} style={{ padding: '8px' }} data-tooltip="Fechar comparativo"><X size={24} /></button>
            </div>

            <div className="comparison-table-wrapper">
              <table className="comparison-table">
                <thead>
                  <tr>
                    <th style={{ width: '200px', textAlign: 'left' }}>Atributo</th>
                    {compareList.map(item => (
                      <th key={item.id} style={{ minWidth: '150px' }}>
                        <div style={{ textAlign: 'center' }}>
                          <div className="mini-img-placeholder">
                            <ShoppingBasket size={32} opacity={0.1} color="var(--primary)" />
                          </div>
                          <p style={{ fontWeight: 700, fontSize: '0.85rem', marginTop: '10px', height: '2.6em', overflow: 'hidden' }}>{item.name}</p>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Preço</strong></td>
                    {compareList.map(item => (
                      <td key={item.id}>
                        <div style={{ textAlign: 'center' }}>
                          <span style={{ fontSize: '1.2rem', fontWeight: 800, color: item.isPromo ? 'var(--danger)' : 'var(--primary)' }}>R$ {item.price.toFixed(2).replace('.', ',')}</span>
                          {item.isPromo && <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>R$ {item.originalPrice.toFixed(2).replace('.', ',')}</span>}
                        </div>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td><strong>Loja</strong></td>
                    {compareList.map(item => {
                      const storeData = MOCK_STORES.find(s => s.id === item.storeId);
                      return (
                        <td key={item.id}>
                          <div className="flex items-center justify-center gap-2">
                            {renderLogo(storeData?.logo || '', '24px', item.storeName)}
                            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{item.storeName}</span>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                  <tr>
                    <td><strong>Categoria</strong></td>
                    {compareList.map(item => (
                      <td key={item.id} style={{ textAlign: 'center' }}>
                        <span style={{ fontSize: '0.7rem', background: 'var(--primary-light)', color: 'var(--primary)', padding: '2px 8px', borderRadius: '4px', fontWeight: 800 }}>{item.category}</span>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td><strong>Ações</strong></td>
                    {compareList.map(item => (
                      <td key={item.id}>
                        <div style={{ textAlign: 'center' }}>
                          <button 
                            className="btn btn-primary" 
                            style={{ fontSize: '0.7rem', padding: '6px 12px' }}
                            onClick={() => { addToCart(item); setIsCompareModalOpen(false); }}
                            data-tooltip="Adicionar este à lista"
                          >
                            Add à Lista
                          </button>
                        </div>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {isClearModalOpen && (
        <div className="modal-overlay" onClick={() => setIsClearModalOpen(false)}>
          <div className="modal-content animate-pop" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon-container"><AlertTriangle size={32} color="var(--danger)" /></div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '12px', color: 'var(--text-main)' }}>Limpar sua lista?</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '28px', fontSize: '0.95rem' }}>Essa ação irá remover todos os {totalItemsCount} itens da sua lista de compras atual.</p>
            <div className="flex gap-4 justify-center" style={{ width: '100%' }}>
              <button className="btn btn-ghost" style={{ flex: 1, padding: '12px', borderRadius: '14px' }} onClick={() => setIsClearModalOpen(false)}>Cancelar</button>
              <button className="btn btn-primary" style={{ flex: 1, padding: '12px', borderRadius: '14px', background: 'var(--danger)' }} onClick={clearCart}>Sim, limpar tudo</button>
            </div>
          </div>
        </div>
      )}

      <button onClick={scrollToTop} className={`btn-back-to-top ${showBackToTop ? 'show' : ''}`} aria-label="Voltar ao topo" data-tooltip="Voltar ao topo"><ArrowUp size={24} /></button>

      <style dangerouslySetInnerHTML={{ __html: `
        .badge-count { position: absolute; top: -5px; right: -5px; background: var(--primary); color: white; border-radius: 50%; width: 20px; height: 20px; font-size: 0.7rem; display: flex; align-items: center; justify-content: center; font-weight: 800; box-shadow: 0 0 0 2px var(--card-bg); }
        @keyframes pop { 0% { transform: scale(0.9); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        .animate-pop { animation: pop 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        .qty-btn:hover { background: rgba(0,0,0,0.05); }
        .delete-btn:hover { background: rgba(239, 68, 68, 0.15); transform: scale(1.05); }
        
        /* Sidebar Styles */
        .sidebar-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(4px); z-index: 1900; }
        .sidebar-menu { position: fixed; top: 0; right: 0; bottom: 0; width: 280px; background: var(--card-bg); z-index: 2000; box-shadow: -10px 0 30px rgba(0,0,0,0.1); border-left: 1px solid var(--border); display: flex; flex-direction: column; }
        .sidebar-header { padding: 20px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; }
        .sidebar-content { flex: 1; padding: 20px; display: flex; flex-direction: column; gap: 8px; }
        .sidebar-link { display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-radius: 12px; font-weight: 700; color: var(--text-main); text-decoration: none; transition: all 0.2s; }
        .sidebar-link:hover { background: var(--primary-light); color: var(--primary); }
        .sidebar-link:hover .badge-count { box-shadow: 0 0 0 2px var(--primary-light); }
        .sidebar-footer { padding: 20px; border-top: 1px solid var(--border); }
        
        @keyframes slideLeft { from { transform: translateX(100%); } to { transform: translateX(0); } }
        .animate-slide-left { animation: slideLeft 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards; }

        .suggestions-dropdown { position: absolute; top: calc(100% + 8px); left: 0; right: 0; background: var(--card-bg); backdrop-filter: blur(20px); border: 1px solid var(--border); border-radius: 20px; box-shadow: 0 10px 40px -10px rgba(0,0,0,0.2); z-index: 1000; overflow: hidden; padding: 8px; }
        .suggestion-item { display: flex; align-items: center; gap: 14px; padding: 10px 14px; cursor: pointer; border-radius: 12px; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); }
        .suggestion-item:hover { background: var(--primary-light); transform: translateX(4px); }
        .suggestion-icon-wrapper { width: 32px; height: 32px; background: var(--bg); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: var(--text-muted); transition: all 0.2s; }
        .suggestion-item:hover .suggestion-icon-wrapper { background: var(--primary); color: white; }
        .suggestion-content { flex: 1; display: flex; flex-direction: column; text-align: left; }
        .suggestion-text { font-size: 0.95rem; font-weight: 700; color: var(--text-main); }
        .suggestion-type-label { font-size: 0.65rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
        .suggestion-chevron { opacity: 0; transform: translateX(-10px); transition: all 0.2s; color: var(--primary); }
        .suggestion-item:hover .suggestion-chevron { opacity: 1; transform: translateX(0); }
        .btn-back-to-top { position: fixed; bottom: 30px; right: 30px; width: 50px; height: 50px; border-radius: 50%; background: var(--primary); color: white; border: none; box-shadow: var(--shadow-lg); cursor: pointer; display: flex; align-items: center; justify-content: center; z-index: 1000; opacity: 0; visibility: hidden; transform: translateY(20px); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        .btn-back-to-top.show { opacity: 1; visibility: visible; transform: translateY(0); }
        .btn-back-to-top:hover { background: var(--primary-hover); transform: translateY(-5px) scale(1.05); }
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.5); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 2000; padding: 20px; }
        .modal-content { background: var(--card-bg); max-width: 400px; width: 100%; padding: 32px; border-radius: 24px; text-align: center; box-shadow: 0 20px 40px -10px rgba(0,0,0,0.3); border: 1px solid var(--border); }
        .modal-icon-container { width: 64px; height: 64px; background: rgba(239, 68, 68, 0.1); border-radius: 20px; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; }
        .btn-icon { background: none; border: none; padding: 8px; border-radius: 8px; cursor: pointer; color: var(--text-muted); transition: all 0.2s; display: flex; align-items: center; justify-content: center; }
        .btn-icon:hover { background: var(--bg); color: var(--text-main); }
        .btn-icon.active { background: var(--primary-light); color: var(--primary); }
        
        .mobile-only { display: none; }
        .hide-mobile { display: inline-flex; }

        /* Promo Page Exclusive Styles */
        .promo-page-hero { margin-bottom: 40px; }
        .promo-badge-icon { background: var(--danger); color: white; width: 64px; height: 64px; border-radius: 20px; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 20px rgba(239, 68, 68, 0.2); }
        .promo-controls-grid { display: grid; grid-template-columns: 1fr auto auto; gap: 16px; margin-top: 30px; align-items: center; }
        .promo-search-bar { position: relative; }
        .promo-search-icon { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: var(--text-muted); }
        .promo-search-bar input { width: 100%; padding: 14px 20px 14px 50px; border-radius: 16px; border: 2px solid var(--border); background: var(--card-bg); color: var(--text-main); font-weight: 600; outline: none; transition: border-color 0.2s; }
        .promo-search-bar input:focus { border-color: var(--primary); }
        .promo-sort-select { display: flex; align-items: center; gap: 10px; background: var(--card-bg); border: 2px solid var(--border); padding: 0 16px; border-radius: 16px; color: var(--text-muted); }
        .promo-sort-select select { border: none; background: none; padding: 14px 0; color: var(--text-main); font-weight: 700; outline: none; font-family: inherit; cursor: pointer; }
        .view-mode-toggle-box { display: flex; background: var(--card-bg); border: 2px solid var(--border); padding: 4px; border-radius: 16px; gap: 4px; }
        .view-mode-toggle-box button { border: none; background: none; padding: 10px; border-radius: 12px; color: var(--text-muted); cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; }
        .view-mode-toggle-box button.active { background: var(--primary); color: white; box-shadow: 0 4px 10px rgba(16, 185, 129, 0.2); }

        .promo-filters-scroll { display: flex; align-items: center; gap: 20px; overflow-x: auto; padding: 15px 0; margin-bottom: 20px; scrollbar-width: none; }
        .promo-filters-scroll::-webkit-scrollbar { display: none; }
        .filter-group { display: flex; align-items: center; gap: 10px; white-space: nowrap; }
        .filter-label { font-size: 0.75rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 6px; }
        .filter-pill { padding: 8px 18px; border-radius: 100px; border: 1.5px solid var(--border); background: var(--card-bg); color: var(--text-main); font-weight: 700; font-size: 0.85rem; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 8px; }
        .filter-pill:hover { border-color: var(--primary); color: var(--primary); transform: translateY(-1px); }
        .filter-pill.active { background: var(--primary); border-color: var(--primary); color: white; box-shadow: 0 4px 10px rgba(16, 185, 129, 0.2); }
        .filter-divider { width: 1px; height: 30px; background: var(--border); flex-shrink: 0; }

        .empty-state-box { padding: 100px 20px; text-align: center; background: var(--card-bg); border-radius: 30px; border: 2px dashed var(--border); display: flex; flex-direction: column; align-items: center; gap: 20px; }
        .empty-state-box p { color: var(--text-muted); font-weight: 600; font-size: 1.1rem; }

        @media (max-width: 768px) {
          .header-nav { display: none; }
          .mobile-only { display: inline-flex; }
          .hide-mobile { display: none !important; }
          .promo-controls-grid { grid-template-columns: 1fr; }
          .view-mode-toggle-box { justify-content: center; }
          .promo-filters-scroll { gap: 12px; }
          .filter-divider { display: none; }
          .promo-filters-scroll { flex-direction: column; align-items: flex-start; }
          
          .compare-floating-bar {
            left: 50% !important;
            top: auto !important;
            bottom: 24px !important;
            transform: translateX(-50%) !important;
            width: auto !important;
            padding: 10px 20px !important;
            flex-direction: row !important;
          }
          .compare-bar-layout { flex-direction: row !important; gap: 15px !important; }
          .compare-items-stack, .compare-actions-stack { flex-direction: row !important; }
          
          .store-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }
          .store-card {
            padding: 16px !important;
          }
          .store-card h3 {
            font-size: 0.95rem !important;
          }
          .store-card .btn-ghost {
            font-size: 0.75rem !important;
            padding: 8px !important;
          }
        }
        
        /* Desktop Store Grid */
        @media (min-width: 769px) {
          .store-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 20px;
          }
        }

        /* Estilos para o cabeçalho da página de lojas */
        .store-page-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }
        .store-page-title {
          font-weight: 800;
          font-size: 2rem;
        }
        .store-search-container {
          position: relative;
          max-width: 350px;
          width: 100%;
        }
        .store-search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
          z-index: 10;
        }
        .store-search-input {
          padding: 12px 10px 12px 40px;
          width: 100%;
          border-radius: 14px;
          border: 2px solid var(--border);
          background: var(--card-bg);
          color: var(--text-main);
          font-size: 0.95rem;
          outline: none;
          transition: all 0.2s;
        }
        .store-search-input:focus {
          border-color: var(--primary);
          box-shadow: 0 0 0 3px var(--primary-light);
        }

        @media (max-width: 768px) {
          .store-page-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }
          .store-page-title {
            font-size: 1.5rem;
            line-height: 1.1;
          }
          .store-search-container {
            max-width: none;
          }
        }

        .notif-pulse { animation: bellPulse 2s infinite; }
        @keyframes bellPulse { 0% { transform: scale(1); } 50% { transform: scale(1.1); background: var(--primary-light); } 100% { transform: scale(1); } }
        .notif-dropdown { position: absolute; top: calc(100% + 12px); right: 0; width: 320px; background: var(--card-bg); border: 1px solid var(--border); border-radius: 20px; box-shadow: var(--shadow-lg); z-index: 1000; overflow: hidden; }
        .notif-scroll-area { max-height: 400px; overflow-y: auto; }
        .notif-item { display: flex; gap: 12px; padding: 16px; cursor: pointer; border-bottom: 1px solid var(--border); transition: background 0.2s; }
        .notif-item:hover { background: var(--bg); }
        .notif-item:last-child { border-bottom: none; }
        .notif-type-icon { width: 32px; height: 32px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .notif-type-icon.PROMO { background: #dcfce7; color: #16a34a; }
        .notif-type-icon.BETTER_DEAL { background: #fef3c7; color: #d97706; }
        .notif-type-icon.PRICE_DROP { background: #dbeafe; color: #2563eb; }
        .product-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 20px; }
        .product-list-view { display: flex; flex-direction: column; gap: 16px; margin-top: 30px; width: 100%; }
        @media (max-width: 768px) {
          .product-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
          .product-list-view { gap: 12px; }
          .notif-dropdown { position: fixed; top: 70px; right: 10px; left: 10px; width: auto; }
        }
        .nav-link { background: none; border: none; font-family: inherit; font-weight: 700; color: var(--text-muted); cursor: pointer; padding: 8px 12px; border-radius: 8px; transition: all 0.2s; text-decoration: none; }
        .nav-link:hover { color: var(--primary); background: var(--primary-light); }
        .nav-link.active { color: var(--primary); }
        .store-card:hover { transform: translateY(-8px); border-color: var(--primary); }
        
        /* Optimized Side Comparison Bar */
        .compare-floating-bar {
          position: fixed;
          top: 140px;
          left: 24px;
          background: var(--card-bg);
          border: 2px solid var(--primary);
          border-radius: 20px;
          padding: 16px;
          box-shadow: 0 15px 40px rgba(16, 185, 129, 0.25);
          z-index: 1500;
          width: 76px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .compare-bar-layout {
          display: flex;
          flex-direction: column;
          gap: 20px;
          align-items: center;
        }
        .compare-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }
        .compare-items-stack {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .compare-actions-stack {
          display: flex;
          flex-direction: column;
          gap: 10px;
          width: 100%;
          border-top: 1px solid var(--border);
          padding-top: 16px;
        }
        .btn-compare-main {
          width: 44px !important;
          height: 44px !important;
          padding: 0 !important;
          justify-content: center !important;
          border-radius: 12px !important;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }
        .btn-clear-mini {
          width: 44px !important; height: 36px !important; padding: 0 !important; justify-content: center !important; border-radius: 10px !important; color: var(--danger) !important; border-color: rgba(239, 68, 68, 0.1) !important; } .btn-compare-main:disabled { background: var(--border); box-shadow: none; } .compare-mini-item { width: 44px; height: 44px; border-radius: 12px; background: var(--bg); border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; position: relative; transition: all 0.2s; } .compare-mini-item:hover:not(.empty) { border-color: var(--primary); background: var(--primary-light); } .compare-mini-item.empty { border-style: dashed; background: transparent; } .compare-count-label { font-weight: 800; font-size: 0.75rem; color: var(--text-main); } .mini-remove { position: absolute; top: -6px; right: -6px; background: var(--danger); color: white; border: none; width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 10px; box-shadow: 0 2px 6px rgba(0,0,0,0.25); z-index: 10; } .comparison-table-wrapper { overflow-x: auto; margin-top: 20px; border-radius: 16px; border: 1px solid var(--border); } .comparison-table { width: 100%; border-collapse: collapse; background: var(--card-bg); } .comparison-table th, .comparison-table td { padding: 16px; border-bottom: 1px solid var(--border); border-right: 1px solid var(--border); } .comparison-table th { background: var(--bg); color: var(--text-main); font-weight: 800; } .comparison-table tr:last-child td { border-bottom: none; } .comparison-table td:last-child, .comparison-table th:last-child { border-right: none; } .mini-img-placeholder { width: 80px; height: 80px; background: var(--bg); border-radius: 12px; margin: 0 auto; display: flex; align-items: center; justify-content: center; border: 1px solid var(--border); } ` }} /> </div> ); } function SuggestionsList({ list, onSelect, isStoreSearch = false }: { list: SuggestionItem[], onSelect: (e: any, name: string, type: any) => void, isStoreSearch?: boolean }) { return ( <div className="suggestions-dropdown animate"> <div style={{ padding: '8px 12px', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', borderBottom: '1px solid var(--border)', marginBottom: '4px' }}> {isStoreSearch ? 'Sugestões de Estabelecimento' : 'Sugestões no Banco'} </div> {list.length > 0 ? ( list.map((item, idx) => ( <div key={idx} className="suggestion-item" onClick={(e) => onSelect(e, item.name, item.type)}> <div className="suggestion-icon-wrapper"> {item.type === 'category' && <Tag size={14} />} {item.type === 'product' && <Package size={14} />} {item.type === 'store' && <StoreIcon size={14} />} {item.type === 'neighborhood' && <MapPin size={14} />} </div> <div className="suggestion-content"> <span className="suggestion-text">{item.name}</span> <span className="suggestion-type-label"> {item.type === 'category' && 'Categoria'} {item.type === 'product' && 'Produto'} {item.type === 'store' && 'Supermercado'} {item.type === 'neighborhood' && 'Bairro'} </span> </div> <ChevronRight size={14} className="suggestion-chevron" /> </div> )) ) : ( <div style={{ padding: '20px', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}> Sem resultados aproximados </div> )} </div> ); } function App() { return ( <Router> <AppContent /> </Router> ); } export default App;
