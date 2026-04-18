export type Language = 'en' | 'ar';

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'dessert';
export type Category = 'economic' | 'normal' | 'medium' | 'healthy' | 'hot' | 'cold';

export interface Meal {
  id: string;
  nameEn: string;
  nameAr: string;
  cookingTime: number;
  prepTime: number;
  serves: number;
  ingredientsEn: string[];
  ingredientsAr: string[];
  methodEn: string[];
  methodAr: string[];
  category: Category;
  tags: string[];
}

export interface AppState {
  screen: 'home' | 'selection' | 'results' | 'details';
  language: Language;
  mealType: MealType | null;
  category: Category | null;
  selectedSubFilters: string[];
  meals: Meal[];
  currentMealIndex: number;
  selectedMeal: Meal | null;
  error: string | null;
}
