import { GoogleGenAI, Type } from "@google/genai";
import { ProductOffer } from "../types";
import { MOCK_STORES, RAW_PRODUCTS } from "../constants";

export const searchProductsWithGemini = async (query: string): Promise<ProductOffer[]> => {
  // Initialize inside the function to ensure process.env.API_KEY is available and to follow guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const lowerQuery = query.toLowerCase().trim();
  
  // Use Gemini to intelligently match products or categories from the local database
  let matchedIds: number[] = [];
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Identify which products from this list match the user's query: "${query}". 
      If searching for "promoções", return products with active promotions.
      Product List:
      ${RAW_PRODUCTS.map(p => `ID: ${p.id}, Name: ${p.produto}, Category: ${p.categoria}`).join('\n')}
      
      Return a JSON array of integers containing only the IDs of the matching products.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.INTEGER }
        }
      }
    });

    const jsonText = response.text;
    if (jsonText) {
      matchedIds = JSON.parse(jsonText);
    }
  } catch (error) {
    console.error("Gemini search error, falling back to local filter:", error);
    // Fallback to simple filtering
    matchedIds = RAW_PRODUCTS
      .filter(p => 
        p.produto.toLowerCase().includes(lowerQuery) || 
        p.categoria.toLowerCase().includes(lowerQuery) ||
        (lowerQuery === "promoções" && p.promocao)
      )
      .map(p => p.id);
  }

  const filtered = RAW_PRODUCTS.filter(p => matchedIds.includes(p.id));

  return filtered.map(p => {
    const store = MOCK_STORES.find(s => s.name === p.supermercado) || MOCK_STORES[0];
    
    return {
      id: `prod_${p.id}`,
      baseProductId: String(p.id),
      name: p.produto,
      category: p.categoria,
      storeId: store.id,
      storeName: store.name,
      storeColor: store.color,
      price: p.promocao ? (p.preco_promocional || p.preco_normal) : p.preco_normal,
      originalPrice: p.preco_normal,
      unit: p.produto.split(' ').slice(-1)[0],
      imageUrl: "",
      isPromo: p.promocao
    };
  });
};

export const suggestRecipe = async (items: string[]): Promise<string> => {
  if (items.length === 0) return "Combine seus itens para uma refeição deliciosa!";

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Sugira uma receita simples usando alguns destes ingredientes: ${items.join(', ')}. Responda de forma curta em Português.`,
    });
    return response.text || "Combine seus itens para uma refeição deliciosa!";
  } catch (err) {
    return "Combine seus itens para uma refeição deliciosa e econômica!";
  }
};