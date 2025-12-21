import React from 'react';
import { ProductOffer } from '../types';
import { Plus, ShoppingBasket } from 'lucide-react';

interface ProductCardProps {
  product: ProductOffer;
  onAdd: (product: ProductOffer) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAdd }) => {
  return (
    <div className="card">
      <div style={{
        background: 'var(--bg)',
        height: '160px',
        borderRadius: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '16px',
        position: 'relative'
      }}>
        <ShoppingBasket size={48} style={{opacity: 0.1, color: 'var(--primary)'}} />
        <span style={{
          position: 'absolute',
          bottom: '10px',
          right: '10px',
          background: 'white',
          padding: '4px 8px',
          borderRadius: '6px',
          fontSize: '0.7rem',
          fontWeight: 800,
          border: '1px solid var(--border)'
        }}>
          {product.storeName}
        </span>
      </div>
      
      <h4 style={{fontWeight: 700, fontSize: '0.95rem', marginBottom: '4px'}}>{product.name}</h4>
      <p style={{fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '16px'}}>{product.unit}</p>
      
      <div className="flex justify-between items-center" style={{marginTop: 'auto'}}>
        <div>
          <span style={{fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block'}}>PREÇO</span>
          <span style={{fontSize: '1.2rem', fontWeight: 800}}>R$ {product.price.toFixed(2).replace('.', ',')}</span>
        </div>
        <button className="btn btn-primary" style={{padding: '10px', borderRadius: '12px'}} onClick={() => onAdd(product)}>
          <Plus size={18} />
        </button>
      </div>
    </div>
  );
};

export default ProductCard;