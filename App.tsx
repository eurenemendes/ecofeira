import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, ShoppingCart, Store as StoreIcon, ChefHat, Trash2 } from 'lucide-react';
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
  const [recipeSuggestion, setRecipeSuggestion] = useState<string>('');

  const handleSearch = async (e?: React.FormEvent, queryOverride?: string) => {
    if (e) e.preventDefault();
    const term = queryOverride || query;
    if (!term.trim()) return;

    if (queryOverride) setQuery(term);
    
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

          <button className="btn btn-ghost" onClick={() => setView(AppView.CART)}>
            <ShoppingCart size={20} />
            {totalItems > 0 && <span style={{color: 'var(--primary)', fontWeight: 'bold'}}>{totalItems}</span>}
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
            
            <form onSubmit={handleSearch} style={{position: 'relative', marginBottom: '30px'}}>
               <Search style={{position: 'absolute', left: '20px', top: '18px', color: 'var(--primary)'}} size={24} />
               <input 
                type="text" 
                placeholder="O que você precisa hoje?" 
                style={{width: '100%', padding: '18px 20px 18px 55px', borderRadius: '20px', border: '2px solid var(--border)', fontSize: '1.1rem', outline: 'none'}}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
               />
               <button className="btn btn-primary" style={{position: 'absolute', right: '8px', top: '8px', bottom: '8px', borderRadius: '14px'}}>
                Buscar
               </button>
            </form>

            <div className="flex gap-2" style={{flexWrap: 'wrap', justifyContent: 'center'}}>
              {INITIAL_SUGGESTIONS.slice(0, 5).map(s => (
                <button key={s} onClick={() => handleSearch(undefined, s)} className="btn btn-ghost" style={{fontSize: '0.8rem'}}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {view === AppView.SEARCH && (
          <div className="animate">
            <h2 style={{fontWeight: 800, fontSize: '1.5rem', marginBottom: '20px'}}>Resultados para "{query}"</h2>
            {isSearching ? (
              <p style={{color: 'var(--text-muted)'}}>Pesquisando nos mercados locais...</p>
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
            <h2 style={{fontWeight: 800, fontSize: '2rem', marginBottom: '30px'}}>Minha Lista</h2>
            {cart.length === 0 ? (
              <div style={{textAlign: 'center', padding: '60px', border: '2px dashed var(--border)', borderRadius: '30px'}}>
                <p style={{color: 'var(--text-muted)'}}>Sua lista está vazia.</p>
                <button className="btn btn-primary" style={{marginTop: '20px'}} onClick={() => setView(AppView.HOME)}>Buscar Produtos</button>
              </div>
            ) : (
              <div style={{display: 'grid', gap: '20px'}}>
                <div style={{background: 'white', borderRadius: '24px', padding: '24px', border: '1px solid var(--border)'}}>
                  {cart.map(item => (
                    <div key={item.id} className="flex justify-between items-center" style={{padding: '15px 0', borderBottom: '1px solid var(--bg)'}}>
                      <div>
                        <h4 style={{fontWeight: 700}}>{item.name}</h4>
                        <p style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>{item.storeName} • {item.quantity} un.</p>
                      </div>
                      <div style={{textAlign: 'right'}}>
                        <p style={{fontWeight: 800, color: 'var(--primary)'}}>R$ {(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
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