import { GoogleGenAI, Type } from "@google/genai";
import { Meal, MealType, Category } from "../types";
import { FALLBACK_MEALS } from "./fallbackData";

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
    // Try different possible environment variable names
    const apiKey = process.env.GEMINI_API_KEY || 
                   process.env.GOOGLE_API_KEY || 
                   process.env.VITE_GEMINI_API_KEY;

    const isPlaceholder = !apiKey || 
                         apiKey === "TODO" || 
                         apiKey === "MY_GEMINI_API_KEY" || 
                         apiKey === "YOUR_API_KEY_HERE" ||
                         apiKey.length < 10;

    if (isPlaceholder) {
      console.error("❌ GEMINI_API_KEY is missing, too short, or a placeholder.");
      console.error(`Current value: "${apiKey}"`);
      throw new Error("GEMINI_API_KEY_MISSING");
    }

    // Clean key: remove whitespace and quotes
    const cleanKey = apiKey.trim().replace(/^["']|["']$/g, '');
    
    // Debug log (masked for security)
    const maskedKey = `${cleanKey.substring(0, 4)}...${cleanKey.substring(cleanKey.length - 4)}`;
    console.log(`🤖 Initializing Gemini with key: ${maskedKey} (Length: ${cleanKey.length})`);
    
    // Final check for valid characters (Gemini keys are usually base64/alphanumeric)
    if (!/^[A-Za-z0-9_-]+$/.test(cleanKey)) {
      console.error("❌ GEMINI_API_KEY contains invalid characters.");
      throw new Error("INVALID_API_KEY_FORMAT");
    }

    aiInstance = new GoogleGenAI({ apiKey: cleanKey });
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
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mealType, category, subFilters, count }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to fetch from server");
    }
    
    return await response.json();
  }

  // Server-side logic (SDK)
  return generateMealsBackend(mealType, category, subFilters, count);
}

const KITCHEN_KNOWLEDGE = `
EGYPTIAN KITCHEN MASTER DATA:
- rice (أرز): Koshary, Roz bi-Shareya, Fattah, Stuffed vegetables (Mahshi), Sayadeya Rice, Roz Muammar.
- bread (عيش): Ful, Ta'ameya, Hawawshi, Fattah (toasted), Shawarma Baladi, Molokhia (with 'dipping').
- pasta (مكرونة): Koshary, Bechamel Pasta, Negresco, Mucarona Mabshora.
- chicken (فراخ): Roasted Chicken, Pané, Mesahab, Chicken Tagine with potatoes.
- meat (لحمة): Fattah, Kebab Halla, Kofta, Okra with meat, Bamya.
- fish (سمك): Fried/Grilled Tilapia (Bolti), Sayadeya (Fish + Rice), Singari, Seafood soup.
- vegetables (خضار): Okra (Bamya), Molokhia, Peas (Besela), Turlu, Moussaka.
- soup (شوربة): Orzo (Lisan Asfour), Lentil (Ads), Veggie soup.
- protein (بروتين): Meat, Chicken, Fish, Eggs, Ful.
- legumes (بقوليات): Ful Medames, Koshary (Lentils), Ads soup, Falafel.
- pastries (معجنات): Crepes, Egyptian Pizza, Fatair Meshaltet, Goulash.
- potatoes (بطاطس): Tagine with meat/chicken, French fries, Mashed (Buree).
- eggs (بيض): Shakshuka, Boiled, Fried with Pastirma.

COMBINATION LOGIC:
- rice + fish = Sayadeya (سمك صيادية مع أرز).
- rice + meat = Fattah (فتة) or Kebab Halla with rice.
- rice + vegetables = Rice with Shareya + Veggie Tagine (مثل البسلة أو البامية).
- bread + meat = Hawawshi (حواوشي) or Kebab/Kofta.
- pasta + meat = Bechamel Pasta (مكرونة بالبشاميل).
- legumes + bread = Ful and Falafel (فطار مصري أصيل).

STRICT RULE: If AND logic is applied (e.g. rice and fish), the result MUST contain both or be a meal where both are the stars.
`;

async function generateMealsBackend(
  mealType: MealType,
  category: Category,
  subFilters: string[],
  count: number
): Promise<Meal[]> {
  // Ordered from newest/most powerful to most stable fallback
  const models = [
    "gemini-2.0-flash",
    "gemini-1.5-flash", 
    "gemini-1.5-flash-8b",
    "gemini-flash-latest"
  ];
  let lastError: any = null;

  try {
    const ai = getAi();
  } catch (keyErr: any) {
    console.warn("Using fallback data because:", keyErr.message);
    return FALLBACK_MEALS.filter(m => m.category === category || category === 'normal');
  }

  for (let i = 0; i < models.length; i++) {
    const modelName = models[i];
    try {
      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000 * i));
      }

      const ai = getAi();
      const subFiltersText = subFilters.length > 0 ? subFilters.join(", ") : "Any";
      
      const prompt = `${KITCHEN_KNOWLEDGE}

Generate exactly ${count} Egyptian recipes for ${mealType} in the ${category} category.
User mandatory preferences: ${subFiltersText}.

CRITICAL REQUIREMENTS:
1. Return ONLY a JSON array.
2. Every recipe MUST respect the user preferences: ${subFiltersText}. If "rice and fish" are selected, return only rice and fish combinations.
3. Recipes must be authentic Egyptian.
4. Very detailed method & ingredients in both English and Arabic.
5. If lunch + rice/pasta: include Koshary.
6. If lunch + pastries: focus on Crepes/Pizza/Fatair.
7. If breakfast/dinner + pastries: focus on Egyptian breads.

Category Definitions:
- economic: low cost.
- normal: standard home.
- medium: balanced/varied.
- healthy: low fat/high veg.`;

      console.log(`[Attempt ${i + 1}] Model: ${modelName} | Preferences: ${subFiltersText}`);
      
      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: mealSchema,
          systemInstruction: `You are an expert Egyptian Master Chef. 
You follow the EGYPTIAN KITCHEN MASTER DATA and COMBINATION LOGIC principles strictly.
Your primary mission is to provide recipes that PERFECTLY match the user's requested ingredients (sub-filters).
If a user selects specific ingredients, do not suggest meals that ignore them.
Provide authentic, high-quality Egyptian recipes in both English and Arabic.
Return ONLY the JSON array.`,
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
      const errorStr = JSON.stringify(error).toLowerCase();
      
      // Handle the specific "Invalid API Key" error to give clear feedback
      if (errorStr.includes("api_key_invalid") || errorStr.includes("api key not valid")) {
        console.error("❌ CRITICAL ERROR: YOUR GEMINI API KEY IS INVALID.");
        console.error("Please verify the key in your Vercel/Environment settings.");
        throw new Error("INVALID_GEMINI_API_KEY");
      }

      console.warn(`Attempt with ${modelName} failed:`, error?.message || error);
      
      // If it's a 429 or 500/503/RPC error, we try the next model
      // Error code 6 or UNKNOWN status usually indicates a transient RPC issue
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
  
  // Final safety net: Return at least some data so the user isn't stuck
  return FALLBACK_MEALS.filter(m => m.category === category || category === 'normal');
}
