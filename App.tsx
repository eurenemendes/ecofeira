
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  Search, ShoppingCart, Store as StoreIcon, Trash2, History, X, Moon, Sun, 
  Tag, ArrowUp, ChevronRight, Package, Check, AlertTriangle, LayoutGrid, 
  List, ArrowLeft, MapPin, BookOpen, ChevronUp, Bell, BellOff, Info, 
  TrendingDown, Sparkles, Clock, ArrowUpDown
} from 'lucide-react';
import { searchProductsWithGemini } from './services/geminiService';
import { ProductOffer, CartItem, AppView, Store, AppNotification } from './types';
import { INITIAL_SUGGESTIONS, MOCK_STORES, RAW_PRODUCTS } from './constants';
import ProductCard from './components/ProductCard';
import CartOptimizer from './components/CartOptimizer';
import BannerCarousel from './components/BannerCarousel';
import InlineAdBanner from './components/InlineAdBanner';
import StoreFlyer from './components/StoreFlyer';

type SortOption = 'price_asc' | 'price_desc' | 'name_asc';
type ViewMode = 'grid' | 'list';

interface SuggestionItem {
  name: string;
  type: 'product' | 'category';
}

interface RenderItem {
  type: 'product' | 'ad';
  data?: ProductOffer;
  id: string;
}

function App() {
  const [view, setView] = useState<AppView>(AppView.HOME);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [query, setQuery] = useState('');
  const [storeQuery, setStoreQuery] = useState('');
  const [selectedStoreData, setSelectedStoreData] = useState<Store | null>(null);
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<ProductOffer[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('ecofeira_theme') === 'dark');
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [isFlyerExpanded, setIsFlyerExpanded] = useState(false);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const headerSearchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedStore, setSelectedStore] = useState<string | null>(null);
  const [onlyPromos, setOnlyPromos] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('price_asc');

  const categories = useMemo(() => Array.from(new Set(RAW_PRODUCTS.map(p => p.categoria))), []);
  const stores = useMemo(() => MOCK_STORES, []);

  const filteredStores = useMemo(() => {
    return MOCK_STORES.filter(s => s.name.toLowerCase().includes(storeQuery.toLowerCase()));
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

  // Hydration and Notification Logic
  useEffect(() => {
    const savedHistory = localStorage.getItem('ecofeira_history');
    if (savedHistory) try { setSearchHistory(JSON.parse(savedHistory)); } catch (e) {}
    
    const savedCart = localStorage.getItem('ecofeira_cart');
    if (savedCart) try { setCart(JSON.parse(savedCart)); } catch (e) {}

    const savedNotifs = localStorage.getItem('ecofeira_notifs');
    if (savedNotifs) try { setNotifications(JSON.parse(savedNotifs)); } catch (e) {}
  }, []);

  useEffect(() => { localStorage.setItem('ecofeira_history', JSON.stringify(searchHistory)); }, [searchHistory]);
  useEffect(() => { localStorage.setItem('ecofeira_cart', JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem('ecofeira_notifs', JSON.stringify(notifications)); }, [notifications]);

  // Automated Notification Generator (Simulating Background Checks)
  useEffect(() => {
    if (cart.length === 0 && searchHistory.length === 0) return;

    const generateNotifications = () => {
      const newNotifs: AppNotification[] = [];
      
      // Check for better deals for items in cart
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

      // Check for promos on history items
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

    const timer = setTimeout(generateNotifications, 3000); // Check 3s after activity
    return () => clearTimeout(timer);
  }, [cart, searchHistory, notifications.length]);

  const handleInputChange = (val: string) => {
    setQuery(val);
    if (val.trim().length > 0) {
      const lowerVal = val.toLowerCase();
      const categoryMatches: SuggestionItem[] = categories
        .filter(cat => cat.toLowerCase().includes(lowerVal))
        .map(name => ({ name, type: 'category' }));
      const productMatches: SuggestionItem[] = Array.from(new Set(RAW_PRODUCTS
        .filter(p => p.produto.toLowerCase().includes(lowerVal))
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

  const handleSearch = async (e?: React.FormEvent, queryOverride?: string, type?: 'product' | 'category') => {
    if (e) e.preventDefault();
    const term = queryOverride || query;
    if (!term.trim()) return;
    setQuery(term);
    setShowSuggestions(false);
    setSearchHistory(prev => [term, ...prev.filter(i => i !== term)].slice(0, 5));
    setIsSearching(true);
    setView(AppView.SEARCH);
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

  const openStoreDetail = (store: Store) => {
    setSelectedStoreData(store);
    setView(AppView.STORE_DETAIL);
    setIsFlyerExpanded(false);
    const storeProducts = RAW_PRODUCTS.filter(p => p.supermercado === store.name).map(p => ({
      id: `prod_${p.id}`,
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
    setSearchResults(storeProducts);
  };

  const handleStoreClick = useCallback((storeId: string) => {
    const store = MOCK_STORES.find(s => s.id === storeId);
    if (store) {
      openStoreDetail(store);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const renderLogo = (logo: string, size: string = '1em', alt: string = '') => {
    if (logo.startsWith('http')) {
      return <img src={logo} alt={alt} style={{ width: size, height: size, objectFit: 'contain', borderRadius: '4px' }} />;
    }
    return logo;
  };

  const filteredAndSortedResults = useMemo(() => {
    let results = [...searchResults];
    if (selectedCategory) results = results.filter(p => p.category === selectedCategory);
    if (selectedStore && view !== AppView.STORE_DETAIL) results = results.filter(p => p.storeId === selectedStore);
    if (onlyPromos) results = results.filter(p => p.isPromo);
    results.sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      return a.name.localeCompare(b.name);
    });
    return results;
  }, [searchResults, selectedCategory, selectedStore, onlyPromos, sortBy, view]);

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
  const totalItems = useMemo(() => cart.reduce((acc, item) => acc + item.quantity, 0), [cart]);
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const SuggestionsList = ({ list }: { list: SuggestionItem[] }) => (
    <div className="suggestions-dropdown animate">
      <div style={{ padding: '8px 12px', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', borderBottom: '1px solid var(--border)', marginBottom: '4px' }}>
        Sugestões no Banco
      </div>
      {list.length > 0 ? (
        list.map((item, idx) => (
          <div key={idx} className="suggestion-item" onClick={() => handleSearch(undefined, item.name, item.type)}>
            <div className="suggestion-icon-wrapper">{item.type === 'category' ? <Tag size={14} /> : <Package size={14} />}</div>
            <div className="suggestion-content">
              <span className="suggestion-text">{item.name}</span>
              <span className="suggestion-type-label">{item.type === 'category' ? 'Categoria' : 'Produto'}</span>
            </div>
            <ChevronRight size={14} className="suggestion-chevron" />
          </div>
        ))
      ) : (
        <div className="suggestion-item-empty">Sem resultados para "{query}"</div>
      )}
    </div>
  );

  const formatTime = (ts: number) => {
    const diff = Date.now() - ts;
    if (diff < 60000) return 'Agora mesmo';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} min atrás`;
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="app-wrapper">
      <header>
        <div className="container flex justify-between items-center">
          <div className="logo" onClick={() => { setView(AppView.HOME); window.scrollTo(0,0); }}>
            <div className="logo-icon"><StoreIcon size={20} /></div>
            <span>EcoFeira</span>
          </div>

          <nav className="header-nav flex gap-4 items-center">
            <button className={`nav-link ${view === AppView.STORES ? 'active' : ''}`} onClick={() => setView(AppView.STORES)}>
              Supermercados
            </button>
            {view !== AppView.HOME && view !== AppView.STORES && (
              <div className="search-container" ref={headerSearchRef}>
                <form onSubmit={(e) => handleSearch(e)}>
                  <Search className="search-icon" size={18} />
                  <input type="text" className="search-input" placeholder="Buscar..." value={query} onChange={(e) => handleInputChange(e.target.value)} onFocus={() => query.length > 0 && setShowSuggestions(true)} />
                </form>
                {showSuggestions && <SuggestionsList list={suggestions} />}
              </div>
            )}
          </nav>

          <div className="flex gap-2 items-center">
            <div style={{ position: 'relative' }} ref={notifRef}>
              <button 
                className={`btn btn-ghost ${unreadCount > 0 ? 'notif-pulse' : ''}`} 
                onClick={() => {
                  setIsNotifOpen(!isNotifOpen);
                  if (!isNotifOpen) markAllNotifsRead();
                }} 
                style={{ padding: '10px' }}
              >
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
                        <div 
                          key={n.id} 
                          className="notif-item" 
                          onClick={() => {
                            if (n.relatedSearchTerm) handleSearch(undefined, n.relatedSearchTerm);
                            setIsNotifOpen(false);
                          }}
                        >
                          <div className={`notif-type-icon ${n.type}`}>
                             {n.type === 'PROMO' ? <Sparkles size={14} /> : <TrendingDown size={14} />}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div className="flex justify-between items-start">
                              <h5 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-main)' }}>{n.title}</h5>
                              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Clock size={10} /> {formatTime(n.timestamp)}
                              </span>
                            </div>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px', lineHeight: 1.3 }}>{n.message}</p>
                            {n.discountPercentage && (
                              <span style={{ display: 'inline-block', marginTop: '6px', background: 'var(--primary-light)', color: 'var(--primary)', fontSize: '0.65rem', fontWeight: 800, padding: '2px 6px', borderRadius: '4px' }}>
                                ECONOMIA DE {n.discountPercentage}%
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div style={{ padding: '12px', textAlign: 'center', background: 'var(--bg)', fontSize: '0.7rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border)' }}>
                    Monitoramos preços em tempo real para você.
                  </div>
                </div>
              )}
            </div>

            <button className="btn btn-ghost" onClick={() => setIsDarkMode(!isDarkMode)} style={{ padding: '10px' }}>
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button className="btn btn-ghost" onClick={() => setView(AppView.CART)} style={{ position: 'relative', padding: '10px' }}>
              <ShoppingCart size={20} />
              {totalItems > 0 && <span className="badge-count animate-pop">{totalItems}</span>}
            </button>
          </div>
        </div>
      </header>

      <main className="container" style={{paddingTop: '30px', paddingBottom: '80px'}}>
        {view === AppView.HOME && (
          <div className="animate" style={{textAlign: 'center', maxWidth: '800px', margin: '60px auto'}}>
            <h1 style={{fontSize: '3.2rem', fontWeight: 800, marginBottom: '16px', lineHeight: 1.1}}>
              Compare e <span style={{color: 'var(--primary)'}}>economize</span>.
            </h1>
            <p style={{color: 'var(--text-muted)', marginBottom: '30px', fontSize: '1.1rem'}}>
              Os melhores preços de {RAW_PRODUCTS.length} produtos em 5 supermercados locais.
            </p>

            <BannerCarousel />

            <div style={{position: 'relative', marginBottom: '40px'}} ref={searchRef}>
               <Search style={{position: 'absolute', left: '20px', top: '18px', color: 'var(--primary)', zIndex: 10}} size={24} />
               <form onSubmit={(e) => handleSearch(e)}>
                <input type="text" placeholder="O que você precisa hoje?" style={{width: '100%', padding: '18px 120px 18px 55px', borderRadius: '20px', border: '2px solid var(--border)', background: 'var(--card-bg)', color: 'var(--text-main)', fontSize: '1.1rem', outline: 'none', boxShadow: 'var(--shadow-md)', position: 'relative', zIndex: 5}} value={query} onChange={(e) => handleInputChange(e.target.value)} onFocus={() => query.length > 0 && setShowSuggestions(true)} />
                <button type="submit" className="btn btn-primary" style={{position: 'absolute', right: '8px', top: '8px', bottom: '8px', borderRadius: '14px', zIndex: 10}}>Buscar</button>
               </form>
               {showSuggestions && <SuggestionsList list={suggestions} />}
            </div>
            {searchHistory.length > 0 && (
              <div style={{ marginBottom: '30px', textAlign: 'left' }}>
                <div className="flex justify-between items-center" style={{ marginBottom: '12px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <History size={14} /> BUSCAS RECENTES
                  </span>
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
        )}

        {view === AppView.STORES && (
          <div className="animate">
            <div className="flex items-center justify-between" style={{ marginBottom: '30px' }}>
              <h2 style={{fontWeight: 800, fontSize: '2rem'}}>Supermercados Parceiros</h2>
              <div style={{position: 'relative', maxWidth: '300px', width: '100%'}}>
                <Search size={18} style={{position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)'}} />
                <input 
                  type="text" 
                  placeholder="Pesquisar loja..." 
                  value={storeQuery}
                  onChange={(e) => setStoreQuery(e.target.value)}
                  style={{padding: '10px 10px 10px 40px', width: '100%', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--card-bg)', color: 'var(--text-main)', fontSize: '0.9rem', outline: 'none'}}
                />
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
              {filteredStores.map(store => (
                <div key={store.id} className="card store-card" onClick={() => openStoreDetail(store)} style={{cursor: 'pointer', padding: '24px', textAlign: 'center'}}>
                  <div style={{height: '80px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem'}}>
                    {renderLogo(store.logo, '80px', store.name)}
                  </div>
                  <h3 style={{fontWeight: 800, fontSize: '1.25rem', marginBottom: '8px'}}>{store.name}</h3>
                  <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.9rem'}}>
                    <MapPin size={14} /> <span>{store.distance} da sua localização</span>
                  </div>
                  <button className="btn btn-ghost" style={{marginTop: '20px', width: '100%'}}>Ver Ofertas</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {(view === AppView.STORE_DETAIL || view === AppView.SEARCH) && (
          <div className="animate">
            {view === AppView.STORE_DETAIL && selectedStoreData && (
              <div style={{ marginBottom: '40px' }}>
                <div className="flex items-center justify-between" style={{ marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                  <div className="flex items-center gap-4">
                    <button className="btn btn-ghost" onClick={() => setView(AppView.STORES)} style={{padding: '10px'}}><ArrowLeft size={20} /></button>
                    <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
                      <div style={{
                        fontSize: '2.5rem', 
                        width: '64px', 
                        height: '64px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        background: 'var(--card-bg)',
                        borderRadius: '16px',
                        border: '1px solid var(--border)',
                        boxShadow: 'var(--shadow-sm)'
                      }}>
                        {renderLogo(selectedStoreData.logo, '40px', selectedStoreData.name)}
                      </div>
                      <div>
                        <h2 style={{fontWeight: 800, fontSize: '1.8rem', color: 'var(--text-main)'}}>{selectedStoreData.name}</h2>
                        <div style={{color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600}}>
                          <MapPin size={14} style={{ display: 'inline', marginRight: '4px' }} />
                          {selectedStoreData.distance} • Todos os produtos
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {selectedStoreData.flyerUrl && (
                    <button 
                      className={`btn ${isFlyerExpanded ? 'btn-ghost' : 'btn-primary'}`} 
                      onClick={() => setIsFlyerExpanded(!isFlyerExpanded)}
                      style={{ 
                        borderRadius: '14px', 
                        gap: '10px', 
                        padding: '12px 24px',
                        boxShadow: isFlyerExpanded ? 'none' : '0 8px 20px rgba(16, 185, 129, 0.25)' 
                      }}
                    >
                      {isFlyerExpanded ? <ChevronUp size={20} /> : <BookOpen size={20} />}
                      <span style={{ fontWeight: 800 }}>{isFlyerExpanded ? 'Ocultar Panfleto' : 'Ver Panfleto'}</span>
                    </button>
                  )}
                </div>

                {/* Exibição do Panfleto (Iframe) */}
                {isFlyerExpanded && selectedStoreData.flyerUrl && (
                  <StoreFlyer store={selectedStoreData} />
                )}
              </div>
            )}

            {view === AppView.SEARCH && (
              <div className="flex items-center justify-between" style={{ marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
                <div className="flex items-center gap-2">
                  <button className="btn btn-ghost" onClick={() => setView(AppView.HOME)} style={{ padding: '8px' }}><X size={20} /></button>
                  <h2 style={{fontWeight: 800, fontSize: '1.25rem'}}>{filteredAndSortedResults.length} resultados para "{query}"</h2>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between" style={{ marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
              <div className="flex items-center gap-4">
                <div style={{ display: 'flex', background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '4px' }}>
                  <button onClick={() => setViewMode('grid')} className={`btn-icon ${viewMode === 'grid' ? 'active' : ''}`} title="Ver em blocos"><LayoutGrid size={18} /></button>
                  <button onClick={() => setViewMode('list')} className={`btn-icon ${viewMode === 'list' ? 'active' : ''}`} title="Ver em lista"><List size={18} /></button>
                </div>
                <div className="flex items-center gap-2">
                  <ArrowUpDown size={16} color="var(--text-muted)" />
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortOption)} style={{ background: 'var(--card-bg)', color: 'var(--text-main)', border: '1px solid var(--border)', padding: '6px 12px', borderRadius: '10px', fontSize: '0.85rem', outline: 'none' }}>
                    <option value="price_asc">Menor Preço</option>
                    <option value="price_desc">Major Preço</option>
                    <option value="name_asc">Nome (A-Z)</option>
                  </select>
                </div>
              </div>
            </div>

            {view === AppView.SEARCH && (
              <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '8px', scrollbarWidth: 'none' }}>
                <button onClick={() => setOnlyPromos(!onlyPromos)} className={`btn ${onlyPromos ? 'btn-primary' : 'btn-ghost'}`} style={{ fontSize: '0.75rem', padding: '6px 12px', whiteSpace: 'nowrap' }}><Tag size={14} /> Em Promoção</button>
                <div style={{ width: '1px', background: 'var(--border)', margin: '0 5px' }}></div>
                {categories.map(cat => (<button key={cat} onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)} className={`btn ${selectedCategory === cat ? 'btn-primary' : 'btn-ghost'}`} style={{ fontSize: '0.75rem', padding: '6px 12px', whiteSpace: 'nowrap' }}>{cat}</button>))}
                <div style={{ width: '1px', background: 'var(--border)', margin: '0 5px' }}></div>
                {stores.map(store => (<button key={store.id} onClick={() => setSelectedStore(selectedStore === store.id ? null : store.id)} className={`btn ${selectedStore === store.id ? 'btn-primary' : 'btn-ghost'}`} style={{ fontSize: '0.75rem', padding: '6px 12px', whiteSpace: 'nowrap' }}>{renderLogo(store.logo, '16px', store.name)} {store.name}</button>))}
              </div>
            )}

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
        )}

        {view === AppView.CART && (
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
                <button className="btn btn-primary" onClick={() => setView(AppView.HOME)}>Buscar Produtos</button>
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
                          <button onClick={() => removeFromCart(item.id)} style={{ color: 'var(--danger)', background: 'rgba(239, 68, 68, 0.08)', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer', transition: 'all 0.2s' }} className="delete-btn" title="Remover item"><Trash2 size={18} /></button>
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
        )}
      </main>

      {isClearModalOpen && (
        <div className="modal-overlay" onClick={() => setIsClearModalOpen(false)}>
          <div className="modal-content animate-pop" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon-container"><AlertTriangle size={32} color="var(--danger)" /></div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '12px', color: 'var(--text-main)' }}>Limpar sua lista?</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '28px', fontSize: '0.95rem' }}>Essa ação irá remover todos os {totalItems} itens da sua lista de compras atual. Esta ação não pode ser desfeita.</p>
            <div className="flex gap-4 justify-center" style={{ width: '100%' }}>
              <button className="btn btn-ghost" style={{ flex: 1, padding: '12px', borderRadius: '14px' }} onClick={() => setIsClearModalOpen(false)}>Cancelar</button>
              <button className="btn btn-primary" style={{ flex: 1, padding: '12px', borderRadius: '14px', background: 'var(--danger)' }} onClick={clearCart}>Sim, limpar tudo</button>
            </div>
          </div>
        </div>
      )}

      <button onClick={scrollToTop} className={`btn-back-to-top ${showBackToTop ? 'show' : ''}`} aria-label="Voltar ao topo"><ArrowUp size={24} /></button>

      <style>{`
        .badge-count { position: absolute; top: -5px; right: -5px; background: var(--primary); color: white; border-radius: 50%; width: 20px; height: 20px; font-size: 0.7rem; display: flex; align-items: center; justify-content: center; font-weight: 800; box-shadow: 0 0 0 2px var(--card-bg); }
        @keyframes pop { 0% { transform: scale(0.9); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        .animate-pop { animation: pop 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        .qty-btn:hover { background: rgba(0,0,0,0.05); }
        .delete-btn:hover { background: rgba(239, 68, 68, 0.15); transform: scale(1.05); }
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
        .suggestion-item-empty { padding: 24px; font-size: 0.9rem; color: var(--text-muted); text-align: center; font-style: italic; }
        .btn-back-to-top { position: fixed; bottom: 30px; right: 30px; width: 50px; height: 50px; border-radius: 50%; background: var(--primary); color: white; border: none; box-shadow: var(--shadow-lg); cursor: pointer; display: flex; align-items: center; justify-content: center; z-index: 1000; opacity: 0; visibility: hidden; transform: translateY(20px); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        .btn-back-to-top.show { opacity: 1; visibility: visible; transform: translateY(0); }
        .btn-back-to-top:hover { background: var(--primary-hover); transform: translateY(-5px) scale(1.05); }
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.5); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 2000; padding: 20px; }
        .modal-content { background: var(--card-bg); max-width: 400px; width: 100%; padding: 32px; border-radius: 24px; text-align: center; box-shadow: 0 20px 40px -10px rgba(0,0,0,0.3); border: 1px solid var(--border); }
        .modal-icon-container { width: 64px; height: 64px; background: rgba(239, 68, 68, 0.1); border-radius: 20px; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; }
        .btn-icon { background: none; border: none; padding: 8px; border-radius: 8px; cursor: pointer; color: var(--text-muted); transition: all 0.2s; display: flex; align-items: center; justify-content: center; }
        .btn-icon:hover { background: var(--bg); color: var(--text-main); }
        .btn-icon.active { background: var(--primary-light); color: var(--primary); }
        
        /* Notifications Styles */
        .notif-pulse { 
          animation: bellPulse 2s infinite; 
        }
        @keyframes bellPulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); background: var(--primary-light); }
          100% { transform: scale(1); }
        }
        .notif-dropdown {
          position: absolute;
          top: calc(100% + 12px);
          right: 0;
          width: 320px;
          background: var(--card-bg);
          border: 1px solid var(--border);
          border-radius: 20px;
          box-shadow: var(--shadow-lg);
          z-index: 1000;
          overflow: hidden;
        }
        .notif-scroll-area {
          max-height: 400px;
          overflow-y: auto;
        }
        .notif-item {
          display: flex;
          gap: 12px;
          padding: 16px;
          cursor: pointer;
          border-bottom: 1px solid var(--border);
          transition: background 0.2s;
        }
        .notif-item:hover {
          background: var(--bg);
        }
        .notif-item:last-child {
          border-bottom: none;
        }
        .notif-type-icon {
          width: 32px;
          height: 32px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .notif-type-icon.PROMO { background: #dcfce7; color: #16a34a; }
        .notif-type-icon.BETTER_DEAL { background: #fef3c7; color: #d97706; }
        .notif-type-icon.PRICE_DROP { background: #dbeafe; color: #2563eb; }

        .product-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 20px;
        }

        .product-list-view { 
          display: flex; 
          flex-direction: column;
          gap: 16px; 
          margin-top: 30px; 
          width: 100%;
        }
        
        @media (max-width: 768px) {
          .header-nav { display: none; }
          .product-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }
          .product-list-view { 
            gap: 12px; 
          }
          .notif-dropdown {
            position: fixed;
            top: 70px;
            right: 10px;
            left: 10px;
            width: auto;
          }
        }
        
        .nav-link { background: none; border: none; font-family: inherit; font-weight: 700; color: var(--text-muted); cursor: pointer; padding: 8px 12px; border-radius: 8px; transition: all 0.2s; }
        .nav-link:hover { color: var(--primary); background: var(--primary-light); }
        .nav-link.active { color: var(--primary); }
        
        .store-card:hover { transform: translateY(-8px); border-color: var(--primary); }
      `}</style>
    </div>
  );
}

export default App;
