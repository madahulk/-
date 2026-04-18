import { GoogleGenAI, Type } from "@google/genai";
import { Meal, MealType, Category } from "../types";

const mealSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      id: { type: Type.STRING },
      nameEn: { type: Type.STRING },
      nameAr: { type: Type.STRING },
      cookingTime: { type: Type.NUMBER },
      prepTime: { type: Type.NUMBER },
      serves: { type: Type.NUMBER },
      ingredientsEn: { type: Type.ARRAY, items: { type: Type.STRING } },
      ingredientsAr: { type: Type.ARRAY, items: { type: Type.STRING } },
      methodEn: { type: Type.ARRAY, items: { type: Type.STRING } },
      methodAr: { type: Type.ARRAY, items: { type: Type.STRING } },
      category: { type: Type.STRING },
      tags: { type: Type.ARRAY, items: { type: Type.STRING } },
    },
    required: ["id", "nameEn", "nameAr", "cookingTime", "prepTime", "serves", "ingredientsEn", "ingredientsAr", "methodEn", "methodAr", "category", "tags"],
  },
};

let aiInstance: GoogleGenAI | null = null;

function getAi() {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "TODO") {
      throw new Error("GEMINI_API_KEY_MISSING");
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}

export async function generateMeals(
  mealType: MealType,
  category: Category,
  subFilters: string[],
  count: number = 20
): Promise<Meal[]> {
  // If running in browser, call the API endpoint
  if (typeof window !== "undefined") {
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mealType, category, subFilters, count }),
      });
      if (!response.ok) throw new Error("Failed to fetch from server");
      return await response.json();
    } catch (error) {
      console.error("Client fetch error:", error);
      return [];
    }
  }

  // Server-side logic (SDK)
  return generateMealsBackend(mealType, category, subFilters, count);
}

async function generateMealsBackend(
  mealType: MealType,
  category: Category,
  subFilters: string[],
  count: number
): Promise<Meal[]> {
  // Use recommended models from the Gemini API skill
  const models = [
    "gemini-3-flash-preview", 
    "gemini-3.1-flash-lite-preview",
    "gemini-2.0-flash", 
    "gemini-flash-latest"
  ];
  let lastError: any = null;

  for (let i = 0; i < models.length; i++) {
    const modelName = models[i];
    try {
      // Add a small delay between retries if this isn't the first attempt
      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000 * i));
      }

      const ai = getAi();
      const subFiltersText = subFilters.length > 0 ? subFilters.join(", ") : "Any";
      
      const prompt = `Generate exactly ${count} Egyptian recipes for ${mealType} (${category}).
Preferences: ${subFiltersText}.

CRITICAL:
1. Return ONLY a JSON array.
2. Must be authentic Egyptian.
3. Very detailed method & ingredients.
4. If lunch + rice/pasta: MUST include Koshary.
5. If lunch + pastries: Focus on Crepes/Pizza.
6. If breakfast/dinner + pastries: Focus on Baladi/Fino/Shami bread.

Category definitions:
- economic: cheap.
- normal: standard home.
- medium: balanced portions.
- healthy: diet focus.`;

      console.log(`Attempt ${i + 1}: Generating with ${modelName}...`);
      
      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: mealSchema,
          systemInstruction: "You are an expert Egyptian chef. Provide authentic recipes in English and Arabic. Return ONLY the JSON array.",
        },
      });

      const text = response.text;
      
      if (!text || text.trim() === "" || text === "[]") {
        console.warn(`Model ${modelName} returned empty response`);
        continue;
      }

      try {
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed) && parsed.length > 0) {
          console.log(`Successfully generated ${parsed.length} meals with ${modelName}`);
          return parsed as Meal[];
        }
      } catch (parseError) {
        console.error(`JSON Parse Error with ${modelName}`);
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          try {
            const parsed = JSON.parse(jsonMatch[0]);
            if (Array.isArray(parsed) && parsed.length > 0) {
              return parsed as Meal[];
            }
          } catch (e) {}
        }
      }
    } catch (error: any) {
      lastError = error;
      console.warn(`Attempt with ${modelName} failed:`, error?.message || error);
      
      // If it's a 429 or 500/503/RPC error, we try the next model
      // Error code 6 or UNKNOWN status usually indicates a transient RPC issue
      const errorStr = JSON.stringify(error).toLowerCase();
      if (
        errorStr.includes("429") || 
        errorStr.includes("500") || 
        errorStr.includes("rpc") ||
        errorStr.includes("demand") ||
        errorStr.includes("unavailable")
      ) {
        continue;
      }
      
      // For fatal errors (like 401/403 with wrong key), stop
      break;
    }
  }

  if (lastError) {
    console.error("Meal generation failed after all available models:", lastError);
  }
  return [];
}
