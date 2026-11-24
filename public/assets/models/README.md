# ROLEX EMPIRE — 3D Models Directory (`/public/assets/models/`)

This folder holds external `.glb` / `.gltf` (including Draco-compressed) 3D models for the Kireka street scene and playable Rolex stall.

Every slot currently falls back to built-in procedural Three.js geometry with **zero 404 requests** until you enable a model in `manifest.json`.

## Folder Layout

| Subfolder | Put These Collected Assets Here |
| :--- | :--- |
| `ingredients/` | Tomatoes, purple onions, cabbage, carrots, green peppers, spiced beef, avocado, egg cartons |
| `food/` | Raw dough, cooked chapatis, omelettes, kraft-wrapped rolled Rolex |
| `kitchen/` | Charcoal *sigiri* stove, cast-iron *tava* pan, cooking pots, knives, graters, rolling pins, serving trays *(dishwashers reserved for future Level 9–10 Bistro tier)* |
| `furniture/` | Wooden tables, customer waiting benches, menu easels, kiosk frames |
| `props/` | 20L yellow oil jerrycans, plastic soda crates, charcoal sacks, shade canopies |
| `roads/` | Kampala–Jinja Highway tarmac segments, concrete storm drain channels, railway tracks, UMEME utility poles |
| `vegetation/` | Acacia/mango trees, roadside shrubs, laterite/granite rock clusters |
| `buildings/` | Kireka 1 & 2-storey shopfronts, Kireka Main Market *mabati* sheds, Mobile Money kiosks, produce tarp stalls |
| `vehicles/` | Boda-boda motorbikes, Kampala *matatu* taxis, saloon cars (orient forward along `+X`) |
| `characters/` | Assistant Chef Juma and customer character models |

## How to Integrate a New `.glb` Model (2 Steps)

1. **Drop your `.glb` file** into the matching subfolder (for example: `public/assets/models/ingredients/ing_tomato_bowl.glb` or `public/assets/models/kitchen/equip_knife_board.glb`).
2. **Open `public/assets/models/manifest.json`** and set `"enabled": true` on that model's entry (or update `"glbUrl"` if your filename differs).

`AssetManager.ts` automatically:
- Loads the `.glb` via `GLTFLoader` + `DRACOLoader`.
- Applies `castShadow` / `receiveShadow` on all meshes.
- Normalizes scale to `targetHeight` or `targetMaxDim` (in meters) and grounds the bottom-center pivot cleanly at `y = 0`.
- Preserves all invisible gameplay click hitboxes (`prep`, `tava`, `ingredients`, `serve`) and pan cooking animations outside the swapped visual shell.
- Falls back safely to procedural Three.js geometry if a file fails to load.

## Orientation & Alignment Tweaks

If an imported `.glb` faces the wrong direction or sits slightly off-center, adjust its entry in `manifest.json` without editing any TypeScript:
- `"rotationDeg": [0, 90, 0]` — rotates `[X, Y, Z]` in degrees before normalization.
- `"offset": [0, 0.02, 0]` — shifts `[X, Y, Z]` in meters after grounding.
- `"targetHeight"` or `"targetMaxDim"` — rescales the model uniformly in meters.

You can inspect all active vs. procedural model slots live inside the app at **`/owner` -> 3D Models**.
