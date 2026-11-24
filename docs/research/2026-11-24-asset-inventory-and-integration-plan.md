# ROLEX EMPIRE — VERIFIED ASSET INVENTORY & INTEGRATION SPECIFICATION (2026-11-24)

## 1. Verified Current Repository Asset State

Full workspace inspection (`/`, `/public`, `/src`) confirms:
- **External 3D Models (`.glb` / `.gltf` / `.obj` / `.fbx`):** **0 files** currently in the repository.
- **External Textures / Images (`.png` / `.jpg` / `.webp` / `.ktx2`):** **0 files** in `/src` or `/public` (only `/public/favicon.svg`).
- **External Audio Files (`.mp3` / `.wav` / `.ogg`):** **0 files** (100% procedural Web Audio API in `src/engine/AudioSystem.ts`).
- **Active 3D Pipeline:** `src/engine/AssetManager.ts` pre-registers **24 asset IDs** across 7 categories (`food`, `ingredients`, `equipment`, `furniture`, `characters`, `buildings`, `environment`). All 24 currently resolve via `proceduralFallback` inside `StallBuilder.ts` and `CustomerSystem.ts`.

---

## 2. Existing Procedural Asset Audit

| ID / Symbol | Type / Format | Category | Location | Current Use | Milestone 1 Action |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `lateriteSoil` | `CanvasTexture` (512²) | `textures` / `environment` | `ProceduralTextures.ts` | Ground plane (`140×140`) | **Keep & Enhance** (tile across valley/lane; add subtle tonal patches) |
| `kampalaTarmac` | `CanvasTexture` (512²) | `textures` / `roads` | `ProceduralTextures.ts` | Single road strip (`100×5.2`) | **Supplement / Replace** with owner's road/tarmac GLBs |
| `mabatiRoof` | `CanvasTexture` (512²) | `textures` / `materials` | `ProceduralTextures.ts` | Stall & shop roofs/backwall | **Enhance** (add rust/painted variants for Kivulu & shops) |
| `woodCounter`, `castIronTava` | `CanvasTexture` (512²) | `textures` / `materials` | `ProceduralTextures.ts` | Timber counter & pan | **Keep** |
| `menuBoard`, `ugandaSignBanner`, `kitengePattern` | `CanvasTexture` | `textures` / `props` | `ProceduralTextures.ts` | Menu easel, banner, apron/awning | **Keep & Expand** (add Kampala *duka*/Mobile Money signage textures) |
| `chapatiSurface`, `omeletteSurface`, `contactShadow` | `CanvasTexture` (256²) | `textures` / `food` | `ProceduralTextures.ts` | Cooking pan states & grounding | **Keep** (add soft smoke particle sprite) |
| `food_chapati_*`, `food_omelette`, `food_rolex_rolled` | Procedural Mesh/Group | `food` | `StallBuilder.ts` | Live cooking state morphs | **Keep procedural state meshes** (so color/scale cook feedback stays exact) |
| `ing_*_bowl` (6 bowls), `ing_egg_tray` | Procedural Group | `ingredients` | `StallBuilder.ts` | Counter bowls & 3×3 egg tray | **Supplement/Replace** bowls' produce contents & egg carton with owner GLBs |
| `equip_sigiri_stove`, `equip_tava_pan`, `equip_rolling_pin`, `equip_serving_tray` | Procedural Group | `equipment` / `kitchen` | `StallBuilder.ts` | 4 interactive stations | **Supplement carefully** (preserve invisible hitboxes & `panSurfaceY` alignment) |
| `furn_kiosk_frame`, `furn_waiting_bench`, `furn_menu_board` | Procedural Group | `furniture` | `StallBuilder.ts` | Stall structure, bench, easel | **Supplement** bench/tables with owner wooden furniture GLBs |
| `char_customer`, `char_assistant_juma` | Procedural Group | `characters` | `CustomerSystem.ts`, `StallBuilder.ts` | 5 customer types + Chef Juma | **Keep & Optimize** (remove per-frame `Vector3` allocs; add market bag/vest detail) |
| `bldg_kampala_shopfront` | Procedural Boxes | `buildings` | `StallBuilder.ts` | 3 placeholder boxes | **Replace** with modular Kivulu commercial + inner-settlement bays |
| `env_acacia_tree` | Procedural Spheres | `vegetation` | `StallBuilder.ts` | 4 placeholder trees | **Replace/Supplement** with owner vegetation GLBs via `InstancedMesh` |
| `env_boda_motorbike` | Procedural 8-part Group | `vehicles` | `StallBuilder.ts` | 1 static parked boda | **Enhance & Pool** (add headlights/kickstand/rider for boda stage & traffic) |
| Web Audio Synth | Web Audio API | `audio` | `AudioSystem.ts` | Cooking & UI SFX | **Keep** (zero-404 guaranteed) |

---

## 3. External Assets Collected by Project Owner — Integration Specification

*(These assets have NOT yet been added to the repo and must NOT be assumed present until supplied and verified.)*

| External Asset Group | Expected Format | Intended In-Game Use | Proposed Project Location | Target Scale & Poly Budget | Texture Requirements | Performance Implications | Strategy (Replace vs. Supplement) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Tomatoes, Purple Onions, Cabbage, Carrots** | `.glb` / `.gltf` (Draco preferred) | Populate Station 3 bowls & Station 1 prep display crate | `public/assets/models/food/` (or `ingredients/`) | `0.06m–0.18m` normalized; `< 400–800` tris each | Shared 256²–512² sRGB albedo + roughness | Instance repeated produce (`InstancedMesh`) if >10 visible | **Supplement** bowls/prep display; keep Station 3 hitbox unchanged |
| **Egg Cartons** | `.glb` / `.gltf` | Replace/upgrade 3×3 `eggCrate` on Station 3 & spare shelf stack | `public/assets/models/kitchen/` | `~0.30m × 0.22m`; `< 1,200` tris | 512² cardboard + egg albedo | Low (1–3 instances) | **Replace** procedural `eggCrate` mesh inside `ingGroup` |
| **Knives & Graters** | `.glb` / `.gltf` | Prep props on Station 1 board & Station 3 | `public/assets/models/kitchen/` | `0.22m–0.32m`; `< 600` tris | Metallic PBR (`metalness 0.85, roughness 0.25`) | Negligible (static, 1–2 meshes) | **Supplement** Station 1 (`prepGroup`) for close-up realism |
| **Pans, Pots & Stoves** | `.glb` / `.gltf` | Upgrade Station 2 *sigiri*/*tava* housing + background boiling pot prop | `public/assets/models/kitchen/` | Match `tavaPan` radius `0.37m` & `panSurfaceY = 0.236`; `< 2,000` tris | Cast-iron/steel PBR + normal/roughness | Low; must align cleanly under `panChapati`/`panOmelette` | **Supplement / Careful Replace** visual shell while keeping gameplay pan planes |
| **Dishwashers & Heavy Kitchen Equipment** | `.glb` / `.gltf` | **Reserved for Level 9–10 Bistro tier** (not Level 1 Kivulu roadside stall) | `public/assets/models/kitchen/` | Real-world `~0.6m × 0.85m`; `< 2,500` tris | 512² stainless PBR | Do **not** load in Level 1 Kivulu district to save RAM | **Defer** to higher-tier district manifest |
| **Wooden Tables & Customer Furniture** | `.glb` / `.gltf` | Customer waiting area & neighboring *duka* veranda seating | `public/assets/models/props/` (or `furniture/`) | Seat height `0.45m`, table `0.75m`; `< 1,200` tris | 512² weathered wood albedo | Share material / instance if repeated across shops | **Replace** procedural `bench` & dress neighboring verandas |
| **Rocks & Vegetation** | `.glb` / `.gltf` | Murram road shoulders, drain edge, Makerere Hill backdrop | `public/assets/models/vegetation/` & `environment/` | Rocks `0.2–0.8m` (`<300` tris); Trees `3–7m` (`<1,800` tris) | 512² bark/foliage (alphaTest `0.5`, avoid heavy alpha blend) | **Must use `InstancedMesh`** with `±15%` scale & `setColorAt` tint | **Replace** placeholder sphere-puff trees & dress slopes |
| **Road & Tarmac Models** *(to be supplied)* | `.glb` / `.gltf` | Main Kivulu Corner 2-lane road, junctions & curbs | `public/assets/models/roads/` | Modular `10m–20m` straight/corner tiles at `Y = 0.02`; `< 1,500` tris/tile | 1024² weathered asphalt + `anisotropy` | Tile via `InstancedMesh` or merged static chunk; avoid Z-fighting (`Y >= 0.02`) | **Replace** procedural `tarmac` plane in `buildKampalaEnvironment()` |

---

## 4. Proposed Asset Directory Structure (Target for Milestone 1 Construction)

```text
public/assets/
  districts/kivulu/district.manifest.json
  models/
    buildings/
    characters/
    environment/
    food/
    kitchen/
    props/
    roads/
    vegetation/
    vehicles/
  textures/
  materials/
docs/references/          # Optional owner reference photos (kept out of public/ prod deploy)
```

*No existing files in `src/` or `public/` were moved, renamed, or deleted during this documentation pass.*
