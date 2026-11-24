# ROLEX EMPIRE — MASTER PROJECT DOCUMENT

> **MANDATORY INSTRUCTION FOR EVERY NEW AI AGENT:**
> **EVERY NEW AI AGENT MUST READ `docs/ROLEX_EMPIRE_MASTER.md` BEFORE MAKING CHANGES.**
>
> Before modifying any code, configuration, or assets, every AI agent must also:
> 1. Read the latest entries in `docs/PROJECT_CHANGELOG.md`.
> 2. Inspect relevant existing source code before proposing or making edits.
> 3. Confirm the current active milestone and approved scope (do not jump ahead to deferred milestones).
> 4. Preserve all completed work, gameplay mechanics, routes, saves, and deployment/AdSense configurations.
> 5. Avoid repeating research already documented in `docs/research/` and `docs/milestones/`.
> 6. Never invent implementation status, fabricated photo/satellite inspections, or claim untested features work.
> 7. Update `docs/ROLEX_EMPIRE_MASTER.md` and `docs/PROJECT_CHANGELOG.md` after any significant change.
> 8. Preserve historical milestone snapshots in `docs/milestones/` and original research in `docs/research/`.
> 9. Clearly report what was changed, what was tested, and any remaining limitations before handing work over.

---

## 1. Project Identity, Purpose & Long-Term Vision

- **Project Name:** ROLEX EMPIRE
- **Genre:** 3D Browser-Based Ugandan Street-Food Cooking & Business Simulation
- **Live URL:** https://rolex-empire.vercel.app
- **Repository:** `emkay0070/ROLEX-EMPIRE-` (GitHub, branch `main`)
- **Latest Verified Baseline Commit:** `a57f21a144add0b9f52631481269a9c87279415e` (`chore: add public/ads.txt and google-adsense-account meta tag`) · Local Git checkpoint tag: `checkpoint-2026-11-24-pre-kireka`
- **Author / Contact:** `eoxystudio@gmail.com`
- **Purpose:** Put authentic East African / Ugandan roadside culinary craft center stage—translating the real workflow of grilling chapati on a cast-iron *tava*, whisking farm eggs with *katungulu* (red onion), *nyanya* (tomato), and *emboga* (cabbage), and rolling hot *Rolex* in brown kraft paper into an accessible desktop and mobile browser game.
- **Long-Term Vision:** Anchor the opening 3D world in **Kireka, Uganda (Kireka Main Market & surrounding commercial street environment along the Kampala–Jinja Highway corridor, Kira Municipality, Wakiso District)**, and evolve into an expandable multi-district Ugandan street-food simulation backed by structured local persistence (IndexedDB) and an owner operations dashboard.

---

## 2. Game Concept, Gameplay Loop & Business Progression

### Core Gameplay Loop (`src/components/GameView.tsx`)
Players run 60-second roadside shifts (`SHIFT_DURATION_SEC = 60`):
1. **Customer Arrival:** Ugandan customer archetypes spawn into up to 3 counter slots (`x ∈ {-1.15, 0, +1.15}, z = 1.55`) with a requested recipe, egg count, fillings, and patience timer.
2. **Step 1 — Grill Chapati (`chapati_grilling` -> `chapati_ready`):** Click station (`prep` or `tava`), HUD button, or `Space`. Lift in the golden sweet spot (`58%–86%`, widened by `heavy_tava` upgrade).
3. **Step 2 — Crack Eggs & Mix Fillings (`mixing_eggs`):** Crack 1–3 eggs and toggle ingredients matching the ticket (`onion`, `tomato`, `cabbage`, plus level-unlocked `pepper`, `beef`, `avocado`).
4. **Step 3 — Fry Omelette & Combine (`frying_omelette` -> `rolling`):** Pour onto hot *tava*, press chapati on top in golden zone (`62%–88%`, widened by `heavy_tava`).
5. **Step 4 — Roll & Serve (`rolling` -> `ready_to_serve`):** Tap Roll (`Space` or HUD) 3 times to wrap in kraft paper, then click the customer ticket or the 3D customer mesh to serve and earn UGX + tips + XP.

### Recipes (`src/data/recipes.ts`)
- `classic_rolex` (2 eggs, onion, tomato, cabbage — 3,000 UGX, Lvl 1)
- `single_quick` (1 egg, onion, tomato — 2,000 UGX, Lvl 1)
- `double_egg_special` (2 eggs, onion, tomato, cabbage, pepper — 4,000 UGX, Lvl 2)
- `beef_rolex` (2 eggs, beef, onion, tomato — 5,500 UGX, Lvl 3)
- `avocado_green` (2 eggs, avocado, tomato, cabbage, pepper — 6,000 UGX, Lvl 4)
- `empire_supreme` (3 eggs, beef, avocado, onion, tomato, pepper — 8,500 UGX, Lvl 6)

### Business Upgrades (`src/data/upgrades.ts`)
- `heavy_tava` (max rank 3) — cook speed & wider sweet spot
- `gas_sigiri` (max rank 2, Lvl 2+) — dual-ring blue burner visual + cook speed
- `prep_crate` (max rank 3) — unlocks level-3 ingredients early + tip multiplier
- `signboard` (max rank 3) — +15% base Rolex price per rank
- `hire_juma` (max rank 1, Lvl 2+) — reveals Assistant Chef Juma NPC + auto pre-grills chapati to 22% + +20% patience
- `canopy_expand` (max rank 2, Lvl 3+) — reveals kitenge canopy awning + +25% customer patience

### Current Codebase Progression Roadmap (`src/data/upgrades.ts`)
- *Implemented in code:* Levels 1–2 now display `"Kireka, Jinja Road, Kampala"` in `PROGRESSION_TIERS`; Levels 3–10 progress through Wandegeya, Ntinda, Nakasero, Acacia Avenue, and Kampala Flagship Bistro.

---

## 3. Current Technical Stack & Architecture

- **Frontend:** React `19.0.1`, TypeScript (`~7.0.2`), Tailwind CSS v4 (`@tailwindcss/vite` `4.3.3`), `lucide-react` `0.546.0`, `motion` `12.23.24`.
- **3D Rendering:** Three.js `0.187.0` (`WebGLRenderer`, `ACESFilmicToneMapping`, `SRGBColorSpace`, `PCFSoftShadowMap`, `OrbitControls`, `RoomEnvironment` + `PMREMGenerator`, `GLTFLoader`).
- **Build & Tooling:** Vite `8.3.0`, `npm run lint` (`tsc --noEmit`), `npm run build` (`vite build`).
- **Audio:** 100% procedural Web Audio API (`src/engine/AudioSystem.ts`) — zero external audio files.
- **Persistence:** Dual-layer **IndexedDB (`rolex_empire_db`, v1: `profile`, `shift_history`, `order_ledger`, `upgrade_log`)** + `localStorage` (`rolex_empire_save_v1`) mirror & zero-loss migration (`src/engine/IndexedDbStore.ts`, `src/engine/SaveSystem.ts`).
- **Hosting:** Vercel static SPA (`vercel.json`) with client-side route rewrites to `/index.html`.
- **Note:** `@google/genai`, `express`, and `tsx` exist in `package.json`, though Version 1.0 currently runs as a pure client-side Vite SPA.

---

## 4. Existing Game Systems & How They Work

| System | Source File | Status | Behavior Summary |
| :--- | :--- | :--- | :--- |
| **3D Scene & Loop** | `src/engine/RolexGameEngine.ts` | Implemented & Compiled | Mounts WebGL canvas in `GameView`'s `canvasMountRef`; detects software WebGL (`SwiftShader`/`llvmpipe`/`softpipe`); orchestrates `DistrictManager`, `TrafficSystem`, `StallBuilder`, `CustomerSystem`, `RoomEnvironment` PMREM reflections, camera damping, `raycaster` on layer `1`, stove embers/steam, and clean GPU disposal. |
| **Kireka District** | `src/engine/DistrictManager.ts` | Implemented & Compiled | Builds Kireka Trading Centre facing Kampala–Jinja Highway (`Z = +3.25..+9.15`), interlocking concrete paver sidewalk, lined concrete storm drain + crossover slabs, Kireka Boda & Matatu Stage, Mobile Money steel kiosk, Kireka Market Access Lane + produce stalls, 1–2 story Kireka commercial shopfronts, Uganda Railways meter-gauge line (`InstancedMesh` sleepers), Kireka Main Market *mabati* sheds, sculpted Kireka Hill backdrop, and instanced UMEME poles/cables/trees. |
| **Street Traffic** | `src/engine/TrafficSystem.ts` | Implemented & Compiled | Pooled, zero-allocation moving boda bodas (with riders), white/blue-band Kampala *matatu* taxis, saloon cars along Jinja Road, and background pedestrians along shop verandas, far highway verge, and market lane. |
| **Shared PBR Mats** | `src/engine/EnvironmentMaterials.ts` | Implemented & Compiled | Central reusable PBR material library (`lateriteSoil`, `jinjaHighway`, `paverWalkway`, `mabati` variants, painted plasters, steel, glass, warm shop interior emissives, vehicle trims) minimizing shader duplication. |
| **Procedural Textures** | `src/engine/ProceduralTextures.ts` | Implemented & Compiled | Generates 19 `CanvasTexture`s including Kampala–Jinja Highway worn asphalt, interlocking pavers, Kireka commercial shopfront signs (`Hardware`, `Wholesale Duka`, `Tech & Salon`, `Mobile Money`, `Kireka Main Market`), soft smoke sprite, and stall textures. |
| **Hero Rolex Stall** | `src/engine/StallBuilder.ts` | Implemented & Compiled | Focused strictly on the playable hero stall at `(0,0,0)`: concrete pad, timber posts, *mabati* roof, signboard, tungsten bulb, 4 exact raycast stations (`prep`, `tava`, `ingredients`, `serve`), Chef Juma, canopy + stools upgrade, 20L yellow oil jerrycan, soda crates, charcoal sack, and soft steam particles. |
| **Asset Loader** | `src/engine/AssetManager.ts`, `public/assets/models/manifest.json` | Implemented & Compiled | Fetches `public/assets/models/manifest.json` at init, supports `GLTFLoader` + `DRACOLoader` + `Box3` `normalizeAndGround()` (`targetHeight`, `targetMaxDim`, `rotationDeg`, `offset`), tracks/disposes cached meshes and textures, and wires 44 modular asset slots across 10 subfolders (`food/`, `ingredients/`, `kitchen/`, `furniture/`, `props/`, `roads/`, `vegetation/`, `buildings/`, `vehicles/`, `characters/`) with zero-404 procedural fallbacks. |
| **Customer System** | `src/engine/CustomerSystem.ts` | Implemented & Compiled | 5 personalities, shared geometries/materials, zero-allocation per-frame `updateCustomerVisuals()`, raycast hitbox on layer `1`. |
| **Audio Engine** | `src/engine/AudioSystem.ts` | Implemented & Verified | Procedural sizzle, egg crack, chop, roll, cash chime, customer arrive, angry leave. |
| **Simulation & HUD** | `src/components/GameView.tsx`, `GameHUD.tsx`, `ShopModal.tsx`, `ShiftSummaryModal.tsx` | Implemented & Verified | 50ms deterministic interval loop decoupled from React state updaters via refs; keyboard shortcuts (`Space`, `H`, `Esc`); collapsible bottom dock; shop & shift summary modals. |

---

## 5. Existing Routes, Screens, Camera Systems & Interactions

- **Routes (`src/App.tsx`, `src/components/SiteLayout.tsx`):** `/` (Home), `/play` (3D Viewport), `/owner` (Private Owner's Ledger Dashboard — lazy-loaded, AdSense-free), `/how-to-play`, `/about`, `/privacy-policy`, `/contact`.
- **Camera Presets (`CAMERA_PRESETS` in `RolexGameEngine.ts`):**
  - `overview`: pos `(0.42, 3.32, 6.45)`, target `(0, 1.05, 0.35)` (frames the hero stall, sidewalk, storm drain, Jinja Road foreground traffic, commercial shopfronts, railway reserve, market sheds, and Kireka Hill)
  - `tava`: pos `(-0.15, 2.05, 1.42)`, target `(-0.15, 1.15, 0.02)`
  - `prep`: pos `(-1.18, 2.0, 1.55)`, target `(-1.18, 1.05, 0.05)`
  - `counter`: pos `(1.15, 2.15, 2.35)`, target `(0.65, 1.05, 0.45)`
  - `OrbitControls`: `enablePan = false`, `minDistance = 1.5`, `maxDistance = 13.5`, `minPolarAngle = 0.25`, `maxPolarAngle = 0.47π`, `minAzimuthAngle = -0.45π`, `maxAzimuthAngle = +0.45π`. Smooth exponential damping (`lambda = 6.5`), cancelled on user drag `'start'`.

---

## 6. Existing Save & Persistence Implementation

- **Modules:** `src/engine/IndexedDbStore.ts` + `src/engine/SaveSystem.ts` (`rolex_empire_db` v1 + `window.localStorage` mirror `rolex_empire_save_v1`).
- **IndexedDB Object Stores (`rolex_empire_db`):**
  - `profile`: stores `'active_save'` (`SaveData`, `schemaVersion`, `updatedAt`, `migratedFromLocalStorage`).
  - `shift_history`: stores per-shift `ShiftRecord` entries (`by_timestamp`, `by_shift` indexes).
  - `order_ledger`: stores every served/missed `OrderLedgerRecord` (`by_timestamp`, `by_recipe` indexes).
  - `upgrade_log`: stores `UpgradePurchaseRecord` purchases (`by_timestamp` index).
- **Schema (`SaveData`):** `cashUgx` (default `5000`), `totalLifetimeUgx`, `xp`, `level`, `shiftCount`, `ordersCompletedTotal`, `satisfactionRating` (`88`), `upgrades`, `employeeHired`, `bestShiftProfitUgx`, `soundMuted`.
- **Migration, Race Protection & Backup (`src/engine/SaveSystem.ts`):** `hydrateSaveDataAsync()` runs on `HomePage`, `GameView`, and `OwnerDashboardPage` mount, automatically migrates legacy `rolex_empire_save_v1` data into IndexedDB with zero loss, picks the higher-progress snapshot if both exist, and serializes writes/resets via `writeQueue`. `exportCareerArchive()` and `importCareerArchive(rawJson)` provide full JSON backup/restore across `profile`, `shift_history`, `order_ledger`, and `upgrade_log`.

---

## 7. GitHub, Google AI Studio & Vercel Deployment Workflow

- **Repository:** `emkay0070/ROLEX-EMPIRE-` (`main` branch). Do NOT create another repository.
- **Checkpoint Recorded:** `a57f21a144add0b9f52631481269a9c87279415e` (tagged locally as `checkpoint-2026-11-24-pre-kireka`).
- **Vercel Config (`vercel.json`):** Vite build -> `dist`, SPA rewrite to `/index.html`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`.
- **SEO & Crawling:** `public/robots.txt`, `public/sitemap.xml`, OpenGraph/Twitter/JSON-LD `VideoGame` schema in `index.html`.

---

## 8. AdSense Integration, Publisher Configuration & `ads.txt` Protection

- **Publisher Account:** `ca-pub-8832384771899504` (`google-adsense-account` meta tag + async `adsbygoogle.js` in `index.html`).
- **`public/ads.txt`:** `google.com, pub-8832384771899504, DIRECT, f08c47fec0942fa0`.
- **`src/components/AdBannerSlot.tsx`:** Renders strictly on informational pages (`HomePage`, `HowToPlayPage`, `AboutPage`) when `VITE_ADSENSE_CLIENT` & slot IDs are set. Never alter or move ads onto `/play`.

---

## 9. Asset Inventory Summary (Existing vs. External / Missing)

*Detailed audit in `docs/research/2026-11-24-asset-inventory-and-integration-plan.md` & `docs/research/2026-11-24-kireka-revised-environment-blueprint.md`.*

- **Verified Repository State (2026-11-24):** `public/assets/models/` directory is now initialized with 10 category subfolders, `public/assets/models/README.md`, and `public/assets/models/manifest.json` registering 44 drop-in `.glb` slots (currently `enabled: false` with procedural fallbacks until `.glb` files are dropped in).
- **External Assets Collected by Owner (Ready for Drop-In):** Produce, egg cartons, knives, graters, pans, pots, stoves, dishwashers (deferred to Level 9–10 Bistro), wooden tables/furniture, rocks, vegetation, and road/tarmac GLBs can now be dropped directly into `public/assets/models/<folder>/`, activated with `"enabled": true` in `public/assets/models/manifest.json`, and inspected in `/owner` -> **3D Models**.

---

## 10. Environment Design Vision & District Expansion Plans

- **APPROVED OFFICIAL STARTING LOCATION (Updated 2026-11-24):**
  **Kireka Main Market and its surrounding commercial street environment, along the Kampala–Jinja Highway corridor, Kira Municipality, Wakiso District, Uganda.**
  - **CRITICAL GEOGRAPHICAL RULE:** Use the **established Kireka township around Jinja Road** (Kampala–Jinja Highway, Kireka–Namugongo Road, Kamuli Road, Kireka Main Market / railway halt `8MW2+M25`, Kireka Shopping Centre, and Kireka Hill / Central Uganda Conference landmark). **Do NOT substitute or confuse this with the "Kireka-Bbira growth centre along Sentema Road"** from the Wakiso 2026 Sentema report.
- **District Expansion Architecture:**
  - `DistrictManager` architecture separating the Hero Rolex Stall `(0,0,0)` from swappable district environments (`kireka_market` -> `wandegeya` -> `ntinda` -> `nakasero` -> `acacia`) with clean GPU disposal on district switch.

---

## 11. Confirmed Technical Decisions & Development Roadmap

### Approved Roadmap Sequence
1. **MILESTONE 1 — Kireka Environment Reconstruction (COMMITTED & PUSHED `d767b3e` — Browser Visual Inspection Pending):**
   - Modular 3D Construction (`DistrictManager`, `EnvironmentMaterials`, `TrafficSystem`, `AssetManager` Draco/Box3, `ProceduralTextures`, `StallBuilder`, `RolexGameEngine`, `upgrades.ts` Kireka labels) -> `tsc --noEmit` & `vite build` passed -> pushed to `origin/main`.
2. **MILESTONE 2 — IndexedDB Local Persistence (COMMITTED & PUSHED `1c5e96a`):**
   - Structured `rolex_empire_db` (`profile`, `shift_history`, `order_ledger`, `upgrade_log`) cleanly migrating `rolex_empire_save_v1` with zero data loss and wired into `GameView.tsx` & `HomePage.tsx`.
3. **MILESTONE 3 — Private Owner's Dashboard (`/owner`) (IMPLEMENTED & VERIFIED):**
   - Lazy-loaded standalone workspace (`src/pages/OwnerDashboardPage.tsx`) backed strictly by `rolex_empire_db` (`Overview`, `Shifts`, `Orders`, `Data & Upgrades`), featuring KPI analytics, 10-shift profit chart, recipe & customer mix tables, searchable shift/order filters, CSV accounting export, JSON backup export/restore, confirmed reset, and zero AdSense ads.
4. **EXPLICITLY DEFERRED — Supabase & Cloud Features:**
   - Supabase, authentication, RLS, cloud saves, and cloud synchronization remain deferred until explicitly authorized.

---

## 12. Completed Milestones

| Date | Milestone / Task | Summary |
| :--- | :--- | :--- |
| Pre-2026-11-24 | **Version 1.0 Public Launch** | Live playable 3D Rolex business simulation at `https://rolex-empire.vercel.app` (baseline commit `a57f21a144add0b9f52631481269a9c87279415e`). |
| 2026-11-24 | **Preliminary Makerere Kivulu Audit & Continuity Docs** | Established `docs/` structure, archived preliminary Kivulu research (now superseded as starting location). |
| 2026-11-24 | **Kireka Location Pivot, Research & Checkpoint** | Recorded git checkpoint `a57f21a144add0b9f52631481269a9c87279415e` (`checkpoint-2026-11-24-pre-kireka`), completed Kireka geographical/railway/market research, produced Kireka Revised Blueprint & Asset Integration Plan. |
| 2026-11-24 | **Milestone 1 — Kireka 3D Environment Implementation** | Built `DistrictManager.ts`, `EnvironmentMaterials.ts`, and `TrafficSystem.ts`; upgraded `AssetManager.ts`, `ProceduralTextures.ts`, `StallBuilder.ts`, `CustomerSystem.ts`, `RolexGameEngine.ts`, and `upgrades.ts`. Committed & pushed as `d767b3e`. |
| 2026-11-24 | **Milestone 2 — IndexedDB Local Persistence** | Created `IndexedDbStore.ts` (`rolex_empire_db` v1 with 4 object stores), upgraded `SaveSystem.ts` with automatic `rolex_empire_save_v1` migration & write queue, added ledger types in `types/game.ts`, and wired `GameView.tsx` & `HomePage.tsx`. Committed & pushed as `1c5e96a`. |
| 2026-11-24 | **Milestone 3 — Private Owner's Dashboard (`/owner`)** | Built `OwnerDashboardPage.tsx` (`Overview`, `Shifts`, `Orders`, `Data & Upgrades`), added `CareerArchivePayload` + `exportCareerArchive`/`importCareerArchive` in `SaveSystem.ts`, added `/owner` routing in `App.tsx`, and added navigation entry points in `HomePage.tsx` and `SiteLayout.tsx` footer. |

---

## 13. Current Development Status

- **Implemented & Pushed (`d767b3e`):** Milestone 1 Kireka 3D environment (`DistrictManager`, `TrafficSystem`, `EnvironmentMaterials`, `AssetManager`, `ProceduralTextures`, `StallBuilder`, `RolexGameEngine`, `upgrades.ts`).
- **Implemented & Pushed (`1c5e96a`):** Milestone 2 structured IndexedDB persistence (`IndexedDbStore.ts`, `SaveSystem.ts`, `GameView.tsx`, `HomePage.tsx`, `types/game.ts`).
- **Implemented & Pushed (`06148ca`):** Milestone 3 Private Owner's Dashboard at `/owner` (`OwnerDashboardPage.tsx`, `SaveSystem.ts`, `App.tsx`, `HomePage.tsx`, `SiteLayout.tsx`).
- **Implemented & Compiled (Models Directory & GLB Pipeline):** Initialized `public/assets/models/` (10 subfolders, `manifest.json`, `README.md`), upgraded `AssetManager.ts` with `manifest.json` + `rotationDeg`/`offset`/`targetMaxDim`, fixed `StallBuilder.ts` prep-station hitbox isolation & wired all kitchen/ingredient/furniture/prop slots, added GLB overrides in `DistrictManager.ts` + `TrafficSystem.ts`, and added the live **3D Models** directory view in `OwnerDashboardPage.tsx`.
- **Deferred:** Supabase, authentication, RLS, cloud sync (explicitly out of scope unless requested later).

---

## 14. Current Priority & Immediate Next Tasks

1. Drop collected `.glb` files into `public/assets/models/<folder>/`, set `"enabled": true` in `public/assets/models/manifest.json`, and inspect them on `/play` and `/owner` -> **3D Models**.
2. Fine-tune `targetHeight` / `targetMaxDim`, `rotationDeg`, or `offset` in `public/assets/models/manifest.json` per imported model if any asset needs orientation or scale adjustment.
3. Keep Supabase / cloud synchronization deferred until explicitly authorized by the project owner.

---

## 15. Deferred Features & Explicitly Out-of-Scope Work

- Supabase / Auth / RLS / Cloud Sync (Explicitly Deferred).
- Modifying gameplay mechanics, HUD layout, `vercel.json`, `public/ads.txt`, or AdSense configuration.

---

## 16. Known Problems, Limitations & Unresolved Questions

1. **Headless Browser Verification Limitation in Sandbox:** The build container has no `chromium`/`google-chrome` binary, so `npm run lint` (`tsc --noEmit`) and `npm run build` (`vite build`) succeeded, while live WebGL screenshot capture & interactive browser testing should be verified on a local machine or Vercel preview.
2. **External GLB Assets:** All 39 `AssetManager` IDs currently resolve to lightweight modular procedural `THREE.Group` / `InstancedMesh` placeholders until external `.glb` files are added to `/public/assets/models/` and bound via `registerGlbAsset()`.

---

## 17. Protected Files & Systems (Do Not Modify Without Explicit Authorization)

- `src/components/GameView.tsx`, `GameHUD.tsx`, `ShopModal.tsx`, `ShiftSummaryModal.tsx`
- `src/data/recipes.ts`
- `src/engine/SaveSystem.ts` (`rolex_empire_save_v1`)
- `src/App.tsx`, `src/components/SiteLayout.tsx`, `src/pages/*`
- `src/components/AdBannerSlot.tsx`, `public/ads.txt`, `index.html` AdSense & SEO tags
- `vercel.json`, `package.json`, `.env.example`
