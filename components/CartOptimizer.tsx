
import React, { useMemo } from 'react';
import { CartItem, CartOptimization } from '../types';
import { MOCK_STORES, STORE_PRICING_FACTORS, RAW_PRODUCTS } from '../constants';
import { TrendingDown, MapPin, CheckCircle2, AlertCircle } from 'lucide-react';

interface CartOptimizerProps {
  cart: CartItem[];
}

// Fixed missing closing tags and added default export for CartOptimizer
const CartOptimizer: React.FC<CartOptimizerProps> = ({ cart }) => {
  
  const optimizedData: CartOptimization[] = useMemo(() => {
    if (cart.length === 0) return [];

    return MOCK_STORES.map(store => {
      let total = 0;
      let foundCount = 0;
      const storeItems: CartItem[] = [];

      const targetStoreFactor = STORE_PRICING_FACTORS[store.id] || 1.0;

      cart.forEach(item => {
        // Tenta encontrar o mesmo produto (pelo nome) neste supermercado específico no banco de dados
        const dbProduct = RAW_PRODUCTS.find(p => 
          p.produto === item.name && 
          p.supermercado === store.name
        );

        let finalPrice: number;

        if (dbProduct) {
          // Se encontrou no banco, usa o preço real (promocional ou normal)
          finalPrice = dbProduct.promocao ? (dbProduct.preco_promocional || dbProduct.preco_normal) : dbProduct.preco_normal;
          foundCount++;
        } else {
          // Se não encontrou, faz uma estimativa inteligente baseada no fator do mercado
          const sourceStoreFactor = STORE_PRICING_FACTORS[item.storeId] || 1.0;
          const estimatedBasePrice = item.price / sourceStoreFactor;
          finalPrice = estimatedBasePrice * targetStoreFactor;
        }

        total += finalPrice * item.quantity;
        storeItems.push({ 
          ...item, 
          price: finalPrice, 
          storeName: store.name, 
          storeId: store.id 
        });
      });

      return {
        storeId: store.id,
        storeName: store.name,
        totalPrice: total,
        missingItems: cart.length - foundCount,
        items: storeItems
      };
    }).sort((a, b) => a.totalPrice - b.totalPrice);
  }, [cart]);

  if (cart.length === 0) return null;

  const bestOption = optimizedData[0];
  const worstOption = optimizedData[optimizedData.length - 1];
  const totalCartItems = cart.length;

  return (
    <div style={{ display: 'grid', gap: '24px', marginTop: '10px' }}>
      {/* Top Banner: Melhor Opção de Compra */}
      <div style={{
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        borderRadius: '28px',
        padding: '30px',
        color: 'white',
        boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.4)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Ícone Decorativo de Fundo */}
        <TrendingDown size={140} style={{ position: 'absolute', right: '-20px', bottom: '-20px', opacity: 0.15, transform: 'rotate(-10deg)' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', fontSize: '0.9rem', fontWeight: 700, opacity: 0.9 }}>
          <TrendingDown size={18} /> MELHOR OPÇÃO DE COMPRA
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <p style={{ fontSize: '0.85rem', marginBottom: '4px', opacity: 0.85 }}>Comprando tudo no:</p>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>{bestOption.storeName}</h2>
            
            <div style={{ 
              marginTop: '16px', 
              fontSize: '0.8rem', 
              background: 'rgba(0,0,0,0.1)', 
              padding: '6px 14px', 
              borderRadius: '100px', 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '6px',
              fontWeight: 600
            }}>
              <CheckCircle2 size={14} /> {totalCartItems - bestOption.missingItems} de {totalCartItems} itens confirmados no banco
            </div>
          </div>
          
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '0.85rem', marginBottom: '4px', opacity: 0.85 }}>Total Estimado</p>
            <p style={{ fontSize: '2.8rem', fontWeight: 900, margin: 0 }}>R$ {bestOption.totalPrice.toFixed(2).replace('.', ',')}</p>
            <p style={{ fontSize: '0.85rem', marginTop: '8px', fontWeight: 600, color: '#fef3c7' }}>
              Economia de R$ {(worstOption.totalPrice - bestOption.totalPrice).toFixed(2).replace('.', ',')} comparado ao mais caro.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom List: Comparativo por Mercado */}
      <div>
        <h4 style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '1.2rem', marginBottom: '16px', paddingLeft: '4px' }}>Comparativo por Mercado</h4>
        
        <div style={{ display: 'grid', gap: '14px' }}>
          {optimizedData.map((opt, idx) => {
            const storeInfo = MOCK_STORES.find(s => s.id === opt.storeId);
            const isBest = idx === 0;

            return (
              <div key={opt.storeId} style={{ 
                background: isBest ? 'var(--primary-light)' : 'var(--card-bg)', 
                borderRadius: '20px', 
                padding: '20px', 
                border: isBest ? '2px solid var(--primary)' : '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: isBest ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                position: 'relative'
              }}>
                {isBest && (
                  <span style={{
                    position: 'absolute',
                    top: '-10px',
                    left: '24px',
                    background: 'var(--primary)',
                    color: 'white',
                    fontSize: '0.6rem',
                    fontWeight: 900,
                    padding: '3px 10px',
                    borderRadius: '6px',
                    textTransform: 'uppercase'
                  }}>MAIS BARATO</span>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '14px',
                    background: 'var(--bg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    border: '1px solid var(--border)'
                  }}>
                    {storeInfo?.logo}
                  </div>
                  <div>
                    <h5 style={{ fontWeight: 800, fontSize: '1.05rem', margin: 0 }}>{opt.storeName}</h5>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        <MapPin size={12} /> {storeInfo?.distance}
                      </span>
                      <span style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '4px', 
                        fontSize: '0.75rem', 
                        color: opt.missingItems === 0 ? 'var(--primary)' : 'var(--text-muted)',
                        fontWeight: opt.missingItems === 0 ? 700 : 500
                      }}>
                        {opt.missingItems === 0 ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                        {totalCartItems - opt.missingItems}/{totalCartItems} no banco
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 800, fontSize: '1.3rem', color: isBest ? 'var(--primary)' : 'var(--text-main)' }}>
                    R$ {opt.totalPrice.toFixed(2).replace('.', ',')}
                  </div>
                  {!isBest && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--danger)', fontWeight: 600, marginTop: '2px' }}>
                      + R$ {(opt.totalPrice - bestOption.totalPrice).toFixed(2).replace('.', ',')}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CartOptimizer;
