# KIREKA MAIN MARKET — REVISED ENVIRONMENT BLUEPRINT, ASSET INTEGRATION & CONSTRUCTION SEQUENCE (2026-11-24)

> **Status:** DESIGN DRAFT FOR OWNER REVIEW. Gameplay preservation locked. **Construction is NOT yet approved.**

---

## 1. Preserved Gameplay Core (Unchanged Coordinates)

All existing working mechanics and player interactions remain anchored around `(0, 0, 0)`:
- **Stall Concrete Pad:** `X ∈ [-2.2, 2.2]`, `Z ∈ [-1.4, 1.1]`, `Y = 0..0.06`
- **4 Interactive Stations (`layer 1`):** `prep` (`x=-1.25`), `tava` (`x=-0.15`), `ingredients` (`x=0.68`), `serve` (`x=1.45`)
- **3 Customer Slots:** `Z = 1.55`, `X ∈ {-1.15, 0.0, +1.15}`; approach/exit path along sidewalk `Z = 2.15`, `X = ±6.5`
- **Camera Rig:** `overview`, `tava`, `prep`, `counter` presets + `OrbitControls` (`minAzimuthAngle: -0.45π`, `maxAzimuthAngle: +0.45π`, `minDistance: 1.5`, `maxDistance: 10.5`, `enablePan: false`).

---

## 2. Kireka Environment Spatial Blueprint

To make Kireka immediately recognizable on first glance from the `overview` camera `(0.4, 3.05, 5.15)` while preserving smooth mobile performance, the scene frames the Hero Rolex Stall along a **busy Kireka Market commercial street just off the Kampala–Jinja Highway**, with the **iconic Kireka meter-gauge railway reserve & market stalls** clearly visible in the mid-ground (`-Z`) and **Kireka Hill** rising in the far background:

```text
KIREKA MAIN MARKET & JINJA ROAD CORRIDOR — TOP-DOWN BLUEPRINT (Y = 0 Apron)
================================================================================
Z = -36m   [KIREKA HILL BACKDROP: Gentle hillside silhouette, trees & distant rooftops]
Z = -22m   [KIREKA MAIN MARKET HALL / ROOF CLUSTER: Sloped weathered mabati market sheds]
Z = -13.5m ==========[UGANDA RAILWAYS METER-GAUGE TRACK (East <-> West)]==========
            Crushed stone ballast + timber sleepers + steel rails (Kireka Halt zone)
            Trackside produce tables & market tarps stepping back from track reserve
           +----------------------+  |Market |  +------------------------------+
Z = -9.5m  | B1: 2-Story Kireka   |  |Access |  | B2: 3-Bay Commercial Strip   |
           | Shopping Block       |  |Lane   |  | - Wholesale Duka (Crates)    |
           | Hardware / Pharmacy  |  |(Murram|  | - Electronics / Salon        |
Z = -4.8m  +-[Covered Veranda]----+  |X=-5m) |  +-[Veranda + Cantilevered Tarp]+
           =====================================================================
Z = -3.0m  [Concrete Apron + Yellow Mobile Money Steel Kiosk (X=-3.4) + UMEME Poles]
--------------------------------------------------------------------------------
Z = -1.4m          +=======================================+
                   |    HERO PLAYER ROLEX STALL (Origin)   |  <-- Preserved
Z =  0.0m          |  [Prep] [Sigiri/Tava] [Ing] [Serve]   |      Gameplay
Z =  1.1m          +=======================================+      Core
Z =  1.55m            (Cust 0)    (Cust 1)    (Cust 2)
Z =  2.15m ========[Busy Kireka Sidewalk / Commuter Walkway]====================
Z =  2.75m --------[Open/Slotted Concrete Storm Drain (-0.42m) + Slab Bridges]--
Z =  3.35m --------[Red Murram Shoulder & Roadside Hawker Edge]-----------------
           =====================================================================
Z =  6.6m   PLAYABLE ROAD SEGMENT: KIREKA COMMERCIAL SERVICE ROAD / JINJA RD EDGE
            (6.5m wide 2-lane weathered bitumen + yellow/white faded center markings)
            -> Moving Boda Bodas, Matatu Minibus Taxis, Saloon Cars & Trucks
            -> Kireka Boda-Boda & Taxi Stage Corner (+X = +5.8..+10.5, Z = 3.5..4.4)
Z =  9.9m  ---------------------------------------------------------------------
Z = 11.2m  [Opposite Curb, Drain, UMEME Poles & Distant Highway Frontage Silhouettes]
================================================================================
X = -32m <-------------------- X = 0 (Stall) --------------------> X = +32m
```

### Key Architectural & Environmental Features Specific to Kireka
1. **Playable Road Segment (`Z = 3.35..9.9`):** A `6.5m`-wide weathered tarmac corridor representing the Kireka–Jinja Road commercial frontage / market feeder artery, with dusty red laterite shoulders, concrete drainage channel (`-0.42m` deep) + concrete slab crossovers, and a **Kireka Boda-Boda & Matatu Stage** on the eastern flank (`+X`).
2. **Market Access Lane (`X = -6.5..-3.8`, running `-Z`):** Compacted red *murram* market alley lined with produce stalls (tomatoes, cabbages, onions, *matooke* baskets under timber & colored tarp shades) leading directly into Kireka Main Market and across the railway line.
3. **Kireka Meter-Gauge Railway Reserve (`Z = -13.5m`):** Low-poly modular track bed (crushed gravel ballast strip, `InstancedMesh` wooden sleepers, and two steel rail beams) running East–West between the front commercial shop bays and the main market *mabati* sheds—creating an unmistakable Kireka identity without cluttering the foreground cooking area.
4. **Commercial Shopfronts & Kiosks (`Z = -4.8..-9.5`):** Modular 1–2 story plastered concrete buildings with covered verandas, steel roll-up shutters, bright MTN/Airtel/beverage co-branded fascia signage, stacked soda crates, plus a welded metal Mobile Money booth (`X = -3.4`) and **branded metal-frame umbrella** option beside the stall.
5. **Kireka Hill Backdrop (`Z = -24..-36`):** Rising terrain silhouette behind the market sheds with instanced shade trees and residential roofs, grounded into horizon fog (`FogExp2`).
6. **Lighting & Evening Rush Atmosphere:** Warm late-afternoon sun default + optional/shift-based **Kireka Evening Rush** mode (deep twilight sky, glowing tungsten stall bulb, charcoal *sigiri* embers, shopfront fluorescent spill, and moving boda/matatu headlights).

*(Open Verification Question for Owner: Confirm whether the playable foreground road represents the direct Jinja Road edge or the Kireka Market / Namugongo Rd feeder street immediately off Jinja Road once satellite & street photos are reviewed.)*

---

## 3. Asset Integration Plan (Adapted for Kireka)

*Builds upon verified repository inventory (`docs/research/2026-11-24-asset-inventory-and-integration-plan.md`): 0 external GLBs currently exist in `/public` or `/src`.*

| Asset Group | Source | Kireka Scene Assignment | Technical Target |
| :--- | :--- | :--- | :--- |
| **Road & Tarmac Models** *(to be supplied)* | Owner External GLBs | Playable Kireka highway/service road (`Z = 3.35..9.9`) & curb transitions | Draco GLB, `Y = 0.02`, tiled cleanly without Z-fighting |
| **Tomatoes, Purple Onions, Cabbage, Carrots** | Owner External GLBs | Hero Stall Station 3 bowls/crates **AND** Kireka Market produce tables along market lane (`InstancedMesh`) | `<600` tris/mesh, `Box3` normalized |
| **Egg Cartons, Knives, Graters, Pans, Pots, Stoves** | Owner External GLBs | Hero Stall Stations 1, 2, 3 (`StallBuilder.ts`); keep dishwashers deferred for Level 9–10 Bistro | Align pan/stove under `panSurfaceY = 0.236` |
| **Wooden Tables & Furniture** | Owner External GLBs | Customer waiting bench, market produce tables, neighboring shop veranda seating | Shared wood PBR material |
| **Rocks & Vegetation** | Owner External GLBs | Drain edge rocks, railway embankment, Kireka Hill backdrop trees | `InstancedMesh` with `±15%` scale & tint variation |
| **Kireka-Specific Modular Assets (Procedural / New GLBs)** | Built modularly in `src/engine/` or supplied | Meter-gauge rail track + sleepers, slotted concrete drain + bridges, 1–2 story shopfront bays, Mobile Money booth, UMEME poles + cables, boda bodas + matatu traffic | `<120–160` total scene draw calls; `isSoftwareGl` safe |

---

## 4. Phased Construction Sequence (Awaiting Approval Before Execution)

1. **Pre-Construction Gate (Current Step):** Review satellite + 4–8 Kireka photographs with project owner; receive external GLB/tarmac models; confirm playable road segment option.
2. **Phase 1 — Pipeline & District Scaffolding:** Upgrade `AssetManager.ts` (`DRACOLoader` + `Box3` normalization), create `EnvironmentMaterials.ts` & `DistrictManager.ts` (decoupling city world from `StallBuilder.ts`), fix `CustomerSystem.ts` per-frame `Vector3` allocations, update `PROGRESSION_TIERS` Level 1–2 label in `upgrades.ts` to `"Kireka Main Market, Kampala"` (only when authorized).
3. **Phase 2 — Kireka Ground, Road, Drainage & Railway Reserve:** Lay road/tarmac GLBs, concrete storm drain + slab bridges, market *murram* access lane, and meter-gauge railway track bed (`Z = -13.5m`) + Kireka Hill slope backdrop.
4. **Phase 3 — Kireka Buildings, Market Stalls & Signage:** Assemble front commercial strip, Mobile Money steel kiosk, Kireka Main Market *mabati* sheds, and procedural Nasser-Road signage textures.
5. **Phase 4 — Hero Stall External GLB Integration:** Swap owner's produce, egg cartons, knives, graters, pans, pots, stoves, and wooden tables into `StallBuilder.ts` while verifying all 4 station hitboxes and cooking state animations.
6. **Phase 5 — Street Life, UMEME Utilities & Evening Atmosphere:** Add instanced UMEME poles + overhead wires, `TrafficSystem.ts` (boda bodas, *matatus*, background market pedestrians), and warm afternoon / evening rush lighting.
7. **Phase 6 — Verification & Regression Testing:** Run `npm run lint` + `npm run build`, verify desktop GPU, mobile viewport, and `isSoftwareGl` rendering, verify `rolex_empire_save_v1` persistence, routes, and AdSense separation.
