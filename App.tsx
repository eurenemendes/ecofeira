import React, { useState, useEffect, useCallback } from 'react';
import { Search, ShoppingCart, ArrowLeft, Trash2, MapPin, Store as StoreIcon, ChefHat } from 'lucide-react';
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
    
    // Use override if provided, otherwise fallback to state query
    const termToSearch = queryOverride !== undefined ? queryOverride : query;
    
    if (!termToSearch.trim()) return;

    // Update the state if we used an override so the UI input reflects it
    if (queryOverride) setQuery(queryOverride);

    setIsSearching(true);
    setView(AppView.SEARCH);
    
    // Clear previous results to show loading state effectively
    setSearchResults([]);
    
    const results = await searchProductsWithGemini(termToSearch);
    setSearchResults(results);
    setIsSearching(false);
  };

  const addToCart = (product: ProductOffer) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
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

  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const generateRecipe = useCallback(async () => {
      setIsLoadingRecipe(true);
      const itemNames = cart.map(i => i.name);
      const recipe = await suggestRecipe(itemNames);
      setRecipeSuggestion(recipe);
      setIsLoadingRecipe(false);
  }, [cart]);

  // Effect to generate recipe when entering cart if enough items
  useEffect(() => {
    if (view === AppView.CART && cart.length > 2 && !recipeSuggestion) {
        generateRecipe();
    }
  }, [view, cart.length, recipeSuggestion, generateRecipe]);


  // ---- Render Helpers ----

  const renderHome = () => (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="mb-8 p-4 bg-emerald-100 rounded-full text-emerald-600">
        <StoreIcon size={48} />
      </div>
      <h1 className="text-4xl font-extrabold text-gray-800 mb-4 tracking-tight">
        Economize na <span className="text-emerald-500">EcoFeira</span>
      </h1>
      <p className="text-gray-500 max-w-md mb-8">
        Compare preços de supermercados locais, encontre as melhores ofertas e planeje sua compra inteligente.
      </p>
      
      <div className="w-full max-w-md space-y-3">
        <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider text-left pl-2">Sugestões Populares</p>
        <div className="flex flex-wrap gap-2">
          {INITIAL_SUGGESTIONS.map(term => (
            <button 
              key={term}
              onClick={() => handleSearch(undefined, term)}
              className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-600 hover:border-emerald-500 hover:text-emerald-600 transition-colors shadow-sm"
            >
              {term}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSearchResults = () => (
    <div className="px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">
          Resultados para "{query}"
        </h2>
        <span className="text-sm text-gray-500">{searchResults.length} ofertas encontradas</span>
      </div>

      {isSearching ? (
         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1,2,3,4,5,6].map(i => (
                <div key={i} className="bg-white h-72 rounded-2xl animate-pulse shadow-sm p-4">
                    <div className="bg-gray-200 h-32 rounded-xl mb-4 w-full"></div>
                    <div className="bg-gray-200 h-4 w-3/4 rounded mb-2"></div>
                    <div className="bg-gray-200 h-4 w-1/2 rounded mb-4"></div>
                    <div className="bg-gray-200 h-8 w-1/3 rounded"></div>
                </div>
            ))}
         </div>
      ) : searchResults.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
            <p className="text-lg">Nenhum produto encontrado.</p>
            <p>Tente buscar por termos mais genéricos como "Arroz" ou "Leite".</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-20">
          {searchResults.map(offer => (
            <ProductCard 
              key={offer.id} 
              product={offer} 
              onAdd={addToCart} 
            />
          ))}
        </div>
      )}
    </div>
  );

  const renderCart = () => (
    <div className="max-w-3xl mx-auto px-4 py-6 pb-32">
        <div className="flex items-center gap-2 mb-6">
             <button onClick={() => setView(AppView.SEARCH)} className="p-2 hover:bg-gray-200 rounded-full">
                <ArrowLeft size={20} />
             </button>
             <h2 className="text-2xl font-bold text-gray-800">Sua Lista de Compras</h2>
        </div>

        {cart.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl shadow-sm border border-dashed border-gray-300">
                <ShoppingCart size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900">Sua lista está vazia</h3>
                <p className="text-gray-500 mb-6">Adicione itens para ver a mágica da comparação de preços.</p>
                <button 
                    onClick={() => setView(AppView.HOME)}
                    className="px-6 py-2 bg-emerald-500 text-white rounded-full font-medium hover:bg-emerald-600 transition"
                >
                    Começar a pesquisar
                </button>
            </div>
        ) : (
            <div className="grid md:grid-cols-2 gap-8">
                
                {/* List Items */}
                <div className="space-y-4">
                    {cart.map(item => (
                        <div key={item.id} className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex gap-3 items-center">
                            <img src={item.imageUrl} alt={item.name} className="w-16 h-16 rounded-lg object-cover bg-gray-100" />
                            <div className="flex-grow">
                                <h4 className="font-medium text-gray-800 text-sm leading-tight">{item.name}</h4>
                                <p className="text-xs text-gray-500 mt-1">{item.storeName}</p>
                                <div className="text-emerald-600 font-bold text-sm mt-1">R$ {item.price.toFixed(2)}</div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <button onClick={() => removeFromCart(item.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                                    <Trash2 size={16} />
                                </button>
                                <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200">
                                    <button onClick={() => updateQuantity(item.id, -1)} className="px-2 py-1 text-gray-600 font-medium hover:bg-gray-100 rounded-l-lg">-</button>
                                    <span className="text-xs font-semibold px-1 min-w-[20px] text-center">{item.quantity}</span>
                                    <button onClick={() => updateQuantity(item.id, 1)} className="px-2 py-1 text-gray-600 font-medium hover:bg-gray-100 rounded-r-lg">+</button>
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    {/* Gemini Recipe Suggestion Block */}
                    {cart.length > 2 && (
                        <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 mt-6">
                            <div className="flex items-center gap-2 text-orange-600 mb-2">
                                <ChefHat size={20} />
                                <h4 className="font-bold text-sm uppercase tracking-wide">Dica do Chef AI</h4>
                            </div>
                            {isLoadingRecipe ? (
                                <div className="h-16 animate-pulse bg-orange-100 rounded-lg w-full"></div>
                            ) : (
                                <p className="text-sm text-gray-700 italic leading-relaxed">
                                    "{recipeSuggestion || "Pensando em uma receita..."}"
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* Optimization Panel */}
                <div className="md:sticky md:top-24 h-fit">
                    <CartOptimizer cart={cart} />
                    
                    <button className="w-full mt-6 bg-gray-900 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-black transition-transform active:scale-95 flex items-center justify-center gap-2">
                        <span>Finalizar Lista</span>
                        <ArrowLeft size={16} className="rotate-180" />
                    </button>
                </div>
            </div>
        )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm transition-all">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
            <div 
                className="flex items-center gap-2 cursor-pointer group" 
                onClick={() => { setView(AppView.HOME); setQuery(''); }}
            >
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm group-hover:shadow-emerald-200 transition-shadow">
                    E
                </div>
                <span className="font-bold text-xl tracking-tight text-gray-800">EcoFeira</span>
            </div>

            {/* Desktop Search Bar (shown if not on home or always on desktop if preferred) */}
            {view !== AppView.HOME && (
                <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="hidden md:flex flex-1 max-w-md mx-8 relative">
                    <input 
                        type="text" 
                        placeholder="Buscar produtos (ex: Leite, Pão...)" 
                        className="w-full pl-10 pr-4 py-2 bg-gray-100 border-transparent focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 rounded-full text-sm transition-all outline-none"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                </form>
            )}

            <button 
                onClick={() => setView(AppView.CART)} 
                className="relative p-2 hover:bg-gray-100 rounded-full transition-colors group"
            >
                <ShoppingCart className={`text-gray-600 group-hover:text-emerald-600 transition-colors ${view === AppView.CART ? 'text-emerald-600 fill-current' : ''}`} />
                {cartItemCount > 0 && (
                    <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full shadow-sm ring-2 ring-white">
                        {cartItemCount}
                    </span>
                )}
            </button>
        </div>

        {/* Mobile Search Bar (Sub-header) */}
        {view !== AppView.HOME && (
             <div className="md:hidden px-4 pb-3">
                 <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="relative">
                    <input 
                        type="text" 
                        placeholder="Buscar produtos..." 
                        className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm shadow-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <Search className="absolute left-3 top-3.5 text-gray-400" size={18} />
                </form>
             </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-grow max-w-5xl mx-auto w-full">
        {view === AppView.HOME && renderHome()}
        
        {/* We keep the search input logic in the header for search view, but need to handle initial search from Home */}
        {view === AppView.HOME && (
             <div className="px-4 -mt-6">
                <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="relative max-w-md mx-auto">
                    <input 
                        type="text" 
                        placeholder="O que você precisa comprar hoje?" 
                        className="w-full pl-12 pr-4 py-4 bg-white border-2 border-emerald-100 hover:border-emerald-300 focus:border-emerald-500 rounded-2xl shadow-lg text-lg outline-none transition-all placeholder:text-gray-400"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        autoFocus
                    />
                    <Search className="absolute left-4 top-5 text-emerald-500" size={24} />
                    <button type="submit" className="absolute right-2 top-2 bottom-2 bg-emerald-500 text-white px-4 rounded-xl font-medium hover:bg-emerald-600 transition-colors">
                        Buscar
                    </button>
                </form>
             </div>
        )}

        {view === AppView.SEARCH && renderSearchResults()}
        {view === AppView.CART && renderCart()}
      </main>

    </div>
  );
}

export default App;