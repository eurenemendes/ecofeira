import React from 'react';
import { ProductOffer } from '../types';
import { Plus, ShoppingBasket } from 'lucide-react';

interface ProductCardProps {
  product: ProductOffer;
  onAdd: (product: ProductOffer) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAdd }) => {
  const getCategoryStyles = (cat: string) => {
    const styles: Record<string, { bg: string, text: string }> = {
      'Mercearia': { bg: 'bg-amber-50', text: 'text-amber-600' },
      'Limpeza': { bg: 'bg-indigo-50', text: 'text-indigo-600' },
      'Hortifruti': { bg: 'bg-emerald-50', text: 'text-emerald-600' },
      'Carnes': { bg: 'bg-rose-50', text: 'text-rose-600' },
      'Laticínios': { bg: 'bg-sky-50', text: 'text-sky-600' },
      'Bebidas': { bg: 'bg-purple-50', text: 'text-purple-600' },
    };
    return styles[cat] || { bg: 'bg-slate-50', text: 'text-slate-500' };
  };

  const style = getCategoryStyles(product.category);

  return (
    <div className="bg-white rounded-[24px] border border-slate-100 p-4 flex flex-col h-full transition-all hover:shadow-xl hover:shadow-slate-200/50 group">
      <div className={`aspect-square rounded-[20px] ${style.bg} flex flex-col items-center justify-center mb-4 relative overflow-hidden`}>
        <ShoppingBasket className={`${style.text} opacity-20`} size={48} />
        <span className={`absolute inset-0 flex items-center justify-center font-bold text-[10px] uppercase tracking-widest ${style.text}`}>
          {product.category}
        </span>
        
        {product.isPromo && (
          <div className="absolute top-3 left-3 bg-rose-500 text-white text-[9px] font-black px-2 py-1 rounded-lg shadow-sm">
            PROMO
          </div>
        )}

        <div className={`absolute bottom-3 left-3 text-[9px] font-bold px-2 py-0.5 rounded-md text-white ${product.storeColor} shadow-sm`}>
           {product.storeName}
        </div>
      </div>
      
      <div className="flex flex-col flex-grow">
        <h3 className="font-bold text-slate-800 text-sm leading-tight mb-1 group-hover:text-emerald-600 transition-colors">
          {product.name}
        </h3>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mb-4">
          Unidade: {product.unit}
        </p>
        
        <div className="mt-auto flex items-center justify-between">
          <div>
            <p className="text-[9px] text-slate-400 font-bold uppercase mb-0.5">Preço</p>
            <p className="text-lg font-black text-slate-900 leading-none">
              <span className="text-xs font-bold mr-0.5">R$</span>
              {product.price.toFixed(2).replace('.', ',')}
            </p>
          </div>
          
          <button 
            onClick={() => onAdd(product)}
            className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center hover:bg-emerald-600 active:scale-90 transition-all shadow-lg shadow-slate-200"
            aria-label="Adicionar ao carrinho"
          >
            <Plus size={20} strokeWidth={3} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;