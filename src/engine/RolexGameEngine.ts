import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { CameraPreset, CookingState, CustomerOrder } from '../types/game';
import { AssetManager } from './AssetManager';
import { createProceduralTextures, ProceduralTextureSet } from './ProceduralTextures';
import { buildKampalaRolexStall, StallRig } from './StallBuilder';
import {
  buildUgandanCustomerMesh,
  CustomerVisual,
  disposeCustomerVisual,
  updateCustomerVisuals,
} from './CustomerSystem';

export interface EngineCallbacks {
  onStationClicked?: (station: 'prep' | 'tava' | 'ingredients' | 'serve') => void;
  onCustomerClicked?: (customerId: string) => void;
  onWebglError?: (message: string) => void;
}

const CAMERA_PRESETS: Record<CameraPreset, { pos: THREE.Vector3; target: THREE.Vector3 }> = {
  overview: {
    pos: new THREE.Vector3(0.4, 3.05, 5.15),
    target: new THREE.Vector3(0, 1.05, 0.2),
  },
  tava: {
    pos: new THREE.Vector3(-0.15, 2.05, 1.42),
    target: new THREE.Vector3(-0.15, 1.15, 0.02),
  },
  prep: {
    pos: new THREE.Vector3(-1.18, 2.0, 1.55),
    target: new THREE.Vector3(-1.18, 1.05, 0.05),
  },
  counter: {
    pos: new THREE.Vector3(1.15, 2.15, 2.35),
    target: new THREE.Vector3(0.65, 1.05, 0.45),
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
  private customerVisuals: CustomerVisual[] = [];

  private activeCameraGoal: { pos: THREE.Vector3; target: THREE.Vector3 } | null = null;
  private cookingState: CookingState | null = null;
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
    const skyColor = new THREE.Color(0xdbeafe);
    this.scene.background = skyColor;
    this.scene.fog = new THREE.FogExp2(0xdbeafe, 0.022);

    this.camera = new THREE.PerspectiveCamera(46, width / height, 0.1, 120);
    this.camera.position.copy(CAMERA_PRESETS.overview.pos);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.target.copy(CAMERA_PRESETS.overview.target);
    this.controls.enableDamping = !this.isSoftwareGl;
    this.controls.dampingFactor = 0.07;
    this.controls.maxPolarAngle = Math.PI * 0.47;
    this.controls.minPolarAngle = 0.25;
    this.controls.minAzimuthAngle = -Math.PI * 0.45;
    this.controls.maxAzimuthAngle = Math.PI * 0.45;
    this.controls.minDistance = 1.5;
    this.controls.maxDistance = 10.5;
    this.controls.enablePan = false;
    this.controls.update();

    this.controls.addEventListener('start', () => {
      // Cancel scripted camera transition if player grabs the viewport
      this.activeCameraGoal = null;
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
    const hemi = new THREE.HemisphereLight(0xbae6fd, 0x8b4a2b, 0.82);
    this.scene.add(hemi);

    const sun = new THREE.DirectionalLight(0xfff1d6, 2.15);
    sun.position.set(6.5, 11, 7.5);
    sun.castShadow = !this.isSoftwareGl;
    sun.shadow.mapSize.width = 1024;
    sun.shadow.mapSize.height = 1024;
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = 32;
    const d = 8.5;
    sun.shadow.camera.left = -d;
    sun.shadow.camera.right = d;
    sun.shadow.camera.top = d;
    sun.shadow.camera.bottom = -d;
    sun.shadow.bias = -0.0005;
    sun.shadow.normalBias = 0.02;
    this.scene.add(sun);

    // Subtle cool rim light separating stall silhouette from background shopfronts
    const rim = new THREE.DirectionalLight(0x93c5fd, 0.45);
    rim.position.set(-5, 4, -6);
    this.scene.add(rim);
  }

  public async initialize(): Promise<void> {
    const maxAniso = this.renderer.capabilities.getMaxAnisotropy();
    this.textures = createProceduralTextures(maxAniso);
    Object.values(this.textures).forEach((t) => this.assetManager.trackTexture(t));

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
    const p = CAMERA_PRESETS[preset];
    this.activeCameraGoal = {
      pos: p.pos.clone(),
      target: p.target.clone(),
    };
  }

  public syncCookingVisuals(state: CookingState): void {
    this.cookingState = state;
    if (!this.stallRig) return;

    const { panChapati, panOmelette, panRolled, trayRolled } = this.stallRig;

    // Reset visibility first
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
        this._tmpColor.setHex(0x6b3a19); // Overcooked char
      }
      chapMat.color.copy(this._tmpColor);
    } else if (state.stage === 'mixing_eggs' || state.stage === 'frying_omelette') {
      panOmelette.visible = true;
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
    } else if (state.stage === 'ready_to_serve') {
      trayRolled.visible = true;
    }

    if (state.stage !== 'combining') {
      panChapati.position.y = 0.236;
    }
  }

  public syncUpgradesVisuals(
    upgrades: Record<string, number>,
    employeeHired: boolean,
  ): void {
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

      // Animate stall stove embers, steam particles, and Juma NPC
      if (this.stallRig) {
        const emberMat = this.stallRig.emberGlow.material as THREE.MeshStandardMaterial;
        const heatBoost = this.cookingState?.panHeat || 0.3;
        emberMat.emissiveIntensity = 1.15 + heatBoost * 0.9 + Math.sin(elapsed * 7) * 0.2;
        this.stallRig.stoveLight.intensity = 1.1 + heatBoost * 0.7 + Math.sin(elapsed * 9) * 0.12;

        // Steam particles
        const isHot =
          this.cookingState &&
          (this.cookingState.stage === 'chapati_grilling' ||
            this.cookingState.stage === 'frying_omelette' ||
            this.cookingState.stage === 'combining');
        const steamMat = this.stallRig.steamParticles.material as THREE.PointsMaterial;
        steamMat.opacity = THREE.MathUtils.damp(steamMat.opacity, isHot ? 0.55 : 0.0, 5, dt);

        if (steamMat.opacity > 0.02) {
          const posAttr = this.stallRig.steamParticles.geometry.getAttribute(
            'position',
          ) as THREE.BufferAttribute;
          const arr = this.stallRig.steamPositions;
          const vels = this.stallRig.steamVelocities;
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

        // Juma chopping motion when hired
        if (this.stallRig.jumaGroup.visible) {
          this.stallRig.jumaRightArm.rotation.x = -0.85 + Math.sin(elapsed * 8) * 0.22;
        }
      }

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

    this.assetManager.dispose();
    this.controls.dispose();
    this.renderer.dispose();
    if (this.renderer.domElement.parentElement === this.container) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
