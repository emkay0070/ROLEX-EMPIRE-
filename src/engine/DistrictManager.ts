import * as THREE from 'three';
import { AssetManager } from './AssetManager';
import { createEnvironmentMaterials, EnvironmentMaterialSet } from './EnvironmentMaterials';
import { ProceduralTextureSet } from './ProceduralTextures';

export interface DistrictHandle {
  root: THREE.Group;
  materials: EnvironmentMaterialSet;
  setEveningFactor: (t: number) => void;
  dispose: () => void;
}

function createParkedBodaMesh(
  mats: EnvironmentMaterialSet,
  tankColor: number,
): THREE.Group {
  const g = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({
    color: tankColor,
    roughness: 0.34,
    metalness: 0.32,
  });

  for (const wx of [-0.54, 0.54]) {
    const tire = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.072, 10, 18), mats.tireRubber);
    tire.position.set(wx, 0.33, 0);
    tire.castShadow = true;
    g.add(tire);

    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.08, 12), mats.chromeTrim);
    hub.rotation.x = Math.PI / 2;
    hub.position.set(wx, 0.33, 0);
    g.add(hub);
  }

  const chassis = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.22, 0.22), bodyMat);
  chassis.position.set(0, 0.58, 0);
  chassis.castShadow = true;
  g.add(chassis);

  const tank = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.18, 0.25), bodyMat);
  tank.position.set(0.2, 0.74, 0);
  g.add(tank);

  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.11, 0.26), mats.tireRubber);
  seat.position.set(-0.18, 0.74, 0);
  g.add(seat);

  const fork = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, 0.64, 8), mats.chromeTrim);
  fork.position.set(0.45, 0.6, 0);
  fork.rotation.z = 0.28;
  g.add(fork);

  const handlebar = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.6, 8), mats.chromeTrim);
  handlebar.rotation.x = Math.PI / 2;
  handlebar.position.set(0.38, 0.91, 0);
  g.add(handlebar);

  const headlamp = new THREE.Mesh(new THREE.SphereGeometry(0.065, 8, 8), mats.headlightGlow);
  headlamp.position.set(0.56, 0.78, 0);
  g.add(headlamp);

  return g;
}

function createParkedMatatuMesh(mats: EnvironmentMaterialSet): THREE.Group {
  const g = new THREE.Group();

  // Lower white van body
  const lower = new THREE.Mesh(new THREE.BoxGeometry(4.3, 0.88, 1.72), mats.matatuWhite);
  lower.position.y = 0.72;
  lower.castShadow = true;
  lower.receiveShadow = true;
  g.add(lower);

  // Iconic Kampala blue waist band
  const band = new THREE.Mesh(new THREE.BoxGeometry(4.34, 0.24, 1.76), mats.matatuBlueBand);
  band.position.y = 0.94;
  g.add(band);

  // Upper cabin & tinted window strip
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(4.05, 0.72, 1.66), mats.matatuWhite);
  cabin.position.set(-0.08, 1.5, 0);
  cabin.castShadow = true;
  g.add(cabin);

  const sideWindows = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.44, 1.69), mats.windowGlass);
  sideWindows.position.set(-0.12, 1.48, 0);
  g.add(sideWindows);

  const windshield = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.48, 1.48), mats.windowGlass);
  windshield.position.set(1.94, 1.46, 0);
  windshield.rotation.z = -0.18;
  g.add(windshield);

  // Roof carrier rack
  const roofRack = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.08, 1.32), mats.darkSteel);
  roofRack.position.set(-0.2, 1.9, 0);
  g.add(roofRack);

  // Bumpers
  const frontBumper = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.2, 1.74), mats.darkSteel);
  frontBumper.position.set(2.14, 0.38, 0);
  g.add(frontBumper);

  // Wheels
  const wheelGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.22, 14);
  for (const wx of [-1.3, 1.32]) {
    for (const wz of [-0.82, 0.82]) {
      const wheel = new THREE.Mesh(wheelGeo, mats.tireRubber);
      wheel.rotation.x = Math.PI / 2;
      wheel.position.set(wx, 0.32, wz);
      wheel.castShadow = true;
      g.add(wheel);

      const rim = new THREE.Mesh(
        new THREE.CylinderGeometry(0.17, 0.17, 0.24, 10),
        mats.chromeTrim,
      );
      rim.rotation.x = Math.PI / 2;
      rim.position.set(wx, 0.32, wz);
      g.add(rim);
    }
  }

  // Headlights & taillights
  for (const lz of [-0.6, 0.6]) {
    const hl = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.14, 0.22), mats.headlightGlow);
    hl.position.set(2.16, 0.64, lz);
    g.add(hl);
    const tl = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.18, 0.16), mats.taillightGlow);
    tl.position.set(-2.16, 0.72, lz);
    g.add(tl);
  }

  return g;
}

function buildKirekaTwoStoreyShopBlock(
  mats: EnvironmentMaterialSet,
  signTex: THREE.Texture,
  wallMat: THREE.MeshStandardMaterial,
  trimColor: number,
  width = 8.4,
  depth = 4.6,
): THREE.Group {
  const g = new THREE.Group();
  const groundH = 3.2;
  const upperH = 2.9;
  const totalH = groundH + upperH;

  // Veranda concrete plinth
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(width + 0.5, 0.18, depth + 1.5), mats.concreteCurb);
  plinth.position.set(0, 0.09, 0.55);
  plinth.receiveShadow = true;
  g.add(plinth);

  // Main 2-storey masonry body
  const body = new THREE.Mesh(new THREE.BoxGeometry(width, totalH, depth), wallMat);
  body.position.set(0, totalH / 2 + 0.18, 0);
  body.castShadow = true;
  body.receiveShadow = true;
  g.add(body);

  // Upper cantilevered veranda slab & parapet balustrade
  const balconySlab = new THREE.Mesh(new THREE.BoxGeometry(width + 0.4, 0.18, 1.45), mats.concreteCurb);
  balconySlab.position.set(0, groundH + 0.18, depth / 2 + 0.68);
  balconySlab.castShadow = true;
  g.add(balconySlab);

  const rail = new THREE.Mesh(new THREE.BoxGeometry(width + 0.36, 0.85, 0.1), wallMat);
  rail.position.set(0, groundH + 0.7, depth / 2 + 1.34);
  g.add(rail);

  // Ground-floor veranda columns
  const colGeo = new THREE.BoxGeometry(0.24, groundH, 0.24);
  const cols = [-width / 2 + 0.25, -width / 6, width / 6, width / 2 - 0.25];
  for (const cx of cols) {
    const col = new THREE.Mesh(colGeo, wallMat);
    col.position.set(cx, groundH / 2 + 0.18, depth / 2 + 1.24);
    col.castShadow = true;
    g.add(col);
  }

  // Commercial fascia banner above ground veranda
  const trimMat = new THREE.MeshStandardMaterial({ color: trimColor, roughness: 0.65 });
  const fascia = new THREE.Mesh(new THREE.BoxGeometry(width + 0.44, 0.76, 0.12), trimMat);
  fascia.position.set(0, groundH + 0.02, depth / 2 + 1.41);
  g.add(fascia);

  const signFace = new THREE.Mesh(
    new THREE.PlaneGeometry(width - 0.5, 0.68),
    new THREE.MeshStandardMaterial({ map: signTex, roughness: 0.48 }),
  );
  signFace.position.set(0, groundH + 0.02, depth / 2 + 1.48);
  g.add(signFace);

  // Two shop bays (one open warm-lit doorway + one half-shuttered bay)
  const bayOffsets = [-width / 4, width / 4];
  bayOffsets.forEach((bx, idx) => {
    const frame = new THREE.Mesh(new THREE.BoxGeometry(2.3, 2.35, 0.12), mats.darkSteel);
    frame.position.set(bx, 1.35, depth / 2 + 0.04);
    g.add(frame);

    if (idx === 0) {
      const interior = new THREE.Mesh(new THREE.PlaneGeometry(2.05, 2.15), mats.warmInteriorEmissive);
      interior.position.set(bx, 1.32, depth / 2 + 0.11);
      g.add(interior);

      const rolledShutter = new THREE.Mesh(new THREE.BoxGeometry(2.14, 0.42, 0.16), mats.shutterGrey);
      rolledShutter.position.set(bx, 2.28, depth / 2 + 0.12);
      g.add(rolledShutter);
    } else {
      const shutter = new THREE.Mesh(new THREE.BoxGeometry(2.1, 2.15, 0.14), mats.shutterGrey);
      shutter.position.set(bx, 1.3, depth / 2 + 0.09);
      g.add(shutter);
    }
  });

  // Upper floor windows
  for (const wx of [-width * 0.3, 0, width * 0.3]) {
    const winFrame = new THREE.Mesh(new THREE.BoxGeometry(1.35, 1.25, 0.12), mats.darkSteel);
    winFrame.position.set(wx, groundH + 1.65, depth / 2 + 0.03);
    g.add(winFrame);

    const glass = new THREE.Mesh(new THREE.PlaneGeometry(1.18, 1.08), mats.windowGlass);
    glass.position.set(wx, groundH + 1.65, depth / 2 + 0.1);
    g.add(glass);
  }

  // Slanted mabati roof + rooftop parapet & black Kampala water tank (Simtank)
  const roof = new THREE.Mesh(new THREE.BoxGeometry(width + 0.5, 0.14, depth + 0.6), mats.mabatiRust);
  roof.position.set(0, totalH + 0.25, 0);
  roof.rotation.x = 0.06;
  g.add(roof);

  const parapet = new THREE.Mesh(new THREE.BoxGeometry(width + 0.2, 0.48, 0.22), wallMat);
  parapet.position.set(0, totalH + 0.42, depth / 2 - 0.05);
  g.add(parapet);

  const tank = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.62, 1.25, 14), mats.waterTankBlack);
  tank.position.set(width * 0.28, totalH + 0.9, -0.5);
  tank.castShadow = true;
  g.add(tank);

  return g;
}

function buildKirekaSingleStoreyShop(
  mats: EnvironmentMaterialSet,
  signTex: THREE.Texture,
  wallMat: THREE.MeshStandardMaterial,
  roofMat: THREE.MeshStandardMaterial,
  width = 6.8,
  depth = 4.4,
): THREE.Group {
  const g = new THREE.Group();
  const wallH = 3.5;

  const plinth = new THREE.Mesh(new THREE.BoxGeometry(width + 0.4, 0.16, depth + 1.3), mats.concreteCurb);
  plinth.position.set(0, 0.08, 0.5);
  plinth.receiveShadow = true;
  g.add(plinth);

  const walls = new THREE.Mesh(new THREE.BoxGeometry(width, wallH, depth), wallMat);
  walls.position.set(0, wallH / 2 + 0.16, 0);
  walls.castShadow = true;
  walls.receiveShadow = true;
  g.add(walls);

  // Slanted corrugated roof extending over veranda
  const roof = new THREE.Mesh(new THREE.BoxGeometry(width + 0.6, 0.12, depth + 1.8), roofMat);
  roof.position.set(0, wallH + 0.18, 0.55);
  roof.rotation.x = 0.1;
  roof.castShadow = true;
  g.add(roof);

  // Veranda posts
  for (const px of [-width / 2 + 0.25, 0, width / 2 - 0.25]) {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.16, wallH - 0.2, 0.16), mats.darkSteel);
    post.position.set(px, (wallH - 0.2) / 2 + 0.16, depth / 2 + 1.15);
    g.add(post);
  }

  // Signboard fascia
  const sign = new THREE.Mesh(
    new THREE.BoxGeometry(width - 0.3, 0.72, 0.1),
    new THREE.MeshStandardMaterial({ map: signTex, roughness: 0.5 }),
  );
  sign.position.set(0, wallH - 0.22, depth / 2 + 1.25);
  g.add(sign);

  // Open hardware door + display shutter
  const doorGlow = new THREE.Mesh(new THREE.PlaneGeometry(1.75, 2.2), mats.warmInteriorEmissive);
  doorGlow.position.set(-width * 0.2, 1.28, depth / 2 + 0.03);
  g.add(doorGlow);

  const shutter = new THREE.Mesh(new THREE.BoxGeometry(1.9, 2.2, 0.12), mats.shutterGrey);
  shutter.position.set(width * 0.22, 1.28, depth / 2 + 0.04);
  g.add(shutter);

  return g;
}

function buildMobileMoneyKiosk(
  mats: EnvironmentMaterialSet,
  signTex: THREE.Texture,
): THREE.Group {
  const g = new THREE.Group();

  const pad = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.08, 1.55), mats.concreteCurb);
  pad.position.y = 0.04;
  pad.receiveShadow = true;
  g.add(pad);

  const body = new THREE.Mesh(new THREE.BoxGeometry(1.55, 2.15, 1.25), mats.kioskYellow);
  body.position.y = 1.15;
  body.castShadow = true;
  body.receiveShadow = true;
  g.add(body);

  const blackStripe = new THREE.Mesh(new THREE.BoxGeometry(1.59, 0.24, 1.29), mats.darkSteel);
  blackStripe.position.y = 0.42;
  g.add(blackStripe);

  // Service grille window
  const windowBack = new THREE.Mesh(new THREE.PlaneGeometry(0.95, 0.65), mats.warmInteriorEmissive);
  windowBack.position.set(0, 1.42, 0.635);
  g.add(windowBack);

  const shelf = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.06, 0.28), mats.darkSteel);
  shelf.position.set(0, 1.06, 0.72);
  g.add(shelf);

  // Roof + fascia
  const roof = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.08, 1.65), mats.mabatiSilver);
  roof.position.set(0, 2.28, 0.1);
  roof.rotation.x = 0.08;
  roof.castShadow = true;
  g.add(roof);

  const sign = new THREE.Mesh(
    new THREE.BoxGeometry(1.58, 0.42, 0.08),
    new THREE.MeshStandardMaterial({ map: signTex, roughness: 0.42 }),
  );
  sign.position.set(0, 2.04, 0.72);
  g.add(sign);

  return g;
}

function buildProduceStall(
  mats: EnvironmentMaterialSet,
  tarpMat: THREE.MeshStandardMaterial,
  seed: number,
): THREE.Group {
  const g = new THREE.Group();

  // Timber frame posts
  for (const px of [-0.95, 0.95]) {
    for (const pz of [-0.55, 0.55]) {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.05, 0.08), mats.timberMarket);
      post.position.set(px, 1.02, pz);
      post.castShadow = true;
      g.add(post);
    }
  }

  // Table display
  const table = new THREE.Mesh(new THREE.BoxGeometry(2.05, 0.1, 1.15), mats.timberMarket);
  table.position.set(0, 0.78, 0);
  table.castShadow = true;
  table.receiveShadow = true;
  g.add(table);

  // Slanted tarp awning
  const canopy = new THREE.Mesh(new THREE.BoxGeometry(2.25, 0.05, 1.45), tarpMat);
  canopy.position.set(0, 2.06, 0.05);
  canopy.rotation.x = 0.14;
  canopy.castShadow = true;
  g.add(canopy);

  // Produce piles (matooke green, tomatoes red, onions purple)
  const produceColors = [0x4d7c0f, 0xdc2626, 0xfacc15, 0x9333ea];
  for (let i = 0; i < 3; i++) {
    const basket = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.19, 0.16, 10),
      mats.timberPole,
    );
    basket.position.set(-0.62 + i * 0.62, 0.91, 0.08);
    g.add(basket);

    const heap = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 8, 6, 0, Math.PI * 2, 0, Math.PI * 0.55),
      new THREE.MeshStandardMaterial({
        color: produceColors[(seed + i) % produceColors.length],
        roughness: 0.78,
      }),
    );
    heap.position.set(-0.62 + i * 0.62, 0.97, 0.08);
    g.add(heap);
  }

  return g;
}

function buildKirekaMarketShed(
  mats: EnvironmentMaterialSet,
  bannerTex: THREE.Texture,
  roofMat: THREE.MeshStandardMaterial,
  width = 12.5,
  depth = 5.4,
  withBanner = false,
): THREE.Group {
  const g = new THREE.Group();

  // Concrete market floor slab
  const floor = new THREE.Mesh(new THREE.BoxGeometry(width, 0.12, depth), mats.concreteCurb);
  floor.position.y = 0.06;
  floor.receiveShadow = true;
  g.add(floor);

  // Steel roof stanchions
  const postGeo = new THREE.CylinderGeometry(0.08, 0.09, 3.6, 8);
  const cols = [-width / 2 + 0.5, -width / 6, width / 6, width / 2 - 0.5];
  for (const px of cols) {
    for (const pz of [-depth / 2 + 0.4, depth / 2 - 0.4]) {
      const post = new THREE.Mesh(postGeo, mats.darkSteel);
      post.position.set(px, 1.86, pz);
      g.add(post);
    }
  }

  // Pitched corrugated gable roof
  const leftSlope = new THREE.Mesh(new THREE.BoxGeometry(width + 0.8, 0.1, depth * 0.6), roofMat);
  leftSlope.position.set(0, 3.92, -depth * 0.24);
  leftSlope.rotation.x = -0.22;
  g.add(leftSlope);

  const rightSlope = new THREE.Mesh(new THREE.BoxGeometry(width + 0.8, 0.1, depth * 0.6), roofMat);
  rightSlope.position.set(0, 3.92, depth * 0.24);
  rightSlope.rotation.x = 0.22;
  g.add(rightSlope);

  if (withBanner) {
    const banner = new THREE.Mesh(
      new THREE.BoxGeometry(6.8, 0.85, 0.12),
      new THREE.MeshStandardMaterial({ map: bannerTex, roughness: 0.5 }),
    );
    banner.position.set(0, 3.4, depth / 2 + 0.22);
    g.add(banner);
  }

  // Market stalls & tarps silhouettes inside the open shed
  for (let sx = -width / 2 + 1.8; sx <= width / 2 - 1.8; sx += 3.0) {
    const bench = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.72, 1.1), mats.timberMarket);
    bench.position.set(sx, 0.42, 0.8);
    g.add(bench);

    const sack = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.32, 0.72, 8), mats.tarpOrange);
    sack.position.set(sx + 0.65, 0.46, 1.65);
    g.add(sack);
  }

  return g;
}

function createUmemePole(mats: EnvironmentMaterialSet): THREE.Group {
  const g = new THREE.Group();
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.15, 6.2, 8), mats.timberPole);
  pole.position.y = 3.1;
  pole.castShadow = true;
  g.add(pole);

  const crossArm = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.1, 0.1), mats.darkSteel);
  crossArm.position.y = 5.75;
  g.add(crossArm);

  for (const ix of [-0.58, 0, 0.58]) {
    const ins = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.14, 6), mats.chromeTrim);
    ins.position.set(ix, 5.87, 0);
    g.add(ins);
  }
  return g;
}

export async function buildKirekaDistrict(
  assetManager: AssetManager,
  textures: ProceduralTextureSet,
): Promise<DistrictHandle> {
  const root = new THREE.Group();
  root.name = 'kireka_district_root';
  const mats = createEnvironmentMaterials(textures);
  const ownedGeometries: THREE.BufferGeometry[] = [];
  const ownedMaterials: THREE.Material[] = [];

  const trackGeo = <T extends THREE.BufferGeometry>(g: T): T => {
    ownedGeometries.push(g);
    return g;
  };

  // =========================================================================
  // 1. TERRAIN & KIREKA HILL BACKDROP (Natural open terrain horizon, no walls)
  // =========================================================================
  const groundGeo = trackGeo(new THREE.PlaneGeometry(180, 160));
  const soilGround = new THREE.Mesh(groundGeo, mats.lateriteSoil);
  soilGround.rotation.x = -Math.PI / 2;
  soilGround.position.set(0, 0, -10);
  soilGround.receiveShadow = true;
  root.add(soilGround);

  // Kireka Hill rising north of the railway & market (Z = -26..-78)
  const hillGeo = trackGeo(new THREE.PlaneGeometry(180, 56, 48, 16));
  const posAttr = hillGeo.attributes.position;
  for (let i = 0; i < posAttr.count; i++) {
    const vx = posAttr.getX(i);
    const vy = posAttr.getY(i); // maps to -Z after rotation
    const tNorth = THREE.MathUtils.clamp((vy + 28) / 56, 0, 1);
    const undulation =
      Math.sin(vx * 0.065) * 2.1 + Math.cos(vx * 0.13 + 1.1) * 1.1 + Math.sin(vy * 0.12) * 0.8;
    const height = Math.pow(tNorth, 1.35) * 11.5 + tNorth * undulation;
    posAttr.setZ(i, Math.max(0, height));
  }
  hillGeo.computeVertexNormals();
  const kirekaHill = new THREE.Mesh(hillGeo, mats.hillGrass);
  kirekaHill.rotation.x = -Math.PI / 2;
  kirekaHill.position.set(0, -0.05, -52);
  kirekaHill.receiveShadow = true;
  root.add(kirekaHill);

  // Distant Kireka Hill residential rooftops & Central Uganda Conference spire silhouette
  const hillHouses = [
    { x: -24, z: -42, y: 3.4, w: 5.5, h: 2.6, d: 4.2, mat: mats.plasterCream },
    { x: -11, z: -46, y: 4.6, w: 6.2, h: 2.8, d: 4.5, mat: mats.plasterOchre },
    { x: 4, z: -44, y: 4.2, w: 7.4, h: 3.6, d: 5.0, mat: mats.plasterCream }, // Landmark hall
    { x: 18, z: -41, y: 3.2, w: 5.2, h: 2.5, d: 4.0, mat: mats.plasterTerracotta },
    { x: 30, z: -47, y: 4.8, w: 6.0, h: 2.7, d: 4.2, mat: mats.plasterConcrete },
  ];
  for (const hh of hillHouses) {
    const house = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(hh.w, hh.h, hh.d)), hh.mat);
    house.position.set(hh.x, hh.y + hh.h / 2, hh.z);
    root.add(house);
    const hRoof = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(hh.w + 0.5, 0.25, hh.d + 0.5)),
      mats.mabatiRust,
    );
    hRoof.position.set(hh.x, hh.y + hh.h + 0.14, hh.z);
    root.add(hRoof);
  }

  // =========================================================================
  // 2. KAMPALA-JINJA HIGHWAY, SHOULDERS, STORM DRAIN & PAVED SIDEWALK
  // =========================================================================
  const highway = await assetManager.loadOrBuild('kireka_highway_segment', () => {
    const g = new THREE.Group();
    const roadMesh = new THREE.Mesh(new THREE.PlaneGeometry(120, 5.8), mats.jinjaHighway);
    roadMesh.rotation.x = -Math.PI / 2;
    roadMesh.position.set(0, 0.025, 6.15);
    roadMesh.receiveShadow = true;
    g.add(roadMesh);

    // Far-side highway verge & red murram shoulder
    const farShoulder = new THREE.Mesh(new THREE.PlaneGeometry(120, 1.4), mats.lateriteSoil);
    farShoulder.rotation.x = -Math.PI / 2;
    farShoulder.position.set(0, 0.014, 9.75);
    g.add(farShoulder);
    return g;
  });
  root.add(highway);

  // Interlocking Concrete Paver Sidewalk along Kireka commercial frontage
  const sidewalk = new THREE.Mesh(
    trackGeo(new THREE.PlaneGeometry(46, 3.9)),
    mats.paverWalkway,
  );
  sidewalk.rotation.x = -Math.PI / 2;
  sidewalk.position.set(0, 0.018, 0.6);
  sidewalk.receiveShadow = true;
  root.add(sidewalk);

  // Roadside Concrete Storm Drainage Channel (Z = 2.55..3.18) with Crossover Slabs
  const drainGroup = await assetManager.loadOrBuild('kireka_drain_channel', () => {
    const g = new THREE.Group();
    // Sidewalk curb lip (Z = 2.55)
    const innerCurb = new THREE.Mesh(new THREE.BoxGeometry(68, 0.18, 0.16), mats.concreteCurb);
    innerCurb.position.set(0, 0.04, 2.55);
    innerCurb.receiveShadow = true;
    g.add(innerCurb);

    // Outer highway-edge curb (Z = 3.2)
    const outerCurb = new THREE.Mesh(new THREE.BoxGeometry(68, 0.16, 0.16), mats.concreteCurb);
    outerCurb.position.set(0, 0.03, 3.2);
    outerCurb.receiveShadow = true;
    g.add(outerCurb);

    // Recessed drain channel bed + dark silt/water strip
    const bed = new THREE.Mesh(new THREE.BoxGeometry(68, 0.08, 0.56), mats.drainBed);
    bed.position.set(0, -0.18, 2.88);
    g.add(bed);

    const water = new THREE.Mesh(new THREE.PlaneGeometry(68, 0.44), mats.drainWater);
    water.rotation.x = -Math.PI / 2;
    water.position.set(0, -0.12, 2.88);
    g.add(water);

    // Pedestrian/boda concrete bridge slabs over the drain
    const slabConfigs: Array<[number, number]> = [
      [0, 4.8],      // Hero Rolex Stall frontage crossing
      [-5.8, 2.6],   // Kireka Market Access Lane entrance
      [7.2, 3.2],    // Kireka Boda & Matatu Stage crossing
      [-13.5, 2.4],  // West shopfront crossing
      [15.0, 2.4],   // East shopfront crossing
    ];
    for (const [sx, sw] of slabConfigs) {
      const slab = new THREE.Mesh(new THREE.BoxGeometry(sw, 0.1, 0.84), mats.concreteCurb);
      slab.position.set(sx, 0.06, 2.88);
      slab.receiveShadow = true;
      slab.castShadow = true;
      g.add(slab);
    }
    return g;
  });
  root.add(drainGroup);

  // =========================================================================
  // 3. UGANDA RAILWAYS METER-GAUGE TRACK RESERVE (Z = -13.6)
  // =========================================================================
  const railway = await assetManager.loadOrBuild('kireka_railway_track', () => {
    const g = new THREE.Group();

    // Crushed stone ballast embankment
    const ballast = new THREE.Mesh(new THREE.BoxGeometry(116, 0.16, 2.8), mats.ballastStone);
    ballast.position.set(0, 0.06, -13.6);
    ballast.receiveShadow = true;
    g.add(ballast);

    // Instanced sleepers (116 sleepers -> 1 draw call!)
    const sleeperGeo = new THREE.BoxGeometry(0.22, 0.12, 1.85);
    const sleeperCount = 116;
    const sleepers = new THREE.InstancedMesh(sleeperGeo, mats.railwaySleeper, sleeperCount);
    const dummy = new THREE.Object3D();
    for (let i = 0; i < sleeperCount; i++) {
      dummy.position.set(-57.5 + i * 1.0, 0.14, -13.6);
      dummy.rotation.set(0, (Math.sin(i * 1.7) * 0.015), 0);
      dummy.updateMatrix();
      sleepers.setMatrixAt(i, dummy.matrix);
    }
    sleepers.instanceMatrix.needsUpdate = true;
    sleepers.computeBoundingSphere();
    g.add(sleepers);

    // Twin 1.0m meter-gauge steel rails
    for (const rz of [-13.1, -14.1]) {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(116, 0.09, 0.07), mats.railwaySteel);
      rail.position.set(0, 0.24, rz);
      g.add(rail);
    }

    // Timber level-crossing deck where Market Lane crosses tracks (X = -5.8)
    const crossing = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.08, 2.4), mats.timberMarket);
    crossing.position.set(-5.8, 0.21, -13.6);
    g.add(crossing);

    return g;
  });
  root.add(railway);

  // =========================================================================
  // 4. KIREKA COMMERCIAL SHOPFRONTS & MAIN MARKET SHEDS
  // =========================================================================
  // Central 2-Storey Wholesale Duka & Pharmacy behind the Rolex stall (Z = -7.8)
  const centralBlock = await assetManager.loadOrBuild('kireka_shop_building_a', () =>
    buildKirekaTwoStoreyShopBlock(
      mats,
      textures.signWholesaleDuka,
      mats.plasterCream,
      0x14532d,
      8.6,
      4.6,
    ),
  );
  centralBlock.position.set(2.2, 0, -7.8);
  root.add(centralBlock);

  // East Hardware & Paints shopfront (X = +10.8, Z = -7.4)
  const eastHardware = await assetManager.loadOrBuild('kireka_shop_building_b', () =>
    buildKirekaSingleStoreyShop(
      mats,
      textures.signHardware,
      mats.plasterOchre,
      mats.mabatiRust,
      7.2,
      4.4,
    ),
  );
  eastHardware.position.set(10.8, 0, -7.4);
  root.add(eastHardware);

  // West Electronics & Hair Salon 2-Storey block across the Market Lane (X = -12.6, Z = -7.8)
  const westBlock = buildKirekaTwoStoreyShopBlock(
    mats,
    textures.signElectronicsSalon,
    mats.plasterMint,
    0x7f1d1d,
    8.2,
    4.6,
  );
  westBlock.position.set(-12.6, 0, -7.8);
  root.add(westBlock);

  // Outer wing Jinja Road commercial shopfronts (East & West)
  const farEastShop = buildKirekaSingleStoreyShop(
    mats,
    textures.signWholesaleDuka,
    mats.plasterTerracotta,
    mats.mabatiBlue,
    7.6,
    4.4,
  );
  farEastShop.position.set(19.2, 0, -7.4);
  root.add(farEastShop);

  const farWestShop = buildKirekaSingleStoreyShop(
    mats,
    textures.signHardware,
    mats.plasterOchre,
    mats.mabatiSilver,
    7.6,
    4.4,
  );
  farWestShop.position.set(-21.8, 0, -7.4);
  root.add(farWestShop);

  // Southern opposite-side Jinja Road buildings (visible when orbiting left/right or zoomed out)
  const southBlocks: Array<[number, number, THREE.MeshStandardMaterial]> = [
    [-16.5, 14.8, mats.plasterCream],
    [-8.8, 14.8, mats.plasterTerracotta],
    [10.2, 14.8, mats.plasterOchre],
    [18.5, 14.8, mats.plasterConcrete],
  ];
  for (const [bx, bz, wMat] of southBlocks) {
    const sb = buildKirekaSingleStoreyShop(
      mats,
      textures.signHardware,
      wMat,
      mats.mabatiRust,
      6.6,
      4.2,
    );
    sb.position.set(bx, 0, bz);
    sb.rotation.y = Math.PI;
    root.add(sb);
  }

  // Kireka Main Market Open-Truss Mabati Sheds (north of railway line, Z = -20.5)
  const marketWestShed = await assetManager.loadOrBuild('kireka_market_shed', () =>
    buildKirekaMarketShed(mats, textures.signKirekaMarket, mats.mabatiRust, 13.0, 5.6, true),
  );
  marketWestShed.position.set(-7.5, 0, -20.4);
  root.add(marketWestShed);

  const marketEastShed = buildKirekaMarketShed(
    mats,
    textures.signKirekaMarket,
    mats.mabatiSilver,
    12.0,
    5.6,
    false,
  );
  marketEastShed.position.set(6.2, 0, -20.4);
  root.add(marketEastShed);

  // =========================================================================
  // 5. KIREKA NEIGHBORING KIOSK, MARKET ACCESS LANE & BODA/MATATU STAGE
  // =========================================================================
  // Iconic Yellow Mobile Money Kiosk just West of the Rolex stall (X = -3.75, Z = -0.85)
  const mmKiosk = await assetManager.loadOrBuild('kireka_mobile_money_kiosk', () =>
    buildMobileMoneyKiosk(mats, textures.signMobileMoney),
  );
  mmKiosk.position.set(-3.75, 0, -0.85);
  mmKiosk.rotation.y = 0.16;
  root.add(mmKiosk);

  // Kireka Market Access Lane (compacted red murram lane X = -7.6..-4.4, Z = -22..+2.5)
  const marketLane = new THREE.Mesh(
    trackGeo(new THREE.PlaneGeometry(3.2, 23.5)),
    mats.lateriteSoil,
  );
  marketLane.rotation.x = -Math.PI / 2;
  marketLane.position.set(-5.8, 0.022, -9.2);
  marketLane.receiveShadow = true;
  root.add(marketLane);

  // Roadside Informal Produce Stalls lining the Market Lane
  const producePositions: Array<[number, number, number, THREE.MeshStandardMaterial]> = [
    [-7.9, -3.1, Math.PI / 2, mats.tarpBlue],
    [-7.9, -6.5, Math.PI / 2, mats.tarpOrange],
    [-3.7, -4.4, -Math.PI / 2, mats.tarpBlue],
    [-3.7, -8.2, -Math.PI / 2, mats.tarpOrange],
  ];
  for (let i = 0; i < producePositions.length; i++) {
    const [px, pz, rotY, tMat] = producePositions[i];
    const stall = await assetManager.loadOrBuild(`kireka_produce_stall`, () =>
      buildProduceStall(mats, tMat, i),
    );
    stall.position.set(px, 0, pz);
    stall.rotation.y = rotY;
    root.add(stall);
  }

  // East-Side Kireka Boda-Boda & Matatu Stage (X = +4.8..+11.5)
  const parkedBoda1 = createParkedBodaMesh(mats, 0xdc2626);
  parkedBoda1.position.set(4.55, 0, 2.05);
  parkedBoda1.rotation.y = -0.52;
  root.add(parkedBoda1);

  const parkedBoda2 = createParkedBodaMesh(mats, 0x1d4ed8);
  parkedBoda2.position.set(6.15, 0, 2.08);
  parkedBoda2.rotation.y = -0.78;
  root.add(parkedBoda2);

  // Stage signpost
  const stagePole = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.05, 0.05, 2.35, 8)),
    mats.darkSteel,
  );
  stagePole.position.set(5.4, 1.175, 2.2);
  root.add(stagePole);
  const stagePlate = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.75, 0.42, 0.05)),
    mats.kioskYellow,
  );
  stagePlate.position.set(5.4, 2.15, 2.2);
  root.add(stagePlate);

  // Waiting Kampala Matatu parked along East Stage edge (X = 10.6, Z = 3.72)
  const parkedMatatu = await assetManager.loadOrBuild('env_matatu_taxi', () =>
    createParkedMatatuMesh(mats),
  );
  parkedMatatu.position.set(10.6, 0, 3.72);
  parkedMatatu.rotation.y = Math.PI; // Facing -X toward Kampala city
  root.add(parkedMatatu);

  // =========================================================================
  // 6. UMEME UTILITY POLES, OVERHEAD CABLES & INSTANCED TREES
  // =========================================================================
  const poleCoords: Array<[number, number]> = [
    [-22, -4.1],
    [-11.5, -4.1],
    [-3.2, -4.1],
    [5.8, -4.1],
    [15.0, -4.1],
    [24.0, -4.1],
    [-20, 9.9],
    [-10, 9.9],
    [1.5, 9.9],
    [12.5, 9.9],
    [22.5, 9.9],
  ];

  for (const [px, pz] of poleCoords) {
    const pole = await assetManager.loadOrBuild('env_umeme_pole', () => createUmemePole(mats));
    pole.position.set(px, 0, pz);
    root.add(pole);
  }

  // Overhead power cable catenary curves (high at Y = 5.5..5.9m so camera never clips)
  const cableMat = new THREE.LineBasicMaterial({ color: 0x18181b });
  ownedMaterials.push(cableMat);
  const addCableSpan = (rowIndices: number[], zOffset: number) => {
    for (let i = 0; i < rowIndices.length - 1; i++) {
      const [x1, z1] = poleCoords[rowIndices[i]];
      const [x2, z2] = poleCoords[rowIndices[i + 1]];
      for (const armX of [-0.55, 0.55]) {
        const pts: THREE.Vector3[] = [];
        for (let s = 0; s <= 6; s++) {
          const t = s / 6;
          const sag = Math.sin(t * Math.PI) * 0.34;
          pts.push(
            new THREE.Vector3(
              THREE.MathUtils.lerp(x1, x2, t),
              5.82 - sag,
              THREE.MathUtils.lerp(z1, z2, t) + armX * zOffset,
            ),
          );
        }
        const geo = trackGeo(new THREE.BufferGeometry().setFromPoints(pts));
        root.add(new THREE.Line(geo, cableMat));
      }
    }
  };
  addCableSpan([0, 1, 2, 3, 4, 5], 0.25);
  addCableSpan([6, 7, 8, 9, 10], 0.25);

  // Instanced Ugandan Acacia / Mango Shade Trees (2 draw calls total!)
  const treeCoords: Array<[number, number, number]> = [
    [-8.6, -2.1, 1.05],
    [7.8, -2.3, 1.0],
    [-16.8, -1.8, 1.15],
    [16.2, -1.9, 1.1],
    [-25.5, 1.4, 1.2],
    [25.0, 1.2, 1.15],
    [-18.0, -16.8, 1.25],
    [16.5, -16.5, 1.2],
    [-26.0, -29.0, 1.45],
    [-14.0, -32.0, 1.5],
    [-2.0, -30.5, 1.4],
    [11.5, -31.5, 1.55],
    [24.0, -29.5, 1.45],
    [-21.0, 11.8, 1.15],
    [14.5, 11.6, 1.1],
  ];

  const trunkGeo = trackGeo(new THREE.CylinderGeometry(0.15, 0.24, 2.5, 8));
  const canopyGeo = trackGeo(new THREE.SphereGeometry(1.42, 10, 8));
  const trunkInst = new THREE.InstancedMesh(trunkGeo, mats.treeBark, treeCoords.length);
  const canopyInst = new THREE.InstancedMesh(
    canopyGeo,
    mats.foliageGreen,
    treeCoords.length * 2,
  );
  trunkInst.castShadow = true;
  canopyInst.castShadow = true;

  const dummy = new THREE.Object3D();
  treeCoords.forEach(([tx, tz, sc], idx) => {
    const hillLift = tz < -26 ? ((-tz - 26) / 56) * 2.2 : 0;
    dummy.position.set(tx, hillLift + 1.25 * sc, tz);
    dummy.rotation.set(0, idx * 0.7, 0);
    dummy.scale.set(sc, sc, sc);
    dummy.updateMatrix();
    trunkInst.setMatrixAt(idx, dummy.matrix);

    // Lower wide umbrella puff
    dummy.position.set(tx, hillLift + 2.75 * sc, tz);
    dummy.scale.set(sc * 1.15, sc * 0.52, sc * 1.15);
    dummy.updateMatrix();
    canopyInst.setMatrixAt(idx * 2, dummy.matrix);

    // Upper offset puff
    dummy.position.set(tx + 0.45 * sc, hillLift + 3.05 * sc, tz - 0.25 * sc);
    dummy.scale.set(sc * 0.82, sc * 0.44, sc * 0.82);
    dummy.updateMatrix();
    canopyInst.setMatrixAt(idx * 2 + 1, dummy.matrix);
  });
  trunkInst.instanceMatrix.needsUpdate = true;
  canopyInst.instanceMatrix.needsUpdate = true;
  trunkInst.computeBoundingSphere();
  canopyInst.computeBoundingSphere();
  root.add(trunkInst, canopyInst);

  // Instanced roadside shrubs & grass tufts along railway reserve & murram verges
  const shrubGeo = trackGeo(new THREE.DodecahedronGeometry(0.32, 0));
  const shrubCount = 44;
  const shrubs = new THREE.InstancedMesh(shrubGeo, mats.foliageDark, shrubCount);
  for (let i = 0; i < shrubCount; i++) {
    const sx = -28 + (i / shrubCount) * 56 + Math.sin(i * 3.1) * 0.6;
    const sz = i % 2 === 0 ? -11.9 + Math.cos(i) * 0.35 : 9.8 + Math.sin(i) * 0.4;
    const s = 0.7 + (i % 4) * 0.25;
    dummy.position.set(sx, 0.16 * s, sz);
    dummy.rotation.set(0, i * 0.9, 0);
    dummy.scale.set(s * 1.3, s * 0.75, s);
    dummy.updateMatrix();
    shrubs.setMatrixAt(i, dummy.matrix);
  }
  shrubs.instanceMatrix.needsUpdate = true;
  shrubs.computeBoundingSphere();
  root.add(shrubs);

  return {
    root,
    materials: mats,
    setEveningFactor: (t: number) => {
      const clamped = THREE.MathUtils.clamp(t, 0, 1);
      mats.warmInteriorEmissive.emissiveIntensity = 0.35 + clamped * 1.35;
    },
    dispose: () => {
      ownedGeometries.forEach((g) => g.dispose());
      ownedMaterials.forEach((m) => m.dispose());
      mats.dispose();
    },
  };
}
