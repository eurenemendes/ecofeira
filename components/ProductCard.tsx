import React from 'react';
import { ProductOffer } from '../types';
import { Plus, ShoppingCart } from 'lucide-react';

interface ProductCardProps {
  product: ProductOffer;
  onAdd: (product: ProductOffer) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAdd }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden flex flex-col h-full border border-gray-100">
      <div className="relative h-40 overflow-hidden bg-gray-50 group">
        <img 
          src={product.imageUrl} 
          alt={product.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {product.isPromo && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg shadow-sm">
            OFERTA
          </div>
        )}
        <div className={`absolute bottom-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full text-white bg-opacity-90 ${product.storeColor.replace('bg-', 'bg-')}`}>
           {product.storeName}
        </div>
      </div>
      
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex-grow">
            <h3 className="font-semibold text-gray-800 line-clamp-2 leading-tight mb-1">{product.name}</h3>
            <p className="text-xs text-gray-400 mb-3">{product.unit}</p>
        </div>
        
        <div className="flex items-end justify-between mt-2">
          <div>
            <span className="text-xs text-gray-400 font-medium block">Preço</span>
            <span className="text-xl font-bold text-emerald-600">
              R$ {product.price.toFixed(2).replace('.', ',')}
            </span>
          </div>
          <button 
            onClick={() => onAdd(product)}
            className="w-10 h-10 rounded-full bg-gray-100 hover:bg-emerald-500 hover:text-white text-emerald-600 flex items-center justify-center transition-colors shadow-sm"
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