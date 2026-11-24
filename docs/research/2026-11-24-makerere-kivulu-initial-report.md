# PRELIMINARY REPORT (ARCHIVED AS ORIGINALLY PRODUCED — 2026-11-24)

> **Archival Note:** This document preserves the original preliminary research report, spatial blueprint, asset audit, and implementation plan produced on 2026-11-24 before the second-pass visual research and blueprint revision. Provisional observations here must **not** be treated as visually verified facts; see `2026-11-24-makerere-kivulu-visual-reference-board.md` and `2026-11-24-makerere-kivulu-revised-blueprint.md` for updates and corrections.

---

## DELIVERABLE 1 — PRELIMINARY RESEARCH REPORT

### 1.1 Research Tooling & Image-Access Limitation Disclosure
Using text-based web search (`search_web`), urban context, architectural descriptions, and web source URLs were retrieved, **but direct image-viewing / Google Images thumbnail inspection or Google Street View browsing access was unavailable**. Pixel-level visual details of individual Makerere Kivulu Corner facades were not directly viewed.

### 1.2 Recorded Initial Source URLs (Grounding Domains)
- Makerere Kivulu & Sir Apollo Kaggwa / Makerere Hill context: `mapcarta.com` (`https://mapcarta.com/39109038`), `mak.ac.ug`, `cybo.com`, `youtube.com` (*Inside Makerere Kivulu*, *Life In Kivulu*).
- Kampala Rolex vendors & Wandegeya/Makerere stall setups: `wikipedia.org`, `globalpressjournal.com`, `mak.ac.ug`, `keefamotortours.com`, `travelgiantsuganda.com`, `thisisuganda.org`, `ugandasafariplanner.com`, `therolexguyug.com`.
- Kampala shopfronts, verandas, kiosks & signage: `ugandaradionetwork.net`, `terrain-arch.com`, `realmuloodi.co.ug`, `kamogartistry.com`, `brandboss.co.ug`, `yellow.ug`.
- KCCA roads, drainage & UMEME poles/cables: `thekampalareport.com`, `nilepost.co.ug`, `parliamentwatch.ug`, `afdb.org`, `scribd.com`.
- Boda bodas & Kampala evening/night streets: `wikimedia.org` (*Streets in Kampala*, *Boda-Boda-Uganda.jpg*), `independent.co.ug`, `observer.ug`, `rentadriveruganda.com`, `gettyimages.com`, `shutterstock.com`, `alamy.com`, `dreamstime.com`.

### 1.3 Initial Environmental Observations (Broad Kampala + Kivulu Context)
- **Context:** Makerere Kivulu in Kawempe Division sits near Makerere University, Wandegeya, and Sir Apollo Kaggwa / Gaddafi Road, mixing narrow access roads, dense local residential plots, and student-serving roadside retail.
- **Buildings & Shopfronts:** 1–3 story concrete-block commercial buildings with covered verandas, roll-up shutters, corrugated *mabati* roofs, welded steel kiosks, and Nasser Road-style flex banners plus MTN/Airtel/beverage co-branding.
- **Roads & Drainage:** Weathered bitumen/tarmac carriageways, unpaved red-brown laterite (*murram*) shoulders/lanes, interlocking paving blocks or concrete sidewalks, and open/slotted concrete roadside drainage channels.
- **Utilities & Street Life:** UMEME power poles with dense overhead cables, parked/moving boda bodas in reflective vests, minibus taxis (*matatus*), metal-frame umbrellas shading Rolex griddles (*kikalango*/*tava*), and warm tungsten bulbs at dusk.

---

## DELIVERABLE 2 — PRELIMINARY ENVIRONMENT BLUEPRINT (PROVISIONAL)

### Preliminary Top-Down Coordinate Concept (Y = 0 Flat Ground Baseline)
- **Z = -24m:** Distant Makerere Hill tree-line & fog horizon.
- **Z = -18m:** Secondary residential *mabati* rooftops.
- **Z = -10m to -5m:** Left 2-story corner hardware/hostel (`X = -9.5`), unpaved Kivulu *murram* side-lane (`X = -6.8` to `-3.8`), Mobile Money yellow steel kiosk (`X = -4.8`), and right commercial retail strip (`X = +5.2`: Mini-Duka + Salon/Tailoring).
- **Z = -3m to -2m:** Concrete veranda apron + UMEME poles & overhead cables (`Y ≥ 5.2m`).
- **Z = -1.4m to +1.1m (`X = 0`):** Preserved Hero Player Rolex Stall (`prep`, `tava`, `ingredients`, `serve`).
- **Z = +1.55m:** Preserved 3 customer slots (`x ∈ {-1.15, 0, +1.15}`).
- **Z = +2.1m to +3.35m:** Interlocking paver sidewalk, concrete slotted drainage channel (`-0.45m` deep) with crossover slabs, and raised curb.
- **Z = +3.35m to +9.35m:** Main 2-lane weathered tarmac road (`6.0m` wide) with Kivulu boda stage at `X = +5.5..+9.0, Z = 3.4..4.2` and moving boda/matatu lanes.
- **Z = +10.5m:** Opposite curb, drain, UMEME poles, and foreground silhouettes.

*(See `2026-11-24-makerere-kivulu-revised-blueprint.md` for updates and corrections made after deeper geographic/settlement research.)*

---

## DELIVERABLE 3 — INITIAL ASSET AUDIT SUMMARY (SUPERSEDED BY VERIFIED AUDIT)
- Confirmed zero `.glb`, `.gltf`, or image files exist in `/public` or `/src`.
- Cataloged all 11 procedural `CanvasTexture`s and 24 `AssetManager` fallback IDs.
- Mapped user's external model list (produce, egg cartons, knives, graters, pans, pots, stoves, dishwashers, wooden tables, rocks, vegetation, road/tarmac) into a proposed `public/assets/` structure.

---

## DELIVERABLE 4 — INITIAL IMPLEMENTATION PLAN SUMMARY
- Proposed a 6-phase build sequence: (1) `AssetManager` Draco/bounds upgrade + `EnvironmentMaterials`, (2) Terrain/Tarmac/Drainage, (3) Modular Kampala Buildings, (4) Hero Stall GLB swap-in, (5) `InstancedMesh` street props/poles/vegetation + `TrafficSystem`, (6) Day/Evening lighting & mobile optimization (`<120–160` draw calls, `isSoftwareGl` preservation).
