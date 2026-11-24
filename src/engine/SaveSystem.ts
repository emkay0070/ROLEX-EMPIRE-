import { SaveData } from '../types/game';

const STORAGE_KEY = 'rolex_empire_save_v1';

export const DEFAULT_SAVE: SaveData = {
  cashUgx: 5000,
  totalLifetimeUgx: 5000,
  xp: 0,
  level: 1,
  shiftCount: 0,
  ordersCompletedTotal: 0,
  satisfactionRating: 88,
  upgrades: {},
  employeeHired: false,
  bestShiftProfitUgx: 0,
  soundMuted: false,
};

export function loadSaveData(): SaveData {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SAVE };
    const parsed = JSON.parse(raw) as Partial<SaveData>;
    return {
      ...DEFAULT_SAVE,
      ...parsed,
      upgrades: { ...(parsed.upgrades || {}) },
    };
  } catch {
    return { ...DEFAULT_SAVE };
  }
}

export function persistSaveData(data: SaveData): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Ignore storage quota / private mode errors gracefully
  }
}

export function resetSaveData(): SaveData {
  const fresh = { ...DEFAULT_SAVE, upgrades: {} };
  persistSaveData(fresh);
  return fresh;
}
