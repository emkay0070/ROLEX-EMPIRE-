# ROLEX EMPIRE — PROJECT CHANGELOG

All notable planning, research, architecture, asset, and code changes for **ROLEX EMPIRE** (`emkay0070/ROLEX-EMPIRE-` / `https://rolex-empire.vercel.app`) are recorded here chronologically.

> **Policy:** Do not erase or rewrite historical entries. Always append or prepend dated entries with clear status, files affected, testing performed, and next recommended action.

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
