
import React from 'react';
import { ProductOffer } from '../types';
import { Plus } from 'lucide-react';

interface ProductCardProps {
  product: ProductOffer;
  onAdd: (product: ProductOffer) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAdd }) => {
  // Gera uma cor baseada na categoria para o placeholder
  const getCategoryColor = (cat: string) => {
    const colors: Record<string, string> = {
      'Mercearia': 'bg-amber-100 text-amber-600',
      'Limpeza': 'bg-blue-100 text-blue-600',
      'Hortifruti': 'bg-green-100 text-green-600',
      'Carnes': 'bg-red-100 text-red-600',
      'Laticínios': 'bg-sky-100 text-sky-600',
    };
    return colors[cat] || 'bg-gray-100 text-gray-400';
  };

  const colorClass = getCategoryColor(product.category);

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden flex flex-col h-full border border-gray-100">
      <div className={`relative h-32 flex items-center justify-center font-bold text-xs uppercase tracking-tighter ${colorClass}`}>
        <span className="px-4 text-center">{product.category}</span>
        {product.isPromo && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-sm">
            OFERTA
          </div>
        )}
        <div className={`absolute bottom-2 left-2 text-[9px] font-bold px-2 py-0.5 rounded-full text-white bg-opacity-90 ${product.storeColor}`}>
           {product.storeName}
        </div>
      </div>
      
      <div className="p-3 flex flex-col flex-grow">
        <div className="flex-grow">
            <h3 className="font-semibold text-gray-800 text-sm line-clamp-2 leading-tight mb-1">{product.name}</h3>
            <p className="text-[10px] text-gray-400 mb-2">{product.unit}</p>
        </div>
        
        <div className="flex items-end justify-between mt-2">
          <div>
            <span className="text-[10px] text-gray-400 font-medium block">Preço</span>
            <span className="text-lg font-bold text-emerald-600">
              R$ {product.price.toFixed(2).replace('.', ',')}
            </span>
          </div>
          <button 
            onClick={() => onAdd(product)}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-emerald-500 hover:text-white text-emerald-600 flex items-center justify-center transition-colors shadow-sm"
          >
            <Plus size={18} strokeWidth={3} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
