import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Search, ShoppingCart, Store as StoreIcon, Trash2, History, X, Moon, Sun, Filter, ArrowUpDown, Tag, ArrowUp, ChevronRight, Package, Check, AlertTriangle, LayoutGrid, List } from 'lucide-react';
import { searchProductsWithGemini } from './services/geminiService';
import { ProductOffer, CartItem, AppView } from './types';
import { INITIAL_SUGGESTIONS, MOCK_STORES, RAW_PRODUCTS } from './constants';
import ProductCard from './components/ProductCard';
import CartOptimizer from './components/CartOptimizer';

type SortOption = 'price_asc' | 'price_desc' | 'name_asc';
type ViewMode = 'grid' | 'list';

interface SuggestionItem {
  name: string;
  type: 'product' | 'category';
}

function App() {
  const [view, setView] = useState<AppView>(AppView.HOME);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<ProductOffer[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('ecofeira_theme') === 'dark');
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  
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

  // Lógica de Sugestões Aprimorada
  const handleInputChange = (val: string) => {
    setQuery(val);
    if (val.trim().length > 0) {
      const lowerVal = val.toLowerCase();
      
      // Busca categorias
      const categoryMatches: SuggestionItem[] = categories
        .filter(cat => cat.toLowerCase().includes(lowerVal))
        .map(name => ({ name, type: 'category' }));

      // Busca produtos únicos
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
    
    // Reset filtros ao buscar novo termo
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

  const totalItems = useMemo(() => cart.reduce((acc, item) => acc + item.quantity, 0), [cart]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Componente de lista de sugestões enriquecida
  const SuggestionsList = ({ list }: { list: SuggestionItem[] }) => (
    <div className="suggestions-dropdown animate">
      <div style={{ padding: '8px 12px', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', borderBottom: '1px solid var(--border)', marginBottom: '4px' }}>
        Sugestões no Banco
      </div>
      {list.length > 0 ? (
        list.map((item, idx) => (
          <div 
            key={idx} 
            className="suggestion-item"
            onClick={() => handleSearch(undefined, item.name, item.type)}
          >
            <div className="suggestion-icon-wrapper">
              {item.type === 'category' ? <Tag size={14} /> : <Package size={14} />}
            </div>
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
              <form onSubmit={(e) => handleSearch(e)}>
                <Search className="search-icon" size={18} />
                <input 
                  type="text" 
                  className="search-input" 
                  placeholder="Buscar produtos..." 
                  value={query}
                  onChange={(e) => handleInputChange(e.target.value)}
                  onFocus={() => query.length > 0 && setShowSuggestions(true)}
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
              {totalItems > 0 && <span className="badge-count animate-pop">{totalItems}</span>}
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
               <form onSubmit={(e) => handleSearch(e)}>
                <input 
                  type="text" 
                  placeholder="O que você precisa hoje?" 
                  style={{width: '100%', padding: '18px 120px 18px 55px', borderRadius: '20px', border: '2px solid var(--border)', background: 'var(--card-bg)', color: 'var(--text-main)', fontSize: '1.1rem', outline: 'none', boxShadow: 'var(--shadow-md)', position: 'relative', zIndex: 5}}
                  value={query}
                  onChange={(e) => handleInputChange(e.target.value)}
                  onFocus={() => query.length > 0 && setShowSuggestions(true)}
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
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '12px' }}>SUGESTÕES POPULARES</span>
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
            <div className="flex items-center justify-between" style={{ marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
              <div className="flex items-center gap-2">
                <button className="btn btn-ghost" onClick={() => setView(AppView.HOME)} style={{ padding: '8px' }}><X size={20} /></button>
                <h2 style={{fontWeight: 800, fontSize: '1.25rem'}}>{filteredAndSortedResults.length} resultados para "{query}"</h2>
              </div>
              
              <div className="flex items-center gap-4">
                {/* Alternador de Visualização */}
                <div style={{ display: 'flex', background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '4px' }}>
                  <button 
                    onClick={() => setViewMode('grid')}
                    className={`btn-icon ${viewMode === 'grid' ? 'active' : ''}`}
                    title="Ver em blocos"
                  >
                    <LayoutGrid size={18} />
                  </button>
                  <button 
                    onClick={() => setViewMode('list')}
                    className={`btn-icon ${viewMode === 'list' ? 'active' : ''}`}
                    title="Ver em lista"
                  >
                    <List size={18} />
                  </button>
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
                <p style={{color: 'var(--text-muted)', fontWeight: 600}}>Sincronizando ofertas locais...</p>
              </div>
            ) : filteredAndSortedResults.length > 0 ? (
              <div className={viewMode === 'grid' ? "product-grid" : "product-list-view"}>
                {filteredAndSortedResults.map(p => (
                  <ProductCard key={p.id} product={p} onAdd={addToCart} layout={viewMode} />
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
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            border: '1px solid var(--border)', 
                            borderRadius: '10px', 
                            background: 'var(--bg)', 
                            overflow: 'hidden',
                            boxShadow: 'var(--shadow-sm)'
                          }}>
                            <button 
                              onClick={() => decrementInCart(item.id)} 
                              style={{ 
                                background: 'none', 
                                color: 'var(--text-main)', 
                                border: 'none', 
                                padding: '6px 14px', 
                                cursor: 'pointer', 
                                fontSize: '1.1rem', 
                                fontWeight: 700, 
                                display: 'flex', 
                                alignItems: 'center',
                                transition: 'background 0.2s'
                              }}
                              className="qty-btn"
                            >
                              -
                            </button>
                            <span style={{ 
                              background: 'var(--card-bg)', 
                              color: 'var(--text-main)', 
                              padding: '6px 0', 
                              minWidth: '40px', 
                              textAlign: 'center', 
                              fontWeight: 800, 
                              fontSize: '0.95rem',
                              borderLeft: '1px solid var(--border)',
                              borderRight: '1px solid var(--border)'
                            }}>
                              {item.quantity}
                            </span>
                            <button 
                              onClick={() => addToCart(item)} 
                              style={{ 
                                background: 'none', 
                                color: 'var(--text-main)', 
                                border: 'none', 
                                padding: '6px 14px', 
                                cursor: 'pointer', 
                                fontSize: '1.1rem', 
                                fontWeight: 700, 
                                display: 'flex', 
                                alignItems: 'center',
                                transition: 'background 0.2s'
                              }}
                              className="qty-btn"
                            >
                              +
                            </button>
                          </div>
                          <button 
                            onClick={() => removeFromCart(item.id)} 
                            style={{ 
                              color: 'var(--danger)', 
                              background: 'rgba(239, 68, 68, 0.08)', 
                              border: 'none', 
                              borderRadius: '8px',
                              padding: '8px',
                              cursor: 'pointer', 
                              transition: 'all 0.2s'
                            }}
                            className="delete-btn"
                            title="Remover item"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '2px solid var(--border)', textAlign: 'right' }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>VALOR TOTAL ESTIMADO</p>
                    <p style={{ fontSize: '2.4rem', fontWeight: 900, color: 'var(--text-main)' }}>
                      R$ {cart.reduce((acc, item) => acc + (item.price * item.quantity), 0).toFixed(2).replace('.', ',')}
                    </p>
                  </div>
                </div>
                <CartOptimizer 
                  cart={cart} 
                  onAdd={addToCart} 
                  onDecrement={decrementInCart} 
                  onRemove={removeFromCart} 
                />
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modal de Confirmação Profissional */}
      {isClearModalOpen && (
        <div className="modal-overlay" onClick={() => setIsClearModalOpen(false)}>
          <div className="modal-content animate-pop" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon-container">
              <AlertTriangle size={32} color="var(--danger)" />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '12px', color: 'var(--text-main)' }}>Limpar sua lista?</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '28px', fontSize: '0.95rem' }}>
              Essa ação irá remover todos os {totalItems} itens da sua lista de compras atual. Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-4 justify-center" style={{ width: '100%' }}>
              <button 
                className="btn btn-ghost" 
                style={{ flex: 1, padding: '12px', borderRadius: '14px' }}
                onClick={() => setIsClearModalOpen(false)}
              >
                Cancelar
              </button>
              <button 
                className="btn btn-primary" 
                style={{ flex: 1, padding: '12px', borderRadius: '14px', background: 'var(--danger)' }}
                onClick={clearCart}
              >
                Sim, limpar tudo
              </button>
            </div>
          </div>
        </div>
      )}

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
          border-radius: 50%; width: 20px; height: 20px; font-size: 0.7rem;
          display: flex; align-items: center; justify-content: center; font-weight: 800;
          box-shadow: 0 0 0 2px var(--card-bg);
        }

        @keyframes pop {
          0% { transform: scale(0.9); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-pop { animation: pop 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        
        .qty-btn:hover { background: rgba(0,0,0,0.05); }
        .delete-btn:hover { background: rgba(239, 68, 68, 0.15); transform: scale(1.05); }

        .suggestions-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          right: 0;
          background: var(--card-bg);
          backdrop-filter: blur(20px);
          border: 1px solid var(--border);
          border-radius: 20px;
          box-shadow: 0 10px 40px -10px rgba(0,0,0,0.2);
          z-index: 1000;
          overflow: hidden;
          padding: 8px;
        }

        .suggestion-item {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 10px 14px;
          cursor: pointer;
          border-radius: 12px;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .suggestion-item:hover {
          background: var(--primary-light);
          transform: translateX(4px);
        }

        .suggestion-icon-wrapper {
          width: 32px;
          height: 32px;
          background: var(--bg);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
          transition: all 0.2s;
        }

        .suggestion-item:hover .suggestion-icon-wrapper {
          background: var(--primary);
          color: white;
        }

        .suggestion-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          text-align: left;
        }

        .suggestion-text {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--text-main);
        }

        .suggestion-type-label {
          font-size: 0.65rem;
          color: var(--text-muted);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .suggestion-chevron {
          opacity: 0;
          transform: translateX(-10px);
          transition: all 0.2s;
          color: var(--primary);
        }

        .suggestion-item:hover .suggestion-chevron {
          opacity: 1;
          transform: translateX(0);
        }

        .suggestion-item-empty {
          padding: 24px;
          font-size: 0.9rem;
          color: var(--text-muted);
          text-align: center;
          font-style: italic;
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

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          padding: 20px;
        }

        .modal-content {
          background: var(--card-bg);
          max-width: 400px;
          width: 100%;
          padding: 32px;
          border-radius: 24px;
          text-align: center;
          box-shadow: 0 20px 40px -10px rgba(0,0,0,0.3);
          border: 1px solid var(--border);
        }

        .modal-icon-container {
          width: 64px;
          height: 64px;
          background: rgba(239, 68, 68, 0.1);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
        }

        .btn-icon {
          background: none;
          border: none;
          padding: 8px;
          border-radius: 8px;
          cursor: pointer;
          color: var(--text-muted);
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .btn-icon:hover { background: var(--bg); color: var(--text-main); }
        .btn-icon.active { background: var(--primary-light); color: var(--primary); }

        .product-list-view {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 30px;
        }
      `}</style>
    </div>
  );
}

export default App;