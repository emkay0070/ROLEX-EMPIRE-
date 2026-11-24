import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { AssetCategory } from '../types/game';

export const DEFAULT_MODELS_MANIFEST_URL = '/assets/models/manifest.json';

export interface AssetDescriptor {
  id: string;
  category: AssetCategory;
  folder?: string;
  slotLabel?: string;
  glbUrl?: string; // External GLB/glTF path under /assets/models/...
  enabled?: boolean; // Must be true for glbUrl to be fetched (prevents 404s)
  scale?: number;
  targetHeight?: number; // Uniform scale so Box3 height matches meters
  targetMaxDim?: number; // Uniform scale so largest Box3 dimension matches meters
  rotationDeg?: [number, number, number]; // Optional [X, Y, Z] orientation fix in degrees
  offset?: [number, number, number]; // Optional [X, Y, Z] post-grounding offset in meters
  notes?: string;
}

export interface ModelManifest {
  version: number;
  basePath?: string;
  notes?: string;
  models: AssetDescriptor[];
}

export interface NormalizeOptions {
  targetHeight?: number;
  targetMaxDim?: number;
  rotationDeg?: [number, number, number];
  offset?: [number, number, number];
}

export async function fetchModelsManifest(
  url = DEFAULT_MODELS_MANIFEST_URL,
): Promise<ModelManifest | null> {
  try {
    const res = await fetch(url, { cache: 'no-cache' });
    if (!res.ok) return null;
    const json = (await res.json()) as Partial<ModelManifest>;
    if (!json || !Array.isArray(json.models)) return null;
    return {
      version: typeof json.version === 'number' ? json.version : 1,
      basePath: typeof json.basePath === 'string' ? json.basePath : '/assets/models',
      notes: typeof json.notes === 'string' ? json.notes : undefined,
      models: json.models.filter(
        (m): m is AssetDescriptor => Boolean(m && typeof m.id === 'string' && typeof m.category === 'string'),
      ),
    };
  } catch {
    return null;
  }
}

/**
 * Modular AssetManager supporting optimized GLB/glTF (+ Draco) models across all 7 categories
 * driven by /assets/models/manifest.json, with automatic procedural fallback when disabled or missing.
 */
export class AssetManager {
  private readonly loadingManager: THREE.LoadingManager;
  private readonly gltfLoader: GLTFLoader;
  private readonly dracoLoader: DRACOLoader;
  private readonly modelCache = new Map<string, THREE.Object3D>();
  private readonly registry = new Map<string, AssetDescriptor>();
  private readonly textures: THREE.Texture[] = [];
  private maxAnisotropy = 1;
  private manifestLoaded = false;

  constructor(maxAnisotropy = 1) {
    this.maxAnisotropy = Math.max(1, maxAnisotropy);
    this.loadingManager = new THREE.LoadingManager();
    this.dracoLoader = new DRACOLoader(this.loadingManager);
    this.dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');

    this.gltfLoader = new GLTFLoader(this.loadingManager);
    this.gltfLoader.setDRACOLoader(this.dracoLoader);

    this.registerDefaultCatalog();
  }

  public setMaxAnisotropy(aniso: number): void {
    this.maxAnisotropy = Math.max(1, aniso);
  }

  private registerDefaultCatalog(): void {
    const entries: AssetDescriptor[] = [
      // Food
      { id: 'food_chapati_raw', category: 'food', folder: 'food' },
      { id: 'food_chapati_cooked', category: 'food', folder: 'food' },
      { id: 'food_omelette', category: 'food', folder: 'food' },
      { id: 'food_rolex_rolled', category: 'food', folder: 'food' },
      // Ingredients
      { id: 'ing_onion_bowl', category: 'ingredients', folder: 'ingredients' },
      { id: 'ing_tomato_bowl', category: 'ingredients', folder: 'ingredients' },
      { id: 'ing_cabbage_bowl', category: 'ingredients', folder: 'ingredients' },
      { id: 'ing_carrot_crate', category: 'ingredients', folder: 'ingredients' },
      { id: 'ing_pepper_bowl', category: 'ingredients', folder: 'ingredients' },
      { id: 'ing_beef_bowl', category: 'ingredients', folder: 'ingredients' },
      { id: 'ing_avocado_bowl', category: 'ingredients', folder: 'ingredients' },
      { id: 'ing_egg_tray', category: 'ingredients', folder: 'ingredients' },
      // Kitchen equipment
      { id: 'equip_sigiri_stove', category: 'equipment', folder: 'kitchen' },
      { id: 'equip_tava_pan', category: 'equipment', folder: 'kitchen' },
      { id: 'equip_cooking_pot', category: 'equipment', folder: 'kitchen' },
      { id: 'equip_rolling_pin', category: 'equipment', folder: 'kitchen' },
      { id: 'equip_knife_board', category: 'equipment', folder: 'kitchen' },
      { id: 'equip_serving_tray', category: 'equipment', folder: 'kitchen' },
      // Furniture & Props
      { id: 'furn_kiosk_frame', category: 'furniture', folder: 'furniture' },
      { id: 'furn_waiting_bench', category: 'furniture', folder: 'furniture' },
      { id: 'furn_wooden_table', category: 'furniture', folder: 'furniture' },
      { id: 'furn_menu_board', category: 'furniture', folder: 'furniture' },
      { id: 'env_soda_crates', category: 'furniture', folder: 'props' },
      { id: 'env_oil_jerrycan', category: 'furniture', folder: 'props' },
      { id: 'env_umbrella_canopy', category: 'furniture', folder: 'props' },
      { id: 'env_charcoal_sack', category: 'furniture', folder: 'props' },
      // Characters
      { id: 'char_customer', category: 'characters', folder: 'characters' },
      { id: 'char_assistant_juma', category: 'characters', folder: 'characters' },
      // Kireka Buildings
      { id: 'bldg_kampala_shopfront', category: 'buildings', folder: 'buildings' },
      { id: 'kireka_shop_building_a', category: 'buildings', folder: 'buildings' },
      { id: 'kireka_shop_building_b', category: 'buildings', folder: 'buildings' },
      { id: 'kireka_market_shed', category: 'buildings', folder: 'buildings' },
      { id: 'kireka_mobile_money_kiosk', category: 'buildings', folder: 'buildings' },
      { id: 'kireka_produce_stall', category: 'buildings', folder: 'buildings' },
      // Kireka Environment, Vegetation, Roads & Vehicles
      { id: 'kireka_highway_segment', category: 'environment', folder: 'roads' },
      { id: 'kireka_drain_channel', category: 'environment', folder: 'roads' },
      { id: 'kireka_railway_track', category: 'environment', folder: 'roads' },
      { id: 'env_umeme_pole', category: 'environment', folder: 'roads' },
      { id: 'env_acacia_tree', category: 'environment', folder: 'vegetation' },
      { id: 'env_roadside_shrub', category: 'environment', folder: 'vegetation' },
      { id: 'env_rock_cluster', category: 'environment', folder: 'vegetation' },
      { id: 'env_boda_motorbike', category: 'environment', folder: 'vehicles' },
      { id: 'env_matatu_taxi', category: 'environment', folder: 'vehicles' },
      { id: 'env_saloon_car', category: 'environment', folder: 'vehicles' },
    ];

    for (const entry of entries) {
      this.registry.set(entry.id, entry);
    }
  }

  /**
   * Loads /assets/models/manifest.json so dropped-in GLBs activate declaratively
   * without touching TypeScript source code.
   */
  public async loadManifest(url = DEFAULT_MODELS_MANIFEST_URL): Promise<number> {
    const manifest = await fetchModelsManifest(url);
    this.manifestLoaded = true;
    if (!manifest) return 0;

    let enabledCount = 0;
    for (const entry of manifest.models) {
      this.registry.set(entry.id, entry);
      this.modelCache.delete(entry.id);
      if (entry.enabled && entry.glbUrl) {
        enabledCount += 1;
      }
    }
    return enabledCount;
  }

  public isManifestLoaded(): boolean {
    return this.manifestLoaded;
  }

  public registerGlbAsset(descriptor: AssetDescriptor): void {
    this.registry.set(descriptor.id, {
      ...descriptor,
      enabled: descriptor.enabled ?? Boolean(descriptor.glbUrl),
    });
    this.modelCache.delete(descriptor.id);
  }

  public getDescriptor(id: string): AssetDescriptor | undefined {
    return this.registry.get(id);
  }

  public hasActiveGlb(id: string): boolean {
    const desc = this.registry.get(id);
    return Boolean(desc?.glbUrl && desc.enabled !== false);
  }

  public getAllDescriptors(): AssetDescriptor[] {
    return Array.from(this.registry.values());
  }

  public getRegisteredCategories(): Record<AssetCategory, string[]> {
    const grouped: Record<AssetCategory, string[]> = {
      food: [],
      ingredients: [],
      equipment: [],
      furniture: [],
      characters: [],
      buildings: [],
      environment: [],
    };
    this.registry.forEach((desc) => {
      grouped[desc.category].push(desc.id);
    });
    return grouped;
  }

  /**
   * Grounds an object so its bounding-box minimum sits at y = 0 and X/Z are centered.
   * Supports uniform targetHeight / targetMaxDim scaling, Euler degree fixes, and offset.
   */
  public normalizeAndGround(
    object: THREE.Object3D,
    targetOrOpts?: number | NormalizeOptions,
  ): THREE.Object3D {
    const opts: NormalizeOptions =
      typeof targetOrOpts === 'number' ? { targetHeight: targetOrOpts } : targetOrOpts || {};

    if (opts.rotationDeg) {
      const [rx, ry, rz] = opts.rotationDeg;
      object.rotation.set(
        THREE.MathUtils.degToRad(rx),
        THREE.MathUtils.degToRad(ry),
        THREE.MathUtils.degToRad(rz),
      );
    }

    object.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(object);
    if (box.isEmpty()) return object;

    const size = new THREE.Vector3();
    box.getSize(size);

    if (opts.targetHeight && size.y > 0.001) {
      object.scale.multiplyScalar(opts.targetHeight / size.y);
      object.updateMatrixWorld(true);
      box.setFromObject(object);
    } else if (opts.targetMaxDim) {
      const maxDim = Math.max(size.x, size.y, size.z);
      if (maxDim > 0.001) {
        object.scale.multiplyScalar(opts.targetMaxDim / maxDim);
        object.updateMatrixWorld(true);
        box.setFromObject(object);
      }
    }

    const center = new THREE.Vector3();
    box.getCenter(center);
    object.position.x -= center.x;
    object.position.z -= center.z;
    object.position.y -= box.min.y;

    if (opts.offset) {
      object.position.x += opts.offset[0];
      object.position.y += opts.offset[1];
      object.position.z += opts.offset[2];
    }

    return object;
  }

  private applyLoadedModelTexturesAndShadows(model: THREE.Object3D): void {
    model.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        for (const mat of materials) {
          if (!mat) continue;
          const std = mat as THREE.MeshStandardMaterial;
          if (std.map) {
            std.map.anisotropy = this.maxAnisotropy;
            this.textures.push(std.map);
          }
          if (std.normalMap) this.textures.push(std.normalMap);
          if (std.roughnessMap) this.textures.push(std.roughnessMap);
          if (std.metalnessMap) this.textures.push(std.metalnessMap);
          if (std.emissiveMap) this.textures.push(std.emissiveMap);
        }
      }
    });
  }

  /**
   * Loads a GLB asset if enabled and configured; otherwise invokes the supplied procedural builder.
   * Ensures gameplay hitboxes & mechanics never break when swapping procedural placeholders for GLB models.
   */
  public async loadOrBuild(
    id: string,
    proceduralFallback: () => THREE.Object3D,
  ): Promise<THREE.Object3D> {
    const cached = this.modelCache.get(id);
    if (cached) {
      return cached.clone(true);
    }

    const descriptor = this.registry.get(id);
    if (descriptor?.glbUrl && descriptor.enabled === true) {
      try {
        const gltf = await new Promise<{ scene: THREE.Group }>((resolve, reject) => {
          this.gltfLoader.load(descriptor.glbUrl!, resolve, undefined, reject);
        });
        const root = new THREE.Group();
        root.name = `glb_${id}`;
        const model = gltf.scene;
        this.applyLoadedModelTexturesAndShadows(model);
        if (descriptor.scale) {
          model.scale.setScalar(descriptor.scale);
        }
        this.normalizeAndGround(model, {
          targetHeight: descriptor.targetHeight,
          targetMaxDim: descriptor.targetMaxDim,
          rotationDeg: descriptor.rotationDeg,
          offset: descriptor.offset,
        });
        root.add(model);
        this.modelCache.set(id, root);
        return root.clone(true);
      } catch (err) {
        console.warn(`[AssetManager] Failed loading ${id} (${descriptor.glbUrl}), using procedural fallback.`, err);
      }
    }

    const built = proceduralFallback();
    this.modelCache.set(id, built);
    return built.clone(true);
  }

  public trackTexture(tex: THREE.Texture): THREE.Texture {
    this.textures.push(tex);
    return tex;
  }

  public dispose(): void {
    this.textures.forEach((t) => t.dispose());
    this.textures.length = 0;
    this.modelCache.forEach((obj) => {
      obj.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.geometry?.dispose();
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((m) => m.dispose());
          } else {
            mesh.material?.dispose();
          }
        }
      });
    });
    this.modelCache.clear();
    this.dracoLoader.dispose();
  }
}
