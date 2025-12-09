import React, { useMemo } from 'react';
import { CartItem, CartOptimization } from '../types';
import { MOCK_STORES } from '../constants';
import { ShoppingBag, TrendingDown, MapPin, AlertCircle } from 'lucide-react';

interface CartOptimizerProps {
  cart: CartItem[];
}

const CartOptimizer: React.FC<CartOptimizerProps> = ({ cart }) => {
  
  const optimizedData: CartOptimization[] = useMemo(() => {
    if (cart.length === 0) return [];

    // Group items by baseProductId to understand unique items needed
    const uniqueItemsNeeded = new Set(cart.map(i => i.baseProductId));

    return MOCK_STORES.map(store => {
      let total = 0;
      let missingCount = 0;
      const storeItems: CartItem[] = [];

      // For each unique item in the cart, find the price at this specific store
      // NOTE: In a real app, we would re-fetch prices for this store. 
      // Here, we assume the cart items *are* the offers selected, 
      // but for "Optimization" we need to simulate the price at *other* stores for the same product.
      // Since we generated offers for ALL stores in geminiService, we can simulate this logic 
      // by inferring the price variation logic or finding the sibling offer if we stored it.
      
      // SIMPLIFICATION FOR DEMO: 
      // We will calculate the total based on the selected items. 
      // To show "Best Store", we need to know the price of 'Rice' at Store B even if the user added 'Rice' from Store A.
      // Since we don't persist all search results, we will simulate a "Estimated Total" for other stores
      // based on the mock store variance defined in constants/logic.
      
      // Let's rely on the cart items purely for now, but grouped by where they were added from 
      // is not enough. We want to show: "If you buy EVERYTHING at Store A..."
      
      // Hack for demo visualization: 
      // Use the store's "id" hash to deterine a deterministic multiplier for the base price 
      // to consistenty show difference between stores.
      
      let storeMultiplier = 1;
      if (store.id === 'store_1') storeMultiplier = 1.0; // Base
      if (store.id === 'store_2') storeMultiplier = 0.92; // 8% Cheaper generally
      if (store.id === 'store_3') storeMultiplier = 1.05; // 5% More expensive

      cart.forEach(item => {
         // Re-calculate estimated price for THIS store
         // Remove the variance of the item's original store and apply this store's multiplier
         const estimatedPrice = item.price * storeMultiplier;
         total += estimatedPrice * item.quantity;
         storeItems.push({ ...item, price: estimatedPrice, storeName: store.name, storeId: store.id });
      });

      return {
        storeId: store.id,
        storeName: store.name,
        totalPrice: total,
        missingItems: missingCount,
        items: storeItems
      };
    }).sort((a, b) => a.totalPrice - b.totalPrice);
  }, [cart]);

  if (cart.length === 0) return null;

  const bestOption = optimizedData[0];

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-2 mb-2 opacity-90">
          <TrendingDown size={24} />
          <h3 className="font-semibold text-lg">Melhor Opção de Compra</h3>
        </div>
        <div className="flex justify-between items-end">
          <div>
            <p className="text-sm font-medium opacity-80 mb-1">Comprando tudo no:</p>
            <div className="text-2xl font-bold flex items-center gap-2">
               {bestOption.storeName}
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm opacity-80">Total Estimado</p>
            <p className="text-3xl font-extrabold">R$ {bestOption.totalPrice.toFixed(2)}</p>
          </div>
        </div>
        
        {optimizedData.length > 1 && (
             <div className="mt-4 pt-4 border-t border-white/20 text-sm">
                <p>Economia de <span className="font-bold text-yellow-300">R$ {(optimizedData[optimizedData.length-1].totalPrice - bestOption.totalPrice).toFixed(2)}</span> comparado ao mais caro.</p>
             </div>
        )}
      </div>

      <div className="space-y-3">
        <h4 className="font-medium text-gray-700 ml-1">Comparativo por Mercado</h4>
        {optimizedData.map((opt, idx) => (
          <div key={opt.storeId} className={`relative p-4 rounded-xl border-2 transition-all ${idx === 0 ? 'border-emerald-500 bg-emerald-50' : 'border-transparent bg-white shadow-sm'}`}>
            {idx === 0 && (
                <div className="absolute -top-3 left-4 bg-emerald-500 text-white text-xs px-2 py-1 rounded-full font-bold uppercase tracking-wide">
                    Mais Barato
                </div>
            )}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-sm ${idx === 0 ? 'bg-white' : 'bg-gray-100'}`}>
                        {MOCK_STORES.find(s => s.id === opt.storeId)?.logo}
                    </div>
                    <div>
                        <h5 className="font-semibold text-gray-800">{opt.storeName}</h5>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                             <MapPin size={12} />
                             {MOCK_STORES.find(s => s.id === opt.storeId)?.distance}
                        </div>
                    </div>
                </div>
                <div className="text-right">
                    <div className="font-bold text-gray-900">R$ {opt.totalPrice.toFixed(2)}</div>
                    {idx !== 0 && (
                        <div className="text-xs text-red-500 font-medium">
                            + R$ {(opt.totalPrice - bestOption.totalPrice).toFixed(2)}
                        </div>
                    )}
                </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CartOptimizer;