import { ProgressionTier, UpgradeDef } from '../types/game';

export const PROGRESSION_TIERS: ProgressionTier[] = [
  {
    level: 1,
    title: 'Roadside Rolex Stall',
    locationName: 'Kireka, Jinja Road, Kampala',
    xpRequired: 0,
    maxConcurrentCustomers: 2,
    spawnIntervalSec: 9.5,
    description: 'A bustling roadside iron-sheet stall facing the Kampala–Jinja Highway at Kireka.',
  },
  {
    level: 2,
    title: 'Seasoned Street Chef',
    locationName: 'Kireka, Jinja Road, Kampala',
    xpRequired: 120,
    maxConcurrentCustomers: 2,
    spawnIntervalSec: 8.2,
    description: 'Unlocks Green Pepper & Wandegeya Special orders near Kireka Main Market.',
  },
  {
    level: 3,
    title: 'Savoury Spice Master',
    locationName: 'Wandegeya Stage, Kampala',
    xpRequired: 280,
    maxConcurrentCustomers: 3,
    spawnIntervalSec: 7.4,
    description: 'Unlocks Spiced Beef Rolex and higher-value street traffic.',
  },
  {
    level: 4,
    title: 'Kampala Rush Favourite',
    locationName: 'Wandegeya Stage, Kampala',
    xpRequired: 500,
    maxConcurrentCustomers: 3,
    spawnIntervalSec: 6.5,
    description: 'Boda riders and university students line up. Unlocks Avocado Rolex.',
  },
  {
    level: 5,
    title: 'Stall Boss & Mentor',
    locationName: 'Ntinda Trading Centre, Kampala',
    xpRequired: 800,
    maxConcurrentCustomers: 3,
    spawnIntervalSec: 5.8,
    description: 'Eligible to hire Assistant Chef Juma to speed up chopping and chapati prep.',
  },
  {
    level: 6,
    title: 'Expanded Canopy Kitchen',
    locationName: 'Ntinda Trading Centre, Kampala',
    xpRequired: 1200,
    maxConcurrentCustomers: 3,
    spawnIntervalSec: 5.2,
    description: 'Unlocks the Empire Supreme Rolex and double-shift reputation.',
  },
  {
    level: 7,
    title: 'Nakasero Hub Proprietor',
    locationName: 'Nakasero Market Avenue, Kampala',
    xpRequired: 1700,
    maxConcurrentCustomers: 3,
    spawnIntervalSec: 4.8,
    description: 'Prime downtown Kampala foot traffic with generous office-worker tips.',
  },
  {
    level: 8,
    title: 'Regional Rolex Icon',
    locationName: 'Nakasero Market Avenue, Kampala',
    xpRequired: 2300,
    maxConcurrentCustomers: 3,
    spawnIntervalSec: 4.4,
    description: 'Famous across Kampala for blistered chapatis and rich golden omelettes.',
  },
  {
    level: 9,
    title: 'Multi-Stall Operator',
    locationName: 'Acacia Avenue Strip, Kampala',
    xpRequired: 3000,
    maxConcurrentCustomers: 3,
    spawnIntervalSec: 4.1,
    description: 'Preparing to transition from street kiosk to full brick-and-mortar.',
  },
  {
    level: 10,
    title: 'Rolex Bistro Empire',
    locationName: 'Kampala Flagship Bistro',
    xpRequired: 4000,
    maxConcurrentCustomers: 3,
    spawnIntervalSec: 3.8,
    description: 'Your first proper Ugandan Rolex Restaurant — a true culinary empire!',
  },
];

export const UPGRADES: UpgradeDef[] = [
  {
    id: 'heavy_tava',
    name: 'Heavy Cast-Iron Tava',
    category: 'equipment',
    description: 'Retains even heat across the pan, widening the Perfect cooking window and speeding up grilling.',
    effectLabel: '+22% cook speed & wider sweet spot',
    costUgx: 12000,
    requiredLevel: 1,
    maxRank: 3,
  },
  {
    id: 'gas_sigiri',
    name: 'Dual-Ring Gas Burner',
    category: 'equipment',
    description: 'Upgrades your charcoal sigiri with high-output precision flame control.',
    effectLabel: '+25% chapati & omelette speed',
    costUgx: 24000,
    requiredLevel: 2,
    maxRank: 2,
  },
  {
    id: 'prep_crate',
    name: 'Fresh Produce & Spice Rack',
    category: 'ingredients',
    description: 'Stocks crisp Nakasero market produce and premium spices earlier, boosting tips.',
    effectLabel: '+15% customer tips per rank',
    costUgx: 15000,
    requiredLevel: 1,
    maxRank: 3,
  },
  {
    id: 'signboard',
    name: 'Painted Roadside Signboard',
    category: 'expansion',
    description: 'Bright Ugandan-flag accent signboard attracting hungrier, better-tipping customers.',
    effectLabel: '+15% base Rolex price per rank',
    costUgx: 18000,
    requiredLevel: 1,
    maxRank: 3,
  },
  {
    id: 'hire_juma',
    name: 'Hire Assistant Chef (Juma)',
    category: 'staff',
    description: 'Juma joins your stall to pre-press chapatis and auto-chop onions & tomatoes faster.',
    effectLabel: 'Auto-prep chapatis & +20% patience',
    costUgx: 45000,
    requiredLevel: 2,
    maxRank: 1,
  },
  {
    id: 'canopy_expand',
    name: 'Expanded Mabati Canopy & Counter',
    category: 'expansion',
    description: 'Adds shaded seating stools, warm bulb lighting, and boosts customer patience.',
    effectLabel: '+25% customer patience & prestige',
    costUgx: 35000,
    requiredLevel: 3,
    maxRank: 2,
  },
];

export function getTierForLevel(level: number): ProgressionTier {
  const clamped = Math.max(1, Math.min(level, PROGRESSION_TIERS.length));
  return PROGRESSION_TIERS[clamped - 1];
}

export function computeLevelFromXp(xp: number): number {
  let lvl = 1;
  for (const tier of PROGRESSION_TIERS) {
    if (xp >= tier.xpRequired) {
      lvl = tier.level;
    }
  }
  if (xp > PROGRESSION_TIERS[PROGRESSION_TIERS.length - 1].xpRequired) {
    const extra = Math.floor((xp - 4000) / 1200);
    lvl = 10 + extra;
  }
  return lvl;
}
