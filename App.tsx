import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, ShoppingCart, ArrowLeft, Trash2, Store as StoreIcon, ChefHat, ChevronRight, Filter } from 'lucide-react';
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

    if (queryOverride !== undefined) setQuery(term);
    
    setIsSearching(true);
    setView(AppView.SEARCH);
    setSearchResults([]);
    
    try {
      const results = await searchProductsWithGemini(term);
      // Garante que o estado seja limpo antes de setar novos resultados
      setSearchResults(results);
    } catch (err) {
      console.error("Erro na busca:", err);
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

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === itemId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const cartStats = useMemo(() => {
    const count = cart.reduce((acc, item) => acc + item.quantity, 0);
    const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    return { count, total };
  }, [cart]);

  const generateRecipe = useCallback(async () => {
    if (cart.length < 2) return;
    setIsLoadingRecipe(true);
    try {
      const recipe = await suggestRecipe(cart.map(i => i.name));
      setRecipeSuggestion(String(recipe || ""));
    } catch (e) {
      setRecipeSuggestion("");
    } finally {
      setIsLoadingRecipe(false);
    }
  }, [cart]);

  useEffect(() => {
    if (view === AppView.CART && cart.length >= 2 && !recipeSuggestion && !isLoadingRecipe) {
        generateRecipe();
    }
  }, [view, cart.length, recipeSuggestion, generateRecipe, isLoadingRecipe]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-emerald-100">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200 h-16 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-full flex items-center justify-between gap-4">
            <div 
              className="flex items-center gap-2.5 cursor-pointer shrink-0" 
              onClick={() => { setView(AppView.HOME); setQuery(''); setRecipeSuggestion(''); }}
            >
                <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-emerald-200">
                  <StoreIcon size={20} />
                </div>
                <span className="font-extrabold text-xl tracking-tight hidden sm:block">EcoFeira</span>
            </div>

            {view !== AppView.HOME && (
                <form onSubmit={(e) => handleSearch(e)} className="flex-1 max-w-xl relative group">
                    <input 
                        type="text" 
                        placeholder="Pesquisar em mercados..." 
                        className="w-full pl-11 pr-4 py-2.5 bg-slate-100 border-transparent border-2 rounded-2xl text-sm outline-none transition-all focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <Search className="absolute left-3.5 top-3 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                </form>
            )}

            <button 
              onClick={() => setView(AppView.CART)} 
              className={`relative p-2.5 rounded-2xl transition-all ${view === AppView.CART ? 'bg-emerald-50 text-emerald-600' : 'hover:bg-slate-100 text-slate-600'}`}
            >
                <ShoppingCart size={22} />
                {cartStats.count > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-rose-500 text-white text-[10px] font-black flex items-center justify-center rounded-full ring-4 ring-slate-50">
                        {cartStats.count}
                    </span>
                )}
            </button>
        </div>
      </header>

      <main className="flex-grow max-w-6xl mx-auto w-full px-4 py-8">
        {view === AppView.HOME && (
          <div className="flex flex-col items-center py-16 text-center animate-fade-in">
            <div className="mb-8 p-6 bg-emerald-50 rounded-3xl text-emerald-600 relative">
              <StoreIcon size={56} />
              <div className="absolute -top-2 -right-2 bg-rose-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg">LIVE</div>
            </div>
            <h1 className="text-5xl md:text-6xl font-black mb-6 tracking-tight text-slate-900 leading-none">
              Compras inteligentes,<br/><span className="text-emerald-500">preços reais.</span>
            </h1>
            <p className="text-slate-500 text-lg max-w-lg mb-12 font-medium">
              Pesquise produtos e compare ofertas em todos os supermercados do seu bairro em segundos.
            </p>
            
            <form onSubmit={(e) => handleSearch(e)} className="relative w-full max-w-xl mb-14">
                <input 
                    type="text" 
                    placeholder="Arroz, feijão, leite..." 
                    className="w-full pl-14 pr-6 py-5 bg-white border-2 border-slate-100 focus:border-emerald-500 rounded-3xl shadow-2xl shadow-emerald-100/40 outline-none text-lg transition-all"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    autoFocus
                />
                <Search className="absolute left-5 top-5.5 text-emerald-500" size={28} />
                <button 
                  type="submit" 
                  className="absolute right-2.5 top-2.5 bottom-2.5 bg-emerald-600 text-white px-8 rounded-2xl font-bold hover:bg-emerald-700 active:scale-95 transition-all shadow-lg shadow-emerald-100"
                >
                  Buscar
                </button>
            </form>

            <div className="flex flex-wrap justify-center gap-2.5 max-w-2xl">
                <span className="w-full text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Sugestões populares</span>
                {INITIAL_SUGGESTIONS.map(term => (
                  <button 
                    key={term} 
                    onClick={() => handleSearch(undefined, term)} 
                    className="px-5 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm font-semibold text-slate-600 hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 shadow-sm transition-all active:scale-95"
                  >
                    {term}
                  </button>
                ))}
            </div>
          </div>
        )}

        {view === AppView.SEARCH && (
          <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 leading-tight">Ofertas para "{query}"</h2>
                  <p className="text-sm text-slate-500 font-medium">Encontramos {searchResults.length} opções disponíveis</p>
                </div>
                <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
                   <button className="px-4 py-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 rounded-xl">Preço</button>
                   <button className="px-4 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-50 rounded-xl">Distância</button>
                </div>
            </div>

            {isSearching ? (
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {[1,2,3,4,5,6,7,8].map(i => (
                    <div key={i} className="bg-white h-72 rounded-3xl animate-pulse shadow-sm p-4 flex flex-col">
                      <div className="bg-slate-100 h-32 rounded-2xl mb-4"></div>
                      <div className="bg-slate-100 h-5 w-3/4 rounded-lg mb-2"></div>
                      <div className="bg-slate-100 h-4 w-1/2 rounded-lg mt-auto"></div>
                    </div>
                  ))}
               </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {searchResults.map(offer => (
                  <ProductCard key={offer.id} product={offer} onAdd={addToCart} />
                ))}
              </div>
            )}
          </div>
        )}

        {view === AppView.CART && (
          <div className="max-w-5xl mx-auto animate-fade-in">
              <div className="flex items-center gap-4 mb-10">
                   <button 
                     onClick={() => setView(AppView.SEARCH)} 
                     className="w-10 h-10 flex items-center justify-center bg-white hover:bg-slate-100 rounded-xl border border-slate-200 shadow-sm transition-all"
                   >
                     <ArrowLeft size={20} />
                   </button>
                   <h2 className="text-3xl font-black tracking-tight">Minha Lista</h2>
              </div>

              {cart.length === 0 ? (
                  <div className="text-center py-24 bg-white rounded-[40px] border-2 border-dashed border-slate-200">
                      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                        <ShoppingCart size={40} />
                      </div>
                      <p className="text-slate-400 font-bold text-lg mb-6">Sua lista está vazia.</p>
                      <button 
                        onClick={() => setView(AppView.HOME)}
                        className="bg-emerald-600 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-emerald-100"
                      >
                        Começar Compras
                      </button>
                  </div>
              ) : (
                  <div className="grid lg:grid-cols-12 gap-10">
                      <div className="lg:col-span-7 space-y-4">
                          <div className="flex items-center justify-between px-2 mb-2">
                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Produtos selecionados</span>
                            <button onClick={() => setCart([])} className="text-[10px] font-bold text-rose-500 hover:underline">Limpar lista</button>
                          </div>
                          
                          {cart.map(item => (
                              <div key={item.id} className="bg-white p-5 rounded-[32px] shadow-sm border border-slate-100 flex items-center gap-5 hover:border-emerald-200 transition-colors">
                                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xs ${item.storeColor} text-white shadow-inner`}>
                                    {item.category[0]}
                                  </div>
                                  <div className="flex-grow">
                                      <h4 className="font-extrabold text-slate-800 leading-tight">{item.name}</h4>
                                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide mt-1">{item.storeName} • {item.unit}</p>
                                      <div className="text-emerald-600 font-black text-lg mt-1">R$ {item.price.toFixed(2).replace('.', ',')}</div>
                                  </div>
                                  <div className="flex flex-col items-end gap-3">
                                      <button 
                                        onClick={() => removeFromCart(item.id)} 
                                        className="w-8 h-8 flex items-center justify-center text-slate-300 hover:bg-rose-50 hover:text-rose-500 rounded-xl transition-all"
                                      >
                                        <Trash2 size={16} />
                                      </button>
                                      <div className="flex items-center bg-slate-50 rounded-xl border border-slate-100 overflow-hidden">
                                          <button onClick={() => updateQuantity(item.id, -1)} className="w-8 h-8 flex items-center justify-center text-slate-500 font-black hover:bg-white transition-colors">-</button>
                                          <span className="w-8 text-center text-xs font-black">{item.quantity}</span>
                                          <button onClick={() => updateQuantity(item.id, 1)} className="w-8 h-8 flex items-center justify-center text-slate-500 font-black hover:bg-white transition-colors">+</button>
                                      </div>
                                  </div>
                              </div>
                          ))}
                          
                          {recipeSuggestion && (
                              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[32px] p-8 text-white shadow-2xl relative overflow-hidden group">
                                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <ChefHat size={120} />
                                  </div>
                                  <div className="relative z-10">
                                    <div className="flex items-center gap-2 text-emerald-400 mb-4">
                                        <ChefHat size={22} strokeWidth={2.5} />
                                        <h4 className="font-black text-xs uppercase tracking-[0.2em]">Chef AI Sugere</h4>
                                    </div>
                                    <p className="text-lg font-medium leading-relaxed italic text-slate-200">
                                      "{recipeSuggestion}"
                                    </p>
                                  </div>
                              </div>
                          )}
                      </div>
                      
                      <div className="lg:col-span-5">
                          <CartOptimizer cart={cart} />
                          <div className="mt-8 bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/50">
                             <div className="flex justify-between items-center mb-6">
                                <span className="text-slate-500 font-bold uppercase tracking-widest text-xs">Total Geral</span>
                                <span className="text-3xl font-black text-slate-900 leading-none">R$ {cartStats.total.toFixed(2).replace('.', ',')}</span>
                             </div>
                             <button className="w-full bg-emerald-600 text-white py-5 rounded-[24px] font-black shadow-xl shadow-emerald-100 flex items-center justify-center gap-3 hover:bg-emerald-700 active:scale-95 transition-all group">
                                <span>Salvar Lista</span>
                                <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                             </button>
                             <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-6">Preços podem variar de acordo com o estoque local</p>
                          </div>
                      </div>
                  </div>
              )}
          </div>
        )}
      </main>

      <footer className="py-8 text-center border-t border-slate-200 bg-white">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">EcoFeira &copy; 2024 • Economia Inteligente</p>
      </footer>
    </div>
  );
}

export default App;