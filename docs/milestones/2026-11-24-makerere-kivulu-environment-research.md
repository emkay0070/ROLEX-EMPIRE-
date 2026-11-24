# MILESTONE SNAPSHOT — 2026-11-24: MAKERERE KIVULU ENVIRONMENT RESEARCH & CONTINUITY BASELINE

- **Date:** 2026-11-24
- **Milestone:** Milestone 1 — Makerere Kivulu Corner Environment Reconstruction (Research, Documentation & Pre-Construction Gate)
- **Status:** Research, Visual Reference Board, Revised Blueprint, Asset Audit, and Continuity Documentation **COMPLETE**; 3D Construction **NOT STARTED (Awaiting Owner Review & Assets)**

---

## 1. Snapshot Purpose

This snapshot preserves the exact architectural decisions, verified codebase baseline, research findings, and protection constraints established prior to modifying any 3D environment or gameplay files for Milestone 1.

## 2. Confirmed Project Roadmap Recorded on This Date

1. **Milestone 1 (Active Priority):** Makerere Kivulu Corner Environment Reconstruction (3D Kampala neighborhood overhaul around the preserved gameplay stall).
2. **Milestone 2 (Queued):** Local persistence migration to **IndexedDB** (preserving existing `rolex_empire_save_v1` `localStorage` player data).
3. **Milestone 3 (Queued):** Private Owner's Dashboard (only after Milestone 2 is complete and tested).
4. **Deferred:** Supabase, user authentication, RLS, cloud saves, and cloud synchronization.

## 3. Key Architectural Decisions Confirmed

1. **Gameplay Core Invariance:**
   - The Rolex stall stays anchored at `(0, 0, 0)` with existing station coordinates (`prep` at `x=-1.25`, `tava` at `x=-0.15`, `ingredients` at `x=0.68`, `serve` at `x=1.45`), customer queue slots (`z=1.55`, `x ∈ {-1.15, 0, +1.15}`), `raycaster.layers.set(1)`, and `CAMERA_PRESETS`.
2. **Modular District Expansion Architecture:**
   - Extract environment building out of `StallBuilder.ts` into a dedicated `DistrictManager` supporting clean loading/unloading of future Kampala districts (`Wandegeya Stage`, `Ntinda Trading Centre`, `Nakasero Market Avenue`, `Acacia Avenue Strip`).
3. **Hybrid GLB + Procedural Pipeline (`AssetManager.ts`):**
   - Retain procedural fallbacks while upgrading `AssetManager` with `DRACOLoader` and `Box3` auto-grounding/scaling normalization so externally supplied GLB models (produce, egg cartons, kitchenware, wooden tables, rocks, vegetation, tarmac/roads) drop in safely without breaking hitboxes or cooking state visuals.
4. **Performance & Software-WebGL Discipline:**
   - Preserve `detectSoftwareWebGL()` and `afterDraw()` pacing; use `InstancedMesh` for repeated props/trees/drainage/poles; keep active scene under `120–160` draw calls; eliminate per-frame `Vector3` allocations in `CustomerSystem.ts`.
5. **Non-Negotiable Protections:**
   - Zero edits to gameplay logic, HUD/UI, routes, `localStorage` save format, GitHub/Vercel config, or AdSense (`ca-pub-8832384771899504` & `public/ads.txt`).

## 4. Research Limitations Preserved

- Automated web searches confirmed Makerere Kivulu's location in Kawempe Division (valley below Makerere Hill between Makerere Hill Rd, Bombo Rd, Gaddafi Rd / LDC, and Wandegeya), authentic building construction (commercial concrete strips + inner-Kivulu weathered brick/block dwellings with stone/tire-weighted *mabati* roofs), and Kampala infrastructure (open/slotted storm drains, UMEME poles/cables, Nasser Road signage, boda stages).
- **Direct visual inspection of photographs or Google Street View frames was NOT available in this environment.** Exact corner geometry and facade details remain provisional until the project owner provides reference images.

## 5. Linked Artifacts Created in This Milestone

- `docs/ROLEX_EMPIRE_MASTER.md`
- `docs/PROJECT_CHANGELOG.md`
- `docs/research/2026-11-24-makerere-kivulu-initial-report.md`
- `docs/research/2026-11-24-makerere-kivulu-visual-reference-board.md`
- `docs/research/2026-11-24-makerere-kivulu-revised-blueprint.md`
- `docs/research/2026-11-24-asset-inventory-and-integration-plan.md`
