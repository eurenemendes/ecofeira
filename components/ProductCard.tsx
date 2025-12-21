import React from 'react';
import { ProductOffer } from '../types';
import { Plus, ShoppingBasket, Tag, TrendingDown } from 'lucide-react';

interface ProductCardProps {
  product: ProductOffer;
  onAdd: (product: ProductOffer) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAdd }) => {
  const savings = product.originalPrice - product.price;
  const discountPercent = Math.round((savings / product.originalPrice) * 100);

  return (
    <div className="card" style={{ position: 'relative' }}>
      {product.isPromo && (
        <div style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          background: 'var(--danger)',
          color: 'white',
          padding: '4px 10px',
          borderRadius: '8px',
          fontSize: '0.65rem',
          fontWeight: 800,
          zIndex: 2,
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <Tag size={10} /> {discountPercent}% OFF
        </div>
      )}

      <div style={{
        background: 'var(--bg)',
        height: '140px',
        borderRadius: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '16px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <ShoppingBasket size={48} style={{opacity: 0.1, color: 'var(--primary)'}} />
        <span style={{
          position: 'absolute',
          bottom: '10px',
          right: '10px',
          background: 'var(--card-bg)',
          color: 'var(--text-main)',
          padding: '4px 10px',
          borderRadius: '8px',
          fontSize: '0.7rem',
          fontWeight: 800,
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          {product.storeName}
        </span>
      </div>
      
      <div style={{ padding: '0 4px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h4 style={{fontWeight: 700, fontSize: '0.95rem', marginBottom: '4px', lineHeight: 1.3}}>{product.name}</h4>
        <div className="flex gap-2 items-center" style={{marginBottom: '12px'}}>
           <span style={{fontSize: '0.65rem', background: 'var(--primary-light)', color: 'var(--primary)', padding: '2px 6px', borderRadius: '4px', fontWeight: 700, textTransform: 'uppercase'}}>{product.category}</span>
        </div>
        
        <div style={{ marginTop: 'auto' }}>
          {product.isPromo && (
            <div style={{ marginBottom: '4px' }}>
              <div className="flex items-center gap-1" style={{ color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 700 }}>
                <TrendingDown size={12} /> Economia de R$ {savings.toFixed(2).replace('.', ',')}
              </div>
              <span style={{fontSize: '0.8rem', textDecoration: 'line-through', color: 'var(--text-muted)', opacity: 0.7}}>
                De R$ {product.originalPrice.toFixed(2).replace('.', ',')}
              </span>
            </div>
          )}
          
          <div className="flex justify-between items-center">
            <div>
              <span style={{fontSize: '1.3rem', fontWeight: 800, color: product.isPromo ? 'var(--danger)' : 'var(--text-main)'}}>
                R$ {product.price.toFixed(2).replace('.', ',')}
              </span>
            </div>
            <button 
              className="btn btn-primary" 
              style={{padding: '8px 12px', borderRadius: '12px'}} 
              onClick={() => onAdd(product)}
            >
              <Plus size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;