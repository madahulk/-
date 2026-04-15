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
  count: number = 20 // Restored to 20
): Promise<Meal[]> {
  try {
    const ai = getAi();
    const subFiltersText = subFilters.length > 0 ? subFilters.join(", ") : "Any";
    const prompt = `Generate exactly ${count} real Egyptian meal recommendations for ${mealType} in the ${category} category. 
    The user selected these preferences: ${subFiltersText}.
    
    CRITICAL INSTRUCTIONS:
    - You MUST return a JSON array of objects.
    - Do NOT return an empty array.
    - Each recipe must be authentic Egyptian cuisine.
    - Be EXTREMELY detailed in the cooking method and ingredients.
    - For method: Include specific steps like "bring a tray, put broth and pepper", "soak rice for 5 mins in hot water then 2 mins in cold water", "stir every 10 minutes", etc.
    - For ingredients: List every spice, oil, and specific detail needed.
    - If the category is 'hot' dessert: Focus on cakes, tarts, and oven-baked sweets.
    - If the category is 'cold' dessert: Focus on all types of ice cream, flavors, and homemade cold treats.
    - If 'lunch' is selected and subfilters include 'rice' (أرز) or 'pasta' (مكرونة) or both: You MUST include "Egyptian Koshary" (كشري مصري) as one of the primary recommendations with its full detailed recipe.
    - If 'lunch' is selected and 'pastries' (معجنات) is selected: Focus on Crepes (كريب), Pizza (بيتزا), and various Pies/Fatair (فطاير).
    - If 'breakfast' or 'dinner' is selected and 'pastries' (معجنات) is selected: Ensure you include various types of bread such as Baladi Bread (عيش بلدي), Fino Bread (عيش فينو), and Shami Bread (عيش شامي) as individual meal recommendations.
    
    Ensure the meals are authentic, with correct ingredients and spices.
    Avoid repetition and ensure variety.
    Return the data in the specified JSON format.
    Category rules:
    - economic: affordable, simple ingredients.
    - normal: standard Egyptian home cooking.
    - medium: balanced portions, slightly lighter.
    - healthy: diet-friendly, focus on vegetables and lean protein.`;

    console.log("Generating meals with prompt:", prompt);
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: mealSchema,
        systemInstruction: "You are an expert Egyptian chef. You provide authentic recipes and meal ideas in both English and Arabic. Return ONLY the JSON array.",
      },
    });

    const text = response.text;
    console.log("Gemini Response Text:", text);
    
    if (!text || text.trim() === "" || text === "[]") {
      console.warn("Gemini returned empty response");
      return [];
    }

    try {
      const parsed = JSON.parse(text);
      return Array.isArray(parsed) ? (parsed as Meal[]) : [];
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError, "Text:", text);
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[0]) as Meal[];
        } catch (e) {
          return [];
        }
      }
      return [];
    }
  } catch (error: any) {
    if (error.message === "GEMINI_API_KEY_MISSING") {
      console.error("CRITICAL: GEMINI_API_KEY is missing in the environment.");
    } else {
      console.error("Error generating meals:", error);
    }
    return [];
  }
}
