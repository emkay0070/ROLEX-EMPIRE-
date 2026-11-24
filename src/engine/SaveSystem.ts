import {
  OrderLedgerRecord,
  PersistenceSummary,
  SaveData,
  ShiftRecord,
  ShiftStats,
  UpgradePurchaseRecord,
} from '../types/game';
import {
  idbAddOrderRecord,
  idbAddShiftRecord,
  idbAddUpgradeRecord,
  idbClearAllStores,
  idbGetAllOrders,
  idbGetAllShifts,
  idbGetAllUpgrades,
  idbGetCounts,
  idbGetProfile,
  idbPutProfile,
} from './IndexedDbStore';

const STORAGE_KEY = 'rolex_empire_save_v1';
const SCHEMA_VERSION = 1;

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

function normalizeSave(raw?: Partial<SaveData> | null): SaveData {
  if (!raw) return { ...DEFAULT_SAVE, upgrades: {} };
  return {
    ...DEFAULT_SAVE,
    ...raw,
    upgrades: { ...(raw.upgrades || {}) },
  };
}

function readLocalStorageRaw(): SaveData | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<SaveData>;
    return normalizeSave(parsed);
  } catch {
    return null;
  }
}

function writeLocalStorage(data: SaveData): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Ignore storage quota / private mode errors gracefully
  }
}

function saveProgressScore(data: SaveData): number {
  return (
    data.xp * 10 +
    data.ordersCompletedTotal * 100 +
    data.shiftCount * 500 +
    data.totalLifetimeUgx * 0.01
  );
}

export function loadSaveData(): SaveData {
  return readLocalStorageRaw() ?? { ...DEFAULT_SAVE, upgrades: {} };
}

let hydrationPromise: Promise<SaveData> | null = null;
let hydrationFinished = false;

/**
 * Hydrates career profile from IndexedDB (`rolex_empire_db`), automatically migrating
 * legacy `rolex_empire_save_v1` localStorage data with zero loss and keeping both stores aligned.
 */
export function hydrateSaveDataAsync(): Promise<SaveData> {
  if (hydrationPromise) {
    return hydrationPromise;
  }

  hydrationPromise = (async () => {
    const localSave = readLocalStorageRaw();
    const idbRecord = await idbGetProfile();

    if (!idbRecord) {
      const migrated = localSave ?? { ...DEFAULT_SAVE, upgrades: {} };
      await idbPutProfile({
        id: 'active_save',
        schemaVersion: SCHEMA_VERSION,
        updatedAt: Date.now(),
        migratedFromLocalStorage: localSave !== null,
        data: migrated,
      });
      if (localSave === null) {
        writeLocalStorage(migrated);
      }
      hydrationFinished = true;
      return migrated;
    }

    const idbSave = normalizeSave(idbRecord.data);
    if (!localSave) {
      writeLocalStorage(idbSave);
      hydrationFinished = true;
      return idbSave;
    }

    if (saveProgressScore(localSave) > saveProgressScore(idbSave)) {
      await idbPutProfile({
        id: 'active_save',
        schemaVersion: SCHEMA_VERSION,
        updatedAt: Date.now(),
        migratedFromLocalStorage: idbRecord.migratedFromLocalStorage,
        data: localSave,
      });
      hydrationFinished = true;
      return localSave;
    }

    writeLocalStorage(idbSave);
    hydrationFinished = true;
    return idbSave;
  })();

  return hydrationPromise;
}

let writeQueue: Promise<void> = Promise.resolve();

function enqueueIdbOp(task: () => Promise<void>): void {
  writeQueue = writeQueue.then(task).catch(() => {
    // Keep queue alive if an IndexedDB transaction fails
  });
}

export function persistSaveData(data: SaveData): void {
  const normalized = normalizeSave(data);
  // Avoid clobbering IndexedDB or richer localStorage before initial hydration finishes
  if (!hydrationFinished && saveProgressScore(normalized) === 0) {
    return;
  }
  writeLocalStorage(normalized);
  enqueueIdbOp(async () => {
    if (!hydrationFinished && hydrationPromise) {
      await hydrationPromise;
    }
    await idbPutProfile({
      id: 'active_save',
      schemaVersion: SCHEMA_VERSION,
      updatedAt: Date.now(),
      migratedFromLocalStorage: true,
      data: normalized,
    });
  });
}

export function resetSaveData(): SaveData {
  const fresh = { ...DEFAULT_SAVE, upgrades: {} };
  hydrationFinished = true;
  hydrationPromise = Promise.resolve(fresh);
  writeLocalStorage(fresh);
  enqueueIdbOp(async () => {
    await idbClearAllStores();
    await idbPutProfile({
      id: 'active_save',
      schemaVersion: SCHEMA_VERSION,
      updatedAt: Date.now(),
      migratedFromLocalStorage: false,
      data: fresh,
    });
  });
  return fresh;
}

export function recordOrderEvent(
  entry: Omit<OrderLedgerRecord, 'id' | 'servedAt'>,
): void {
  const record: OrderLedgerRecord = {
    ...entry,
    id: `ord_${Date.now()}_${Math.floor(Math.random() * 99999)}`,
    servedAt: Date.now(),
  };
  void idbAddOrderRecord(record);
}

export function recordShiftCompleted(
  stats: ShiftStats,
  locationName: string,
  levelAfter: number,
): void {
  const record: ShiftRecord = {
    ...stats,
    id: `shift_${stats.shiftNumber}_${Date.now()}`,
    completedAt: Date.now(),
    locationName,
    levelAfter,
  };
  void idbAddShiftRecord(record);
}

export function recordUpgradePurchased(
  upgradeId: string,
  upgradeName: string,
  rank: number,
  costUgx: number,
  levelAtPurchase: number,
): void {
  const record: UpgradePurchaseRecord = {
    id: `upg_${upgradeId}_r${rank}_${Date.now()}`,
    purchasedAt: Date.now(),
    upgradeId,
    upgradeName,
    rank,
    costUgx,
    levelAtPurchase,
  };
  void idbAddUpgradeRecord(record);
}

export async function loadShiftHistory(): Promise<ShiftRecord[]> {
  return idbGetAllShifts();
}

export async function loadOrderLedger(limit = 250): Promise<OrderLedgerRecord[]> {
  return idbGetAllOrders(limit);
}

export async function loadUpgradeLog(): Promise<UpgradePurchaseRecord[]> {
  return idbGetAllUpgrades();
}

export async function getPersistenceSummary(): Promise<PersistenceSummary> {
  const [profile, counts] = await Promise.all([idbGetProfile(), idbGetCounts()]);
  return {
    backend: profile ? 'indexeddb' : 'localstorage',
    migratedFromLocalStorage: profile?.migratedFromLocalStorage ?? false,
    shiftRecordsCount: counts.shifts,
    orderLedgerCount: counts.orders,
    upgradeLogCount: counts.upgrades,
    lastSavedAt: profile?.updatedAt ?? null,
  };
}
