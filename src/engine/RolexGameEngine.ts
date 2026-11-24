import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { CameraPreset, CookingState, CustomerOrder } from '../types/game';
import { AssetManager } from './AssetManager';
import { createProceduralTextures, ProceduralTextureSet } from './ProceduralTextures';
import { buildKampalaRolexStall, StallRig } from './StallBuilder';
import { buildKirekaDistrict, DistrictHandle } from './DistrictManager';
import { TrafficSystem } from './TrafficSystem';
import { INGREDIENTS } from '../data/recipes';
import {
  buildUgandanCustomerMesh,
  CustomerVisual,
  disposeCustomerVisual,
  updateCustomerVisuals,
} from './CustomerSystem';

export type CookingActionKind =
  | 'roll_dough'
  | 'chop'
  | 'crack_egg'
  | 'pour_egg'
  | 'flip_tava'
  | 'roll_rolex'
  | 'serve';

export type CameraFocusTarget = CameraPreset | 'mix' | 'roll';

export interface EngineCallbacks {
  onStationClicked?: (station: 'prep' | 'tava' | 'ingredients' | 'serve') => void;
  onCustomerClicked?: (customerId: string) => void;
  onUserCameraInteract?: () => void;
  onWebglError?: (message: string) => void;
}

const CAMERA_TARGETS: Record<CameraFocusTarget, { pos: THREE.Vector3; target: THREE.Vector3 }> = {
  overview: {
    pos: new THREE.Vector3(0.42, 3.05, 5.75),
    target: new THREE.Vector3(0, 1.12, 0.05),
  },
  tava: {
    pos: new THREE.Vector3(0.14, 1.86, 1.28),
    target: new THREE.Vector3(-0.15, 1.15, -0.02),
  },
  prep: {
    pos: new THREE.Vector3(-0.98, 1.86, 1.32),
    target: new THREE.Vector3(-1.18, 1.04, -0.06),
  },
  mix: {
    pos: new THREE.Vector3(0.5, 1.8, 1.38),
    target: new THREE.Vector3(0.5, 1.06, 0.16),
  },
  roll: {
    pos: new THREE.Vector3(0.28, 1.76, 1.22),
    target: new THREE.Vector3(0.02, 1.12, 0.02),
  },
  counter: {
    pos: new THREE.Vector3(1.28, 2.04, 2.18),
    target: new THREE.Vector3(0.85, 1.12, 0.35),
  },
};

function detectSoftwareWebGL(): boolean {
  try {
    const probeCanvas = document.createElement('canvas');
    const gl = probeCanvas.getContext('webgl2') || probeCanvas.getContext('webgl');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param));
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
}

export class RolexGameEngine {
  private readonly container: HTMLElement;
  private readonly callbacks: EngineCallbacks;
  private readonly isSoftwareGl: boolean;
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene: THREE.Scene;
  private readonly camera: THREE.PerspectiveCamera;
  private readonly controls: OrbitControls;
  private readonly assetManager: AssetManager;
  private readonly raycaster = new THREE.Raycaster();
  private readonly pointer = new THREE.Vector2();
  private readonly clock = new THREE.Clock();

  private textures: ProceduralTextureSet | null = null;
  private stallRig: StallRig | null = null;
  private district: DistrictHandle | null = null;
  private trafficSystem: TrafficSystem | null = null;
  private customerVisuals: CustomerVisual[] = [];

  private activeCameraGoal: { pos: THREE.Vector3; target: THREE.Vector3 } | null = null;
  private queuedCameraGoal: { focus: CameraFocusTarget; delay: number } | null = null;
  private cookingState: CookingState | null = null;
  private employeeHired = false;
  private actionKind: CookingActionKind | null = null;
  private actionElapsed = 0;
  private actionDuration = 0.85;
  private vendorTargetX = -0.15;
  private frameId = 0;
  private disposed = false;

  // Reusable math scratch objects (zero GC in render loop)
  private readonly _tmpColor = new THREE.Color();

  constructor(container: HTMLElement, callbacks: EngineCallbacks) {
    this.container = container;
    this.callbacks = callbacks;
    this.isSoftwareGl = detectSoftwareWebGL();

    const width = Math.max(container.clientWidth, 320);
    const height = Math.max(container.clientHeight, 240);

    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.08;
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.renderer.domElement.style.display = 'block';
    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';
    container.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    const skyColor = new THREE.Color(0xdce8f5);
    this.scene.background = skyColor;
    this.scene.fog = new THREE.FogExp2(0xdce8f5, 0.012);

    this.camera = new THREE.PerspectiveCamera(46, width / height, 0.1, 180);
    this.camera.position.copy(CAMERA_TARGETS.overview.pos);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.target.copy(CAMERA_TARGETS.overview.target);
    this.controls.enableDamping = !this.isSoftwareGl;
    this.controls.dampingFactor = 0.07;
    this.controls.maxPolarAngle = Math.PI * 0.47;
    this.controls.minPolarAngle = 0.25;
    this.controls.minAzimuthAngle = -Math.PI * 0.45;
    this.controls.maxAzimuthAngle = Math.PI * 0.45;
    this.controls.minDistance = 1.15;
    this.controls.maxDistance = 13.5;
    this.controls.enablePan = false;
    this.controls.update();

    this.controls.addEventListener('start', () => {
      // Yield immediately if the player drags or zooms manually
      this.activeCameraGoal = null;
      this.queuedCameraGoal = null;
      this.callbacks.onUserCameraInteract?.();
    });

    this.assetManager = new AssetManager();
    this.raycaster.layers.set(1);

    this.setupLighting();
    this.bindEvents();
  }

  private setupLighting(): void {
    // Mandatory procedural studio environment reflections
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    const envTex = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    this.scene.environment = envTex;
    pmremGenerator.dispose();

    // Kampala warm afternoon sun key light + cool sky/laterite ground hemisphere fill
    const hemi = new THREE.HemisphereLight(0xbae6fd, 0x8b4a2b, 0.85);
    this.scene.add(hemi);

    const sun = new THREE.DirectionalLight(0xfff0d4, 2.2);
    sun.position.set(7.5, 12.5, 8.5);
    sun.castShadow = !this.isSoftwareGl;
    sun.shadow.mapSize.width = 1024;
    sun.shadow.mapSize.height = 1024;
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = 36;
    const d = 10.5;
    sun.shadow.camera.left = -d;
    sun.shadow.camera.right = d;
    sun.shadow.camera.top = d;
    sun.shadow.camera.bottom = -d;
    sun.shadow.bias = -0.0005;
    sun.shadow.normalBias = 0.02;
    this.scene.add(sun);

    // Subtle cool rim light separating stall silhouette from Kireka shopfronts
    const rim = new THREE.DirectionalLight(0x93c5fd, 0.48);
    rim.position.set(-6, 5, -7);
    this.scene.add(rim);
  }

  public async initialize(): Promise<void> {
    const maxAniso = this.renderer.capabilities.getMaxAnisotropy();
    this.assetManager.setMaxAnisotropy(maxAniso);
    await this.assetManager.loadManifest();

    this.textures = createProceduralTextures(maxAniso);
    Object.values(this.textures).forEach((t) => this.assetManager.trackTexture(t));

    this.district = await buildKirekaDistrict(this.assetManager, this.textures);
    this.scene.add(this.district.root);

    this.trafficSystem = new TrafficSystem(this.district.materials);
    await this.trafficSystem.initialize(this.assetManager);
    this.scene.add(this.trafficSystem.root);

    this.stallRig = await buildKampalaRolexStall(this.assetManager, this.textures);
    this.scene.add(this.stallRig.root);

    if (!this.isSoftwareGl) {
      this.renderer.compile(this.scene, this.camera);
    }

    this.clock.start();
    this.startLoop();
  }

  private bindEvents(): void {
    window.addEventListener('resize', this.handleResize);
    this.renderer.domElement.addEventListener('pointerdown', this.handlePointerDown);
    this.renderer.domElement.addEventListener('pointerup', this.handlePointerUp);
    this.renderer.domElement.addEventListener('webglcontextlost', this.handleContextLost);
    this.renderer.domElement.addEventListener('webglcontextrestored', this.handleContextRestored);
  }

  private handleContextLost = (e: Event): void => {
    e.preventDefault();
    cancelAnimationFrame(this.frameId);
    clearTimeout(this.frameId);
    this.callbacks.onWebglError?.('3D graphics context paused. Restoring viewport...');
  };

  private handleContextRestored = (): void => {
    this.startLoop();
  };

  private handleResize = (): void => {
    if (this.disposed) return;
    const width = Math.max(this.container.clientWidth, 320);
    const height = Math.max(this.container.clientHeight, 240);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  private pointerDownPos = { x: 0, y: 0 };

  private handlePointerDown = (e: PointerEvent): void => {
    this.pointerDownPos.x = e.clientX;
    this.pointerDownPos.y = e.clientY;
  };

  private handlePointerUp = (e: PointerEvent): void => {
    const dx = e.clientX - this.pointerDownPos.x;
    const dy = e.clientY - this.pointerDownPos.y;
    // Ignore orbit drags
    if (dx * dx + dy * dy > 100) return;

    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.pointer, this.camera);
    const targets: THREE.Object3D[] = [
      ...(this.stallRig?.interactiveMeshes || []),
      ...this.customerVisuals.map((cv) => cv.hitboxMesh),
    ];

    const hits = this.raycaster.intersectObjects(targets, false);
    if (hits.length === 0) return;

    const data = hits[0].object.userData;
    if (data.interactType === 'station' && data.station) {
      this.callbacks.onStationClicked?.(data.station);
    } else if (data.interactType === 'customer' && data.customerId) {
      this.callbacks.onCustomerClicked?.(data.customerId);
    }
  };

  public setCameraPreset(preset: CameraPreset): void {
    this.queuedCameraGoal = null;
    this.setCameraFocus(preset);
  }

  public setCameraFocus(focus: CameraFocusTarget): void {
    const p = CAMERA_TARGETS[focus];
    this.activeCameraGoal = {
      pos: p.pos.clone(),
      target: p.target.clone(),
    };
  }

  public scheduleCameraFocus(focus: CameraFocusTarget, delaySec: number): void {
    this.queuedCameraGoal = { focus, delay: Math.max(0, delaySec) };
  }

  public clearScheduledCamera(): void {
    this.queuedCameraGoal = null;
  }

  public triggerCookingAction(kind: CookingActionKind, colorHex?: string): void {
    this.actionKind = kind;
    this.actionElapsed = 0;

    if (kind === 'roll_dough') this.actionDuration = 1.05;
    else if (kind === 'chop') this.actionDuration = 0.85;
    else if (kind === 'crack_egg') this.actionDuration = 0.92;
    else if (kind === 'pour_egg') this.actionDuration = 0.78;
    else if (kind === 'flip_tava') this.actionDuration = 0.72;
    else if (kind === 'roll_rolex') this.actionDuration = 0.85;
    else this.actionDuration = 0.95;

    if (this.stallRig) {
      if (kind === 'chop' && colorHex) {
        const vegMat = this.stallRig.chopVeggieMesh.material as THREE.MeshStandardMaterial;
        vegMat.color.set(colorHex);
        for (const bit of this.stallRig.choppedBits) {
          (bit.material as THREE.MeshStandardMaterial).color.set(colorHex);
        }
      }
      if (kind === 'roll_dough') {
        this.stallRig.prepDoughDisc.scale.set(0.65, 1.4, 0.65);
      }
    }
  }

  public syncCookingVisuals(state: CookingState): void {
    this.cookingState = state;
    if (!this.stallRig) return;

    const {
      panChapati,
      panOmelette,
      panOmeletteToppings,
      panRolled,
      trayRolled,
      eggCupLiquid,
      chopVeggieMesh,
      choppedBits,
    } = this.stallRig;

    // Reset pan visibility first
    panChapati.visible = false;
    panOmelette.visible = false;
    panRolled.visible = false;
    trayRolled.visible = false;

    const chapMat = panChapati.material as THREE.MeshStandardMaterial;
    const omeMat = panOmelette.material as THREE.MeshStandardMaterial;

    if (state.stage === 'chapati_grilling' || state.stage === 'chapati_ready') {
      panChapati.visible = true;
      const p = state.chapatiProgress / 100;
      if (p < 0.45) {
        this._tmpColor.setHex(0xfef3c7).lerp(new THREE.Color(0xf59e0b), p / 0.45);
      } else if (p <= 0.9) {
        this._tmpColor.setHex(0xe5a94c);
      } else {
        this._tmpColor.setHex(0x6b3a19);
      }
      chapMat.color.copy(this._tmpColor);
    } else if (state.stage === 'mixing_eggs' || state.stage === 'frying_omelette') {
      panOmelette.visible = state.stage === 'frying_omelette';
      const scale = 0.72 + Math.min(0.32, state.eggCount * 0.11);
      panOmelette.scale.set(scale, 1, scale);
      const p = state.omeletteProgress / 100;
      if (p < 0.55) {
        this._tmpColor.setHex(0xfde047);
      } else if (p <= 0.9) {
        this._tmpColor.setHex(0xf59e0b);
      } else {
        this._tmpColor.setHex(0x78350f);
      }
      omeMat.color.copy(this._tmpColor);
    } else if (state.stage === 'combining') {
      panOmelette.visible = true;
      panChapati.visible = true;
      panChapati.position.y = 0.252;
    } else if (state.stage === 'rolling') {
      panRolled.visible = true;
      panRolled.scale.setScalar(0.75 + (state.rollProgress / 100) * 0.25);
      panRolled.rotation.x = (state.rollProgress / 100) * Math.PI * 1.4;
    } else if (state.stage === 'ready_to_serve') {
      trayRolled.visible = true;
    }

    if (state.stage !== 'combining') {
      panChapati.position.y = 0.236;
    }

    // Color & show omelette toppings when omelette is frying or combining
    const showPanToppings = panOmelette.visible && state.selectedIngredients.length > 0;
    for (let i = 0; i < panOmeletteToppings.length; i++) {
      const fleck = panOmeletteToppings[i];
      fleck.visible = showPanToppings;
      if (showPanToppings) {
        const ingId = state.selectedIngredients[i % state.selectedIngredients.length];
        (fleck.material as THREE.MeshStandardMaterial).color.set(INGREDIENTS[ingId].colorHex);
      }
    }

    // Egg mixing cup level
    const inMixStage = state.stage === 'chapati_ready' || state.stage === 'mixing_eggs';
    if (inMixStage && state.eggCount > 0) {
      eggCupLiquid.visible = true;
      eggCupLiquid.scale.y = 0.8 + state.eggCount * 0.65;
      eggCupLiquid.position.y = 0.08 + state.eggCount * 0.017;
    } else {
      eggCupLiquid.visible = false;
    }

    // Show chopped bits on board when ingredients selected during prep/fry
    const showBoardBits =
      state.selectedIngredients.length > 0 &&
      (state.stage === 'chapati_ready' ||
        state.stage === 'mixing_eggs' ||
        state.stage === 'frying_omelette');
    for (let b = 0; b < choppedBits.length; b++) {
      choppedBits[b].visible = showBoardBits || (this.actionKind === 'chop');
      if (showBoardBits && state.selectedIngredients.length > 0 && this.actionKind !== 'chop') {
        const ingId = state.selectedIngredients[b % state.selectedIngredients.length];
        (choppedBits[b].material as THREE.MeshStandardMaterial).color.set(
          INGREDIENTS[ingId].colorHex,
        );
      }
    }
    if (!inMixStage && this.actionKind !== 'chop') {
      chopVeggieMesh.visible = false;
    }

    // Vendor target X lane behind counter
    const minLeftX = this.employeeHired ? -0.92 : -1.16;
    if (state.stage === 'chapati_grilling') {
      this.vendorTargetX = this.actionKind === 'roll_dough' ? minLeftX : -0.15;
    } else if (state.stage === 'chapati_ready' || state.stage === 'mixing_eggs') {
      this.vendorTargetX = 0.48;
    } else if (
      state.stage === 'frying_omelette' ||
      state.stage === 'combining' ||
      state.stage === 'rolling'
    ) {
      this.vendorTargetX = -0.15;
    } else if (state.stage === 'ready_to_serve') {
      this.vendorTargetX = 1.22;
    } else {
      this.vendorTargetX = -0.15;
    }
  }

  public syncUpgradesVisuals(
    upgrades: Record<string, number>,
    employeeHired: boolean,
  ): void {
    this.employeeHired = employeeHired;
    if (!this.stallRig) return;
    this.stallRig.jumaGroup.visible = employeeHired;
    this.stallRig.dualBurnerRing.visible = (upgrades['gas_sigiri'] || 0) > 0;
    this.stallRig.canopyExtension.visible = (upgrades['canopy_expand'] || 0) > 0;
  }

  public syncCustomers(orders: CustomerOrder[]): void {
    if (!this.textures) return;

    const activeIds = new Set(orders.map((o) => o.id));

    // Remove visuals no longer in state & dispose per-customer materials
    this.customerVisuals = this.customerVisuals.filter((cv) => {
      if (!activeIds.has(cv.order.id)) {
        this.scene.remove(cv.group);
        disposeCustomerVisual(cv);
        return false;
      }
      return true;
    });

    // Add newly spawned customers
    const existingIds = new Set(this.customerVisuals.map((cv) => cv.order.id));
    for (const order of orders) {
      if (!existingIds.has(order.id)) {
        const cv = buildUgandanCustomerMesh(order, this.textures.contactShadow);
        this.scene.add(cv.group);
        this.customerVisuals.push(cv);
      } else {
        const found = this.customerVisuals.find((c) => c.order.id === order.id);
        if (found) {
          found.order = order;
        }
      }
    }
  }

  private afterDraw(cb: () => void): void {
    const gl = this.renderer.getContext() as WebGL2RenderingContext;
    if (typeof gl.fenceSync === 'function') {
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (this.disposed) return;
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          this.frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          this.frameId = window.setTimeout(cb, 80);
        }
      };
      this.frameId = window.setTimeout(poll, 5);
    } else {
      this.frameId = window.setTimeout(cb, 80);
    }
  }

  private startLoop(): void {
    const tick = () => {
      if (this.disposed) return;
      const rawDt = this.clock.getDelta();
      const dt = Math.min(rawDt, 0.1);
      const elapsed = this.clock.getElapsedTime();

      // Handle queued follow-up camera goal (e.g., prep dough roll -> tava sizzle)
      if (this.queuedCameraGoal) {
        this.queuedCameraGoal.delay -= dt;
        if (this.queuedCameraGoal.delay <= 0) {
          const nextFocus = this.queuedCameraGoal.focus;
          this.queuedCameraGoal = null;
          this.setCameraFocus(nextFocus);
        }
      }

      // Smooth damped camera preset transition
      if (this.activeCameraGoal) {
        const dampLambda = 6.5;
        this.camera.position.x = THREE.MathUtils.damp(
          this.camera.position.x,
          this.activeCameraGoal.pos.x,
          dampLambda,
          dt,
        );
        this.camera.position.y = THREE.MathUtils.damp(
          this.camera.position.y,
          this.activeCameraGoal.pos.y,
          dampLambda,
          dt,
        );
        this.camera.position.z = THREE.MathUtils.damp(
          this.camera.position.z,
          this.activeCameraGoal.pos.z,
          dampLambda,
          dt,
        );

        this.controls.target.x = THREE.MathUtils.damp(
          this.controls.target.x,
          this.activeCameraGoal.target.x,
          dampLambda,
          dt,
        );
        this.controls.target.y = THREE.MathUtils.damp(
          this.controls.target.y,
          this.activeCameraGoal.target.y,
          dampLambda,
          dt,
        );
        this.controls.target.z = THREE.MathUtils.damp(
          this.controls.target.z,
          this.activeCameraGoal.target.z,
          dampLambda,
          dt,
        );

        if (this.camera.position.distanceTo(this.activeCameraGoal.pos) < 0.025) {
          this.activeCameraGoal = null;
        }
      }

      this.controls.update();

      // Animate stall stove embers, steam particles, Primary Vendor & Juma NPC
      if (this.stallRig) {
        const rig = this.stallRig;
        const emberMat = rig.emberGlow.material as THREE.MeshStandardMaterial;
        const heatBoost = this.cookingState?.panHeat || 0.3;
        emberMat.emissiveIntensity = 1.15 + heatBoost * 0.9 + Math.sin(elapsed * 7) * 0.2;
        rig.stoveLight.intensity = 1.1 + heatBoost * 0.7 + Math.sin(elapsed * 9) * 0.12;

        // Steam particles
        const isHot =
          this.cookingState &&
          (this.cookingState.stage === 'chapati_grilling' ||
            this.cookingState.stage === 'frying_omelette' ||
            this.cookingState.stage === 'combining');
        const steamMat = rig.steamParticles.material as THREE.PointsMaterial;
        steamMat.opacity = THREE.MathUtils.damp(steamMat.opacity, isHot ? 0.55 : 0.0, 5, dt);

        if (steamMat.opacity > 0.02) {
          const posAttr = rig.steamParticles.geometry.getAttribute(
            'position',
          ) as THREE.BufferAttribute;
          const arr = rig.steamPositions;
          const vels = rig.steamVelocities;
          for (let i = 0; i < vels.length; i++) {
            arr[i * 3 + 1] += vels[i] * dt;
            arr[i * 3] += Math.sin(elapsed * 3 + i) * 0.06 * dt;
            if (arr[i * 3 + 1] > 0.95) {
              arr[i * 3 + 1] = 0.25;
              arr[i * 3] = (Math.random() - 0.5) * 0.34;
              arr[i * 3 + 2] = (Math.random() - 0.5) * 0.34;
            }
          }
          posAttr.needsUpdate = true;
        }

        // Primary Vendor & live cooking action choreography
        const minLeftX = this.employeeHired ? -0.92 : -1.16;
        let desiredVendorX = this.vendorTargetX;
        let targetLeftArmX = -0.52 + Math.sin(elapsed * 2.1) * 0.04;
        let targetRightArmX = -0.55 + Math.cos(elapsed * 2.1) * 0.04;
        let targetLeftArmZ = 0.02;
        let targetRightArmZ = -0.02;
        let targetHeadX = 0.12;
        let targetHeadY = Math.sin(elapsed * 0.9) * 0.08;

        let showKnife = false;
        let showPin = false;
        let showSpatula = false;
        let showEgg = false;

        if (this.actionKind) {
          this.actionElapsed += dt;
          const u = Math.min(1, this.actionElapsed / Math.max(0.01, this.actionDuration));

          if (this.actionKind === 'roll_dough') {
            desiredVendorX = minLeftX;
            showPin = true;
            if (rig.prepPin) rig.prepPin.visible = false;
            const rollWave = Math.sin(u * Math.PI * 5);
            targetLeftArmX = -0.95 + rollWave * 0.26;
            targetRightArmX = -0.95 + rollWave * 0.26;
            targetHeadX = 0.24;
            targetHeadY = -0.15;
            const flat = 0.65 + u * 0.55;
            rig.prepDoughDisc.scale.set(flat, 1.4 - u * 0.65, flat);
          } else if (this.actionKind === 'chop') {
            desiredVendorX = 0.24;
            showKnife = true;
            rig.chopVeggieMesh.visible = true;
            const chopWave = Math.abs(Math.sin(u * Math.PI * 6));
            targetRightArmX = -0.68 - chopWave * 0.52;
            targetLeftArmX = -0.82;
            targetHeadX = 0.26;
            targetHeadY = 0.04;
            for (let b = 0; b < rig.choppedBits.length; b++) {
              rig.choppedBits[b].visible = true;
              rig.choppedBits[b].position.y = 0.032 + chopWave * 0.024 * ((b % 2) + 0.4);
            }
          } else if (this.actionKind === 'crack_egg') {
            desiredVendorX = 0.72;
            showEgg = u < 0.42;
            rig.crackEggGroup.visible = u >= 0.3;
            const split = Math.max(0, (u - 0.35) / 0.65);
            rig.crackShellLeft.position.x = -0.016 - split * 0.035;
            rig.crackShellLeft.rotation.z = Math.PI / 2 + split * 0.45;
            rig.crackShellRight.position.x = 0.016 + split * 0.035;
            rig.crackShellRight.rotation.z = -Math.PI / 2 - split * 0.45;
            rig.crackYolkDrop.position.y = -0.02 - split * 0.14;
            rig.crackYolkDrop.visible = u >= 0.35 && u < 0.85;
            rig.eggCupWhisk.rotation.y += dt * 16;
            targetRightArmX = -0.86 - Math.sin(u * Math.PI) * 0.24;
            targetLeftArmX = -0.78;
            targetHeadX = 0.22;
            targetHeadY = 0.12;
          } else if (this.actionKind === 'pour_egg') {
            desiredVendorX = 0.12;
            targetRightArmX = -1.05 - Math.sin(u * Math.PI) * 0.25;
            targetRightArmZ = 0.32;
            targetLeftArmX = -0.7;
            targetHeadX = 0.22;
          } else if (this.actionKind === 'flip_tava') {
            desiredVendorX = -0.15;
            showSpatula = true;
            const flick = Math.sin(u * Math.PI);
            targetRightArmX = -0.85 - flick * 0.45;
            targetHeadX = 0.22;
          } else if (this.actionKind === 'roll_rolex') {
            desiredVendorX = -0.05;
            const swirl = Math.sin(u * Math.PI * 3);
            targetLeftArmX = -0.95 + swirl * 0.18;
            targetRightArmX = -0.95 - swirl * 0.18;
            targetLeftArmZ = -0.18;
            targetRightArmZ = 0.18;
            targetHeadX = 0.25;
          } else if (this.actionKind === 'serve') {
            desiredVendorX = 1.24;
            const reach = Math.sin(u * Math.PI);
            targetRightArmX = -0.75 - reach * 0.5;
            targetLeftArmX = -0.6 - reach * 0.3;
            targetHeadX = 0.04;
            targetHeadY = 0.12;
          }

          if (this.actionElapsed >= this.actionDuration) {
            this.actionKind = null;
            rig.crackEggGroup.visible = false;
            rig.chopVeggieMesh.visible = false;
            if (rig.prepPin) rig.prepPin.visible = true;
            for (const bit of rig.choppedBits) {
              bit.position.y = 0.032;
            }
          }
        } else {
          rig.crackEggGroup.visible = false;
          if (rig.prepPin) rig.prepPin.visible = true;
          if (
            this.cookingState?.stage === 'chapati_grilling' ||
            this.cookingState?.stage === 'frying_omelette'
          ) {
            showSpatula = true;
            targetRightArmX = -0.82 + Math.sin(elapsed * 4.5) * 0.08;
            targetHeadX = 0.2;
          } else if (
            this.cookingState?.stage === 'chapati_ready' ||
            this.cookingState?.stage === 'mixing_eggs'
          ) {
            rig.eggCupWhisk.rotation.y += dt * 3.5;
            targetLeftArmX = -0.72;
            targetRightArmX = -0.76 + Math.sin(elapsed * 5) * 0.07;
            targetHeadX = 0.18;
          }
        }

        rig.vendorGroup.position.x = THREE.MathUtils.damp(
          rig.vendorGroup.position.x,
          desiredVendorX,
          7.5,
          dt,
        );

        if (rig.vendorTorso) {
          rig.vendorTorso.position.y = 1.12 + Math.sin(elapsed * 2.4) * 0.008;
        }
        if (rig.vendorHead) {
          rig.vendorHead.rotation.x = THREE.MathUtils.damp(
            rig.vendorHead.rotation.x,
            targetHeadX,
            8,
            dt,
          );
          rig.vendorHead.rotation.y = THREE.MathUtils.damp(
            rig.vendorHead.rotation.y,
            targetHeadY,
            8,
            dt,
          );
        }
        if (rig.vendorLeftArm) {
          rig.vendorLeftArm.rotation.x = THREE.MathUtils.damp(
            rig.vendorLeftArm.rotation.x,
            targetLeftArmX,
            14,
            dt,
          );
          rig.vendorLeftArm.rotation.z = THREE.MathUtils.damp(
            rig.vendorLeftArm.rotation.z,
            targetLeftArmZ,
            12,
            dt,
          );
        }
        if (rig.vendorRightArm) {
          rig.vendorRightArm.rotation.x = THREE.MathUtils.damp(
            rig.vendorRightArm.rotation.x,
            targetRightArmX,
            14,
            dt,
          );
          rig.vendorRightArm.rotation.z = THREE.MathUtils.damp(
            rig.vendorRightArm.rotation.z,
            targetRightArmZ,
            12,
            dt,
          );
        }
        if (rig.vendorKnife) rig.vendorKnife.visible = showKnife;
        if (rig.vendorRollingPin) rig.vendorRollingPin.visible = showPin;
        if (rig.vendorSpatula) rig.vendorSpatula.visible = showSpatula;
        if (rig.vendorEggProp) rig.vendorEggProp.visible = showEgg;

        // Juma chopping motion when hired
        if (rig.jumaGroup.visible && rig.jumaRightArm) {
          rig.jumaRightArm.rotation.x = -0.85 + Math.sin(elapsed * 8) * 0.22;
        }
      }

      // Animate Kireka street traffic & market pedestrians
      this.trafficSystem?.update(dt, elapsed);

      // Animate customers
      updateCustomerVisuals(this.customerVisuals, dt, elapsed);

      this.renderer.render(this.scene, this.camera);

      if (this.isSoftwareGl) {
        this.afterDraw(tick);
      } else {
        this.frameId = requestAnimationFrame(tick);
      }
    };

    if (this.isSoftwareGl) {
      this.afterDraw(tick);
    } else {
      this.frameId = requestAnimationFrame(tick);
    }
  }

  public dispose(): void {
    this.disposed = true;
    cancelAnimationFrame(this.frameId);
    clearTimeout(this.frameId);

    window.removeEventListener('resize', this.handleResize);
    this.renderer.domElement.removeEventListener('pointerdown', this.handlePointerDown);
    this.renderer.domElement.removeEventListener('pointerup', this.handlePointerUp);
    this.renderer.domElement.removeEventListener('webglcontextlost', this.handleContextLost);
    this.renderer.domElement.removeEventListener('webglcontextrestored', this.handleContextRestored);

    for (const cv of this.customerVisuals) {
      this.scene.remove(cv.group);
      disposeCustomerVisual(cv);
    }
    this.customerVisuals = [];

    this.scene.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        mesh.geometry?.dispose();
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((m) => m.dispose());
        } else {
          mesh.material?.dispose();
        }
      }
    });

    this.trafficSystem?.dispose();
    this.trafficSystem = null;
    this.district?.dispose();
    this.district = null;

    this.assetManager.dispose();
    this.controls.dispose();
    this.renderer.dispose();
    if (this.renderer.domElement.parentElement === this.container) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
