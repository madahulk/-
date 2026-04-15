import React, { useState, useEffect, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChefHat, 
  Languages, 
  ArrowRight, 
  ArrowLeft, 
  RotateCcw, 
  Clock, 
  Users, 
  Utensils, 
  Moon, 
  Sun,
  Home,
  Check,
  Loader2
} from 'lucide-react';
import { translations } from './translations';
import { AppState, Language, MealType, Category, Meal } from './types';
import { generateMeals } from './services/geminiService';

const FloatingIcons = memo(() => {
  const icons = ['🍴', '🥄', '🍗', '🥩', '🍕', '🍔', '🥗', '🍲', '🥘', '🍳', '🍎', '🥦', '🥐', '🥨', '🥞'];
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-[0.12] z-0">
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ x: '100%' }}
          animate={{ x: '-100%' }}
          transition={{
            duration: 25 + i * 8,
            repeat: Infinity,
            ease: "linear",
            delay: i * -5
          }}
          className="flex gap-24 text-5xl lg:text-8xl whitespace-nowrap py-10"
          style={{ top: `${i * 12}%` }}
        >
          {[...Array(15)].map((_, j) => (
            <span key={j} className="inline-block rotate-12">{icons[(i + j) % icons.length]}</span>
          ))}
        </motion.div>
      ))}
    </div>
  );
});

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    screen: 'home',
    language: 'ar',
    mealType: null,
    category: null,
    selectedSubFilters: [],
    meals: [],
    currentMealIndex: 0,
    selectedMeal: null,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false); // Starts on Light Mode (Blue)
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const t = translations[state.language];
  const isRtl = state.language === 'ar';

  const toggleLanguage = () => {
    setState(prev => ({ ...prev, language: prev.language === 'en' ? 'ar' : 'en' }));
  };

  const nextScreen = () => {
    if (state.screen === 'home') setState(prev => ({ ...prev, screen: 'selection' }));
  };

  const prevScreen = () => {
    if (state.screen === 'selection') {
      if (state.category) setState(prev => ({ ...prev, category: null, selectedSubFilters: [] }));
      else if (state.mealType) setState(prev => ({ ...prev, mealType: null }));
      else setState(prev => ({ ...prev, screen: 'home' }));
    }
    else if (state.screen === 'results') {
      setState(prev => ({ ...prev, screen: 'selection', meals: [] }));
    }
    else if (state.screen === 'details') {
      setState(prev => ({ ...prev, screen: 'results', selectedMeal: null }));
    }
  };

  const handleGenerate = async (overrideCategory?: Category) => {
    const mealType = state.mealType;
    const category = overrideCategory || state.category;
    if (!mealType || !category) return;
    
    setIsLoading(true);
    const meals = await generateMeals(
      mealType,
      category,
      state.selectedSubFilters
    );
    setState(prev => ({ ...prev, meals, screen: 'results', currentMealIndex: 0 }));
    setIsLoading(false);
  };

  const handleAgain = async () => {
    setIsLoading(true);
    const newMeals = await generateMeals(
      state.mealType,
      state.category || 'normal',
      state.selectedSubFilters
    );
    setState(prev => ({ ...prev, meals: [...prev.meals, ...newMeals], currentMealIndex: prev.meals.length }));
    setIsLoading(false);
  };

  const filteredMeals = useMemo(() => {
    if (!searchQuery) return state.meals;
    return state.meals.filter(meal => 
      meal.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      meal.nameAr.includes(searchQuery)
    );
  }, [state.meals, searchQuery]);

  const subFilterOptions = useMemo(() => {
    if (state.mealType === 'breakfast') {
      if (state.category === 'economic') {
        return [
          { id: 'legumes', label: t.legumes, icon: '🫘' },
          { id: 'dairy', label: t.dairy, icon: '🥛' },
          { id: 'pastries', label: t.pastries, icon: '🥐' },
          { id: 'vegetables', label: t.vegetables, icon: '🥦' },
          { id: 'potatoes', label: t.potatoes, icon: '🥔' },
        ];
      }
      if (state.category === 'normal') {
        return [
          { id: 'pastries', label: t.pastries, icon: '🥐' },
          { id: 'dairy', label: t.dairy, icon: '🥛' },
          { id: 'vegetables', label: t.vegetables, icon: '🥦' },
          { id: 'potatoes', label: t.potatoes, icon: '🥔' },
        ];
      }
      if (state.category === 'medium') {
        return [
          { id: 'legumes', label: t.legumes, icon: '🫘' },
          { id: 'dairy', label: t.dairy, icon: '🥛' },
          { id: 'vegetables', label: t.vegetables, icon: '🥦' },
          { id: 'pastries', label: t.pastries, icon: '🥐' },
        ];
      }
      if (state.category === 'healthy') {
        return [
          { id: 'potatoes', label: t.potatoes, icon: '🥔' },
          { id: 'vegetables', label: t.vegetables, icon: '🥦' },
          { id: 'dairy', label: t.dairy, icon: '🥛' },
        ];
      }
    }

    if (state.mealType === 'lunch') {
      if (state.category === 'economic') {
        return [
          { id: 'rice', label: t.rice, icon: '🍚' },
          { id: 'pasta', label: t.pasta, icon: '🍝' },
          { id: 'soup', label: t.soup, icon: '🍲' },
          { id: 'potatoes', label: t.potatoes, icon: '🥔' },
          { id: 'eggs', label: t.eggs, icon: '🥚' },
        ];
      }
      if (state.category === 'healthy') {
        return [
          { id: 'vegetables', label: t.vegetables, icon: '🥦' },
          { id: 'rice', label: t.rice, icon: '🍚' },
          { id: 'protein', label: t.protein, icon: '🍗' },
          { id: 'potatoes', label: t.potatoes, icon: '🥔' },
          { id: 'eggs', label: t.eggs, icon: '🥚' },
        ];
      }
      return [
        { id: 'chicken', label: t.chicken, icon: '🍗' },
        { id: 'meat', label: t.meat, icon: '🥩' },
        { id: 'vegetables', label: t.vegetables, icon: '🥦' },
        { id: 'rice', label: t.rice, icon: '🍚' },
        { id: 'pasta', label: t.pasta, icon: '🍝' },
        { id: 'fish', label: t.fish, icon: '🐟' },
        { id: 'pastries', label: t.pastries, icon: '🥐' },
      ];
    }

    if (state.mealType === 'dinner') {
      if (state.category === 'normal') {
        return [
          { id: 'dairy', label: t.dairy, icon: '🥛' },
          { id: 'pastries', label: t.pastries, icon: '🥐' },
          { id: 'meat', label: t.meat, icon: '🥩' },
          { id: 'chicken', label: t.chicken, icon: '🍗' },
          { id: 'noodles', label: t.noodles, icon: '🍜' },
          { id: 'fruits', label: t.fruits, icon: '🍎' },
          { id: 'tuna', label: t.tuna, icon: '🐟' },
          { id: 'eggs', label: t.eggs, icon: '🥚' },
          { id: 'potatoes', label: t.potatoes, icon: '🥔' },
        ];
      }
      if (state.category === 'economic') {
        return [
          { id: 'dairy', label: t.dairy, icon: '🥛' },
          { id: 'potatoes', label: t.potatoes, icon: '🥔' },
          { id: 'fruits', label: t.fruits, icon: '🍎' },
          { id: 'noodles', label: t.noodles, icon: '🍜' },
          { id: 'eggs', label: t.eggs, icon: '🥚' },
          { id: 'pastries', label: t.pastries, icon: '🥐' },
        ];
      }
      if (state.category === 'medium') {
        return [
          { id: 'dairy', label: t.dairy, icon: '🥛' },
          { id: 'pastries', label: t.pastries, icon: '🥐' },
          { id: 'meat', label: t.meat, icon: '🥩' },
          { id: 'chicken', label: t.chicken, icon: '🍗' },
          { id: 'noodles', label: t.noodles, icon: '🍜' },
          { id: 'fruits', label: t.fruits, icon: '🍎' },
          { id: 'eggs', label: t.eggs, icon: '🥚' },
          { id: 'potatoes', label: t.potatoes, icon: '🥔' },
        ];
      }
      if (state.category === 'healthy') {
        return [
          { id: 'vegetables', label: t.vegetables, icon: '🥦' },
          { id: 'fruits', label: t.fruits, icon: '🍎' },
          { id: 'dairy', label: t.dairy, icon: '🥛' },
          { id: 'potatoes', label: t.potatoes, icon: '🥔' },
          { id: 'eggs', label: t.eggs, icon: '🥚' },
          { id: 'protein', label: t.protein, icon: '🍗' },
        ];
      }
    }

    return [];
  }, [state.mealType, state.category, t]);

  const toggleSubFilter = (id: string) => {
    setState(prev => ({
      ...prev,
      selectedSubFilters: prev.selectedSubFilters.includes(id)
        ? prev.selectedSubFilters.filter(f => f !== id)
        : [...prev.selectedSubFilters, id]
    }));
  };

  const renderHome = () => (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-10 relative overflow-hidden"
    >
      <div className="relative z-10 flex flex-col items-center space-y-10">
        <div className="absolute -z-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        
        {/* 1. Chef Hat (Fades in first) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ 
            opacity: 1, 
            scale: 1,
            y: [0, -10, 0] 
          }}
          transition={{ 
            opacity: { duration: 0.8, delay: 0 },
            scale: { duration: 0.8, delay: 0 },
            y: { repeat: Infinity, duration: 4, ease: "easeInOut" }
          }}
          className="relative"
        >
          <div className="absolute inset-0 bg-accent/20 blur-2xl rounded-full scale-150" />
          <ChefHat 
            size={80} 
            className="text-home-icon relative z-10 drop-shadow-2xl rotate-[-10deg]" 
          />
        </motion.div>

        {/* 2. Title (Slides in from the right after hat) */}
        <div className="relative">
          <motion.h1
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8, duration: 1, ease: "easeOut" }}
            className={`text-5xl md:text-7xl font-black tracking-tighter gradient-text leading-tight ${isRtl ? 'arabic-font' : ''}`}
          >
            {state.language === 'en' ? 'Eat Today' : 'هناكل أيه النهارده؟'}
          </motion.h1>
          
          <motion.div 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: '40%', opacity: 1 }}
            transition={{ delay: 1.8, duration: 0.8 }}
            className="h-2 bg-accent/20 rounded-full mt-4 mx-auto"
          />
        </div>
        
        {/* 3. Button (Appears last) */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.2, duration: 0.5 }}
          whileHover={{ scale: 1.05, boxShadow: "0 20px 50px rgba(47, 47, 228, 0.4)" }}
          whileTap={{ scale: 0.95 }}
          onClick={nextScreen}
          className={`px-14 py-4 bg-accent hover:opacity-95 text-text-on-accent rounded-3xl text-xl font-black shadow-2xl shadow-accent/30 flex items-center gap-4 transition-all ${isRtl ? 'arabic-font flex-row-reverse' : ''}`}
        >
          {t.start}
          {isRtl ? <ArrowLeft size={28} /> : <ArrowRight size={28} />}
        </motion.button>
      </div>
    </motion.div>
  );

  const renderMealType = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`space-y-1 transition-all duration-500 ${state.mealType ? 'compact-section' : ''}`}
    >
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-[10px] uppercase tracking-[3px] text-text-secondary font-bold">Meal Type | نوع الوجبة</span>
        <div className="h-px flex-1 bg-border" />
      </div>
      <div className="grid grid-cols-4 gap-1.5 justify-items-center">
        {(['breakfast', 'lunch', 'dinner', 'dessert'] as MealType[]).map((type) => (
          <motion.button
            key={type}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -2, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setState(prev => {
              if (prev.mealType === type) {
                return { ...prev, mealType: null, category: null, selectedSubFilters: [] };
              }
              return { ...prev, mealType: type, category: null, selectedSubFilters: [] };
            })}
            className={`pill pill-square border-2 py-1.5 px-2 min-w-0 w-full ${state.mealType === type ? 'pill-active ring-2 ring-accent/5' : 'border-transparent'}`}
          >
            <span className="text-lg mr-1 ml-1">
              {type === 'breakfast' && '🍳'}
              {type === 'lunch' && '🍗'}
              {type === 'dinner' && '🌙'}
              {type === 'dessert' && '🍰'}
            </span>
            <span className={`text-[13px] font-bold tracking-tight ${isRtl ? 'arabic-font' : ''}`}>{t[type]}</span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );

  const renderCategory = () => {
    const categories: Category[] = state.mealType === 'dessert' 
      ? ['hot', 'cold'] 
      : ['economic', 'normal', 'medium', 'healthy'];

    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`space-y-1 pt-1 transition-all duration-500 ${state.category ? 'compact-section' : ''}`}
      >
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-[10px] uppercase tracking-[3px] text-text-secondary font-bold">Category | الفئة</span>
          <div className="h-px flex-1 bg-border" />
        </div>
        <div className={`grid ${state.mealType === 'dessert' ? 'grid-cols-2 max-w-md mx-auto' : 'grid-cols-4'} gap-1.5 justify-items-center`}>
          {categories.map((cat) => (
            <motion.button
              key={cat}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ y: -2, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                if (state.category === cat) {
                  setState(prev => ({ ...prev, category: null, selectedSubFilters: [] }));
                  return;
                }
                setState(prev => ({ ...prev, category: cat, selectedSubFilters: [] }));
                if (state.mealType === 'dessert') {
                  // Direct generate for dessert
                  setTimeout(() => {
                    handleGenerate(cat);
                  }, 100);
                }
              }}
              className={`pill pill-square border-2 py-1.5 px-2 min-w-0 w-full ${state.category === cat ? 'pill-active ring-2 ring-accent/5' : 'border-transparent'}`}
            >
              <span className="text-lg mr-1 ml-1">
                {cat === 'economic' && '💰'}
                {cat === 'normal' && '🏠'}
                {cat === 'medium' && '⚖️'}
                {cat === 'healthy' && '🥗'}
                {cat === 'hot' && '🔥'}
                {cat === 'cold' && '❄️'}
              </span>
              <span className={`text-[13px] font-bold tracking-tight ${isRtl ? 'arabic-font' : ''}`}>{t[cat]}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>
    );
  };

  const renderSubFilters = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`space-y-1 pt-1 transition-all duration-500 ${state.meals.length > 0 ? 'compact-section' : ''}`}
    >
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-[10px] uppercase tracking-[3px] text-text-secondary font-bold">Preferences | التفضيلات</span>
        <div className="h-px flex-1 bg-border" />
      </div>
      <div className="flex flex-wrap gap-1.5 justify-center">
        {subFilterOptions.map((option) => (
          <motion.button
            key={option.id}
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -2, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => toggleSubFilter(option.id)}
            className={`pill pill-square border-2 py-1.5 px-2 min-w-[90px] ${state.selectedSubFilters.includes(option.id) ? 'pill-active ring-2 ring-accent/5' : 'border-transparent'}`}
          >
            <span className="text-lg mr-1 ml-1">{option.icon}</span>
            <span className={`text-[11px] font-bold tracking-tight ${isRtl ? 'arabic-font' : ''}`}>{option.label}</span>
          </motion.button>
        ))}
      </div>

      <div className="flex justify-center pt-2">
        <motion.button
          disabled={state.selectedSubFilters.length === 0 || isLoading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleGenerate}
          className={`px-10 py-3 bg-accent text-text-on-accent rounded-full font-bold shadow-lg flex items-center gap-2 disabled:opacity-50 text-sm transition-all ${isRtl ? 'arabic-font flex-row-reverse' : ''}`}
        >
          {isLoading ? <Loader2 className="animate-spin" size={20} /> : t.next}
          {!isLoading && (isRtl ? <ArrowLeft size={20} /> : <ArrowRight size={20} />)}
        </motion.button>
      </div>
    </motion.div>
  );

  const renderResults = () => (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      <div className="relative max-w-md mx-auto">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t.search}
          className={`w-full px-4 py-2 rounded-xl bg-card border border-border focus:border-accent outline-none text-sm transition-all ${isRtl ? 'text-right arabic-font' : ''}`}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMeals.length === 0 && !isLoading && (
          <div className="col-span-full text-center py-12">
            <p className="text-text-secondary">{searchQuery ? t.noSearchResults : t.noMeals}</p>
          </div>
        )}
        {filteredMeals.map((meal) => (
          <motion.button
            key={meal.id}
            layout
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setState(prev => ({ ...prev, screen: 'details', selectedMeal: meal }))}
            className="geometric-card p-4 text-left flex flex-col gap-3 hover:border-accent/30 transition-all"
          >
            <div className="flex justify-between items-start w-full">
              <div className="bg-accent/10 p-2 rounded-lg">
                <Utensils className="text-accent" size={18} />
              </div>
              <span className="tag text-[8px]">Suggestion</span>
            </div>
            <h3 className={`text-sm font-bold line-clamp-2 ${isRtl ? 'text-right arabic-font' : ''}`}>
              {state.language === 'en' ? meal.nameEn : meal.nameAr}
            </h3>
            <div className={`flex items-center gap-3 text-text-secondary text-[10px] mt-auto ${isRtl ? 'flex-row-reverse' : ''}`}>
              <span className="flex items-center gap-1"><Clock size={12} /> {meal.cookingTime} {t.minutes}</span>
              <span className="flex items-center gap-1"><Users size={12} /> {meal.serves} {t.people}</span>
            </div>
          </motion.button>
        ))}
      </div>

      <div className="flex flex-col items-center gap-3 pt-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleAgain}
          disabled={isLoading}
          className={`px-8 py-2 border border-accent text-accent rounded-full font-bold text-xs flex items-center justify-center gap-2 transition-all hover:bg-accent/5 ${isRtl ? 'arabic-font flex-row-reverse' : ''}`}
        >
          {isLoading ? <Loader2 className="animate-spin" size={14} /> : <RotateCcw size={14} />}
          {t.again}
        </motion.button>
        
        <button 
          onClick={prevScreen}
          className={`text-text-secondary text-xs hover:text-accent transition-colors uppercase tracking-widest ${isRtl ? 'arabic-font' : ''}`}
        >
          {t.back}
        </button>
      </div>
    </motion.div>
  );

  const renderDetails = () => {
    const meal = state.selectedMeal;
    if (!meal) return null;

    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="space-y-6 max-w-3xl mx-auto"
      >
        <div className="geometric-card p-6 space-y-6">
          <div className="flex justify-between items-start">
            <button onClick={prevScreen} className="header-btn">
              {isRtl ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
            </button>
            <div className="text-right">
              <h2 className={`text-2xl font-bold gradient-text ${isRtl ? 'arabic-font' : ''}`}>
                {state.language === 'en' ? meal.nameEn : meal.nameAr}
              </h2>
              <div className={`flex items-center gap-4 text-text-secondary text-sm mt-2 justify-end ${isRtl ? 'flex-row-reverse' : ''}`}>
                <span className="flex items-center gap-1"><Clock size={16} /> {t.cookingTime}: {meal.cookingTime} {t.minutes}</span>
                <span className="flex items-center gap-1"><Clock size={16} /> {t.prepTime}: {meal.prepTime} {t.minutes}</span>
                <span className="flex items-center gap-1"><Users size={16} /> {t.serves}: {meal.serves} {t.people}</span>
              </div>
            </div>
          </div>

          <div className="h-px bg-border" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className={`text-xs uppercase tracking-[2px] text-accent font-bold ${isRtl ? 'arabic-font text-right' : ''}`}>
                {t.ingredients}
              </h4>
              <ul className={`space-y-2 ${isRtl ? 'text-right' : ''}`}>
                {(state.language === 'en' ? meal.ingredientsEn : meal.ingredientsAr).map((ing, i) => (
                  <li key={i} className="text-sm text-text-secondary flex items-center gap-2 justify-end">
                    <span>{ing}</span>
                    <Check size={14} className="text-accent" />
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className={`text-xs uppercase tracking-[2px] text-accent font-bold ${isRtl ? 'arabic-font text-right' : ''}`}>
                {t.method}
              </h4>
              <div className={`space-y-4 ${isRtl ? 'text-right' : ''}`}>
                {(state.language === 'en' ? meal.methodEn : meal.methodAr).map((step, i) => (
                  <div key={i} className={`flex gap-3 text-sm text-text-secondary relative ${isRtl ? 'flex-row-reverse' : ''}`}>
                    <span className="font-bold text-accent">{i + 1}.</span>
                    <p className="leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen relative">
      <FloatingIcons />
      <div className={`min-h-screen p-2 md:p-4 max-w-5xl mx-auto flex flex-col relative z-10 ${isRtl ? 'rtl' : 'ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
        <header className={`flex justify-between items-center mb-2 relative z-20 ${isRtl ? 'flex-row-reverse' : ''}`}>
        <div className={`flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
          {state.screen !== 'home' && (
            <>
              <button 
                onClick={() => setState(prev => ({ ...prev, screen: 'home', meals: [], selectedSubFilters: [], category: null, mealType: null }))}
                className="header-btn"
                title="Home"
              >
                <Home size={20} />
              </button>
              <button 
                onClick={prevScreen}
                className="header-btn"
                title="Back"
              >
                {isRtl ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
              </button>
            </>
          )}
        </div>
        
        <div className={`flex items-center gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="header-btn"
            title={isDarkMode ? "Switch to Blue (Light Mode)" : "Switch to White (Dark Mode)"}
          >
            {isDarkMode ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          <button 
            onClick={toggleLanguage}
            className="header-btn"
            title="Toggle Language"
          >
            <Languages size={20} />
          </button>
        </div>
      </header>

      <main className="flex-1 relative z-10">
        <AnimatePresence mode="wait">
          {state.screen === 'home' && renderHome()}
          {state.screen === 'selection' && (
            <div className="flex flex-col gap-8">
              <div className="flex-1 space-y-2">
                {renderMealType()}
                {state.mealType && renderCategory()}
                {state.category && state.mealType !== 'dessert' && renderSubFilters()}
              </div>
            </div>
          )}
          {state.screen === 'results' && (
            <div className="flex flex-col gap-4">
              {renderResults()}
            </div>
          )}
          {state.screen === 'details' && renderDetails()}
        </AnimatePresence>
      </main>

      {isLoading && (
        <div className="fixed inset-0 bg-bg/95 backdrop-blur-md z-[100] flex flex-col items-center justify-center space-y-8">
          <div className="relative w-32 h-32">
            {/* Plate */}
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute inset-0 bg-white/10 rounded-full border-4 border-accent/20 flex items-center justify-center"
            >
              <div className="w-20 h-20 rounded-full border-2 border-accent/10" />
            </motion.div>
            
            {/* Fork */}
            <motion.div
              animate={{ 
                y: [0, -15, 0],
                rotate: [-15, -25, -15]
              }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              className="absolute -left-4 top-1/2 -translate-y-1/2 text-accent"
            >
              <Utensils size={40} className="-rotate-90" />
            </motion.div>

            {/* Spoon/Knife (Using Fork as base for movement) */}
            <motion.div
              animate={{ 
                y: [0, -15, 0],
                rotate: [15, 25, 15]
              }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut", delay: 0.2 }}
              className="absolute -right-4 top-1/2 -translate-y-1/2 text-accent"
            >
              <Utensils size={40} className="scale-x-[-1] -rotate-90" />
            </motion.div>

            {/* Steam/Heat */}
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex gap-2">
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  animate={{ 
                    y: [0, -20],
                    opacity: [0, 1, 0],
                    scale: [0.5, 1.2]
                  }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 1, 
                    delay: i * 0.3,
                    ease: "easeOut"
                  }}
                  className="w-1 h-4 bg-accent/40 rounded-full blur-[1px]"
                />
              ))}
            </div>
          </div>
          <div className="text-center space-y-4">
            <div className="space-y-2">
              <p className={`text-2xl font-bold text-accent ${isRtl ? 'arabic-font' : ''}`}>{t.loading}</p>
              <p className="text-text-secondary text-sm animate-pulse">Cooking your suggestions...</p>
            </div>
            <button
              onClick={() => setIsLoading(false)}
              className="px-6 py-2 bg-white/5 border border-border rounded-full text-xs text-text-secondary hover:text-accent transition-all"
            >
              {t.cancel}
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default App;

