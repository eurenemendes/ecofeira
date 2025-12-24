
import { ProductOffer } from "../types";
import { MOCK_STORES, RAW_PRODUCTS } from "../constants";

export const searchProductsWithGemini = async (query: string): Promise<ProductOffer[]> => {
  // Simula um pequeno delay de rede para manter o feeling do app
  await new Promise(resolve => setTimeout(resolve, 600));

  const lowerQuery = query.toLowerCase();
  
  const filtered = RAW_PRODUCTS.filter(p => 
    p.produto.toLowerCase().includes(lowerQuery) || 
    p.categoria.toLowerCase().includes(lowerQuery) ||
    (lowerQuery === "promoções" && p.promocao)
  );

  return filtered.map(p => {
    const store = MOCK_STORES.find(s => s.name === p.supermercado) || MOCK_STORES[0];
    
    return {
      // CRITICAL: ID must be unique per product-store pair for correct favoriting/cart logic
      id: `prod_${p.id}_${store.id}`,
      baseProductId: String(p.id),
      name: p.produto,
      category: p.categoria,
      storeId: store.id,
      storeName: store.name,
      storeColor: store.color,
      price: p.promocao ? (p.preco_promocional || p.preco_normal) : p.preco_normal,
      originalPrice: p.preco_normal,
      unit: p.produto.split(' ').slice(-1)[0], // Extrai a unidade do final da string
      imageUrl: "",
      isPromo: p.promocao
    };
  });
};

export const suggestRecipe = async (items: string[]): Promise<string> => {
  // Mantemos como fallback, mas o foco agora são os produtos manuais
  return "Combine seus itens para uma refeição deliciosa e econômica!";
};
