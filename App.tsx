import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Search, ShoppingCart, Store as StoreIcon, Trash2, History, X, Moon, Sun, Filter, ArrowUpDown, Tag, ArrowUp, ChevronRight } from 'lucide-react';
import { searchProductsWithGemini } from './services/geminiService';
import { ProductOffer, CartItem, AppView } from './types';
import { INITIAL_SUGGESTIONS, MOCK_STORES, RAW_PRODUCTS } from './constants';
import ProductCard from './components/ProductCard';
import CartOptimizer from './components/CartOptimizer';

type SortOption = 'price_asc' | 'price_desc' | 'name_asc';

function App() {
  const [view, setView] = useState<AppView>(AppView.HOME);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<ProductOffer[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('ecofeira_theme') === 'dark');
  const [showBackToTop, setShowBackToTop] = useState(false);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const headerSearchRef = useRef<HTMLDivElement>(null);

  // Filtros
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedStore, setSelectedStore] = useState<string | null>(null);
  const [onlyPromos, setOnlyPromos] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('price_asc');

  const categories = useMemo(() => Array.from(new Set(RAW_PRODUCTS.map(p => p.categoria))), []);
  const stores = useMemo(() => MOCK_STORES, []);

  useEffect(() => {
    if (isDarkMode) {
      document.body.setAttribute('data-theme', 'dark');
      localStorage.setItem('ecofeira_theme', 'dark');
    } else {
      document.body.removeAttribute('data-theme');
      localStorage.setItem('ecofeira_theme', 'light');
    }
  }, [isDarkMode]);

  // Fechar sugestões ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        (searchRef.current && !searchRef.current.contains(event.target as Node)) &&
        (headerSearchRef.current && !headerSearchRef.current.contains(event.target as Node))
      ) {
        setShowSuggestions(false);
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

  useEffect(() => {
    const savedHistory = localStorage.getItem('ecofeira_history');
    if (savedHistory) try { setSearchHistory(JSON.parse(savedHistory)); } catch (e) {}
    const savedCart = localStorage.getItem('ecofeira_cart');
    if (savedCart) try { setCart(JSON.parse(savedCart)); } catch (e) {}
  }, []);

  useEffect(() => { localStorage.setItem('ecofeira_history', JSON.stringify(searchHistory)); }, [searchHistory]);
  useEffect(() => { localStorage.setItem('ecofeira_cart', JSON.stringify(cart)); }, [cart]);

  // Lógica de Sugestões em Tempo Real
  const handleInputChange = (val: string) => {
    setQuery(val);
    if (val.trim().length > 1) {
      const lowerVal = val.toLowerCase();
      // Filtra produtos e categorias que contenham o termo
      const matches = RAW_PRODUCTS
        .filter(p => 
          p.produto.toLowerCase().includes(lowerVal) || 
          p.categoria.toLowerCase().includes(lowerVal)
        )
        .map(p => p.produto)
        .filter((value, index, self) => self.indexOf(value) === index) // Unique
        .slice(0, 6);
      
      setSuggestions(matches);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSearch = async (e?: React.FormEvent, queryOverride?: string) => {
    if (e) e.preventDefault();
    const term = queryOverride || query;
    if (!term.trim()) return;
    
    setQuery(term);
    setShowSuggestions(false);
    setSearchHistory(prev => [term, ...prev.filter(i => i !== term)].slice(0, 5));
    setIsSearching(true);
    setView(AppView.SEARCH);
    
    // Reset filtros ao buscar novo termo
    setSelectedCategory(null);
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

  const filteredAndSortedResults = useMemo(() => {
    let results = [...searchResults];

    if (selectedCategory) {
      results = results.filter(p => p.category === selectedCategory);
    }
    if (selectedStore) {
      results = results.filter(p => p.storeId === selectedStore);
    }
    if (onlyPromos) {
      results = results.filter(p => p.isPromo);
    }

    results.sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      return a.name.localeCompare(b.name);
    });

    return results;
  }, [searchResults, selectedCategory, selectedStore, onlyPromos, sortBy]);

  const addToCart = useCallback((product: ProductOffer) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { ...product, quantity: 1 }];
    });
  }, []);

  const totalItems = useMemo(() => cart.reduce((acc, item) => acc + item.quantity, 0), [cart]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Componente de lista de sugestões
  const SuggestionsList = ({ list }: { list: string[] }) => (
    <div className="suggestions-dropdown animate">
      {list.length > 0 ? (
        list.map((item, idx) => (
          <div 
            key={idx} 
            className="suggestion-item"
            onClick={() => handleSearch(undefined, item)}
          >
            <Search size={14} className="suggestion-icon" />
            <span className="suggestion-text">{item}</span>
            <ChevronRight size={14} className="suggestion-chevron" />
          </div>
        ))
      ) : (
        <div className="suggestion-item-empty">Sem sugestões para "{query}"</div>
      )}
    </div>
  );

  return (
    <div className="app-wrapper">
      <header>
        <div className="container flex justify-between items-center">
          <div className="logo" onClick={() => { setView(AppView.HOME); window.scrollTo(0,0); }}>
            <div className="logo-icon"><StoreIcon size={20} /></div>
            <span>EcoFeira</span>
          </div>

          {view !== AppView.HOME && (
            <div className="search-container" ref={headerSearchRef}>
              <form onSubmit={handleSearch}>
                <Search className="search-icon" size={18} />
                <input 
                  type="text" 
                  className="search-input" 
                  placeholder="Buscar produtos..." 
                  value={query}
                  onChange={(e) => handleInputChange(e.target.value)}
                  onFocus={() => query.length > 1 && setShowSuggestions(true)}
                />
              </form>
              {showSuggestions && <SuggestionsList list={suggestions} />}
            </div>
          )}

          <div className="flex gap-2">
            <button className="btn btn-ghost" onClick={() => setIsDarkMode(!isDarkMode)} style={{ padding: '10px' }}>
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button className="btn btn-ghost" onClick={() => setView(AppView.CART)} style={{ position: 'relative', padding: '10px' }}>
              <ShoppingCart size={20} />
              {totalItems > 0 && <span className="badge-count">{totalItems}</span>}
            </button>
          </div>
        </div>
      </header>

      <main className="container" style={{paddingTop: '30px', paddingBottom: '80px'}}>
        {view === AppView.HOME && (
          <div className="animate" style={{textAlign: 'center', maxWidth: '600px', margin: '60px auto'}}>
            <h1 style={{fontSize: '3rem', fontWeight: 800, marginBottom: '20px', lineHeight: 1.1}}>
              Compare e <span style={{color: 'var(--primary)'}}>economize</span>.
            </h1>
            <p style={{color: 'var(--text-muted)', marginBottom: '40px', fontSize: '1.1rem'}}>
              Os melhores preços de {RAW_PRODUCTS.length} produtos em 5 supermercados locais.
            </p>
            
            <div style={{position: 'relative', marginBottom: '40px'}} ref={searchRef}>
               <Search style={{position: 'absolute', left: '20px', top: '18px', color: 'var(--primary)', zIndex: 10}} size={24} />
               <form onSubmit={handleSearch}>
                <input 
                  type="text" 
                  placeholder="O que você precisa hoje?" 
                  style={{width: '100%', padding: '18px 120px 18px 55px', borderRadius: '20px', border: '2px solid var(--border)', background: 'var(--card-bg)', color: 'var(--text-main)', fontSize: '1.1rem', outline: 'none', boxShadow: 'var(--shadow-md)', position: 'relative', zIndex: 5}}
                  value={query}
                  onChange={(e) => handleInputChange(e.target.value)}
                  onFocus={() => query.length > 1 && setShowSuggestions(true)}
                />
                <button type="submit" className="btn btn-primary" style={{position: 'absolute', right: '8px', top: '8px', bottom: '8px', borderRadius: '14px', zIndex: 10}}>
                  Buscar
                </button>
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
                  {searchHistory.map(term => (
                    <button key={term} onClick={() => handleSearch(undefined, term)} className="btn btn-ghost" style={{ fontSize: '0.8rem', padding: '6px 14px', borderRadius: '10px' }}>{term}</button>
                  ))}
                </div>
              </div>
            )}

            <div style={{ textAlign: 'left' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '12px' }}>SUGESTÕES</span>
              <div className="flex gap-2" style={{flexWrap: 'wrap'}}>
                {INITIAL_SUGGESTIONS.map(s => (
                  <button key={s} onClick={() => handleSearch(undefined, s)} className="btn btn-ghost" style={{fontSize: '0.8rem', padding: '6px 14px', borderRadius: '10px'}}>{s}</button>
                ))}
              </div>
            </div>
          </div>
        )}

        {view === AppView.SEARCH && (
          <div className="animate">
            <div className="flex items-center justify-between" style={{ marginBottom: '20px' }}>
              <div className="flex items-center gap-2">
                <button className="btn btn-ghost" onClick={() => setView(AppView.HOME)} style={{ padding: '8px' }}><X size={20} /></button>
                <h2 style={{fontWeight: 800, fontSize: '1.25rem'}}>{filteredAndSortedResults.length} resultados para "{query}"</h2>
              </div>
              
              <div className="flex items-center gap-2">
                <ArrowUpDown size={16} color="var(--text-muted)" />
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  style={{ background: 'var(--card-bg)', color: 'var(--text-main)', border: '1px solid var(--border)', padding: '6px 12px', borderRadius: '10px', fontSize: '0.85rem', outline: 'none' }}
                >
                  <option value="price_asc">Menor Preço</option>
                  <option value="price_desc">Maior Preço</option>
                  <option value="name_asc">Nome (A-Z)</option>
                </select>
              </div>
            </div>

            {/* Barra de Filtros */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '8px', scrollbarWidth: 'none' }}>
              <button 
                onClick={() => setOnlyPromos(!onlyPromos)}
                className={`btn ${onlyPromos ? 'btn-primary' : 'btn-ghost'}`}
                style={{ fontSize: '0.75rem', padding: '6px 12px', whiteSpace: 'nowrap' }}
              >
                <Tag size={14} /> Em Promoção
              </button>
              
              <div style={{ width: '1px', background: 'var(--border)', margin: '0 5px' }}></div>
              
              {categories.map(cat => (
                <button 
                  key={cat}
                  onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                  className={`btn ${selectedCategory === cat ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ fontSize: '0.75rem', padding: '6px 12px', whiteSpace: 'nowrap' }}
                >
                  {cat}
                </button>
              ))}

              <div style={{ width: '1px', background: 'var(--border)', margin: '0 5px' }}></div>

              {stores.map(store => (
                <button 
                  key={store.id}
                  onClick={() => setSelectedStore(selectedStore === store.id ? null : store.id)}
                  className={`btn ${selectedStore === store.id ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ fontSize: '0.75rem', padding: '6px 12px', whiteSpace: 'nowrap' }}
                >
                  {store.logo} {store.name}
                </button>
              ))}
            </div>
            
            {isSearching ? (
              <div style={{ textAlign: 'center', padding: '80px 0' }}>
                <div className="logo-icon animate" style={{ margin: '0 auto 20px', width: '50px', height: '50px' }}><StoreIcon size={24} /></div>
                <p style={{color: 'var(--text-muted)', fontWeight: 600}}>Atualizando ofertas...</p>
              </div>
            ) : filteredAndSortedResults.length > 0 ? (
              <div className="product-grid">
                {filteredAndSortedResults.map(p => (
                  <ProductCard key={p.id} product={p} onAdd={addToCart} />
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '60px', border: '2px dashed var(--border)', borderRadius: '20px' }}>
                <p style={{ color: 'var(--text-muted)' }}>Nenhum produto encontrado com os filtros aplicados.</p>
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
                <button className="btn btn-ghost" style={{ color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.2)' }} onClick={() => confirm('Limpar lista?') && setCart([])}>
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
                        <h4 style={{fontWeight: 700}}>{item.name}</h4>
                        <p style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>{item.storeName} • {item.quantity} un.</p>
                      </div>
                      <div style={{textAlign: 'right'}}>
                        <p style={{fontWeight: 800, color: 'var(--primary)', fontSize: '1.1rem'}}>R$ {(item.price * item.quantity).toFixed(2)}</p>
                        <div className="flex gap-2" style={{ marginTop: '4px' }}>
                           <button onClick={() => setCart(prev => prev.map(i => i.id === item.id ? {...i, quantity: Math.max(1, i.quantity - 1)} : i))} style={{ background: 'var(--bg)', color: 'var(--text-main)', border: '1px solid var(--border)', borderRadius: '4px', padding: '2px 8px', cursor: 'pointer' }}>-</button>
                           <button onClick={() => setCart(prev => prev.map(i => i.id === item.id ? {...i, quantity: i.quantity + 1} : i))} style={{ background: 'var(--bg)', color: 'var(--text-main)', border: '1px solid var(--border)', borderRadius: '4px', padding: '2px 8px', cursor: 'pointer' }}>+</button>
                           <button onClick={() => setCart(prev => prev.filter(i => i.id !== item.id))} style={{ color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer', marginLeft: '8px' }}><Trash2 size={14} /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '2px solid var(--border)', textAlign: 'right' }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>VALOR TOTAL ESTIMADO</p>
                    <p style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)' }}>
                      R$ {cart.reduce((acc, item) => acc + (item.price * item.quantity), 0).toFixed(2)}
                    </p>
                  </div>
                </div>
                <CartOptimizer cart={cart} />
              </div>
            )}
          </div>
        )}
      </main>

      {/* Botão Voltar ao Topo */}
      <button 
        onClick={scrollToTop}
        className={`btn-back-to-top ${showBackToTop ? 'show' : ''}`}
        aria-label="Voltar ao topo"
      >
        <ArrowUp size={24} />
      </button>

      <style>{`
        .badge-count {
          position: absolute; top: -5px; right: -5px; background: var(--primary); color: white;
          border-radius: 50%; width: 18px; height: 18px; font-size: 0.65rem;
          display: flex; align-items: center; justify-content: center; fontWeight: bold;
        }
        
        .suggestions-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          right: 0;
          background: var(--card-bg);
          backdrop-filter: blur(12px);
          border: 1px solid var(--border);
          border-radius: 16px;
          box-shadow: var(--shadow-lg);
          z-index: 1000;
          overflow: hidden;
          padding: 8px;
        }

        .suggestion-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          cursor: pointer;
          border-radius: 10px;
          transition: all 0.2s;
        }

        .suggestion-item:hover {
          background: var(--primary-light);
          color: var(--primary);
        }

        .suggestion-icon {
          color: var(--text-muted);
          flex-shrink: 0;
        }

        .suggestion-item:hover .suggestion-icon {
          color: var(--primary);
        }

        .suggestion-text {
          flex: 1;
          font-size: 0.9rem;
          font-weight: 500;
          text-align: left;
        }

        .suggestion-chevron {
          opacity: 0;
          transform: translateX(-5px);
          transition: all 0.2s;
          color: var(--primary);
        }

        .suggestion-item:hover .suggestion-chevron {
          opacity: 1;
          transform: translateX(0);
        }

        .suggestion-item-empty {
          padding: 12px;
          font-size: 0.85rem;
          color: var(--text-muted);
          text-align: center;
        }

        .btn-back-to-top {
          position: fixed;
          bottom: 30px;
          right: 30px;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: var(--primary);
          color: white;
          border: none;
          box-shadow: var(--shadow-lg);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          opacity: 0;
          visibility: hidden;
          transform: translateY(20px);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .btn-back-to-top.show {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }
        
        .btn-back-to-top:hover {
          background: var(--primary-hover);
          transform: translateY(-5px) scale(1.05);
        }
      `}</style>
    </div>
  );
}

export default App;