import { IngredientDef, IngredientId, RolexRecipe } from '../types/game';

export const INGREDIENTS: Record<IngredientId, IngredientDef> = {
  onion: {
    id: 'onion',
    name: 'Red Onion',
    lugandaHint: 'Katungulu',
    colorHex: '#b8426d',
    unlockLevel: 1,
  },
  tomato: {
    id: 'tomato',
    name: 'Tomato',
    lugandaHint: 'Nyanya',
    colorHex: '#d93829',
    unlockLevel: 1,
  },
  cabbage: {
    id: 'cabbage',
    name: 'Cabbage',
    lugandaHint: 'Emboga',
    colorHex: '#7cb342',
    unlockLevel: 1,
  },
  pepper: {
    id: 'pepper',
    name: 'Green Pepper',
    lugandaHint: 'Pilipili',
    colorHex: '#2e7d32',
    unlockLevel: 2,
  },
  beef: {
    id: 'beef',
    name: 'Spiced Beef',
    lugandaHint: 'Enyama',
    colorHex: '#794430',
    unlockLevel: 3,
  },
  avocado: {
    id: 'avocado',
    name: 'Avocado',
    lugandaHint: 'Ovakedo',
    colorHex: '#9ccc65',
    unlockLevel: 4,
  },
};

export const ROLEX_RECIPES: RolexRecipe[] = [
  {
    id: 'classic_rolex',
    name: 'Classic Kampala Rolex',
    subtitle: '2 Eggs · Onion · Tomato · Cabbage',
    eggCount: 2,
    ingredients: ['onion', 'tomato', 'cabbage'],
    basePriceUgx: 3000,
    unlockLevel: 1,
    prepDifficulty: 1,
  },
  {
    id: 'single_quick',
    name: 'Student Quick Rolex',
    subtitle: '1 Egg · Onion · Tomato',
    eggCount: 1,
    ingredients: ['onion', 'tomato'],
    basePriceUgx: 2000,
    unlockLevel: 1,
    prepDifficulty: 1,
  },
  {
    id: 'double_egg_special',
    name: 'Wandegeya Special',
    subtitle: '2 Eggs · Onion · Tomato · Cabbage · Pepper',
    eggCount: 2,
    ingredients: ['onion', 'tomato', 'cabbage', 'pepper'],
    basePriceUgx: 4000,
    unlockLevel: 2,
    prepDifficulty: 2,
  },
  {
    id: 'beef_rolex',
    name: 'Spiced Beef Rolex',
    subtitle: '2 Eggs · Spiced Beef · Onion · Tomato',
    eggCount: 2,
    ingredients: ['beef', 'onion', 'tomato'],
    basePriceUgx: 5500,
    unlockLevel: 3,
    prepDifficulty: 2,
  },
  {
    id: 'avocado_green',
    name: 'Kololo Fresh Rolex',
    subtitle: '2 Eggs · Avocado · Tomato · Cabbage · Pepper',
    eggCount: 2,
    ingredients: ['avocado', 'tomato', 'cabbage', 'pepper'],
    basePriceUgx: 6000,
    unlockLevel: 4,
    prepDifficulty: 3,
  },
  {
    id: 'empire_supreme',
    name: 'Empire Supreme Rolex',
    subtitle: '3 Eggs · Beef · Avocado · Onion · Tomato · Pepper',
    eggCount: 3,
    ingredients: ['beef', 'avocado', 'onion', 'tomato', 'pepper'],
    basePriceUgx: 8500,
    unlockLevel: 6,
    prepDifficulty: 3,
  },
];

export function getUnlockedRecipes(level: number, unlockedIngredientsBonus: boolean): RolexRecipe[] {
  const effectiveLevel = unlockedIngredientsBonus ? Math.max(level, 3) : level;
  return ROLEX_RECIPES.filter((r) => r.unlockLevel <= effectiveLevel);
}
