# MILESTONE 2 SNAPSHOT — INDEXEDDB LOCAL PERSISTENCE

**Date:** 24 November 2026  
**Project:** ROLEX EMPIRE (`https://rolex-empire.vercel.app`)  
**Prerequisite Commit:** `d767b3e` (Milestone 1 Kireka Environment on `origin/main`)  
**Status:** Implemented & Compiled (`tsc --noEmit` + `vite build` passed).

---

## 1. Database Schema (`rolex_empire_db`, Version `1`)

Implemented in `src/engine/IndexedDbStore.ts`:

| Object Store | Key Path | Indexes | Purpose |
| :--- | :--- | :--- | :--- |
| `profile` | `id` (`'active_save'`) | — | Stores `SaveData`, `schemaVersion`, `updatedAt`, and `migratedFromLocalStorage`. |
| `shift_history` | `id` | `by_timestamp` (`completedAt`), `by_shift` (`shiftNumber`) | Stores complete `ShiftRecord` business results for every completed 60s shift. |
| `order_ledger` | `id` | `by_timestamp` (`servedAt`), `by_recipe` (`recipeId`) | Stores every served and missed `OrderLedgerRecord` (recipe, customer archetype, cook quality, UGX breakdown). |
| `upgrade_log` | `id` | `by_timestamp` (`purchasedAt`) | Stores every `UpgradePurchaseRecord` (upgrade ID, rank, UGX cost, player level). |

---

## 2. Migration & Reliability Guarantees (`src/engine/SaveSystem.ts`)

1. **Zero-Data-Loss Migration:** `hydrateSaveDataAsync()` reads `localStorage['rolex_empire_save_v1']` and `profile['active_save']` on mount (`HomePage.tsx` and `GameView.tsx`). If IndexedDB is empty, existing `localStorage` data is automatically migrated into `rolex_empire_db`.
2. **Dual-Mirroring & Non-Clobbering Guard:** Synchronous `loadSaveData()` keeps initial render instant, while `persistSaveData()` prevents `DEFAULT_SAVE` from overwriting richer IndexedDB state during hydration and serializes writes/resets via `writeQueue`.
3. **Graceful Private-Mode Fallback:** If `window.indexedDB` is unavailable or blocked, all transactions resolve safely to `null` and `localStorage` remains operational.
4. **Milestone 3 Readiness:** Exports `loadShiftHistory()`, `loadOrderLedger()`, `loadUpgradeLog()`, and `getPersistenceSummary()` ready for the upcoming Private Owner's Dashboard.
