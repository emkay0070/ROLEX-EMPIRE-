export type IngredientId =
  | 'onion'
  | 'tomato'
  | 'cabbage'
  | 'pepper'
  | 'beef'
  | 'avocado';

export interface IngredientDef {
  id: IngredientId;
  name: string;
  lugandaHint: string;
  colorHex: string;
  unlockLevel: number;
}

export interface RolexRecipe {
  id: string;
  name: string;
  subtitle: string;
  eggCount: number;
  ingredients: IngredientId[];
  basePriceUgx: number;
  unlockLevel: number;
  prepDifficulty: number; // 1-3
}

export type CookingStage =
  | 'idle'
  | 'chapati_grilling'
  | 'chapati_ready'
  | 'mixing_eggs'
  | 'frying_omelette'
  | 'combining'
  | 'rolling'
  | 'ready_to_serve';

export type CookQuality = 'perfect' | 'good' | 'poor';

export interface CookingState {
  stage: CookingStage;
  chapatiProgress: number; // 0..100
  chapatiQuality: CookQuality | null;
  eggCount: number;
  selectedIngredients: IngredientId[];
  omeletteProgress: number; // 0..100
  omeletteQuality: CookQuality | null;
  rollProgress: number; // 0..100
  overallQuality: CookQuality;
  panHeat: number; // 0..1 visual heat
  lastFeedback: string;
}

export type CustomerPersonality =
  | 'friendly_boda'
  | 'student_rush'
  | 'office_pro'
  | 'market_mama'
  | 'food_critic';

export type CustomerStatus = 'walking_in' | 'waiting' | 'served' | 'leaving_angry' | 'leaving_happy';

export interface CustomerOrder {
  id: string;
  customerName: string;
  personality: CustomerPersonality;
  recipe: RolexRecipe;
  patienceMax: number;
  patienceRemaining: number;
  status: CustomerStatus;
  slotIndex: number; // 0, 1, 2
  tipMultiplier: number;
  shirtColor: number;
  skinTone: number;
  hasHelmet?: boolean;
  hasBackpack?: boolean;
  spawnedAt: number;
}

export type UpgradeCategory = 'equipment' | 'ingredients' | 'staff' | 'expansion';

export interface UpgradeDef {
  id: string;
  name: string;
  category: UpgradeCategory;
  description: string;
  effectLabel: string;
  costUgx: number;
  requiredLevel: number;
  maxRank: number;
}

export interface ProgressionTier {
  level: number;
  title: string;
  locationName: string;
  xpRequired: number;
  maxConcurrentCustomers: number;
  spawnIntervalSec: number;
  description: string;
}

export interface ShiftStats {
  shiftNumber: number;
  durationSeconds: number;
  customersServed: number;
  perfectServes: number;
  missedOrders: number;
  totalSalesUgx: number;
  tipsEarnedUgx: number;
  expensesUgx: number;
  netProfitUgx: number;
  satisfactionAvg: number;
}

export type CameraPreset = 'overview' | 'tava' | 'prep' | 'counter';

export interface SaveData {
  cashUgx: number;
  totalLifetimeUgx: number;
  xp: number;
  level: number;
  shiftCount: number;
  ordersCompletedTotal: number;
  satisfactionRating: number; // 0..100
  upgrades: Record<string, number>;
  employeeHired: boolean;
  bestShiftProfitUgx: number;
  soundMuted: boolean;
}

export type AssetCategory =
  | 'food'
  | 'ingredients'
  | 'equipment'
  | 'furniture'
  | 'characters'
  | 'buildings'
  | 'environment';

export interface OrderLedgerRecord {
  id: string;
  servedAt: number;
  shiftNumber: number;
  recipeId: string;
  recipeName: string;
  personality: CustomerPersonality;
  quality: CookQuality | 'missed';
  saleUgx: number;
  tipUgx: number;
  ingredientCostUgx: number;
  netUgx: number;
  status: 'served' | 'missed';
}

export interface ShiftRecord extends ShiftStats {
  id: string;
  completedAt: number;
  locationName: string;
  levelAfter: number;
}

export interface UpgradePurchaseRecord {
  id: string;
  purchasedAt: number;
  upgradeId: string;
  upgradeName: string;
  rank: number;
  costUgx: number;
  levelAtPurchase: number;
}

export interface PersistenceSummary {
  backend: 'indexeddb' | 'localstorage';
  migratedFromLocalStorage: boolean;
  shiftRecordsCount: number;
  orderLedgerCount: number;
  upgradeLogCount: number;
  lastSavedAt: number | null;
}
