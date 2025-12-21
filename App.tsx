
import React, { useState, useEffect, useCallback } from 'react';
import { Search, ShoppingCart, ArrowLeft, Trash2, Store as StoreIcon, ChefHat, ChevronRight } from 'lucide-react';
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
  const [isLoadingRecipe, setIsLoadingRecipe] = useState(false);

  const handleSearch = async (e?: React.FormEvent, queryOverride?: string) => {
    if (e) e.preventDefault();
    const term = queryOverride !== undefined ? queryOverride : query;
    if (!term.trim()) return;

    if (queryOverride) setQuery(queryOverride);
    setIsSearching(true);
    setView(AppView.SEARCH);
    setSearchResults([]);
    
    const results = await searchProductsWithGemini(term);
    setSearchResults(results);
    setIsSearching(false);
  };

  const addToCart = (product: ProductOffer) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === itemId) {
        return { ...item, quantity: Math.max(1, item.quantity + delta) };
      }
      return item;
    }));
  };

  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const generateRecipe = useCallback(async () => {
      setIsLoadingRecipe(true);
      const recipe = await suggestRecipe(cart.map(i => i.name));
      setRecipeSuggestion(recipe);
      setIsLoadingRecipe(false);
  }, [cart]);

  useEffect(() => {
    if (view === AppView.CART && cart.length > 2 && !recipeSuggestion) {
        generateRecipe();
    }
  }, [view, cart.length, recipeSuggestion, generateRecipe]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 h-16 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-full flex items-center justify-between">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => { setView(AppView.HOME); setQuery(''); }}>
                <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-bold shadow-sm">E</div>
                <span className="font-bold text-xl tracking-tight">EcoFeira</span>
            </div>

            {view !== AppView.HOME && (
                <form onSubmit={(e) => handleSearch(e)} className="hidden md:flex flex-1 max-w-md mx-8 relative">
                    <input 
                        type="text" 
                        placeholder="Buscar..." 
                        className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-full text-sm outline-none focus:bg-white focus:ring-2 focus:ring-emerald-200"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                </form>
            )}

            <button onClick={() => setView(AppView.CART)} className="relative p-2 hover:bg-gray-100 rounded-full transition-colors">
                <ShoppingCart className={view === AppView.CART ? 'text-emerald-600' : 'text-gray-600'} />
                {cartItemCount > 0 && (
                    <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full ring-2 ring-white">
                        {cartItemCount}
                    </span>
                )}
            </button>
        </div>
      </header>

      <main className="flex-grow max-w-5xl mx-auto w-full px-4 py-6">
        {view === AppView.HOME && (
          <div className="flex flex-col items-center py-12 text-center">
            <div className="mb-6 p-4 bg-emerald-100 rounded-full text-emerald-600">
              <StoreIcon size={48} />
            </div>
            <h1 className="text-4xl font-black mb-4">Economize na <span className="text-emerald-500">EcoFeira</span></h1>
            <p className="text-gray-500 max-w-md mb-10">O comparador de preços inteligente que ajuda você a economizar em cada item da sua lista.</p>
            
            <form onSubmit={(e) => handleSearch(e)} className="relative w-full max-w-lg mb-12">
                <input 
                    type="text" 
                    placeholder="O que você precisa hoje?" 
                    className="w-full pl-12 pr-4 py-4 bg-white border-2 border-emerald-100 focus:border-emerald-500 rounded-2xl shadow-xl outline-none text-lg transition-all"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                <Search className="absolute left-4 top-5 text-emerald-500" size={24} />
                <button type="submit" className="absolute right-2 top-2 bottom-2 bg-emerald-500 text-white px-6 rounded-xl font-bold hover:bg-emerald-600 transition-colors">Buscar</button>
            </form>

            <div className="flex flex-wrap justify-center gap-2 max-w-md">
                {INITIAL_SUGGESTIONS.map(term => (
                  <button key={term} onClick={() => handleSearch(undefined, term)} className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-600 hover:border-emerald-500 hover:text-emerald-600 shadow-sm transition-all">{term}</button>
                ))}
            </div>
          </div>
        )}

        {view === AppView.SEARCH && (
          <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Resultados para "{query}"</h2>
                <span className="text-sm text-gray-500">{searchResults.length} ofertas</span>
            </div>

            {isSearching ? (
               <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {[1,2,3,4,5,6].map(i => <div key={i} className="bg-white h-60 rounded-2xl animate-pulse shadow-sm p-4"><div className="bg-gray-100 h-24 rounded-xl mb-4"></div><div className="bg-gray-100 h-4 w-3/4 rounded"></div></div>)}
               </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {searchResults.map(offer => <ProductCard key={offer.id} product={offer} onAdd={addToCart} />)}
              </div>
            )}
          </div>
        )}

        {view === AppView.CART && (
          <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-4 mb-8">
                   <button onClick={() => setView(AppView.SEARCH)} className="p-2 hover:bg-gray-200 rounded-full transition-all"><ArrowLeft size={20} /></button>
                   <h2 className="text-2xl font-bold tracking-tight">Minha Lista de Compras</h2>
              </div>

              {cart.length === 0 ? (
                  <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
                      <ShoppingCart size={48} className="mx-auto text-gray-300 mb-4" />
                      <p className="text-gray-500">Sua lista está vazia.</p>
                  </div>
              ) : (
                  <div className="grid lg:grid-cols-3 gap-8">
                      <div className="lg:col-span-2 space-y-4">
                          {cart.map(item => (
                              <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-[8px] ${item.storeColor} text-white`}>{item.category[0]}</div>
                                  <div className="flex-grow">
                                      <h4 className="font-bold text-sm leading-tight">{item.name}</h4>
                                      <p className="text-[10px] text-gray-400 mt-0.5">{item.storeName} • {item.unit}</p>
                                      <div className="text-emerald-600 font-bold text-sm mt-1">R$ {item.price.toFixed(2)}</div>
                                  </div>
                                  <div className="flex flex-col items-end gap-2">
                                      <button onClick={() => removeFromCart(item.id)} className="text-gray-300 hover:text-red-500"><Trash2 size={16} /></button>
                                      <div className="flex items-center bg-gray-50 rounded-lg border">
                                          <button onClick={() => updateQuantity(item.id, -1)} className="px-2 py-1 text-gray-500 font-bold">-</button>
                                          <span className="px-2 text-xs font-bold">{item.quantity}</span>
                                          <button onClick={() => updateQuantity(item.id, 1)} className="px-2 py-1 text-gray-500 font-bold">+</button>
                                      </div>
                                  </div>
                              </div>
                          ))}
                          {recipeSuggestion && (
                              <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 mt-6">
                                  <div className="flex items-center gap-2 text-orange-600 mb-2">
                                      <ChefHat size={18} />
                                      <h4 className="font-bold text-xs uppercase tracking-widest">Dica do Chef AI</h4>
                                  </div>
                                  <p className="text-xs text-gray-700 italic leading-relaxed">"{recipeSuggestion}"</p>
                              </div>
                          )}
                      </div>
                      <div>
                          <CartOptimizer cart={cart} />
                          <button className="w-full mt-6 bg-gray-900 text-white py-4 rounded-2xl font-bold shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all">
                              <span>Finalizar Lista</span>
                              <ChevronRight size={18} />
                          </button>
                      </div>
                  </div>
              )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
