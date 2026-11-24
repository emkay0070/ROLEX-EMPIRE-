# MILESTONE 3 SNAPSHOT — PRIVATE OWNER'S DASHBOARD (`/owner`)

**Date:** 24 November 2026  
**Project:** ROLEX EMPIRE (`https://rolex-empire.vercel.app`)  
**Prerequisite Commit:** `1c5e96a` (Milestone 2 IndexedDB Local Persistence on `origin/main`)  
**Status:** Implemented & Verified (`tsc --noEmit` + `vite build`).

---

## 1. Purpose & Route Architecture

- **Route:** `/owner` (`OwnerDashboardPage.tsx`, lazy-loaded inside `src/App.tsx`).
- **AdSense Separation:** Rendered outside `SiteLayout` / `AdBannerSlot`, keeping the Owner Operations workspace completely free of AdSense banners while matching the game's dark `#14110f` / `#1b1714` surface palette and `Outfit` + `Plus Jakarta Sans` + `JetBrains Mono` typography.
- **Navigation Entry Points:**
  - `HomePage.tsx`: `"Owner's Ledger"` button inside the Career Snapshot panel.
  - `SiteLayout.tsx`: Quiet `"Owner Ledger"` link in the footer (preserving the 3-zone top navbar unchanged).
  - Top breadcrumb bar on `/owner`: quick links back to `Home` (`/`) and `Open Stall` (`/play`).

---

## 2. IndexedDB-Backed Workspace Sections

All KPIs, charts, tables, and filters read directly from `rolex_empire_db` (`profile`, `shift_history`, `order_ledger`, `upgrade_log`) via `SaveSystem.ts` with zero fabricated data:

1. **Overview (`overview`):**
   - Primary KPI strip: Cash On Hand (+ Lifetime UGX), Best Shift Net Profit (+ Shifts Worked), Total Rolex Served (+ Perfect Rate %), and Customer Satisfaction (+ Chef Juma staffing status).
   - Recent Shift Net Profit trend bar chart (last 10 completed shifts).
   - Revenue by Rolex Recipe table (orders served, sales + tips UGX).
   - Customer Traffic Breakdown table (customer archetype counts & tips earned).
   - Clean empty state guiding first-time players to `/play`.
2. **Shift History (`shifts`):**
   - Searchable tabular ledger of every completed shift (`#`, location, served, perfect, missed, sales, tips, net profit, timestamp).
3. **Order Ledger (`orders`):**
   - Searchable customer transaction history with quality filters (`all`, `perfect`, `good`, `poor`, `missed`) showing timestamp, shift `#`, recipe, customer archetype, result, sale, tip, and net UGX.
4. **Data & Upgrades (`data`):**
   - Live installed equipment & staff ranks (`UPGRADES`).
   - Capital Expenditure Log from `upgrade_log`.
   - IndexedDB record counts (`shift_history`, `order_ledger`, `upgrade_log`), JSON career backup export (`exportCareerArchive`), JSON backup file restore (`importCareerArchive`), and two-step confirmed local reset (`resetSaveData`).

---

## 3. Accounting Export & Backup API (`src/engine/SaveSystem.ts`)

- **CSV Export (`OwnerDashboardPage.tsx`):** Generates a downloadable `rolex-empire-ledger-YYYY-MM-DD.csv` combining `SHIFT` and `ORDER` rows from IndexedDB.
- **JSON Career Archive (`exportCareerArchive` / `importCareerArchive`):** Exports and validates full `{ version, exportedAt, profile, shifts, orders, upgrades }` snapshots, restoring both `localStorage['rolex_empire_save_v1']` and all 4 `rolex_empire_db` stores atomically through `writeQueue`.
