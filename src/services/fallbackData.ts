import { Meal } from '../types';

export const FALLBACK_MEALS: Meal[] = [
  {
    id: 'koshary-1',
    nameEn: 'Authentic Egyptian Koshary',
    nameAr: 'كشري مصري أصيل',
    cookingTime: 45,
    prepTime: 30,
    serves: 4,
    ingredientsEn: [
      '1 cup lentils (brown)',
      '1 cup rice (short grain)',
      '1 cup macaroni (small)',
      '2 cups tomato juice',
      '4 onions (sliced)',
      'Garlic, Vinegar, Cumin',
      'Cooking oil'
    ],
    ingredientsAr: [
      '1 كوب عدس بجبة',
      '1 كوب أرز مصري',
      '1 كوب مكرونة صغيرة',
      '2 كوب عصير طماطم',
      '4 بصلات مقطعة جوانح',
      'ثوم، خل، كمون',
      'زيت قلي'
    ],
    methodEn: [
      'Boil lentils until cooked.',
      'Cook rice with vermicelli.',
      'Boil macaroni separately.',
      'Fry onions until golden brown (Ward).',
      'Make tomato sauce with garlic and vinegar.',
      'Layer lentils, rice, macaroni, and top with sauce and fried onions.'
    ],
    methodAr: [
      'يُسلق العدس حتى تمام النضج.',
      'يُطبخ الأرز مع الشعرية.',
      'تُسلق المكرونة بشكل منفصل.',
      'يُقلى البصل حتى يصبح ذهبي اللون (الورد).',
      'تُجهز صلصة الطماطم بالثوم والخل.',
      'توضع الطبقات (أرز، عدس، مكرونة) وتوزع الصلصة والبصل المقرمش على الوجه.'
    ],
    category: 'economic',
    tags: ['rice', 'pasta', 'legumes']
  },
  {
    id: 'molokhia-2',
    nameEn: 'Molokhia with Roasted Chicken',
    nameAr: 'ملوخية بالفراخ المحمرة',
    cookingTime: 60,
    prepTime: 20,
    serves: 4,
    ingredientsEn: [
      '500g Molokhia (minced)',
      '1 whole chicken',
      '5 cups chicken broth',
      '6 cloves garlic (crushed)',
      '1 tbsp coriander (dried)',
      'Ghee or butter'
    ],
    ingredientsAr: [
      '500 جرام ملوخية مخروطة',
      'دجاجة كاملة',
      '5 أكواب شوربة دجاج',
      '6 فصوص ثوم مفروم',
      '1 ملعقة كبيرة كزبرة ناشفة',
      'سمن أو زبدة'
    ],
    methodEn: [
      'Boil the chicken with aromatics to make broth.',
      'Heat the broth and add the minced Molokhia, stirring constantly.',
      'Prepare the "Tasha": sauté garlic and coriander in ghee until golden.',
      'Pour the Tasha over the Molokhia immediately.',
      'Roast the chicken in the oven or fry it.',
      'Serve with white rice or baladi bread.'
    ],
    methodAr: [
      'تُسلق الدجاجة مع المطيبات لعمل الشوربة.',
      'تُسخن الشوربة وتُضاف الملوخية مع التقليب المستمر.',
      'تُجهز "الطقة": يُحمر الثوم والكزبرة في السمن حتى يصبح ذهبياً.',
      'تُسكب التقلية فوق الملوخية فوراً.',
      'تُحمر الدجاجة في الفرن أو في الزيت.',
      'تُقدم مع أرز أبيض أو عيش بلدي.'
    ],
    category: 'normal',
    tags: ['chicken', 'vegetables', 'bread', 'rice']
  },
  {
    id: 'hawawshi-3',
    nameEn: 'Traditional Egyptian Hawawshi',
    nameAr: 'حواوشي بلدي أصلي',
    cookingTime: 30,
    prepTime: 15,
    serves: 3,
    ingredientsEn: [
      '500g minced meat (fatty)',
      '4 loaves of Baladi bread',
      '2 onions (minced)',
      '1 bell pepper (minced)',
      'Spices: Cinnamon, Nutmeg, Black pepper',
      'Butter'
    ],
    ingredientsAr: [
      '500 جرام لحمة مفرومة (بها نسبة دسم)',
      '4 أرغفة عيش بلدي',
      '2 بصلة مفرومة',
      '1 فلفل رومي مفروم',
      'بهارات: قرفة، جوزة الطيب، فلفل أسود',
      'زبدة'
    ],
    methodEn: [
      'Mix meat with onions, peppers, and spices.',
      'Open the bread loaves slightly and stuff with the meat mixture.',
      'Brush the bread with butter or oil.',
      'Wrap in foil or place directly on oven rack.',
      'Bake at 200°C for 25-30 minutes until meat is cooked and bread is crispy.'
    ],
    methodAr: [
      'تُخلط اللحمة مع البصل والفلفل والبهارات جيداً.',
      'تُفتح أرغفة العيش وتُحشى بخليط اللحم.',
      'يُدهن العيش بالزبدة أو الزيت.',
      'يُلف في ورق فويل أو يوضع مباشرة على رف الرن.',
      'يُخبز في فرن حرارته 200 درجة لمدة 25-30 دقيقة.'
    ],
    category: 'normal',
    tags: ['meat', 'bread']
  }
];
