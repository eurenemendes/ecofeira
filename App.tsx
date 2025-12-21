import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, ShoppingCart, Store as StoreIcon, ChefHat, Trash2, History, X } from 'lucide-react';
import { searchProductsWithGemini, suggestRecipe } from './services/geminiService';
import { ProductOffer, CartItem, AppView } from './types';
import { INITIAL_SUGGESTIONS } from './constants';
import ProductCard from './components/ProductCard';
import CartOptimizer from './components/CartOptimizer';

function App() {
  const [view, setView] = useState<AppView>(AppView.HOME);
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<ProductOffer[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  // Carregar histórico e carrinho do localStorage ao iniciar
  useEffect(() => {
    const savedHistory = localStorage.getItem('ecofeira_history');
    if (savedHistory) {
      try {
        setSearchHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Erro ao carregar histórico", e);
      }
    }

    const savedCart = localStorage.getItem('ecofeira_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error("Erro ao carregar carrinho", e);
      }
    }
  }, []);

  // Salvar histórico sempre que mudar
  useEffect(() => {
    localStorage.setItem('ecofeira_history', JSON.stringify(searchHistory));
  }, [searchHistory]);

  // Salvar carrinho sempre que mudar
  useEffect(() => {
    localStorage.setItem('ecofeira_cart', JSON.stringify(cart));
  }, [cart]);

  const addToHistory = (term: string) => {
    setSearchHistory(prev => {
      const filtered = prev.filter(item => item.toLowerCase() !== term.toLowerCase());
      return [term, ...filtered].slice(0, 5); // Mantém as 5 mais recentes
    });
  };

  const clearHistory = () => {
    setSearchHistory([]);
  };

  const handleSearch = async (e?: React.FormEvent, queryOverride?: string) => {
    if (e) e.preventDefault();
    const term = queryOverride || query;
    if (!term.trim()) return;

    if (queryOverride) setQuery(term);
    
    addToHistory(term);
    setIsSearching(true);
    setView(AppView.SEARCH);
    
    try {
      const results = await searchProductsWithGemini(term);
      setSearchResults(results);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const addToCart = useCallback((product: ProductOffer) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  }, []);

  const totalItems = useMemo(() => cart.reduce((acc, item) => acc + item.quantity, 0), [cart]);

  return (
    <div className="app-wrapper">
      <header>
        <div className="container flex justify-between items-center">
          <div className="logo" onClick={() => setView(AppView.HOME)}>
            <div className="logo-icon"><StoreIcon size={20} /></div>
            <span>EcoFeira</span>
          </div>

          {view !== AppView.HOME && (
            <form onSubmit={handleSearch} className="search-container">
              <Search className="search-icon" size={18} />
              <input 
                type="text" 
                className="search-input" 
                placeholder="Buscar produtos..." 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </form>
          )}

          <button className="btn btn-ghost" onClick={() => setView(AppView.CART)} style={{ position: 'relative' }}>
            <ShoppingCart size={20} />
            {totalItems > 0 && (
              <span style={{
                position: 'absolute',
                top: '-5px',
                right: '-5px',
                background: 'var(--primary)',
                color: 'white',
                borderRadius: '50%',
                width: '18px',
                height: '18px',
                fontSize: '0.65rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold'
              }}>
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </header>

      <main className="container" style={{paddingTop: '40px', paddingBottom: '80px'}}>
        {view === AppView.HOME && (
          <div className="animate" style={{textAlign: 'center', maxWidth: '600px', margin: '60px auto'}}>
            <h1 style={{fontSize: '3rem', fontWeight: 800, marginBottom: '20px', lineHeight: 1.1}}>
              Compare preços e <span style={{color: 'var(--primary)'}}>economize</span> agora.
            </h1>
            <p style={{color: 'var(--text-muted)', marginBottom: '40px', fontSize: '1.1rem'}}>
              Acesse as ofertas de todos os supermercados locais em um único lugar.
            </p>
            
            <form onSubmit={handleSearch} style={{position: 'relative', marginBottom: '40px'}}>
               <Search style={{position: 'absolute', left: '20px', top: '18px', color: 'var(--primary)'}} size={24} />
               <input 
                type="text" 
                placeholder="O que você precisa hoje?" 
                style={{width: '100%', padding: '18px 20px 18px 55px', borderRadius: '20px', border: '2px solid var(--border)', fontSize: '1.1rem', outline: 'none', boxShadow: 'var(--shadow-md)'}}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
               />
               <button className="btn btn-primary" style={{position: 'absolute', right: '8px', top: '8px', bottom: '8px', borderRadius: '14px'}}>
                Buscar
               </button>
            </form>

            {/* Seção de Histórico */}
            {searchHistory.length > 0 && (
              <div style={{ marginBottom: '30px', textAlign: 'left' }}>
                <div className="flex justify-between items-center" style={{ marginBottom: '12px' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <History size={14} /> BUSCAS RECENTES
                  </span>
                  <button 
                    onClick={clearHistory}
                    style={{ background: 'none', border: 'none', color: 'var(--danger)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <X size={12} /> Limpar
                  </button>
                </div>
                <div className="flex gap-2" style={{flexWrap: 'wrap'}}>
                  {searchHistory.map(term => (
                    <button 
                      key={term} 
                      onClick={() => handleSearch(undefined, term)} 
                      className="btn btn-ghost" 
                      style={{ fontSize: '0.8rem', padding: '6px 14px', borderRadius: '10px' }}
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div style={{ textAlign: 'left' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '12px' }}>SUGESTÕES</span>
              <div className="flex gap-2" style={{flexWrap: 'wrap'}}>
                {INITIAL_SUGGESTIONS.map(s => (
                  <button key={s} onClick={() => handleSearch(undefined, s)} className="btn btn-ghost" style={{fontSize: '0.8rem', padding: '6px 14px', borderRadius: '10px'}}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {view === AppView.SEARCH && (
          <div className="animate">
            <div className="flex items-center gap-4" style={{ marginBottom: '30px' }}>
              <button className="btn btn-ghost" onClick={() => setView(AppView.HOME)} style={{ padding: '8px' }}>
                <X size={20} />
              </button>
              <h2 style={{fontWeight: 800, fontSize: '1.5rem'}}>Resultados para "{query}"</h2>
            </div>
            
            {isSearching ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <div className="logo-icon animate" style={{ margin: '0 auto 20px', width: '50px', height: '50px' }}>
                  <StoreIcon size={24} />
                </div>
                <p style={{color: 'var(--text-muted)', fontWeight: 600}}>Consultando preços nos mercados locais...</p>
              </div>
            ) : (
              <div className="product-grid">
                {searchResults.map(p => (
                  <ProductCard key={p.id} product={p} onAdd={addToCart} />
                ))}
              </div>
            )}
          </div>
        )}

        {view === AppView.CART && (
          <div className="animate" style={{maxWidth: '800px', margin: '0 auto'}}>
            <div className="flex items-center justify-between" style={{ marginBottom: '30px' }}>
              <h2 style={{fontWeight: 800, fontSize: '2rem'}}>Minha Lista</h2>
              {cart.length > 0 && (
                <button 
                  className="btn btn-ghost" 
                  style={{ color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                  onClick={() => { if(confirm('Limpar toda a lista?')) setCart([]) }}
                >
                  <Trash2 size={18} /> Limpar Tudo
                </button>
              )}
            </div>
            
            {cart.length === 0 ? (
              <div style={{textAlign: 'center', padding: '60px', border: '2px dashed var(--border)', borderRadius: '30px'}}>
                <ShoppingCart size={48} style={{ color: 'var(--border)', marginBottom: '16px' }} />
                <p style={{color: 'var(--text-muted)', marginBottom: '20px'}}>Sua lista de compras está vazia.</p>
                <button className="btn btn-primary" onClick={() => setView(AppView.HOME)}>Explorar Ofertas</button>
              </div>
            ) : (
              <div style={{display: 'grid', gap: '24px'}}>
                <div style={{background: 'white', borderRadius: '24px', padding: '24px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)'}}>
                  {cart.map(item => (
                    <div key={item.id} className="flex justify-between items-center" style={{padding: '15px 0', borderBottom: '1px solid var(--bg)'}}>
                      <div>
                        <h4 style={{fontWeight: 700}}>{item.name}</h4>
                        <p style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>{item.storeName} • {item.quantity} un.</p>
                      </div>
                      <div style={{textAlign: 'right'}}>
                        <p style={{fontWeight: 800, color: 'var(--primary)', fontSize: '1.1rem'}}>R$ {(item.price * item.quantity).toFixed(2)}</p>
                        <div className="flex gap-2" style={{ marginTop: '4px' }}>
                           <button onClick={() => {
                             setCart(prev => prev.map(i => i.id === item.id ? {...i, quantity: Math.max(1, i.quantity - 1)} : i))
                           }} style={{ background: 'var(--bg)', border: 'none', borderRadius: '4px', padding: '2px 6px', cursor: 'pointer' }}>-</button>
                           <button onClick={() => {
                             setCart(prev => prev.map(i => i.id === item.id ? {...i, quantity: i.quantity + 1} : i))
                           }} style={{ background: 'var(--bg)', border: 'none', borderRadius: '4px', padding: '2px 6px', cursor: 'pointer' }}>+</button>
                           <button onClick={() => {
                             setCart(prev => prev.filter(i => i.id !== item.id))
                           }} style={{ color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer', marginLeft: '8px' }}>
                            <Trash2 size={14} />
                           </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '2px solid var(--bg)', textAlign: 'right' }}>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL DA LISTA</p>
                    <p style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)' }}>
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
    </div>
  );
}

export default App;