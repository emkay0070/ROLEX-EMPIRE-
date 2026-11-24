# MAKERERE KIVULU CORNER — REVISED ENVIRONMENT BLUEPRINT (2026-11-24)

## 1. Comparison: Preliminary Blueprint vs. Expanded Visual & Geographic Research

| Element from Preliminary Blueprint | Status After Research | Assessment & Required Revision |
| :--- | :--- | :--- |
| **Hero Stall at `(0,0,0)` + 4 station hitboxes + 3 customer slots (`z=1.55`) + `CAMERA_PRESETS`** | **CONFIRMED & LOCKED** | Must remain untouched so all cooking mechanics, raycasting, and camera presets work identically. |
| **Flat `Y = 0` terrain (`140×140`) with distant flat tree ridge** | **INACCURATE / UNSUPPORTED** | Research confirms Makerere Kivulu sits in the **valley/slope directly below Makerere Hill** (with natural springs/drainage sloping down toward Bat Valley/Nakivubo). **Revision:** Keep the playable corner apron flat at `Y = 0` for clean physics/grounding, but add a **graduated Makerere Hill terrain slope rising in the `-Z / -X` background (`Y = +0.5m to +8.5m` from `Z = -14m` to `-40m`)** with hillside campus/residential silhouettes! |
| **Background buildings as painted commercial strips (`X = -9.5` and `X = +5.2`)** | **BROADLY REPRESENTATIVE (NEEDS LAYERING)** | Arterial edges (Makerere Hill Rd / Gaddafi Rd / Bombo Rd) indeed have 1–3 story commercial strips, **but inner Kivulu (`-Z` behind the main road strip) consists of densely packed single-story weathered red bricks, unpainted concrete blocks, and rusted *mabati* roofs weighed down with stones/tires.** **Revision:** Layer commercial strips in front (`Z = -5.5m`) and authentic inner-Kivulu brick/block dwellings stepping up the gentle slope behind (`Z = -13m to -24m`). |
| **Open/slotted concrete drainage channel (`Z = 2.55..3.15`) + crossover slabs** | **CONFIRMED** | Strongly supported by KCCA road & Kivulu drainage documentation. Add realistic dark silt/damp sheen at drain bottom (`-0.42m`) plus a **connecting open feeder trench** running down the Kivulu murram side-lane (`X = -5.5m`). |
| **Unpaved red laterite (*murram*) side-lane (`X = -6.8..-3.8`)** | **CONFIRMED** | Matches Kivulu's narrow winding access lanes intersecting paved arterial edges. Add slight downward/upward grade into the settlement. |
| **UMEME poles + overhead cables (`Z = -2.0` & `Z = +9.8`)** | **CONFIRMED (ENHANCE DENSITY)** | Research highlights dense, crisscrossing overhead power and telecom wires on aging poles. **Revision:** Keep main road cables high (`Y ≥ 5.2m`) to avoid camera obstruction, and add secondary feeder drops to shopfronts & the Mobile Money kiosk. |
| **Mobile Money Steel Kiosk + Branded Umbrella** | **CONFIRMED** | Strongly supported for both Kampala roadside commerce and Wandegeya/Makerere Rolex setups. Add a **metal-frame branded umbrella** option/prop beside the stall and a yellow/red Mobile Money steel booth near the lane corner. |
| **Parked & moving Boda Bodas + Matatu taxis** | **CONFIRMED** | Supported by Wikimedia Commons & Kampala traffic documentation; place boda stage on the `+X` corner (`X = +5.5..+9.0, Z = 3.4..4.2`). |
| **Exact corner road names & facade color details** | **STILL NEEDS PHOTOS** | Awaiting owner's exact corner reference photos to lock down specific corner signposts and dominant shop paint palette. |

---

## 2. Revised 3D Reconstruction Layout (Makerere Kivulu Corner)

### 2.1 Preserved Gameplay Core (Unchanged Coordinates)
- **Stall Concrete Pad:** `X ∈ [-2.2, 2.2]`, `Z ∈ [-1.4, 1.1]`, `Y = 0..0.06`
- **4 Interactive Stations (`layer 1`):** `prep` (`x=-1.25`), `tava` (`x=-0.15`), `ingredients` (`x=0.68`), `serve` (`x=1.45`)
- **3 Customer Slots:** `Z = 1.55`, `X ∈ {-1.15, 0.0, +1.15}`; spawn/exit corridors along the sidewalk at `Z = 2.15`, `X = ±6.2`
- **Camera Rig:** `overview`, `tava`, `prep`, `counter` presets + `OrbitControls` azimuth `[ -0.45π, +0.45π ]`, distance `[1.5, 10.5]`.

### 2.2 Revised Spatial Map (Integrating Makerere Hill Slope & Inner Kivulu Density)

```text
REVISED TOP-DOWN PLAN — MAKERERE KIVULU CORNER (Playable Apron Y = 0)
================================================================================
Z = -35m   [MAKERERE HILL RISE: +4m to +9m elevation, lush tropical tree ridge & campus silhouettes]
Z = -20m   [INNER KIVULU SETTLEMENT TIER (+0.6m to +2.2m slope):
            Dense weathered red-brick & unpainted concrete-block homes,
            rusted mabati roofs weighted with stones/tires, narrow footpaths]
           +----------------------+  |Kivulu |  +------------------------------+
Z = -10m   | B1: 2-Story Corner   |  |Murram |  | B2: 3-Bay Commercial Strip   |
           | Hardware/Stationery  |  |Lane   |  | - Mini Duka (Soda Crates)    |
           | Plastered Block +    |  |+Trench|  | - Salon / Tailoring          |
Z = -5.0m  +-[Veranda & Shutters]-+  |(X=-5) |  +-[Covered Concrete Veranda]---+
           ====================================================================
Z = -3.0m  [Interlocking Paver & Concrete Apron + Kiosk: Yellow Mobile Money Booth (X=-3.6)]
Z = -2.0m  [UMEME Utility Poles + Meter Boxes + High Overhead Wire Drops (Y >= 5.2m)]
--------------------------------------------------------------------------------
Z = -1.4m          +=======================================+
                   |    HERO PLAYER ROLEX STALL (Origin)   |  <-- Preserved
Z =  0.0m          |  [Prep] [Sigiri/Tava] [Ing] [Serve]   |      Gameplay
Z =  1.1m          +=======================================+      Core
Z =  1.55m            (Cust 0)    (Cust 1)    (Cust 2)
Z =  2.15m ========[Paved Sidewalk & Customer Approach Path]====================
Z =  2.75m --------[Concrete Slotted Drainage Channel (-0.42m) + Slab Bridges]--
Z =  3.35m --------[Curb + Red Laterite Dust Shoulder]--------------------------
           =====================================================================
Z =  6.3m   MAIN ARTERIAL TARMAC ROAD (6.0m wide, 2-lane weathered bitumen)
            -> Animated Boda Bodas, Matatu Taxis, Saloon Cars (East <-> West)
            -> Kivulu Boda Stage (+X = +5.5..+9.0, Z = 3.5..4.2)
Z =  9.3m  ---------------------------------------------------------------------
Z = 10.6m  [Opposite Curb, Drain, UMEME Poles & Foreground Shop Silhouettes]
================================================================================
```

### 2.3 Key Revised Environmental Modules

1. **Topography (`GroundTerrain`):**
   - Flat precision gameplay zone (`X ∈ [-14, +14], Z ∈ [-3.5, +12]`, `Y = 0`) so all characters, tables, vehicles, and drain slabs sit flush with zero floating.
   - Gradually rising **Makerere Hill backdrop mesh** starting at `Z = -11m` up to `Z = -40m` (`Y` climbing gently to `+8.5m`), dressed with instanced tropical canopy trees and distant Makerere/Kivulu rooftops.
2. **Two-Tier Architectural Authenticity (`buildings/`):**
   - **Foreground Commercial Edge (`Z = -5m to -10m`):** Plastered concrete 1–2 story retail strips with covered verandas, square concrete columns, roll-up corrugated shutters, cantilevered *mabati*/canvas awnings, weathered rain-streaked lower walls (red earth splash patina at `Y = 0..0.45m`), and Nasser-Road-style fascia boards.
   - **Inner Kivulu Settlement Tier (`Z = -13m to -24m`):** Modular low-rise **weathered red-brick** and **unpainted grey concrete-block** houses with rusted *mabati* roofs featuring subtle **stone/tire weights** on roof edges—giving unmistakable Makerere Kivulu character along the `-X` side-lane view.
3. **Drainage & Road Interface (`roads/`):**
   - User-supplied tarmac/road GLBs (or modular procedural fallback) along `Z = 3.35..9.35`.
   - Recessed `-0.42m` concrete drain channel (`Z = 2.55..3.15`) with damp silt bottom plane, precast concrete crossover slabs at `X ∈ [-1.8, +1.8]` (stall entrance) and `X = +5.2` (shop access), plus an open earth/concrete side-trench curving along the Kivulu murram lane (`X = -6.2`).
4. **Hero Stall & Street Props (`StallBuilder` + `props/`):**
   - Retain all 4 cooking hitboxes, `panChapati`, `panOmelette`, `panRolled`, `trayRolled`, `dualBurnerRing`, `canopyExtension`, and `jumaGroup`.
   - Upgrade surrounding dressing with a metal-frame roadside umbrella (canopy upgrade or stall accent), stacked plastic soda crates, 20L yellow oil jerrycan, charcoal *kkutiya* sack, and external produce/kitchen GLBs once supplied.
5. **Cinematic Time-of-Day & Atmospheric Lighting:**
   - **Warm Afternoon (Default):** Equatorial warm sun key (`#ffe4b5`), cool sky/red-laterite hemisphere fill, horizon-matched `FogExp2`.
   - **Kampala Evening Mode (Shift cycle or toggle):** Deep twilight gradient sky, active warm tungsten bulb (`PointLight` + soft glow sprite) under the stall roof, glowing *sigiri* charcoal embers, warm fluorescent/LED interior spill inside the Mobile Money booth and *duka*, and sweeping boda-boda headlight cones along `Z = 4.6..7.4`.
