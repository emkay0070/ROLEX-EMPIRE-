import * as THREE from 'three';
import { ProceduralTextureSet } from './ProceduralTextures';
import { AssetManager } from './AssetManager';

export interface StallRig {
  root: THREE.Group;
  panSurfacePos: THREE.Vector3;
  servingTrayPos: THREE.Vector3;
  panChapati: THREE.Mesh;
  panOmelette: THREE.Mesh;
  panOmeletteToppings: THREE.Mesh[];
  panRolled: THREE.Object3D;
  trayRolled: THREE.Object3D;
  emberGlow: THREE.Mesh;
  stoveLight: THREE.PointLight;
  bulbLight: THREE.PointLight;
  vendorGroup: THREE.Group;
  vendorHead: THREE.Object3D | null;
  vendorTorso: THREE.Object3D | null;
  vendorLeftArm: THREE.Object3D | null;
  vendorRightArm: THREE.Object3D | null;
  vendorKnife: THREE.Object3D | null;
  vendorRollingPin: THREE.Object3D | null;
  vendorSpatula: THREE.Object3D | null;
  vendorEggProp: THREE.Object3D | null;
  prepDoughDisc: THREE.Mesh;
  prepPin: THREE.Object3D | null;
  chopVeggieMesh: THREE.Mesh;
  choppedBits: THREE.Mesh[];
  eggCupLiquid: THREE.Mesh;
  eggCupWhisk: THREE.Group;
  crackEggGroup: THREE.Group;
  crackShellLeft: THREE.Mesh;
  crackShellRight: THREE.Mesh;
  crackYolkDrop: THREE.Mesh;
  jumaGroup: THREE.Group;
  jumaRightArm: THREE.Object3D | null;
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

export async function buildKampalaRolexStall(
  assetManager: AssetManager,
  textures: ProceduralTextureSet,
): Promise<StallRig> {
  const root = new THREE.Group();
  const interactiveMeshes: THREE.Object3D[] = [];

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

  // Iconic 20L Yellow Ugandan Oil Jerrycan + Stacked Plastic Soda Crates beside stall
  const jerrycanGroup = await assetManager.loadOrBuild('env_oil_jerrycan', () => {
    const jg = new THREE.Group();
    const jugMat = new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.45 });
    const jug = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.42, 0.22), jugMat);
    jug.position.y = 0.21;
    jug.castShadow = true;
    jg.add(jug);
    const cap = new THREE.Mesh(
      new THREE.CylinderGeometry(0.032, 0.035, 0.045, 10),
      new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.4 }),
    );
    cap.position.set(0.06, 0.44, 0);
    jg.add(cap);
    const handle = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.05, 0.05), jugMat);
    handle.position.set(-0.06, 0.43, 0);
    jg.add(handle);
    return jg;
  });
  jerrycanGroup.position.set(-2.15, 0.02, 0.15);
  stallGroup.add(jerrycanGroup);

  const sodaCrates = await assetManager.loadOrBuild('env_soda_crates', () => {
    const cg = new THREE.Group();
    const crateColors = [0xb91c1c, 0x1d4ed8];
    for (let i = 0; i < 2; i++) {
      const crate = new THREE.Mesh(
        new THREE.BoxGeometry(0.42, 0.28, 0.34),
        new THREE.MeshStandardMaterial({ color: crateColors[i], roughness: 0.55 }),
      );
      crate.position.y = 0.14 + i * 0.285;
      crate.rotation.y = i * 0.12;
      crate.castShadow = true;
      cg.add(crate);
    }
    return cg;
  });
  sodaCrates.position.set(2.12, 0.02, -0.58);
  stallGroup.add(sodaCrates);

  const charcoalSack = await assetManager.loadOrBuild('env_charcoal_sack', () => {
    const sg = new THREE.Group();
    const sack = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.24, 0.54, 10),
      new THREE.MeshStandardMaterial({ color: 0x785c3e, roughness: 0.94 }),
    );
    sack.position.y = 0.27;
    sack.castShadow = true;
    sg.add(sack);
    return sg;
  });
  charcoalSack.position.set(-1.62, 0.06, -0.78);
  stallGroup.add(charcoalSack);

  // Menu Board Easel on right front side of stall
  const menuGroup = await assetManager.loadOrBuild('furn_menu_board', () => {
    const mg = new THREE.Group();
    const easelLeg1 = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.35, 0.06), frameWoodMat);
    easelLeg1.position.set(-0.28, 0.66, 0);
    easelLeg1.rotation.x = -0.12;
    mg.add(easelLeg1);
    const easelLeg2 = easelLeg1.clone();
    easelLeg2.position.x = 0.28;
    mg.add(easelLeg2);
    const menuPanel = new THREE.Mesh(
      new THREE.BoxGeometry(0.84, 0.92, 0.05),
      new THREE.MeshStandardMaterial({ map: textures.menuBoard, roughness: 0.6 }),
    );
    menuPanel.position.set(0, 1.02, 0.05);
    menuPanel.castShadow = true;
    mg.add(menuPanel);
    return mg;
  });
  menuGroup.position.set(2.35, 0, 0.85);
  menuGroup.rotation.y = -0.35;
  stallGroup.add(menuGroup);

  // Customer Waiting Bench & Roadside Wooden Side Table
  const bench = await assetManager.loadOrBuild('furn_waiting_bench', () => {
    const bg = new THREE.Group();
    const benchPlank = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.06, 0.34), frameWoodMat);
    benchPlank.position.y = 0.44;
    benchPlank.castShadow = true;
    bg.add(benchPlank);
    for (const lx of [-0.45, 0.45]) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.44, 0.28), frameWoodMat);
      leg.position.set(lx, 0.22, 0);
      bg.add(leg);
    }
    return bg;
  });
  bench.position.set(-2.15, 0, 1.45);
  stallGroup.add(bench);

  const sideTable = await assetManager.loadOrBuild('furn_wooden_table', () => {
    const tg = new THREE.Group();
    const top = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.05, 0.56), frameWoodMat);
    top.position.y = 0.72;
    top.castShadow = true;
    top.receiveShadow = true;
    tg.add(top);
    for (const lx of [-0.31, 0.31]) {
      for (const lz of [-0.21, 0.21]) {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.7, 0.06), frameWoodMat);
        leg.position.set(lx, 0.35, lz);
        leg.castShadow = true;
        tg.add(leg);
      }
    }
    return tg;
  });
  sideTable.position.set(-2.45, 0, 0.72);
  stallGroup.add(sideTable);

  // --- STATION 1: CHAPATI PREP BOARD (Left: x = -1.25) ---
  // Keep station wrapper + raycast hitbox outside AssetManager so GLB swaps never break clicks
  const prepGroup = new THREE.Group();
  prepGroup.position.set(-1.25, 0.96, 0.05);

  const rollingPinBoard = await assetManager.loadOrBuild('equip_rolling_pin', () => {
    const g = new THREE.Group();
    const board = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.28, 0.035, 24),
      frameWoodMat,
    );
    board.position.y = 0.0175;
    board.receiveShadow = true;
    g.add(board);

    const pin = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025, 0.025, 0.36, 12),
      new THREE.MeshStandardMaterial({ color: 0xa16207, roughness: 0.7 }),
    );
    pin.name = 'prep_rolling_pin';
    pin.rotation.z = Math.PI / 2;
    pin.rotation.y = 0.35;
    pin.position.set(0.04, 0.055, 0.14);
    pin.castShadow = true;
    g.add(pin);
    return g;
  });
  const prepPin = rollingPinBoard.getObjectByName('prep_rolling_pin') || null;
  prepGroup.add(rollingPinBoard);

  // Live dough ball -> flattened chapati disc on the wooden prep board
  const prepDoughDisc = new THREE.Mesh(
    new THREE.CylinderGeometry(0.11, 0.115, 0.014, 20),
    new THREE.MeshStandardMaterial({ color: 0xf4e3b2, roughness: 0.86 }),
  );
  prepDoughDisc.position.set(0, 0.042, 0);
  prepDoughDisc.scale.set(0.65, 1.4, 0.65);
  prepDoughDisc.castShadow = true;
  prepGroup.add(prepDoughDisc);

  // Dough balls ready to roll
  const doughStack = await assetManager.loadOrBuild('food_chapati_raw', () => {
    const dg = new THREE.Group();
    const doughMat = new THREE.MeshStandardMaterial({ color: 0xf3e5ab, roughness: 0.88 });
    for (let i = 0; i < 3; i++) {
      const ball = new THREE.Mesh(new THREE.SphereGeometry(0.055, 12, 10), doughMat);
      ball.scale.y = 0.72;
      ball.position.set(0, 0.04, -0.14 + i * 0.14);
      ball.castShadow = true;
      dg.add(ball);
    }
    return dg;
  });
  doughStack.position.set(-0.32, 0, -0.11);
  prepGroup.add(doughStack);

  // Stack of cooked golden chapatis on enamel plate
  const cookedChapatiStack = await assetManager.loadOrBuild('food_chapati_cooked', () => {
    const cg = new THREE.Group();
    const plate = new THREE.Mesh(
      new THREE.CylinderGeometry(0.21, 0.18, 0.02, 20),
      new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 }),
    );
    plate.position.y = 0.01;
    cg.add(plate);

    for (let c = 0; c < 4; c++) {
      const chap = new THREE.Mesh(
        new THREE.CylinderGeometry(0.16, 0.16, 0.012, 20),
        new THREE.MeshStandardMaterial({ map: textures.chapatiSurface, roughness: 0.78 }),
      );
      chap.position.y = 0.026 + c * 0.013;
      chap.rotation.y = c * 0.5;
      cg.add(chap);
    }
    return cg;
  });
  cookedChapatiStack.position.set(-0.34, 0, 0.24);
  prepGroup.add(cookedChapatiStack);

  // Chef Knife, Cutting Board & Grater accent beside prep board
  const knifeSet = await assetManager.loadOrBuild('equip_knife_board', () => {
    const kg = new THREE.Group();
    const chopBoard = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.022, 0.2), frameWoodMat);
    chopBoard.position.y = 0.011;
    chopBoard.receiveShadow = true;
    kg.add(chopBoard);

    const blade = new THREE.Mesh(
      new THREE.BoxGeometry(0.16, 0.006, 0.036),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.88, roughness: 0.22 }),
    );
    blade.position.set(-0.02, 0.026, 0.02);
    blade.rotation.y = 0.28;
    kg.add(blade);

    const handle = new THREE.Mesh(
      new THREE.BoxGeometry(0.085, 0.016, 0.022),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.65 }),
    );
    handle.position.set(0.09, 0.028, 0.05);
    handle.rotation.y = 0.28;
    kg.add(handle);
    return kg;
  });
  knifeSet.position.set(0.35, 0, 0.22);
  prepGroup.add(knifeSet);

  // Fresh Produce / Carrot Crate on left edge of counter
  const produceCrate = await assetManager.loadOrBuild('ing_carrot_crate', () => {
    const pg = new THREE.Group();
    const box = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.1, 0.22), frameWoodMat);
    box.position.y = 0.05;
    box.castShadow = true;
    pg.add(box);
    const carrotMat = new THREE.MeshStandardMaterial({ color: 0xea580c, roughness: 0.68 });
    for (let i = 0; i < 4; i++) {
      const carrot = new THREE.Mesh(new THREE.ConeGeometry(0.022, 0.14, 8), carrotMat);
      carrot.rotation.z = Math.PI / 2 - 0.15;
      carrot.rotation.y = i * 0.4;
      carrot.position.set(-0.04 + (i % 2) * 0.08, 0.11, -0.05 + Math.floor(i / 2) * 0.09);
      pg.add(carrot);
    }
    return pg;
  });
  produceCrate.position.set(-0.26, 0, -0.45);
  prepGroup.add(produceCrate);

  // Hitbox for prep station (always kept directly on prepGroup)
  const prepHit = new THREE.Mesh(
    new THREE.BoxGeometry(0.85, 0.4, 0.8),
    new THREE.MeshBasicMaterial({ visible: false }),
  );
  prepHit.position.y = 0.15;
  prepHit.userData = { interactType: 'station', station: 'prep' };
  prepHit.layers.set(1);
  prepGroup.add(prepHit);
  interactiveMeshes.push(prepHit);

  stallGroup.add(prepGroup);

  // --- STATION 2: SIGIRI CHARCOAL STOVE & CAST-IRON TAVA PAN (Center: x = -0.15) ---
  const stovePos = new THREE.Vector3(-0.15, 0.96, 0.02);
  const stoveGroup = new THREE.Group();
  stoveGroup.position.copy(stovePos);

  const sigiriShell = await assetManager.loadOrBuild('equip_sigiri_stove', () => {
    const sg = new THREE.Group();
    const sigiriBody = new THREE.Mesh(
      new THREE.CylinderGeometry(0.32, 0.25, 0.19, 20),
      ironFrameMat,
    );
    sigiriBody.position.y = 0.095;
    sigiriBody.castShadow = true;
    sg.add(sigiriBody);
    return sg;
  });
  stoveGroup.add(sigiriShell);

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

  // Heavy Cast-Iron Tava Frying Pan (swappable via equip_tava_pan)
  const tavaPanShell = await assetManager.loadOrBuild('equip_tava_pan', () => {
    const tg = new THREE.Group();
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
    tg.add(tavaPan);

    const panRim = new THREE.Mesh(
      new THREE.TorusGeometry(0.365, 0.016, 10, 28),
      ironFrameMat,
    );
    panRim.rotation.x = Math.PI / 2;
    panRim.position.y = 0.23;
    tg.add(panRim);

    const panHandle = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.024, 0.045), ironFrameMat);
    panHandle.position.set(-0.46, 0.24, 0);
    panHandle.rotation.z = -0.1;
    tg.add(panHandle);
    return tg;
  });
  stoveGroup.add(tavaPanShell);

  // Background Saucepan / Tea Pot on rear counter beside stove
  const rearPot = await assetManager.loadOrBuild('equip_cooking_pot', () => {
    const pg = new THREE.Group();
    const potBody = new THREE.Mesh(
      new THREE.CylinderGeometry(0.14, 0.13, 0.16, 16),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.85, roughness: 0.28 }),
    );
    potBody.position.y = 0.08;
    potBody.castShadow = true;
    pg.add(potBody);
    const lid = new THREE.Mesh(
      new THREE.CylinderGeometry(0.145, 0.145, 0.018, 16),
      new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.88, roughness: 0.24 }),
    );
    lid.position.y = 0.165;
    pg.add(lid);
    return pg;
  });
  rearPot.position.set(-0.52, 0, -0.45);
  stoveGroup.add(rearPot);

  // Live Cooking Meshes on Pan (kept procedural for dynamic heat/cook color transitions)
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

  // Chopped onion/tomato/cabbage/beef flecks resting inside the sizzling omelette
  const panOmeletteToppings: THREE.Mesh[] = [];
  const toppingGeo = new THREE.BoxGeometry(0.028, 0.014, 0.024);
  for (let i = 0; i < 12; i++) {
    const tMesh = new THREE.Mesh(
      toppingGeo,
      new THREE.MeshStandardMaterial({ color: 0xd93829, roughness: 0.65 }),
    );
    const angle = (i / 12) * Math.PI * 2 + (i % 3) * 0.25;
    const radius = 0.065 + (i % 3) * 0.048;
    tMesh.position.set(Math.cos(angle) * radius, 0.014, Math.sin(angle) * radius);
    tMesh.rotation.set(i * 0.2, i * 0.65, 0);
    tMesh.visible = false;
    panOmelette.add(tMesh);
    panOmeletteToppings.push(tMesh);
  }

  const panRolled = await assetManager.loadOrBuild('food_rolex_rolled', () =>
    createRolledRolexMesh(textures.chapatiSurface),
  );
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
    map: textures.smokeSprite,
    size: 0.16,
    transparent: true,
    opacity: 0.0,
    alphaTest: 0.01,
    depthWrite: false,
  });
  const steamParticles = new THREE.Points(steamGeo, steamMat);
  stoveGroup.add(steamParticles);

  stallGroup.add(stoveGroup);

  // --- STATION 3: INGREDIENT BOWLS & EGG CRATE (Right-Center: x = 0.65) ---
  const ingGroup = new THREE.Group();
  ingGroup.position.set(0.68, 0.96, -0.02);

  const bowlConfigs: Array<[string, number, number, number, number]> = [
    ['ing_onion_bowl', -0.18, -0.22, 0x9d174d, 0xf472b6],   // Red Onion
    ['ing_tomato_bowl', 0.08, -0.22, 0xb91c1c, 0xef4444],   // Tomato
    ['ing_cabbage_bowl', 0.34, -0.22, 0x65a30d, 0xa3e635],  // Cabbage
    ['ing_pepper_bowl', -0.18, 0.06, 0x15803d, 0x22c55e],   // Green Pepper
    ['ing_beef_bowl', 0.08, 0.06, 0x78350f, 0x92400e],      // Spiced Beef
    ['ing_avocado_bowl', 0.34, 0.06, 0x84cc16, 0xd9f99d],   // Avocado
  ];
  for (const [assetId, bx, bz, c1, c2] of bowlConfigs) {
    const bowl = await assetManager.loadOrBuild(assetId, () =>
      createBowlWithContents(c1, c2, 0.105),
    );
    bowl.position.set(bx, 0, bz);
    ingGroup.add(bowl);
  }

  // Egg Crate
  const eggCrate = await assetManager.loadOrBuild('ing_egg_tray', () => {
    const eg = new THREE.Group();
    const trayBase = new THREE.Mesh(
      new THREE.BoxGeometry(0.28, 0.035, 0.22),
      new THREE.MeshStandardMaterial({ color: 0xa8a29e, roughness: 0.92 }),
    );
    trayBase.position.y = 0.017;
    eg.add(trayBase);
    const eggMat = new THREE.MeshStandardMaterial({ color: 0xe7c697, roughness: 0.45 });
    for (let ex = -1; ex <= 1; ex++) {
      for (let ez = -1; ez <= 1; ez++) {
        const egg = new THREE.Mesh(new THREE.SphereGeometry(0.028, 10, 8), eggMat);
        egg.scale.y = 1.28;
        egg.position.set(ex * 0.07, 0.045, ez * 0.06);
        egg.castShadow = true;
        eg.add(egg);
      }
    }
    return eg;
  });
  eggCrate.position.set(-0.18, 0, 0.34);
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

  const tray = await assetManager.loadOrBuild('equip_serving_tray', () => {
    const tg = new THREE.Group();
    const trayMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.46, 0.025, 0.36),
      counterTopMat,
    );
    trayMesh.position.y = 0.0125;
    trayMesh.receiveShadow = true;
    tg.add(trayMesh);
    return tg;
  });
  servingGroup.add(tray);

  const trayRolled = await assetManager.loadOrBuild('food_rolex_rolled', () =>
    createRolledRolexMesh(textures.chapatiSurface),
  );
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

  // --- LIVE CHOPPING STATION (Between tava & ingredient bowls: x = 0.28, z = 0.26) ---
  const chopStation = new THREE.Group();
  chopStation.position.set(0.28, 0.96, 0.26);

  const liveChopBoard = new THREE.Mesh(
    new THREE.BoxGeometry(0.32, 0.024, 0.24),
    frameWoodMat,
  );
  liveChopBoard.position.y = 0.012;
  liveChopBoard.receiveShadow = true;
  liveChopBoard.castShadow = true;
  chopStation.add(liveChopBoard);

  const chopVeggieMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.044, 12, 10),
    new THREE.MeshStandardMaterial({ color: 0xb8426d, roughness: 0.68 }),
  );
  chopVeggieMesh.position.set(-0.02, 0.05, 0);
  chopVeggieMesh.scale.set(1.15, 0.78, 1.0);
  chopVeggieMesh.visible = false;
  chopVeggieMesh.castShadow = true;
  chopStation.add(chopVeggieMesh);

  const choppedBits: THREE.Mesh[] = [];
  const bitGeo = new THREE.BoxGeometry(0.022, 0.014, 0.02);
  for (let b = 0; b < 6; b++) {
    const bit = new THREE.Mesh(
      bitGeo,
      new THREE.MeshStandardMaterial({ color: 0xb8426d, roughness: 0.7 }),
    );
    bit.position.set(0.05 + (b % 3) * 0.028, 0.032, -0.03 + Math.floor(b / 3) * 0.045);
    bit.rotation.y = b * 0.6;
    bit.visible = false;
    chopStation.add(bit);
    choppedBits.push(bit);
  }
  stallGroup.add(chopStation);

  // --- LIVE KAMPALA EGG MIXING CUP ("KIKOPO") STATION (x = 0.86, z = 0.34) ---
  const eggCupGroup = new THREE.Group();
  eggCupGroup.position.set(0.86, 0.96, 0.34);

  const cupMetalMat = new THREE.MeshStandardMaterial({
    color: 0xdbe2ea,
    metalness: 0.88,
    roughness: 0.22,
  });
  const cupBody = new THREE.Mesh(
    new THREE.CylinderGeometry(0.068, 0.054, 0.145, 18),
    cupMetalMat,
  );
  cupBody.position.y = 0.0725;
  cupBody.castShadow = true;
  cupBody.receiveShadow = true;
  eggCupGroup.add(cupBody);

  const cupHandle = new THREE.Mesh(
    new THREE.TorusGeometry(0.038, 0.008, 8, 14, Math.PI),
    cupMetalMat,
  );
  cupHandle.rotation.z = -Math.PI / 2;
  cupHandle.position.set(0.066, 0.08, 0);
  eggCupGroup.add(cupHandle);

  const cupRimInner = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.06, 0.01, 16),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 }),
  );
  cupRimInner.position.y = 0.142;
  eggCupGroup.add(cupRimInner);

  const eggCupLiquid = new THREE.Mesh(
    new THREE.CylinderGeometry(0.058, 0.055, 0.024, 16),
    new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      emissive: 0xca8a04,
      emissiveIntensity: 0.22,
      roughness: 0.25,
    }),
  );
  eggCupLiquid.position.y = 0.146;
  eggCupLiquid.visible = false;
  eggCupGroup.add(eggCupLiquid);

  const eggCupWhisk = new THREE.Group();
  eggCupWhisk.position.set(0.01, 0.12, 0);
  eggCupWhisk.rotation.z = -0.22;
  const whiskStem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.007, 0.007, 0.16, 8),
    cupMetalMat,
  );
  whiskStem.position.y = 0.09;
  eggCupWhisk.add(whiskStem);
  const whiskLoop1 = new THREE.Mesh(
    new THREE.TorusGeometry(0.026, 0.003, 6, 14),
    cupMetalMat,
  );
  whiskLoop1.position.y = 0.012;
  eggCupWhisk.add(whiskLoop1);
  const whiskLoop2 = whiskLoop1.clone();
  whiskLoop2.rotation.y = Math.PI / 2;
  eggCupWhisk.add(whiskLoop2);
  eggCupGroup.add(eggCupWhisk);

  // Cracking eggshell halves + golden yolk drop directly above the kikopo cup
  const crackEggGroup = new THREE.Group();
  crackEggGroup.position.set(0, 0.26, 0);
  crackEggGroup.visible = false;
  const shellMat = new THREE.MeshStandardMaterial({ color: 0xead0a8, roughness: 0.42 });
  const crackShellLeft = new THREE.Mesh(
    new THREE.SphereGeometry(0.032, 10, 8, 0, Math.PI),
    shellMat,
  );
  crackShellLeft.rotation.z = Math.PI / 2;
  crackShellLeft.position.set(-0.018, 0, 0);
  crackEggGroup.add(crackShellLeft);

  const crackShellRight = new THREE.Mesh(
    new THREE.SphereGeometry(0.032, 10, 8, 0, Math.PI),
    shellMat,
  );
  crackShellRight.rotation.z = -Math.PI / 2;
  crackShellRight.position.set(0.018, 0, 0);
  crackEggGroup.add(crackShellRight);

  const crackYolkDrop = new THREE.Mesh(
    new THREE.SphereGeometry(0.02, 10, 8),
    new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.2 }),
  );
  crackYolkDrop.scale.y = 1.3;
  crackYolkDrop.position.set(0, -0.04, 0);
  crackEggGroup.add(crackYolkDrop);
  eggCupGroup.add(crackEggGroup);

  stallGroup.add(eggCupGroup);

  // --- PRIMARY ROLEX VENDOR (Player Chef standing behind counter) ---
  const vendorGroup = new THREE.Group();
  vendorGroup.position.set(-0.15, 0, -0.82);

  const vendorRigRoot = await assetManager.loadOrBuild('char_vendor', () => {
    const vg = new THREE.Group();
    const skinMat = new THREE.MeshStandardMaterial({ color: 0x52301f, roughness: 0.62 });
    const trouserMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.85 });
    const shoeMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.75 });
    const shirtMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.76 });
    const apronMat = new THREE.MeshStandardMaterial({ color: 0x14532d, roughness: 0.8 });
    const capMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.7 });
    const trimMat = new THREE.MeshStandardMaterial({ color: 0xfcdc04, roughness: 0.55 });
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4 });
    const steelMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.88,
      roughness: 0.2,
    });

    // Legs & Shoes
    for (const lx of [-0.11, 0.11]) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.072, 0.06, 0.78, 10), trouserMat);
      leg.position.set(lx, 0.42, 0);
      leg.castShadow = true;
      vg.add(leg);

      const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.07, 0.2), shoeMat);
      shoe.position.set(lx, 0.035, 0.04);
      vg.add(shoe);
    }

    // Upper Torso & Kampala Green Chef Apron
    const torsoGroup = new THREE.Group();
    torsoGroup.name = 'vendor_torso';
    torsoGroup.position.y = 1.12;
    vg.add(torsoGroup);

    const chest = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.185, 0.62, 14), shirtMat);
    chest.castShadow = true;
    torsoGroup.add(chest);

    const apronBody = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.64, 0.055), apronMat);
    apronBody.position.set(0, -0.08, 0.185);
    apronBody.castShadow = true;
    torsoGroup.add(apronBody);

    const apronPocket = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.14, 0.02), trimMat);
    apronPocket.position.set(0, -0.14, 0.215);
    torsoGroup.add(apronPocket);

    // Head & Cap
    const headGroup = new THREE.Group();
    headGroup.name = 'vendor_head';
    headGroup.position.set(0, 1.56, 0.01);
    vg.add(headGroup);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.15, 14, 12), skinMat);
    head.castShadow = true;
    headGroup.add(head);

    for (const ex of [-0.052, 0.052]) {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.016, 8, 8), eyeMat);
      eye.position.set(ex, 0.02, 0.135);
      headGroup.add(eye);
    }

    const capCrown = new THREE.Mesh(new THREE.CylinderGeometry(0.148, 0.154, 0.11, 14), capMat);
    capCrown.position.y = 0.11;
    headGroup.add(capCrown);

    const capVisor = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.02, 0.13), trimMat);
    capVisor.position.set(0, 0.075, 0.12);
    capVisor.rotation.x = 0.16;
    headGroup.add(capVisor);

    // Articulated Left Arm (pivot at shoulder)
    const leftArmPivot = new THREE.Group();
    leftArmPivot.name = 'vendor_left_arm';
    leftArmPivot.position.set(-0.24, 1.36, 0.02);
    leftArmPivot.rotation.x = -0.58;
    vg.add(leftArmPivot);

    const lUpper = new THREE.Mesh(new THREE.CylinderGeometry(0.056, 0.048, 0.3, 10), shirtMat);
    lUpper.position.y = -0.13;
    lUpper.castShadow = true;
    leftArmPivot.add(lUpper);

    const lForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.046, 0.04, 0.3, 10), skinMat);
    lForearm.position.set(0, -0.34, 0.11);
    lForearm.rotation.x = -0.82;
    lForearm.castShadow = true;
    leftArmPivot.add(lForearm);

    const lHand = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 8), skinMat);
    lHand.position.set(0, -0.44, 0.24);
    leftArmPivot.add(lHand);

    // Articulated Right Arm + Held Utensils (pivot at shoulder)
    const rightArmPivot = new THREE.Group();
    rightArmPivot.name = 'vendor_right_arm';
    rightArmPivot.position.set(0.24, 1.36, 0.02);
    rightArmPivot.rotation.x = -0.62;
    vg.add(rightArmPivot);

    const rUpper = new THREE.Mesh(new THREE.CylinderGeometry(0.056, 0.048, 0.3, 10), shirtMat);
    rUpper.position.y = -0.13;
    rUpper.castShadow = true;
    rightArmPivot.add(rUpper);

    const rForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.046, 0.04, 0.3, 10), skinMat);
    rForearm.position.set(0, -0.34, 0.11);
    rForearm.rotation.x = -0.82;
    rForearm.castShadow = true;
    rightArmPivot.add(rForearm);

    const rHand = new THREE.Mesh(new THREE.SphereGeometry(0.052, 10, 8), skinMat);
    rHand.position.set(0, -0.44, 0.24);
    rightArmPivot.add(rHand);

    // Held Tool 1: Chef Knife
    const vKnife = new THREE.Group();
    vKnife.name = 'vendor_knife';
    vKnife.position.set(0, -0.45, 0.28);
    vKnife.visible = false;
    const vkHandle = new THREE.Mesh(
      new THREE.BoxGeometry(0.024, 0.028, 0.1),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.65 }),
    );
    const vkBlade = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.042, 0.18), steelMat);
    vkBlade.position.set(0, -0.006, 0.13);
    vKnife.add(vkHandle, vkBlade);
    rightArmPivot.add(vKnife);

    // Held Tool 2: Wooden Rolling Pin
    const vPin = new THREE.Group();
    vPin.name = 'vendor_rolling_pin';
    vPin.position.set(-0.24, -0.46, 0.27);
    vPin.visible = false;
    const vpBody = new THREE.Mesh(
      new THREE.CylinderGeometry(0.026, 0.026, 0.38, 12),
      new THREE.MeshStandardMaterial({ color: 0xa16207, roughness: 0.7 }),
    );
    vpBody.rotation.z = Math.PI / 2;
    vPin.add(vpBody);
    rightArmPivot.add(vPin);

    // Held Tool 3: Flat Metal Spatula / Turner
    const vSpatula = new THREE.Group();
    vSpatula.name = 'vendor_spatula';
    vSpatula.position.set(0, -0.45, 0.29);
    vSpatula.visible = false;
    const vsStem = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.012, 0.18), steelMat);
    vsStem.position.z = 0.08;
    const vsBlade = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.008, 0.1), steelMat);
    vsBlade.position.set(0, -0.01, 0.21);
    vsBlade.rotation.x = 0.25;
    vSpatula.add(vsStem, vsBlade);
    rightArmPivot.add(vSpatula);

    // Held Tool 4: Fresh Egg in Hand
    const vEgg = new THREE.Mesh(
      new THREE.SphereGeometry(0.028, 10, 8),
      new THREE.MeshStandardMaterial({ color: 0xe7c697, roughness: 0.45 }),
    );
    vEgg.name = 'vendor_egg_prop';
    vEgg.scale.y = 1.28;
    vEgg.position.set(0, -0.45, 0.29);
    vEgg.visible = false;
    rightArmPivot.add(vEgg);

    return vg;
  });

  const vendorHead = vendorRigRoot.getObjectByName('vendor_head') || null;
  const vendorTorso = vendorRigRoot.getObjectByName('vendor_torso') || null;
  const vendorLeftArm = vendorRigRoot.getObjectByName('vendor_left_arm') || null;
  const vendorRightArm = vendorRigRoot.getObjectByName('vendor_right_arm') || null;
  const vendorKnife = vendorRigRoot.getObjectByName('vendor_knife') || null;
  const vendorRollingPin = vendorRigRoot.getObjectByName('vendor_rolling_pin') || null;
  const vendorSpatula = vendorRigRoot.getObjectByName('vendor_spatula') || null;
  const vendorEggProp = vendorRigRoot.getObjectByName('vendor_egg_prop') || null;

  vendorGroup.add(vendorRigRoot);
  stallGroup.add(vendorGroup);

  // --- ASSISTANT CHEF JUMA NPC (Unlocked when hired) ---
  const jumaGroup = new THREE.Group();
  jumaGroup.position.set(-1.35, 0, -0.82);
  jumaGroup.visible = false;

  let jumaRightArm: THREE.Object3D | null = null;
  const jumaMesh = await assetManager.loadOrBuild('char_assistant_juma', () => {
    const jg = new THREE.Group();
    const jumaSkin = new THREE.MeshStandardMaterial({ color: 0x4a2c1d, roughness: 0.65 });
    const jumaApron = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.78 });
    const jumaShirt = new THREE.MeshStandardMaterial({ color: 0x1e40af, roughness: 0.8 });

    const jumaTorso = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.18, 0.62, 12), jumaShirt);
    jumaTorso.position.y = 1.12;
    jumaTorso.castShadow = true;
    jg.add(jumaTorso);

    const apronFront = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.56, 0.04), jumaApron);
    apronFront.position.set(0, 1.05, 0.19);
    jg.add(apronFront);

    const jumaHead = new THREE.Mesh(new THREE.SphereGeometry(0.15, 12, 10), jumaSkin);
    jumaHead.position.y = 1.56;
    jumaHead.castShadow = true;
    jg.add(jumaHead);

    const chefCap = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 0.15, 0.11, 12),
      jumaApron,
    );
    chefCap.position.y = 1.69;
    jg.add(chefCap);

    const jumaLeftArm = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.05, 0.52, 8), jumaSkin);
    jumaLeftArm.position.set(-0.26, 1.08, 0.1);
    jumaLeftArm.rotation.x = -0.6;
    jg.add(jumaLeftArm);

    const rightArm = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.05, 0.52, 8), jumaSkin);
    rightArm.name = 'juma_right_arm';
    rightArm.position.set(0.26, 1.08, 0.12);
    rightArm.rotation.x = -0.8;
    jg.add(rightArm);
    return jg;
  });
  jumaRightArm = jumaMesh.getObjectByName('juma_right_arm') || null;
  jumaGroup.add(jumaMesh);

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

  // Plastic roadside stools beside bench
  const stoolMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.42 });
  for (const sx of [2.15, 2.65]) {
    const stoolTop = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.16, 0.05, 12), stoolMat);
    stoolTop.position.set(sx, 0.44, 1.55);
    stoolTop.castShadow = true;
    canopyExtension.add(stoolTop);
    const stoolLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.16, 0.42, 10), stoolMat);
    stoolLeg.position.set(sx, 0.21, 1.55);
    canopyExtension.add(stoolLeg);
  }
  stallGroup.add(canopyExtension);

  return {
    root,
    panSurfacePos: new THREE.Vector3(-0.15, 1.2, 0.02),
    servingTrayPos: new THREE.Vector3(1.45, 1.05, 0.2),
    panChapati,
    panOmelette,
    panOmeletteToppings,
    panRolled,
    trayRolled,
    emberGlow,
    stoveLight,
    bulbLight,
    vendorGroup,
    vendorHead,
    vendorTorso,
    vendorLeftArm,
    vendorRightArm,
    vendorKnife,
    vendorRollingPin,
    vendorSpatula,
    vendorEggProp,
    prepDoughDisc,
    prepPin,
    chopVeggieMesh,
    choppedBits,
    eggCupLiquid,
    eggCupWhisk,
    crackEggGroup,
    crackShellLeft,
    crackShellRight,
    crackYolkDrop,
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
