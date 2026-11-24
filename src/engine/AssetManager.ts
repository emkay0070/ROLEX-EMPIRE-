import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { AssetCategory } from '../types/game';

export interface AssetDescriptor {
  id: string;
  category: AssetCategory;
  glbUrl?: string; // Optional external GLB/glTF path when studio assets are supplied
  scale?: number;
}

/**
 * Modular AssetManager supporting optimized GLB/glTF models across all 7 categories
 * (food, ingredients, equipment, furniture, characters, buildings, environment),
 * with automatic procedural fallback when no external GLB URL is registered.
 */
export class AssetManager {
  private readonly loadingManager: THREE.LoadingManager;
  private readonly gltfLoader: GLTFLoader;
  private readonly modelCache = new Map<string, THREE.Object3D>();
  private readonly registry = new Map<string, AssetDescriptor>();
  private readonly textures: THREE.Texture[] = [];

  constructor() {
    this.loadingManager = new THREE.LoadingManager();
    this.gltfLoader = new GLTFLoader(this.loadingManager);
    this.registerDefaultCatalog();
  }

  private registerDefaultCatalog(): void {
    const entries: AssetDescriptor[] = [
      // Food
      { id: 'food_chapati_raw', category: 'food' },
      { id: 'food_chapati_cooked', category: 'food' },
      { id: 'food_omelette', category: 'food' },
      { id: 'food_rolex_rolled', category: 'food' },
      // Ingredients
      { id: 'ing_onion_bowl', category: 'ingredients' },
      { id: 'ing_tomato_bowl', category: 'ingredients' },
      { id: 'ing_cabbage_bowl', category: 'ingredients' },
      { id: 'ing_pepper_bowl', category: 'ingredients' },
      { id: 'ing_beef_bowl', category: 'ingredients' },
      { id: 'ing_avocado_bowl', category: 'ingredients' },
      { id: 'ing_egg_tray', category: 'ingredients' },
      // Kitchen equipment
      { id: 'equip_sigiri_stove', category: 'equipment' },
      { id: 'equip_tava_pan', category: 'equipment' },
      { id: 'equip_rolling_pin', category: 'equipment' },
      { id: 'equip_knife_board', category: 'equipment' },
      { id: 'equip_serving_tray', category: 'equipment' },
      // Furniture
      { id: 'furn_kiosk_frame', category: 'furniture' },
      { id: 'furn_waiting_bench', category: 'furniture' },
      { id: 'furn_menu_board', category: 'furniture' },
      // Characters
      { id: 'char_customer', category: 'characters' },
      { id: 'char_assistant_juma', category: 'characters' },
      // Buildings & Environment
      { id: 'bldg_kampala_shopfront', category: 'buildings' },
      { id: 'env_acacia_tree', category: 'environment' },
      { id: 'env_boda_motorbike', category: 'environment' },
    ];

    for (const entry of entries) {
      this.registry.set(entry.id, entry);
    }
  }

  public registerGlbAsset(descriptor: AssetDescriptor): void {
    this.registry.set(descriptor.id, descriptor);
    this.modelCache.delete(descriptor.id);
  }

  public getDescriptor(id: string): AssetDescriptor | undefined {
    return this.registry.get(id);
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
   * Loads a GLB asset if a URL is configured; otherwise invokes the supplied procedural builder.
   * Ensures gameplay systems never rewrite when swapping procedural placeholders for GLB models.
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
    if (descriptor?.glbUrl) {
      try {
        const gltf = await new Promise<{ scene: THREE.Group }>((resolve, reject) => {
          this.gltfLoader.load(descriptor.glbUrl!, resolve, undefined, reject);
        });
        const root = gltf.scene;
        root.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.castShadow = true;
            mesh.receiveShadow = true;
          }
        });
        if (descriptor.scale) {
          root.scale.setScalar(descriptor.scale);
        }
        this.modelCache.set(id, root);
        return root.clone(true);
      } catch {
        // Fallback smoothly to procedural geometry if external GLB fails
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
    this.modelCache.clear();
  }
}
