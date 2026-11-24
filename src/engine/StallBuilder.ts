import * as THREE from 'three';
import { ProceduralTextureSet } from './ProceduralTextures';
import { AssetManager } from './AssetManager';

export interface StallRig {
  root: THREE.Group;
  panSurfacePos: THREE.Vector3;
  servingTrayPos: THREE.Vector3;
  panChapati: THREE.Mesh;
  panOmelette: THREE.Mesh;
  panRolled: THREE.Group;
  trayRolled: THREE.Group;
  emberGlow: THREE.Mesh;
  stoveLight: THREE.PointLight;
  bulbLight: THREE.PointLight;
  jumaGroup: THREE.Group;
  jumaRightArm: THREE.Mesh;
  canopyExtension: THREE.Group;
  dualBurnerRing: THREE.Mesh;
  signboardBanner: THREE.Mesh;
  interactiveMeshes: THREE.Object3D[];
  steamParticles: THREE.Points;
  steamPositions: Float32Array;
  steamVelocities: Float32Array;
}

function createBowlWithContents(
  colorHex: number,
  chunkColorHex: number,
  radius = 0.11,
): THREE.Group {
  const g = new THREE.Group();
  const bowlMat = new THREE.MeshStandardMaterial({
    color: 0xd1d5db,
    metalness: 0.82,
    roughness: 0.25,
  });
  const bowl = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius * 0.72, 0.08, 16),
    bowlMat,
  );
  bowl.position.y = 0.04;
  bowl.castShadow = true;
  bowl.receiveShadow = true;
  g.add(bowl);

  const fill = new THREE.Mesh(
    new THREE.SphereGeometry(radius * 0.85, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.45),
    new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.88, metalness: 0.0 }),
  );
  fill.position.y = 0.065;
  fill.scale.y = 0.45;
  g.add(fill);

  const chunkGeo = new THREE.BoxGeometry(0.022, 0.018, 0.022);
  const chunkMat = new THREE.MeshStandardMaterial({ color: chunkColorHex, roughness: 0.75 });
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const r = radius * 0.42;
    const chunk = new THREE.Mesh(chunkGeo, chunkMat);
    chunk.position.set(Math.cos(a) * r, 0.09, Math.sin(a) * r);
    chunk.rotation.set(i * 0.4, i * 0.7, 0);
    g.add(chunk);
  }
  return g;
}

function createRolledRolexMesh(chapatiTex: THREE.Texture): THREE.Group {
  const g = new THREE.Group();
  // Outer golden chapati cylinder
  const roll = new THREE.Mesh(
    new THREE.CylinderGeometry(0.048, 0.048, 0.24, 16),
    new THREE.MeshStandardMaterial({
      map: chapatiTex,
      roughness: 0.72,
      metalness: 0.02,
    }),
  );
  roll.rotation.z = Math.PI / 2;
  roll.castShadow = true;
  g.add(roll);

  // Egg peek at both ends
  const eggCapMat = new THREE.MeshStandardMaterial({ color: 0xf4be37, roughness: 0.65 });
  const cap1 = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.038, 0.246, 12), eggCapMat);
  cap1.rotation.z = Math.PI / 2;
  g.add(cap1);

  // Authentic Ugandan brown kraft paper wrap sleeve around middle
  const paper = new THREE.Mesh(
    new THREE.CylinderGeometry(0.052, 0.052, 0.14, 16, 1, true),
    new THREE.MeshStandardMaterial({
      color: 0xc29b61,
      roughness: 0.92,
      side: THREE.DoubleSide,
    }),
  );
  paper.rotation.z = Math.PI / 2;
  g.add(paper);

  return g;
}

function buildKampalaEnvironment(
  root: THREE.Group,
  textures: ProceduralTextureSet,
): void {
  // Ground: Kampala red laterite murram extending wide into horizon fog
  const soilGround = new THREE.Mesh(
    new THREE.PlaneGeometry(140, 140),
    new THREE.MeshStandardMaterial({
      map: textures.lateriteSoil,
      roughness: 0.95,
      metalness: 0.0,
    }),
  );
  soilGround.rotation.x = -Math.PI / 2;
  soilGround.position.y = 0;
  soilGround.receiveShadow = true;
  root.add(soilGround);

  // Tarmac street in front of stall
  const tarmac = new THREE.Mesh(
    new THREE.PlaneGeometry(100, 5.2),
    new THREE.MeshStandardMaterial({
      map: textures.kampalaTarmac,
      roughness: 0.88,
      metalness: 0.04,
    }),
  );
  tarmac.rotation.x = -Math.PI / 2;
  tarmac.position.set(0, 0.02, 5.2);
  tarmac.receiveShadow = true;
  root.add(tarmac);

  // Concrete roadside curb
  const curb = new THREE.Mesh(
    new THREE.BoxGeometry(60, 0.12, 0.3),
    new THREE.MeshStandardMaterial({ color: 0x9ca3af, roughness: 0.9 }),
  );
  curb.position.set(0, 0.06, 2.55);
  curb.receiveShadow = true;
  root.add(curb);

  // Kampala roadside shopfronts in background (Buildings category)
  const buildingConfigs = [
    { x: -8.5, z: -6.5, w: 6.2, h: 3.8, d: 4.5, color: 0xd9a066, trim: 0x1e40af },
    { x: 0.5, z: -7.8, w: 7.4, h: 4.2, d: 4.5, color: 0xe5d3b3, trim: 0x15803d },
    { x: 9.2, z: -6.2, w: 5.8, h: 3.6, d: 4.5, color: 0xcbd5e1, trim: 0xb91c1c },
  ];

  for (const b of buildingConfigs) {
    const bGroup = new THREE.Group();
    bGroup.position.set(b.x, 0, b.z);

    const walls = new THREE.Mesh(
      new THREE.BoxGeometry(b.w, b.h, b.d),
      new THREE.MeshStandardMaterial({ color: b.color, roughness: 0.88 }),
    );
    walls.position.y = b.h / 2;
    walls.castShadow = true;
    walls.receiveShadow = true;
    bGroup.add(walls);

    const roof = new THREE.Mesh(
      new THREE.BoxGeometry(b.w + 0.6, 0.14, b.d + 0.9),
      new THREE.MeshStandardMaterial({
        map: textures.mabatiRoof,
        roughness: 0.55,
        metalness: 0.45,
      }),
    );
    roof.position.set(0, b.h + 0.07, 0.25);
    roof.rotation.x = 0.08;
    bGroup.add(roof);

    const fascia = new THREE.Mesh(
      new THREE.BoxGeometry(b.w + 0.1, 0.45, 0.12),
      new THREE.MeshStandardMaterial({ color: b.trim, roughness: 0.7 }),
    );
    fascia.position.set(0, b.h - 0.55, b.d / 2 + 0.05);
    bGroup.add(fascia);

    // Shop shutter door
    const shutter = new THREE.Mesh(
      new THREE.BoxGeometry(1.8, 2.2, 0.1),
      new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.5, metalness: 0.5 }),
    );
    shutter.position.set(0, 1.1, b.d / 2 + 0.03);
    bGroup.add(shutter);

    root.add(bGroup);
  }

  // Ugandan Roadside Acacia / Shade Trees (Instanced foliage puffs + trunks)
  const treePositions = [
    [-6.2, -2.5],
    [6.6, -2.2],
    [-12.5, 1.2],
    [12.2, 1.6],
  ];
  for (const [tx, tz] of treePositions) {
    const tree = new THREE.Group();
    tree.position.set(tx, 0, tz);

    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.16, 0.24, 2.4, 8),
      new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.94 }),
    );
    trunk.position.y = 1.2;
    trunk.castShadow = true;
    tree.add(trunk);

    const canopyMat = new THREE.MeshStandardMaterial({ color: 0x3f6212, roughness: 0.88 });
    const canopyOffsets = [
      [0, 2.75, 0, 1.45, 0.52],
      [-0.7, 2.5, 0.3, 0.95, 0.44],
      [0.75, 2.55, -0.2, 1.0, 0.46],
    ];
    for (const [cx, cy, cz, rx, ry] of canopyOffsets) {
      const puff = new THREE.Mesh(new THREE.SphereGeometry(rx, 10, 8), canopyMat);
      puff.scale.y = ry;
      puff.position.set(cx, cy, cz);
      puff.castShadow = true;
      tree.add(puff);
    }
    root.add(tree);
  }

  // Parked Ugandan Boda-Boda Motorbike near roadside (composite 8-part model)
  const boda = new THREE.Group();
  boda.position.set(3.85, 0, 2.95);
  boda.rotation.y = -0.45;

  const tireMat = new THREE.MeshStandardMaterial({ color: 0x171717, roughness: 0.85 });
  const rimMat = new THREE.MeshStandardMaterial({ color: 0x9ca3af, metalness: 0.85, roughness: 0.3 });
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.35, metalness: 0.3 });

  for (const wx of [-0.55, 0.55]) {
    const tire = new THREE.Mesh(new THREE.TorusGeometry(0.27, 0.075, 10, 18), tireMat);
    tire.position.set(wx, 0.34, 0);
    tire.castShadow = true;
    boda.add(tire);
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.08, 12), rimMat);
    hub.rotation.x = Math.PI / 2;
    hub.position.set(wx, 0.34, 0);
    boda.add(hub);
  }

  const chassis = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.24, 0.24), bodyMat);
  chassis.position.set(0, 0.62, 0);
  chassis.castShadow = true;
  boda.add(chassis);

  const seat = new THREE.Mesh(
    new THREE.BoxGeometry(0.62, 0.12, 0.28),
    new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.8 }),
  );
  seat.position.set(-0.14, 0.78, 0);
  boda.add(seat);

  const fork = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.65, 8), rimMat);
  fork.position.set(0.46, 0.62, 0);
  fork.rotation.z = 0.28;
  boda.add(fork);

  const handlebar = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.62, 8), rimMat);
  handlebar.rotation.x = Math.PI / 2;
  handlebar.position.set(0.38, 0.94, 0);
  boda.add(handlebar);

  root.add(boda);
}

export async function buildKampalaRolexStall(
  assetManager: AssetManager,
  textures: ProceduralTextureSet,
): Promise<StallRig> {
  const root = new THREE.Group();
  const interactiveMeshes: THREE.Object3D[] = [];

  buildKampalaEnvironment(root, textures);

  const stallGroup = new THREE.Group();
  stallGroup.position.set(0, 0, 0);
  root.add(stallGroup);

  // Stall concrete pad
  const pad = new THREE.Mesh(
    new THREE.BoxGeometry(4.4, 0.06, 2.5),
    new THREE.MeshStandardMaterial({ color: 0x6b7280, roughness: 0.92 }),
  );
  pad.position.set(0, 0.03, -0.15);
  pad.receiveShadow = true;
  stallGroup.add(pad);

  // Materials
  const frameWoodMat = new THREE.MeshStandardMaterial({
    map: textures.woodCounter,
    roughness: 0.85,
    metalness: 0.02,
  });
  const counterTopMat = new THREE.MeshStandardMaterial({
    color: 0xcbd5e1,
    roughness: 0.34,
    metalness: 0.78,
  });
  const ironFrameMat = new THREE.MeshStandardMaterial({
    color: 0x27272a,
    roughness: 0.5,
    metalness: 0.72,
  });

  // 4 Timber Support Posts
  const postGeo = new THREE.BoxGeometry(0.11, 2.38, 0.11);
  const postCoords = [
    [-1.85, -1.05],
    [1.85, -1.05],
    [-1.85, 0.65],
    [1.85, 0.65],
  ];
  for (const [px, pz] of postCoords) {
    const post = new THREE.Mesh(postGeo, frameWoodMat);
    post.position.set(px, 1.22, pz);
    post.castShadow = true;
    post.receiveShadow = true;
    stallGroup.add(post);
  }

  // Corrugated Mabati Slanted Roof
  const roofGroup = new THREE.Group();
  roofGroup.position.set(0, 2.42, -0.18);
  roofGroup.rotation.x = -0.12;
  const roofSheet = new THREE.Mesh(
    new THREE.BoxGeometry(4.35, 0.05, 2.35),
    new THREE.MeshStandardMaterial({
      map: textures.mabatiRoof,
      roughness: 0.45,
      metalness: 0.65,
    }),
  );
  roofSheet.castShadow = true;
  roofSheet.receiveShadow = true;
  roofGroup.add(roofSheet);
  stallGroup.add(roofGroup);

  // Front Signboard Banner ("ROLEX EMPIRE · KAMPALA")
  const signboardBanner = new THREE.Mesh(
    new THREE.BoxGeometry(3.85, 0.56, 0.07),
    new THREE.MeshStandardMaterial({
      map: textures.ugandaSignBanner,
      roughness: 0.5,
      metalness: 0.05,
    }),
  );
  signboardBanner.position.set(0, 2.25, 0.75);
  signboardBanner.castShadow = true;
  stallGroup.add(signboardBanner);

  // Hanging Warm Tungsten Bulb under Roof
  const bulbWire = new THREE.Mesh(
    new THREE.CylinderGeometry(0.01, 0.01, 0.34, 6),
    ironFrameMat,
  );
  bulbWire.position.set(0, 2.15, 0.05);
  stallGroup.add(bulbWire);

  const bulbMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.065, 12, 10),
    new THREE.MeshStandardMaterial({
      color: 0xffedd5,
      emissive: 0xffb347,
      emissiveIntensity: 1.8,
      roughness: 0.2,
    }),
  );
  bulbMesh.position.set(0, 1.96, 0.05);
  stallGroup.add(bulbMesh);

  const bulbLight = new THREE.PointLight(0xffbe66, 2.2, 6.5, 1.8);
  bulbLight.position.set(0, 1.88, 0.15);
  stallGroup.add(bulbLight);

  // Main Stall Counter Base & Kitenge Front Apron
  const counterBase = new THREE.Mesh(
    new THREE.BoxGeometry(3.7, 0.88, 1.2),
    frameWoodMat,
  );
  counterBase.position.set(0, 0.46, -0.05);
  counterBase.castShadow = true;
  counterBase.receiveShadow = true;
  stallGroup.add(counterBase);

  const kitengeFront = new THREE.Mesh(
    new THREE.PlaneGeometry(3.62, 0.82),
    new THREE.MeshStandardMaterial({
      map: textures.kitengePattern,
      roughness: 0.9,
      metalness: 0.0,
    }),
  );
  kitengeFront.position.set(0, 0.47, 0.56);
  stallGroup.add(kitengeFront);

  // Stainless Steel Counter Top
  const counterTop = new THREE.Mesh(
    new THREE.BoxGeometry(3.84, 0.06, 1.32),
    counterTopMat,
  );
  counterTop.position.set(0, 0.93, -0.05);
  counterTop.castShadow = true;
  counterTop.receiveShadow = true;
  stallGroup.add(counterTop);

  // Back Shelf with Soda Crates & Oil Jerrycan
  const backWall = new THREE.Mesh(
    new THREE.BoxGeometry(3.75, 1.2, 0.08),
    new THREE.MeshStandardMaterial({
      map: textures.mabatiRoof,
      roughness: 0.65,
      metalness: 0.4,
    }),
  );
  backWall.position.set(0, 1.15, -1.06);
  backWall.castShadow = true;
  backWall.receiveShadow = true;
  stallGroup.add(backWall);

  // Iconic Yellow Ugandan Oil Jerrycan beside stall
  const jerrycan = new THREE.Mesh(
    new THREE.BoxGeometry(0.28, 0.44, 0.22),
    new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.48 }),
  );
  jerrycan.position.set(-2.15, 0.24, 0.15);
  jerrycan.castShadow = true;
  stallGroup.add(jerrycan);

  // Menu Board Easel on right front side of stall
  const menuGroup = new THREE.Group();
  menuGroup.position.set(2.35, 0, 0.85);
  menuGroup.rotation.y = -0.35;
  const easelLeg1 = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.35, 0.06), frameWoodMat);
  easelLeg1.position.set(-0.28, 0.66, 0);
  easelLeg1.rotation.x = -0.12;
  menuGroup.add(easelLeg1);
  const easelLeg2 = easelLeg1.clone();
  easelLeg2.position.x = 0.28;
  menuGroup.add(easelLeg2);
  const menuPanel = new THREE.Mesh(
    new THREE.BoxGeometry(0.84, 0.92, 0.05),
    new THREE.MeshStandardMaterial({ map: textures.menuBoard, roughness: 0.6 }),
  );
  menuPanel.position.set(0, 1.02, 0.05);
  menuPanel.castShadow = true;
  menuGroup.add(menuPanel);
  stallGroup.add(menuGroup);

  // Customer Waiting Bench
  const bench = new THREE.Group();
  bench.position.set(-2.15, 0, 1.45);
  const benchPlank = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.06, 0.34), frameWoodMat);
  benchPlank.position.y = 0.44;
  benchPlank.castShadow = true;
  bench.add(benchPlank);
  for (const lx of [-0.45, 0.45]) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.44, 0.28), frameWoodMat);
    leg.position.set(lx, 0.22, 0);
    bench.add(leg);
  }
  stallGroup.add(bench);

  // --- STATION 1: CHAPATI PREP BOARD (Left: x = -1.25) ---
  const prepGroup = await assetManager.loadOrBuild('equip_rolling_pin', () => {
    const g = new THREE.Group();
    g.position.set(-1.25, 0.96, 0.05);

    const board = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.28, 0.035, 24),
      frameWoodMat,
    );
    board.position.y = 0.0175;
    board.receiveShadow = true;
    g.add(board);

    // Dough balls ready to roll
    const doughMat = new THREE.MeshStandardMaterial({ color: 0xf3e5ab, roughness: 0.88 });
    for (let i = 0; i < 3; i++) {
      const ball = new THREE.Mesh(new THREE.SphereGeometry(0.055, 12, 10), doughMat);
      ball.scale.y = 0.72;
      ball.position.set(-0.32, 0.04, -0.25 + i * 0.14);
      ball.castShadow = true;
      g.add(ball);
    }

    // Wooden rolling pin
    const pin = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025, 0.025, 0.36, 12),
      new THREE.MeshStandardMaterial({ color: 0xa16207, roughness: 0.7 }),
    );
    pin.rotation.z = Math.PI / 2;
    pin.rotation.y = 0.35;
    pin.position.set(0.04, 0.055, 0.14);
    pin.castShadow = true;
    g.add(pin);

    // Stack of cooked golden chapatis on enamel plate
    const plate = new THREE.Mesh(
      new THREE.CylinderGeometry(0.21, 0.18, 0.02, 20),
      new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 }),
    );
    plate.position.set(-0.34, 0.01, 0.24);
    g.add(plate);

    for (let c = 0; c < 4; c++) {
      const chap = new THREE.Mesh(
        new THREE.CylinderGeometry(0.16, 0.16, 0.012, 20),
        new THREE.MeshStandardMaterial({ map: textures.chapatiSurface, roughness: 0.78 }),
      );
      chap.position.set(-0.34, 0.026 + c * 0.013, 0.24);
      chap.rotation.y = c * 0.5;
      g.add(chap);
    }

    // Hitbox for prep station
    const hit = new THREE.Mesh(
      new THREE.BoxGeometry(0.85, 0.4, 0.8),
      new THREE.MeshBasicMaterial({ visible: false }),
    );
    hit.position.y = 0.15;
    hit.userData = { interactType: 'station', station: 'prep' };
    hit.layers.set(1);
    g.add(hit);
    interactiveMeshes.push(hit);

    return g;
  });
  stallGroup.add(prepGroup);

  // --- STATION 2: SIGIRI CHARCOAL STOVE & CAST-IRON TAVA PAN (Center: x = -0.15) ---
  const stovePos = new THREE.Vector3(-0.15, 0.96, 0.02);
  const stoveGroup = new THREE.Group();
  stoveGroup.position.copy(stovePos);

  const sigiriBody = new THREE.Mesh(
    new THREE.CylinderGeometry(0.32, 0.25, 0.19, 20),
    ironFrameMat,
  );
  sigiriBody.position.y = 0.095;
  sigiriBody.castShadow = true;
  stoveGroup.add(sigiriBody);

  const emberGlow = new THREE.Mesh(
    new THREE.CylinderGeometry(0.24, 0.24, 0.04, 16),
    new THREE.MeshStandardMaterial({
      color: 0x3b1206,
      emissive: 0xff4500,
      emissiveIntensity: 1.5,
      roughness: 0.85,
    }),
  );
  emberGlow.position.y = 0.18;
  stoveGroup.add(emberGlow);

  // Dual burner ring (revealed on upgrade)
  const dualBurnerRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.23, 0.018, 8, 24),
    new THREE.MeshStandardMaterial({
      color: 0x1e3a8a,
      emissive: 0x38bdf8,
      emissiveIntensity: 1.4,
      roughness: 0.3,
    }),
  );
  dualBurnerRing.rotation.x = Math.PI / 2;
  dualBurnerRing.position.y = 0.195;
  dualBurnerRing.visible = false;
  stoveGroup.add(dualBurnerRing);

  const stoveLight = new THREE.PointLight(0xff6b2b, 1.4, 2.4, 2);
  stoveLight.position.set(0, 0.26, 0);
  stoveGroup.add(stoveLight);

  // Heavy Cast-Iron Tava Frying Pan
  const tavaPan = new THREE.Mesh(
    new THREE.CylinderGeometry(0.37, 0.34, 0.032, 28),
    new THREE.MeshStandardMaterial({
      map: textures.castIronTava,
      roughness: 0.42,
      metalness: 0.82,
    }),
  );
  tavaPan.position.y = 0.215;
  tavaPan.castShadow = true;
  tavaPan.receiveShadow = true;
  stoveGroup.add(tavaPan);

  const panRim = new THREE.Mesh(
    new THREE.TorusGeometry(0.365, 0.016, 10, 28),
    ironFrameMat,
  );
  panRim.rotation.x = Math.PI / 2;
  panRim.position.y = 0.23;
  stoveGroup.add(panRim);

  // Pan Handle
  const panHandle = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.024, 0.045), ironFrameMat);
  panHandle.position.set(-0.46, 0.24, 0);
  panHandle.rotation.z = -0.1;
  stoveGroup.add(panHandle);

  // Live Cooking Meshes on Pan
  const panSurfaceY = 0.236;
  const panChapati = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 0.22, 0.014, 24),
    new THREE.MeshStandardMaterial({
      map: textures.chapatiSurface,
      color: 0xfff5d6,
      roughness: 0.78,
    }),
  );
  panChapati.position.set(0, panSurfaceY, 0);
  panChapati.visible = false;
  stoveGroup.add(panChapati);

  const panOmelette = new THREE.Mesh(
    new THREE.CylinderGeometry(0.24, 0.25, 0.018, 24),
    new THREE.MeshStandardMaterial({
      map: textures.omeletteSurface,
      color: 0xffd54f,
      roughness: 0.55,
    }),
  );
  panOmelette.position.set(0, panSurfaceY + 0.008, 0);
  panOmelette.visible = false;
  stoveGroup.add(panOmelette);

  const panRolled = createRolledRolexMesh(textures.chapatiSurface);
  panRolled.position.set(0, panSurfaceY + 0.045, 0);
  panRolled.visible = false;
  stoveGroup.add(panRolled);

  // Hitbox for Tava Pan
  const panHit = new THREE.Mesh(
    new THREE.CylinderGeometry(0.42, 0.42, 0.35, 16),
    new THREE.MeshBasicMaterial({ visible: false }),
  );
  panHit.position.y = 0.25;
  panHit.userData = { interactType: 'station', station: 'tava' };
  panHit.layers.set(1);
  stoveGroup.add(panHit);
  interactiveMeshes.push(panHit);

  // Steam / Sizzle Particles above Pan
  const steamCount = 26;
  const steamPositions = new Float32Array(steamCount * 3);
  const steamVelocities = new Float32Array(steamCount);
  for (let i = 0; i < steamCount; i++) {
    steamPositions[i * 3] = (Math.random() - 0.5) * 0.36;
    steamPositions[i * 3 + 1] = 0.26 + Math.random() * 0.55;
    steamPositions[i * 3 + 2] = (Math.random() - 0.5) * 0.36;
    steamVelocities[i] = 0.3 + Math.random() * 0.45;
  }
  const steamGeo = new THREE.BufferGeometry();
  steamGeo.setAttribute('position', new THREE.BufferAttribute(steamPositions, 3));
  const steamMat = new THREE.PointsMaterial({
    color: 0xfff8eb,
    size: 0.08,
    transparent: true,
    opacity: 0.0,
    depthWrite: false,
  });
  const steamParticles = new THREE.Points(steamGeo, steamMat);
  stoveGroup.add(steamParticles);

  stallGroup.add(stoveGroup);

  // --- STATION 3: INGREDIENT BOWLS & EGG CRATE (Right-Center: x = 0.65) ---
  const ingGroup = new THREE.Group();
  ingGroup.position.set(0.68, 0.96, -0.02);

  const bowlConfigs: Array<[number, number, number, number]> = [
    [-0.18, -0.22, 0x9d174d, 0xf472b6], // Red Onion
    [0.08, -0.22, 0xb91c1c, 0xef4444],  // Tomato
    [0.34, -0.22, 0x65a30d, 0xa3e635],  // Cabbage
    [-0.18, 0.06, 0x15803d, 0x22c55e],  // Green Pepper
    [0.08, 0.06, 0x78350f, 0x92400e],   // Spiced Beef
    [0.34, 0.06, 0x84cc16, 0xd9f99d],   // Avocado
  ];
  for (const [bx, bz, c1, c2] of bowlConfigs) {
    const bowl = createBowlWithContents(c1, c2, 0.105);
    bowl.position.set(bx, 0, bz);
    ingGroup.add(bowl);
  }

  // Egg Crate
  const eggCrate = new THREE.Group();
  eggCrate.position.set(-0.18, 0, 0.34);
  const trayBase = new THREE.Mesh(
    new THREE.BoxGeometry(0.28, 0.035, 0.22),
    new THREE.MeshStandardMaterial({ color: 0xa8a29e, roughness: 0.92 }),
  );
  trayBase.position.y = 0.017;
  eggCrate.add(trayBase);
  const eggMat = new THREE.MeshStandardMaterial({ color: 0xe7c697, roughness: 0.45 });
  for (let ex = -1; ex <= 1; ex++) {
    for (let ez = -1; ez <= 1; ez++) {
      const egg = new THREE.Mesh(new THREE.SphereGeometry(0.028, 10, 8), eggMat);
      egg.scale.y = 1.28;
      egg.position.set(ex * 0.07, 0.045, ez * 0.06);
      egg.castShadow = true;
      eggCrate.add(egg);
    }
  }
  ingGroup.add(eggCrate);

  const ingHit = new THREE.Mesh(
    new THREE.BoxGeometry(0.75, 0.3, 0.78),
    new THREE.MeshBasicMaterial({ visible: false }),
  );
  ingHit.position.set(0.08, 0.12, 0.04);
  ingHit.userData = { interactType: 'station', station: 'ingredients' };
  ingHit.layers.set(1);
  ingGroup.add(ingHit);
  interactiveMeshes.push(ingHit);

  stallGroup.add(ingGroup);

  // --- STATION 4: SERVING COUNTER & TRAY (Far Right: x = 1.45) ---
  const servingGroup = new THREE.Group();
  servingGroup.position.set(1.45, 0.96, 0.2);

  const tray = new THREE.Mesh(
    new THREE.BoxGeometry(0.46, 0.025, 0.36),
    counterTopMat,
  );
  tray.position.y = 0.0125;
  tray.receiveShadow = true;
  servingGroup.add(tray);

  const trayRolled = createRolledRolexMesh(textures.chapatiSurface);
  trayRolled.position.set(0, 0.072, 0);
  trayRolled.rotation.y = 0.25;
  trayRolled.visible = false;
  servingGroup.add(trayRolled);

  // Kraft paper stack & cash box
  const paperStack = new THREE.Mesh(
    new THREE.BoxGeometry(0.26, 0.04, 0.24),
    new THREE.MeshStandardMaterial({ color: 0xc29b61, roughness: 0.92 }),
  );
  paperStack.position.set(0, 0.02, -0.36);
  servingGroup.add(paperStack);

  const cashBox = new THREE.Mesh(
    new THREE.BoxGeometry(0.28, 0.12, 0.22),
    new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.45, metalness: 0.4 }),
  );
  cashBox.position.set(0.08, 0.06, -0.66);
  cashBox.castShadow = true;
  servingGroup.add(cashBox);

  const serveHit = new THREE.Mesh(
    new THREE.BoxGeometry(0.55, 0.32, 0.55),
    new THREE.MeshBasicMaterial({ visible: false }),
  );
  serveHit.position.y = 0.14;
  serveHit.userData = { interactType: 'station', station: 'serve' };
  serveHit.layers.set(1);
  servingGroup.add(serveHit);
  interactiveMeshes.push(serveHit);

  stallGroup.add(servingGroup);

  // --- ASSISTANT CHEF JUMA NPC (Unlocked when hired) ---
  const jumaGroup = new THREE.Group();
  jumaGroup.position.set(-1.35, 0, -0.82);
  jumaGroup.visible = false;

  const jumaSkin = new THREE.MeshStandardMaterial({ color: 0x4a2c1d, roughness: 0.65 });
  const jumaApron = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.78 });
  const jumaShirt = new THREE.MeshStandardMaterial({ color: 0x1e40af, roughness: 0.8 });

  const jumaTorso = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.18, 0.62, 12), jumaShirt);
  jumaTorso.position.y = 1.12;
  jumaTorso.castShadow = true;
  jumaGroup.add(jumaTorso);

  const apronFront = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.56, 0.04), jumaApron);
  apronFront.position.set(0, 1.05, 0.19);
  jumaGroup.add(apronFront);

  const jumaHead = new THREE.Mesh(new THREE.SphereGeometry(0.15, 12, 10), jumaSkin);
  jumaHead.position.y = 1.56;
  jumaHead.castShadow = true;
  jumaGroup.add(jumaHead);

  const chefCap = new THREE.Mesh(
    new THREE.CylinderGeometry(0.15, 0.15, 0.11, 12),
    jumaApron,
  );
  chefCap.position.y = 1.69;
  jumaGroup.add(chefCap);

  const jumaLeftArm = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.05, 0.52, 8), jumaSkin);
  jumaLeftArm.position.set(-0.26, 1.08, 0.1);
  jumaLeftArm.rotation.x = -0.6;
  jumaGroup.add(jumaLeftArm);

  const jumaRightArm = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.05, 0.52, 8), jumaSkin);
  jumaRightArm.position.set(0.26, 1.08, 0.12);
  jumaRightArm.rotation.x = -0.8;
  jumaGroup.add(jumaRightArm);

  stallGroup.add(jumaGroup);

  // --- EXPANDED CANOPY EXTENSION (Revealed on Canopy Upgrade) ---
  const canopyExtension = new THREE.Group();
  canopyExtension.visible = false;
  const awning = new THREE.Mesh(
    new THREE.BoxGeometry(4.3, 0.04, 1.1),
    new THREE.MeshStandardMaterial({ map: textures.kitengePattern, roughness: 0.85 }),
  );
  awning.position.set(0, 2.22, 1.25);
  awning.rotation.x = 0.22;
  awning.castShadow = true;
  canopyExtension.add(awning);
  stallGroup.add(canopyExtension);

  return {
    root,
    panSurfacePos: new THREE.Vector3(-0.15, 1.2, 0.02),
    servingTrayPos: new THREE.Vector3(1.45, 1.05, 0.2),
    panChapati,
    panOmelette,
    panRolled,
    trayRolled,
    emberGlow,
    stoveLight,
    bulbLight,
    jumaGroup,
    jumaRightArm,
    canopyExtension,
    dualBurnerRing,
    signboardBanner,
    interactiveMeshes,
    steamParticles,
    steamPositions,
    steamVelocities,
  };
}
