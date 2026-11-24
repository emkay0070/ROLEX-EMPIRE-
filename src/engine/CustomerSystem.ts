import * as THREE from 'three';
import { CustomerOrder, CustomerPersonality } from '../types/game';
import { getUnlockedRecipes } from '../data/recipes';

const UGANDAN_NAMES = [
  'Kato',
  'Babirye',
  'Ssemogerere',
  'Namukasa',
  'Mugisha',
  'Nakato',
  'Wasswa',
  'Achieng',
  'Okello',
  'Nambatya',
  'Byaruhanga',
  'Nakalema',
  'Tusiime',
  'Lubega',
];

const SHIRT_PALETTES = [
  0xd97706, // Saffron amber
  0x1d4ed8, // Kampala royal blue
  0x15803d, // Leaf green
  0xb91c1c, // Crimson red
  0x7c3aed, // Plum
  0x0f766e, // Teal
  0xf59e0b, // Boda reflective vest yellow
  0xe2e8f0, // Crisp office shirt
];

const SKIN_TONES = [0x4a2c1d, 0x5c3826, 0x3b2216, 0x6c422c, 0x523121];

export interface CustomerVisual {
  order: CustomerOrder;
  group: THREE.Group;
  leftLeg: THREE.Mesh;
  rightLeg: THREE.Mesh;
  leftArm: THREE.Mesh;
  rightArm: THREE.Mesh;
  headGroup: THREE.Group;
  targetPos: THREE.Vector3;
  walkPhase: number;
  hitboxMesh: THREE.Mesh;
}

const SLOT_POSITIONS = [
  new THREE.Vector3(-1.15, 0, 1.55),
  new THREE.Vector3(0.0, 0, 1.55),
  new THREE.Vector3(1.15, 0, 1.55),
];

const SHARED_GEOS = {
  shadow: new THREE.PlaneGeometry(0.85, 0.85),
  leg: new THREE.CylinderGeometry(0.085, 0.072, 0.76, 10),
  shoe: new THREE.BoxGeometry(0.13, 0.08, 0.22),
  torso: new THREE.CylinderGeometry(0.21, 0.18, 0.62, 12),
  vest: new THREE.CylinderGeometry(0.222, 0.195, 0.16, 12),
  pack: new THREE.BoxGeometry(0.28, 0.36, 0.16),
  arm: new THREE.CylinderGeometry(0.06, 0.052, 0.54, 10),
  sleeve: new THREE.CylinderGeometry(0.072, 0.068, 0.18, 10),
  neck: new THREE.CylinderGeometry(0.065, 0.075, 0.12, 10),
  head: new THREE.SphereGeometry(0.155, 14, 12),
  helmet: new THREE.SphereGeometry(0.175, 14, 12, 0, Math.PI * 2, 0, Math.PI * 0.65),
  hair: new THREE.SphereGeometry(0.162, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.56),
  eye: new THREE.SphereGeometry(0.018, 8, 8),
  hitbox: new THREE.BoxGeometry(0.75, 1.85, 0.65),
};

const SHARED_MATS = {
  shoe: new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.55 }),
  vest: new THREE.MeshStandardMaterial({ color: 0xa3e635, roughness: 0.4 }),
  pack: new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.85 }),
  helmet: new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.25, metalness: 0.3 }),
  hair: new THREE.MeshStandardMaterial({ color: 0x171412, roughness: 0.95 }),
  eye: new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.2 }),
  hitbox: new THREE.MeshBasicMaterial({ visible: false }),
};

export function buildUgandanCustomerMesh(
  order: CustomerOrder,
  contactShadowTex: THREE.Texture,
): CustomerVisual {
  const group = new THREE.Group();
  group.name = `customer_${order.id}`;

  const skinMat = new THREE.MeshStandardMaterial({
    color: order.skinTone,
    roughness: 0.62,
    metalness: 0.02,
  });

  const shirtMat = new THREE.MeshStandardMaterial({
    color: order.shirtColor,
    roughness: 0.82,
    metalness: 0.0,
  });

  const pantsMat = new THREE.MeshStandardMaterial({
    color: order.personality === 'office_pro' ? 0x1e293b : 0x292524,
    roughness: 0.88,
  });

  // Ground contact shadow (bottom-center pivot at y=0)
  const shadowPlane = new THREE.Mesh(
    SHARED_GEOS.shadow,
    new THREE.MeshBasicMaterial({
      map: contactShadowTex,
      transparent: true,
      depthWrite: false,
      opacity: 0.5,
    }),
  );
  shadowPlane.rotation.x = -Math.PI / 2;
  shadowPlane.position.y = 0.015;
  group.add(shadowPlane);

  // Legs
  const leftLeg = new THREE.Mesh(SHARED_GEOS.leg, pantsMat);
  leftLeg.position.set(-0.11, 0.42, 0);
  leftLeg.castShadow = true;
  group.add(leftLeg);

  const rightLeg = new THREE.Mesh(SHARED_GEOS.leg, pantsMat);
  rightLeg.position.set(0.11, 0.42, 0);
  rightLeg.castShadow = true;
  group.add(rightLeg);

  // Shoes
  const leftShoe = new THREE.Mesh(SHARED_GEOS.shoe, SHARED_MATS.shoe);
  leftShoe.position.set(0, -0.38, 0.04);
  leftLeg.add(leftShoe);

  const rightShoe = new THREE.Mesh(SHARED_GEOS.shoe, SHARED_MATS.shoe);
  rightShoe.position.set(0, -0.38, 0.04);
  rightLeg.add(rightShoe);

  // Torso
  const torso = new THREE.Mesh(SHARED_GEOS.torso, shirtMat);
  torso.position.y = 1.09;
  torso.castShadow = true;
  torso.receiveShadow = true;
  group.add(torso);

  if (order.personality === 'friendly_boda') {
    const vestStrip = new THREE.Mesh(SHARED_GEOS.vest, SHARED_MATS.vest);
    vestStrip.position.y = 1.1;
    group.add(vestStrip);
  }

  if (order.hasBackpack) {
    const pack = new THREE.Mesh(SHARED_GEOS.pack, SHARED_MATS.pack);
    pack.position.set(0, 1.12, 0.22);
    pack.castShadow = true;
    group.add(pack);
  }

  // Arms
  const leftArm = new THREE.Mesh(SHARED_GEOS.arm, skinMat);
  leftArm.position.set(-0.27, 1.08, 0);
  leftArm.castShadow = true;
  group.add(leftArm);

  const rightArm = new THREE.Mesh(SHARED_GEOS.arm, skinMat);
  rightArm.position.set(0.27, 1.08, 0);
  rightArm.castShadow = true;
  group.add(rightArm);

  // Short sleeves
  const leftSleeve = new THREE.Mesh(SHARED_GEOS.sleeve, shirtMat);
  leftSleeve.position.y = 0.17;
  leftArm.add(leftSleeve);

  const rightSleeve = new THREE.Mesh(SHARED_GEOS.sleeve, shirtMat);
  rightSleeve.position.y = 0.17;
  rightArm.add(rightSleeve);

  // Head group
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 1.54, 0);
  group.add(headGroup);

  const neck = new THREE.Mesh(SHARED_GEOS.neck, skinMat);
  neck.position.y = -0.09;
  headGroup.add(neck);

  const head = new THREE.Mesh(SHARED_GEOS.head, skinMat);
  head.castShadow = true;
  headGroup.add(head);

  if (order.hasHelmet) {
    const helmet = new THREE.Mesh(SHARED_GEOS.helmet, SHARED_MATS.helmet);
    helmet.position.y = 0.02;
    headGroup.add(helmet);
  } else {
    const hair = new THREE.Mesh(SHARED_GEOS.hair, SHARED_MATS.hair);
    hair.position.y = 0.015;
    headGroup.add(hair);
  }

  // Facial eyes (facing -Z toward stall counter when yaw = 0)
  const leftEye = new THREE.Mesh(SHARED_GEOS.eye, SHARED_MATS.eye);
  leftEye.position.set(-0.052, 0.02, -0.14);
  headGroup.add(leftEye);
  const rightEye = new THREE.Mesh(SHARED_GEOS.eye, SHARED_MATS.eye);
  rightEye.position.set(0.052, 0.02, -0.14);
  headGroup.add(rightEye);

  // Invisible raycast hitbox
  const hitboxMesh = new THREE.Mesh(SHARED_GEOS.hitbox, SHARED_MATS.hitbox);
  hitboxMesh.position.y = 0.92;
  hitboxMesh.userData = { interactType: 'customer', customerId: order.id };
  hitboxMesh.layers.set(1);
  group.add(hitboxMesh);

  // Spawn from Kampala street side facing center
  const spawnX = order.slotIndex % 2 === 0 ? -5.8 : 5.8;
  group.position.set(spawnX, 0, 2.35);
  group.rotation.y = spawnX < 0 ? -Math.PI / 2 : Math.PI / 2;

  return {
    order,
    group,
    leftLeg,
    rightLeg,
    leftArm,
    rightArm,
    headGroup,
    targetPos: SLOT_POSITIONS[order.slotIndex].clone(),
    walkPhase: Math.random() * Math.PI * 2,
    hitboxMesh,
  };
}

export function disposeCustomerVisual(cv: CustomerVisual): void {
  const sharedMats = new Set<THREE.Material>(Object.values(SHARED_MATS));
  cv.group.traverse((obj) => {
    if ((obj as THREE.Mesh).isMesh) {
      const mat = (obj as THREE.Mesh).material;
      if (Array.isArray(mat)) {
        mat.forEach((m) => {
          if (!sharedMats.has(m)) m.dispose();
        });
      } else if (mat && !sharedMats.has(mat)) {
        mat.dispose();
      }
    }
  });
}

function dampAngle(current: number, target: number, lambda: number, dt: number): number {
  let diff = ((target - current + Math.PI) % (Math.PI * 2)) - Math.PI;
  if (diff < -Math.PI) diff += Math.PI * 2;
  return current + diff * (1 - Math.exp(-lambda * dt));
}

export function createCustomerOrder(
  slotIndex: number,
  level: number,
  patienceBonusMultiplier: number,
  hasSpiceRack: boolean,
): CustomerOrder {
  const recipes = getUnlockedRecipes(level, hasSpiceRack);
  const recipe = recipes[Math.floor(Math.random() * recipes.length)];

  const personalities: CustomerPersonality[] = [
    'friendly_boda',
    'student_rush',
    'office_pro',
    'market_mama',
    'food_critic',
  ];
  const personality = personalities[Math.floor(Math.random() * personalities.length)];

  let basePatience = 28;
  let tipMult = 1.0;

  if (personality === 'student_rush') {
    basePatience = 24;
    tipMult = 0.95;
  } else if (personality === 'friendly_boda') {
    basePatience = 28;
    tipMult = 1.15;
  } else if (personality === 'office_pro') {
    basePatience = 26;
    tipMult = 1.35;
  } else if (personality === 'market_mama') {
    basePatience = 33;
    tipMult = 1.1;
  } else if (personality === 'food_critic') {
    basePatience = 25;
    tipMult = 1.6;
  }

  const patienceMax = Math.round(basePatience * patienceBonusMultiplier);
  const name = UGANDAN_NAMES[Math.floor(Math.random() * UGANDAN_NAMES.length)];

  return {
    id: `cust_${Date.now()}_${Math.floor(Math.random() * 9999)}`,
    customerName: name,
    personality,
    recipe,
    patienceMax,
    patienceRemaining: patienceMax,
    status: 'walking_in',
    slotIndex,
    tipMultiplier: tipMult,
    shirtColor: SHIRT_PALETTES[Math.floor(Math.random() * SHIRT_PALETTES.length)],
    skinTone: SKIN_TONES[Math.floor(Math.random() * SKIN_TONES.length)],
    hasHelmet: personality === 'friendly_boda',
    hasBackpack: personality === 'student_rush',
    spawnedAt: performance.now(),
  };
}

const _scratchDir = new THREE.Vector3();
const _scratchExit = new THREE.Vector3();

export function updateCustomerVisuals(
  visuals: CustomerVisual[],
  dt: number,
  elapsed: number,
): void {
  for (const cv of visuals) {
    const { order, group, leftLeg, rightLeg, leftArm, rightArm, headGroup, targetPos } = cv;

    if (order.status === 'walking_in') {
      const dist = group.position.distanceTo(targetPos);
      if (dist > 0.08) {
        _scratchDir.copy(targetPos).sub(group.position).normalize();
        const speed = 2.4;
        group.position.addScaledVector(_scratchDir, Math.min(dist, speed * dt));
        // Forward face is -Z, so yaw to face dir is atan2(-dir.x, -dir.z)
        const targetYaw = Math.atan2(-_scratchDir.x, -_scratchDir.z);
        group.rotation.y = dampAngle(group.rotation.y, targetYaw, 8, dt);

        cv.walkPhase += dt * 10;
        const swing = Math.sin(cv.walkPhase) * 0.45;
        leftLeg.rotation.x = swing;
        rightLeg.rotation.x = -swing;
        leftArm.rotation.x = -swing * 0.7;
        rightArm.rotation.x = swing * 0.7;
      } else {
        group.position.copy(targetPos);
        order.status = 'waiting';
      }
    } else if (order.status === 'waiting') {
      group.rotation.y = dampAngle(group.rotation.y, 0, 8, dt);
      leftLeg.rotation.x = THREE.MathUtils.lerp(leftLeg.rotation.x, 0, 1 - Math.exp(-10 * dt));
      rightLeg.rotation.x = THREE.MathUtils.lerp(rightLeg.rotation.x, 0, 1 - Math.exp(-10 * dt));

      const ratio = order.patienceRemaining / order.patienceMax;
      if (ratio < 0.35) {
        rightArm.rotation.x = -2.1 + Math.sin(elapsed * 9) * 0.35;
        leftArm.rotation.x = 0.25;
        headGroup.rotation.y = Math.sin(elapsed * 5) * 0.22;
      } else {
        leftArm.rotation.x = Math.sin(elapsed * 2 + cv.walkPhase) * 0.08;
        rightArm.rotation.x = -Math.sin(elapsed * 2 + cv.walkPhase) * 0.08;
        headGroup.rotation.y = Math.sin(elapsed * 1.3 + cv.walkPhase) * 0.1;
      }
    } else if (order.status === 'leaving_happy' || order.status === 'leaving_angry') {
      _scratchExit.set(order.slotIndex % 2 === 0 ? -7.5 : 7.5, 0, 2.25);
      _scratchDir.copy(_scratchExit).sub(group.position).normalize();
      group.position.addScaledVector(_scratchDir, 2.8 * dt);
      const targetYaw = Math.atan2(-_scratchDir.x, -_scratchDir.z);
      group.rotation.y = dampAngle(group.rotation.y, targetYaw, 8, dt);

      cv.walkPhase += dt * 11;
      const swing = Math.sin(cv.walkPhase) * 0.45;
      leftLeg.rotation.x = swing;
      rightLeg.rotation.x = -swing;
      leftArm.rotation.x = order.status === 'leaving_happy' ? -0.4 : -swing * 0.7;
      rightArm.rotation.x =
        order.status === 'leaving_happy' ? -1.4 + Math.sin(elapsed * 8) * 0.2 : swing * 0.7;
    }
  }
}
