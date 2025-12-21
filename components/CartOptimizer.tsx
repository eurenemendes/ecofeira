import React, { useMemo } from 'react';
import { CartItem, CartOptimization } from '../types';
import { MOCK_STORES, STORE_PRICING_FACTORS, RAW_PRODUCTS } from '../constants';
import { TrendingDown, MapPin, CheckCircle2, AlertCircle } from 'lucide-react';

interface CartOptimizerProps {
  cart: CartItem[];
}

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
        missingItems: cart.length - foundCount, // Itens que não possuem preço real neste mercado
        items: storeItems
      };
    }).sort((a, b) => a.totalPrice - b.totalPrice);
  }, [cart]);

  if (cart.length === 0) return null;

  const bestOption = optimizedData[0];
  const worstOption = optimizedData[optimizedData.length - 1];
  const totalCartItems = cart.length;

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      {/* Card de Destaque - Melhor Opção */}
      <div style={{
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        borderRadius: '24px',
        padding: '24px',
        color: 'white',
        boxShadow: 'var(--shadow-lg)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decoração de fundo */}
        <div style={{ position: 'absolute', right: '-20px', top: '-20px', opacity: 0.1 }}>
          <TrendingDown size={150} />
        </div>

        <div className="flex items-center gap-2" style={{ marginBottom: '12px', opacity: 0.9 }}>
          <TrendingDown size={22} />
          <h3 style={{ fontWeight: 700, fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Melhor Opção de Compra
          </h3>
        </div>
        
        <div className="flex justify-between items-end">
          <div>
            <p style={{ fontSize: '0.85rem', fontWeight: 500, opacity: 0.8, marginBottom: '4px' }}>Economize comprando no:</p>
            <div style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1 }}>
               {bestOption.storeName}
            </div>
            <div className="flex items-center gap-1" style={{ marginTop: '12px', fontSize: '0.8rem', background: 'rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: '20px', width: 'fit-content' }}>
                <CheckCircle2 size={14} /> 
                {totalCartItems - bestOption.missingItems} de {totalCartItems} itens confirmados no banco
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '0.85rem', opacity: 0.8 }}>Total Estimado</p>
            <p style={{ fontSize: '2.2rem', fontWeight: 800 }}>R$ {bestOption.totalPrice.toFixed(2).replace('.', ',')}</p>
          </div>
        </div>
        
        {optimizedData.length > 1 && (
             <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.2)', fontSize: '0.9rem' }}>
                Você economiza <span style={{ fontWeight: 800, color: '#fcd34d' }}>R$ {(worstOption.totalPrice - bestOption.totalPrice).toFixed(2).replace('.', ',')}</span> nesta escolha!
             </div>
        )}
      </div>

      {/* Lista Comparativa */}
      <div style={{ display: 'grid', gap: '12px' }}>
        <h4 style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '1.1rem', marginLeft: '4px', marginBottom: '4px' }}>Comparativo por Mercado</h4>
        
        {optimizedData.map((opt, idx) => (
          <div key={opt.storeId} style={{ 
            position: 'relative', 
            padding: '18px', 
            borderRadius: '20px', 
            border: idx === 0 ? '2px solid var(--primary)' : '1px solid var(--border)',
            background: idx === 0 ? 'var(--primary-light)' : 'var(--card-bg)',
            boxShadow: idx === 0 ? 'var(--shadow-md)' : 'var(--shadow-sm)',
            transition: 'transform 0.2s'
          }}>
            {idx === 0 && (
                <div style={{
                  position: 'absolute',
                  top: '-10px',
                  left: '20px',
                  background: 'var(--primary)',
                  color: 'white',
                  fontSize: '0.65rem',
                  padding: '4px 12px',
                  borderRadius: '8px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  boxShadow: '0 2px 4px rgba(16, 185, 129, 0.3)'
                }}>
                    Mais Econômico
                </div>
            )}

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.4rem',
                      background: 'var(--bg)',
                      border: '1px solid var(--border)'
                    }}>
                        {MOCK_STORES.find(s => s.id === opt.storeId)?.logo}
                    </div>
                    <div>
                        <h5 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-main)' }}>{opt.storeName}</h5>
                        <div className="flex items-center gap-3" style={{ marginTop: '4px' }}>
                            <div className="flex items-center gap-1" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                <MapPin size={12} />
                                {MOCK_STORES.find(s => s.id === opt.storeId)?.distance}
                            </div>
                            <div className="flex items-center gap-1" style={{ 
                                fontSize: '0.75rem', 
                                color: opt.missingItems === 0 ? 'var(--primary)' : 'var(--text-muted)',
                                fontWeight: opt.missingItems === 0 ? 700 : 500
                            }}>
                                {opt.missingItems === 0 ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                                {totalCartItems - opt.missingItems}/{totalCartItems} no banco
                            </div>
                        </div>
                    </div>
                </div>
                
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, fontSize: '1.2rem', color: idx === 0 ? 'var(--primary)' : 'var(--text-main)' }}>
                        R$ {opt.totalPrice.toFixed(2).replace('.', ',')}
                    </div>
                    {idx !== 0 && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--danger)', fontWeight: 700, marginTop: '2px' }}>
                            + R$ {(opt.totalPrice - bestOption.totalPrice).toFixed(2).replace('.', ',')}
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