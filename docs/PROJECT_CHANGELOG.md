# ROLEX EMPIRE — PROJECT CHANGELOG

All notable planning, research, architecture, asset, and code changes for **ROLEX EMPIRE** (`emkay0070/ROLEX-EMPIRE-` / `https://rolex-empire.vercel.app`) are recorded here chronologically.

> **Policy:** Do not erase or rewrite historical entries. Always append or prepend dated entries with clear status, files affected, testing performed, and next recommended action.

---

## [2026-11-24 (Update 7)] — Live Rolex Vendor, Cooking Process Craft Animations & Auto Action Camera

- **Milestone / Task:** Gameplay Immersion Upgrade — Visible Articulated Vendor + Close-Up Cooking Craft Camera
- **What Changed:**
  - Added `char_vendor` slot (`targetHeight: 1.74`, `enabled: false`) in `public/assets/models/manifest.json` and `AssetManager.ts` so the primary chef is both procedurally rendered immediately and GLB-swappable later.
  - Upgraded `src/engine/StallBuilder.ts`: built the articulated primary Kampala Rolex Vendor (`vendorGroup`, head, torso, apron, left/right arm pivots, plus held knife, rolling pin, flat spatula, and fresh egg props) standing behind the counter (`z = -0.82`); added Station 1 flattening dough disc (`prepDoughDisc`), live active Chopping Board (`chopVeggieMesh` + bouncing `choppedBits`), Kampala stainless mixing cup (`kikopo`, `eggCupLiquid` rising with egg count, spinning `eggCupWhisk`, and `crackEggGroup` split shells + falling golden yolk), and 12 dynamic omelette veggie chunks (`panOmeletteToppings`) attached to `panOmelette`.
  - Upgraded `src/engine/RolexGameEngine.ts`: added `CookingActionKind` (`roll_dough`, `chop`, `crack_egg`, `pour_egg`, `flip_tava`, `roll_rolex`, `serve`) and `CameraFocusTarget` (`overview`, `prep`, `mix`, `tava`, `roll`, `counter`); implemented smooth X-lane vendor sliding (safely clearing Assistant Chef Juma at `-1.35`), zero-GC per-frame arm/tool/dough/chop/egg-crack/roll animations, queued `prep -> tava` follow-up camera transition, and instant OrbitControls `start` yield (`onUserCameraInteract`) so manual player orbit/zoom always wins.
  - Wired `autoCamera` (enabled by default) and `Auto` toggle button into `src/components/GameView.tsx` and `src/components/GameHUD.tsx`.
- **Files / Systems Affected:** `public/assets/models/manifest.json`, `src/engine/{AssetManager.ts,StallBuilder.ts,RolexGameEngine.ts}`, `src/components/{GameView.tsx,GameHUD.tsx}`, `docs/`.
- **What Was Tested:** Pending `npm run lint` (`tsc --noEmit`) + `npm run build` (`vite build`).
- **Next Recommended Action:** Visually inspect live gameplay in browser during a 60s shift to tune close-up framing or add custom `char_vendor.glb` if desired; revisit AdSense placement after site review completes.

---

## [2026-11-24 (Update 6)] — `public/assets/models/` Directory & Declarative `.glb` Integration Pipeline

- **Milestone / Task:** Initialize `public/assets/models/` drop-in folder hierarchy + `manifest.json` + scene/dashboard integration
- **What Changed:**
  - Created `public/assets/models/` with 10 category subfolders (`food/`, `ingredients/`, `kitchen/`, `furniture/`, `props/`, `roads/`, `vegetation/`, `buildings/`, `vehicles/`, `characters/`), `public/assets/models/README.md`, and `public/assets/models/manifest.json` defining 44 drop-in asset slots (`enabled: false` by default for zero-404 procedural fallback).
  - Upgraded `src/engine/AssetManager.ts`: added `fetchModelsManifest()` + `loadManifest()`, `hasActiveGlb()`, `targetMaxDim`, `rotationDeg`, and `offset` support in `normalizeAndGround()`, and GLB texture anisotropy/disposal tracking.
  - Upgraded `src/engine/StallBuilder.ts`: separated clickable station wrappers & raycast hitboxes (`prepHit`, `panHit`, `ingHit`, `serveHit`) from `assetManager.loadOrBuild()` so GLB swaps never break clicks or pan cooking visuals; wired `equip_knife_board`, `equip_cooking_pot`, `equip_sigiri_stove`, `equip_tava_pan`, `equip_serving_tray`, `ing_*_bowl` (6 bowls), `ing_egg_tray`, `ing_carrot_crate`, `food_chapati_raw`, `food_chapati_cooked`, `food_rolex_rolled`, `furn_waiting_bench`, `furn_wooden_table`, `furn_menu_board`, and `char_assistant_juma`.
  - Upgraded `src/engine/DistrictManager.ts` and `src/engine/TrafficSystem.ts`: wired `env_boda_motorbike`, `furn_wooden_table`, `env_rock_cluster`, `env_matatu_taxi`, `env_saloon_car`, and optional GLB overrides for `env_acacia_tree` / `env_roadside_shrub`.
  - Updated `src/engine/RolexGameEngine.ts`: calls `assetManager.loadManifest()` and `trafficSystem.initialize(assetManager)` before building the scene.
  - Added **3D Models** directory & manifest inspector tab in `src/pages/OwnerDashboardPage.tsx` (`/owner`) with folder filters, search, target dimensions, active mode (`GLB Active` vs `Procedural`), and one-click target path copying.
- **Files / Systems Affected:** `public/assets/models/*`, `src/engine/{AssetManager.ts,StallBuilder.ts,DistrictManager.ts,TrafficSystem.ts,RolexGameEngine.ts}`, `src/pages/OwnerDashboardPage.tsx`, `docs/`.
- **What Was Tested:** `npm run lint` (`tsc --noEmit`), `npm run build` (`vite build`), and `git diff` protected file verification.
- **Next Recommended Action:** Drop `.glb` models into `public/assets/models/<folder>/` and toggle `"enabled": true` in `public/assets/models/manifest.json` to inspect them live in `/play` and `/owner`.

---

## [2026-11-24 (Update 5)] — Milestone 2 Push (`1c5e96a`) & Milestone 3: Private Owner's Dashboard (`/owner`)

- **Milestone / Task:** Push Milestone 2 (`1c5e96a`) to GitHub + Implement & Push Milestone 3 (Private Owner's Dashboard)
- **What Changed:**
  - Committed and pushed Milestone 2 IndexedDB persistence (`rolex_empire_db`) to `origin/main` as commit `1c5e96a`.
  - Created `src/pages/OwnerDashboardPage.tsx`: full-viewport, AdSense-free Owner Operations Ledger at `/owner` backed exclusively by IndexedDB (`profile`, `shift_history`, `order_ledger`, `upgrade_log`) with desktop left sidebar + mobile tab switcher across `Overview`, `Shifts`, `Orders`, and `Data & Upgrades`.
  - Built live analytics directly from persisted IndexedDB records: 4 KPI cards, 10-shift net profit trend bar chart, Revenue by Rolex Recipe breakdown, Customer Traffic Breakdown, searchable shift history, quality-filtered & searchable order ledger, installed equipment & capital expenditure log, CSV accounting export, JSON backup/restore, and two-step confirmed reset.
  - Upgraded `src/engine/SaveSystem.ts`: added `CareerArchivePayload`, `exportCareerArchive()`, and validated `importCareerArchive(rawJson)` restoring all 4 IndexedDB stores and `localStorage` atomically.
  - Wired `/owner` lazy route in `src/App.tsx`, added `"Owner's Ledger"` button on `src/pages/HomePage.tsx`, and added a quiet `"Owner Ledger"` footer link in `src/components/SiteLayout.tsx`.
  - Added `docs/milestones/2026-11-24-owner-dashboard.md` and updated `docs/ROLEX_EMPIRE_MASTER.md`.
- **Files / Systems Affected:** `src/pages/{OwnerDashboardPage.tsx,HomePage.tsx}`, `src/engine/SaveSystem.ts`, `src/components/SiteLayout.tsx`, `src/App.tsx`, `docs/`.
- **What Was Tested:** `npm run lint` (`tsc --noEmit`), `npm run build` (`vite build`), and `git diff` protection check (`public/ads.txt`, `index.html`, `vercel.json`, `package.json`, `src/data/recipes.ts`).
- **Test Results:** TypeScript check and Vite production bundle succeeded cleanly; protected AdSense/deployment/recipe files verified untouched. Live desktop/mobile browser check recommended post-deploy (no headless Chromium binary in sandbox).
- **Next Recommended Action:** Inspect live Vercel deploy across `/`, `/play`, and `/owner` on desktop and mobile; supply external `.glb` assets when ready; keep Supabase/cloud sync deferred until requested.

---

## [2026-11-24 (Update 4)] — Milestone 1 Push (`d767b3e`) & Milestone 2: IndexedDB Local Persistence

- **Milestone / Task:** Push Milestone 1 to GitHub + Implement Milestone 2 (Structured IndexedDB Persistence)
- **What Changed:**
  - Committed and pushed Milestone 1 Kireka environment + continuity documentation to `origin/main` (commit `d767b3e`, triggering Vercel deployment).
  - Created `src/engine/IndexedDbStore.ts`: native typed IndexedDB wrapper (`rolex_empire_db`, version `1`) with 4 object stores (`profile`, `shift_history`, `order_ledger`, `upgrade_log`) and timestamp/shift/recipe indexes.
  - Upgraded `src/engine/SaveSystem.ts`: added `hydrateSaveDataAsync()` with automatic zero-loss migration from `localStorage` (`rolex_empire_save_v1`), higher-progress conflict resolution, serialized `writeQueue` for `persistSaveData`/`resetSaveData`, and ledger helpers (`recordOrderEvent`, `recordShiftCompleted`, `recordUpgradePurchased`, `loadShiftHistory`, `loadOrderLedger`, `loadUpgradeLog`, `getPersistenceSummary`).
  - Added typed record interfaces (`OrderLedgerRecord`, `ShiftRecord`, `UpgradePurchaseRecord`, `PersistenceSummary`) to `src/types/game.ts`.
  - Wired `hydrateSaveDataAsync` + order/shift/upgrade ledger logging cleanly into `src/components/GameView.tsx` and `src/pages/HomePage.tsx` without modifying gameplay balance or UI layout.
  - Added `docs/milestones/2026-11-24-indexeddb-local-persistence.md`.
- **Files / Systems Affected:** `src/engine/{IndexedDbStore.ts,SaveSystem.ts}`, `src/types/game.ts`, `src/components/GameView.tsx`, `src/pages/HomePage.tsx`, `docs/`.
- **What Was Tested:** `npm run lint` (`tsc --noEmit`), `npm run build` (`vite build`), and protected file verification (`public/ads.txt`, `index.html`, `vercel.json`, `recipes.ts`, `App.tsx`).
- **Test Results:** Zero TypeScript errors, Vite production build succeeded cleanly. Live browser IndexedDB inspection pending desktop/mobile browser test.
- **Next Recommended Action:** Push Milestone 2 commit to `origin/main`, verify `rolex_empire_db` migration/persistence in browser DevTools, then proceed to Milestone 3 (Owner's Dashboard) when authorized.

---

## [2026-11-24 (Update 3)] — Milestone 1: Kireka Environment 3D Implementation

- **Milestone / Task:** Milestone 1 Approved 3D Construction — Kireka Trading Centre & Kireka Main Market along Kampala–Jinja Highway
- **What Changed:**
  - Created `src/engine/EnvironmentMaterials.ts`: shared PBR material library for Kireka terrain, weathered highway asphalt, pavers, concrete drain, railway ballast/steel, *mabati* variants, shop plasters, steel, glass, and emissive interiors.
  - Created `src/engine/DistrictManager.ts`: full modular Kireka district reconstruction facing Kampala–Jinja Highway (`Z = +3.25..+9.15`), including interlocking concrete paver sidewalk, lined concrete storm drain (`Z = +2.55..+3.18`) with pedestrian crossover slabs, East-corner Kireka Boda & Matatu Stage, West-corner yellow Mobile Money steel kiosk, Kireka Market Access Lane (`X = -7.6..-4.4`) with produce stalls, 1–2 story Kireka commercial shopfronts, Uganda Railways meter-gauge line (`116` `InstancedMesh` sleepers), Kireka Main Market *mabati* sheds, sculpted Kireka Hill backdrop, instanced UMEME poles + overhead cables, and instanced acacia/mango trees + shrubs.
  - Created `src/engine/TrafficSystem.ts`: pooled, zero-allocation live Kampala–Jinja Highway traffic (moving boda bodas + helmeted riders, white/blue-band *matatu* minibus taxis, saloon cars) and background pedestrians on shop verandas, far highway verge, and market lane.
  - Upgraded `src/engine/AssetManager.ts`: added `DRACOLoader`, `Box3` `normalizeAndGround()`, 39 Kireka-ready asset descriptors across all 7 categories, and full cache disposal.
  - Expanded `src/engine/ProceduralTextures.ts`: added `jinjaHighwayTarmac`, `paverTiles`, `signHardware`, `signWholesaleDuka`, `signElectronicsSalon`, `signMobileMoney`, `signKirekaMarket`, and `smokeSprite` (19 procedural textures total).
  - Refactored `src/engine/StallBuilder.ts`: extracted old `buildKampalaEnvironment` into `DistrictManager`; preserved exact 4 station hitboxes & `StallRig`; upgraded stall props (20L yellow oil jerrycan, stacked soda crates, charcoal sack, soft `smokeSprite` steam, shaded canopy stools).
  - Optimized `src/engine/CustomerSystem.ts`: eliminated per-frame `Vector3` allocations inside `updateCustomerVisuals()`.
  - Updated `src/engine/RolexGameEngine.ts`: integrated `DistrictManager` & `TrafficSystem`, calibrated `overview` framing `(0.42, 3.32, 6.45) -> (0, 1.05, 0.35)`, updated horizon fog (`0.012`) & camera far plane (`180`), and wired clean GPU disposal.
  - Updated `src/data/upgrades.ts`: updated Levels 1–2 `locationName` to `'Kireka, Jinja Road, Kampala'`.
  - Added `docs/milestones/2026-11-24-kireka-environment-implementation.md`.
- **Files / Systems Affected:** `src/engine/{AssetManager.ts,CustomerSystem.ts,DistrictManager.ts,EnvironmentMaterials.ts,ProceduralTextures.ts,RolexGameEngine.ts,StallBuilder.ts,TrafficSystem.ts}`, `src/data/upgrades.ts`, `docs/`. Protected files (`public/ads.txt`, `index.html`, `vercel.json`, `SaveSystem.ts`, `GameView.tsx`, `GameHUD.tsx`, `recipes.ts`, `App.tsx`) untouched.
- **What Was Tested:** `npm run lint` (`tsc --noEmit`), `npm run build` (`vite build`), and `git diff` verification of protected files.
- **Test Results:** Zero TypeScript errors, Vite production build succeeded (`dist/` generated cleanly). Headless browser visual testing could not run in this container because no Chromium/Chrome binary is installed.
- **Next Recommended Action:** Visually inspect `/play` in a desktop and mobile WebGL browser, drop external `.glb` models into `/public/assets/models/` as available, and commit/push to trigger Vercel deployment once verified.

---

## [2026-11-24 (Update 2)] — Location Pivot to Kireka, Uganda, Git Checkpoint & Research Handover

- **Milestone / Task:** Milestone 1 Location Change Approval & Pre-Construction Geographical Research (Construction NOT Yet Approved)
- **What Changed:**
  - Recorded official project owner decision replacing **Makerere Kivulu** with **Kireka, Uganda (Kireka Main Market and surrounding commercial street environment along the Kampala–Jinja Highway corridor, Kira Municipality, Wakiso District)**.
  - Recorded explicit boundary rule distinguishing established **Kireka township along Jinja Road** (`8MW2+M25`, Kireka Main Market / railway halt, Kireka–Namugongo Road, Kamuli Road, Kireka Shopping Centre, Kireka Hill / Central Uganda Conference) from the **Kireka-Bbira growth centre along Sentema Road** (Wakiso 2026 Sentema PDF — contextual only, must NOT be substituted).
  - Created git checkpoint tag `checkpoint-2026-11-24-pre-kireka` on verified HEAD commit `a57f21a144add0b9f52631481269a9c87279415e`.
  - Conducted Kireka geographical, railway-corridor, and road-infrastructure web research; located verified Wikimedia Commons photograph title (`File:A train arrives at Kireka halt in Kampala, as traders make way for its arrival.jpg`), Roger Farnworth Uganda Railway Part 19 documentation, and Kireka/Jinja Road/Namugongo Road corridor references.
  - Created `docs/research/2026-11-24-kireka-geographical-and-visual-research.md`, `docs/research/2026-11-24-kireka-revised-environment-blueprint.md`, and `docs/milestones/2026-11-24-kireka-location-research-and-checkpoint.md`.
  - Updated `docs/ROLEX_EMPIRE_MASTER.md` with Kireka as the official Milestone 1 target, Git commit checkpoint, and open verification requirements.
- **Files / Systems Affected:** `docs/` only + local git tag `checkpoint-2026-11-24-pre-kireka`. Zero modifications to `src/`, `public/`, `index.html`, `package.json`, `vercel.json`, or AdSense configuration.
- **What Was Tested:** Read-only Git verification (`git status -s`, `git rev-parse HEAD`, `git log -n 3 --oneline`) and live `search_web` queries on Kireka landmarks, railway alignment, and Wikimedia Commons.
- **Test Results:** Confirmed clean source tree (`a57f21a144add0b9f52631481269a9c87279415e`), confirmed Wikimedia Commons Kireka halt photo existence, and verified tool limitation (text-only search cannot render satellite tiles or street-view photo pixels).
- **Outstanding Issues:** Direct visual pixel inspection of satellite imagery and 4–8 street-level Kireka photographs + delivery of external GLB models remain pending before 3D construction can be authorized. Also note `src/data/upgrades.ts` still contains `"Makerere Kivulu Corner, Kampala"` until construction authorization.
- **Next Recommended Action:** Project owner supplies/reviews 4–8 Kireka visual references (market frontage, railway reserve, Jinja/Namugongo junction, evening lighting) and external GLBs, confirms playable road frontage option (Market/Railway lane vs. Jinja Road service frontage), and authorizes Milestone 1 construction.

---

## [2026-11-24] — Project Continuity Documentation, Visual Research Revision & Verified Asset Audit

- **Milestone / Task:** Continuity Framework + Milestone 1 Research & Documentation Phase (Makerere Kivulu Baseline)
- **What Changed:**
  - Created `docs/ROLEX_EMPIRE_MASTER.md`, `docs/PROJECT_CHANGELOG.md`, `docs/milestones/2026-11-24-makerere-kivulu-environment-research.md`, `docs/research/2026-11-24-makerere-kivulu-initial-report.md`, `docs/research/2026-11-24-makerere-kivulu-visual-reference-board.md`, `docs/research/2026-11-24-makerere-kivulu-revised-blueprint.md`, and `docs/research/2026-11-24-asset-inventory-and-integration-plan.md`.
- **Files / Systems Affected:** `docs/` only.
- **What Was Tested:** Full static repository inspection (`list_dir` and `view_file`) and `search_web` queries.
- **Test Results:** Confirmed 0 external GLB/texture files in `/public` or `/src`, confirmed `rolex_empire_save_v1` schema and AdSense config (`ca-pub-8832384771899504`).
- **Outstanding Issues:** Superseded on 2026-11-24 by owner decision to switch starting location from Makerere Kivulu to Kireka, Uganda (historical Kivulu research preserved in `docs/research/`).
- **Next Recommended Action:** Superseded by Kireka update above.

---

## [Pre-2026-11-24] — ROLEX EMPIRE Version 1.0 Baseline Release

- **Milestone / Task:** Initial Public Web Release (`v1.0`)
- **What Changed:** Built and deployed React 19 + TypeScript + Tailwind v4 + Three.js 0.187.0 street-food simulation game (`a57f21a144add0b9f52631481269a9c87279415e` on `main`).
- **Files / Systems Affected:** Full baseline repository (`/src/*`, `/public/*`, `index.html`, `package.json`, `vercel.json`, `vite.config.ts`).
- **What Was Tested / Status:** Deployed live at `https://rolex-empire.vercel.app` (live URL runtime not executed in documentation-only sessions).
- **Outstanding Issues:** Placeholder 3D Kampala background environment.
- **Next Recommended Action:** Execute Milestone 1 once location visuals and assets are approved.
