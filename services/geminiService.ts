import { GoogleGenAI, Type } from "@google/genai";
import { ProductOffer } from "../types";
import { MOCK_STORES, STORE_PRICING_FACTORS } from "../constants";

const productSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING },
      category: { type: Type.STRING },
      basePrice: { type: Type.NUMBER },
      unit: { type: Type.STRING },
    },
    required: ["name", "category", "basePrice", "unit"],
  },
};

export const searchProductsWithGemini = async (query: string): Promise<ProductOffer[]> => {
  try {
    // Create instance inside the call to ensure process.env.API_KEY is available
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Gere uma lista de 6 produtos de supermercado para a busca: "${query}". Foco no mercado brasileiro.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: productSchema,
      },
    });

    const productsData = JSON.parse(response.text || "[]");
    const offers: ProductOffer[] = [];

    productsData.forEach((product: any, index: number) => {
      MOCK_STORES.forEach((store) => {
        const storeFactor = STORE_PRICING_FACTORS[store.id] || 1.0;
        const variance = (Math.random() * 0.10) - 0.05;
        const finalPrice = product.basePrice * storeFactor * (1 + variance);

        offers.push({
          id: `off_${index}_${store.id}`,
          baseProductId: `prod_${index}`,
          name: String(product.name),
          category: String(product.category),
          storeId: store.id,
          storeName: store.name,
          storeColor: store.color,
          price: Number(finalPrice.toFixed(2)),
          unit: String(product.unit),
          imageUrl: "",
          isPromo: variance < -0.03,
        });
      });
    });

    return offers;
  } catch (error) {
    console.error("Gemini Error:", error);
    return [];
  }
};

export const suggestRecipe = async (items: string[]): Promise<string> => {
  if (items.length < 2) return "";
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Sugira uma receita rápida e curta usando apenas: ${items.join(", ")}.`,
    });
    return String(response.text || "");
  } catch (e) {
    return "";
  }
};