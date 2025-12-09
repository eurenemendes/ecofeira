import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ProductBase, ProductOffer } from "../types";
import { MOCK_STORES } from "../constants";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const productSchema: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING, description: "Nome comum do produto (ex: Arroz Branco Tio João)" },
      category: { type: Type.STRING, description: "Categoria do produto (ex: Mercearia, Limpeza)" },
      basePrice: { type: Type.NUMBER, description: "Preço médio estimado em reais (BRL) para este item." },
      unit: { type: Type.STRING, description: "Unidade de medida comum (ex: 5kg, 1L, un)" },
    },
    required: ["name", "category", "basePrice", "unit"],
  },
};

/**
 * Searches for generic products using Gemini, then programmatically generates
 * offers across the mock stores with price variations to simulate a real market.
 */
export const searchProductsWithGemini = async (query: string): Promise<ProductOffer[]> => {
  try {
    const model = "gemini-2.5-flash";
    const prompt = `Gere uma lista de 5 a 8 produtos de supermercado específicos e realistas baseados na busca: "${query}". 
    O contexto é o mercado brasileiro. Seja específico nas marcas e tipos se a busca for vaga. 
    Retorne apenas JSON válido.`;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: productSchema,
        temperature: 0.3, // Low temperature for consistent realistic data
      },
    });

    const productsData = JSON.parse(response.text || "[]") as ProductBase[];

    // Expand generic products into specific store offers
    const offers: ProductOffer[] = [];

    productsData.forEach((product, index) => {
      // Create an offer for each store
      MOCK_STORES.forEach((store) => {
        // Randomize price slightly (-15% to +15%)
        const variance = (Math.random() * 0.3) - 0.15;
        const finalPrice = product.basePrice * (1 + variance);
        const isPromo = variance < -0.10; // If it's more than 10% cheaper, flag as promo

        offers.push({
          id: `offer_${index}_${store.id}`,
          baseProductId: `prod_${index}`,
          name: product.name,
          category: product.category, // Added category to satisfy interface but extended ProductOffer doesn't strictly need it in UI usually, good to have
          storeId: store.id,
          storeName: store.name,
          storeColor: store.color,
          price: parseFloat(finalPrice.toFixed(2)),
          unit: product.unit,
          imageUrl: `https://picsum.photos/seed/${product.name.replace(/\s/g, '')}${store.id}/200/200`,
          isPromo: isPromo
        } as unknown as ProductOffer); // Type assertion for extended props
      });
    });

    return offers;

  } catch (error) {
    console.error("Gemini Search Error:", error);
    return [];
  }
};

/**
 * Uses Gemini to suggest a recipe based on items in the cart (Optional fun feature)
 */
export const suggestRecipe = async (items: string[]): Promise<string> => {
    if (items.length === 0) return "";
    try {
        const prompt = `Eu tenho esses ingredientes: ${items.join(', ')}. Sugira uma receita brasileira simples e curta (máximo 300 caracteres) que eu possa fazer.`;
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });
        return response.text || "";
    } catch (e) {
        return "";
    }
}
