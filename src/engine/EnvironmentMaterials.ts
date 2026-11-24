import * as THREE from 'three';
import { ProceduralTextureSet } from './ProceduralTextures';

export interface EnvironmentMaterialSet {
  lateriteSoil: THREE.MeshStandardMaterial;
  hillGrass: THREE.MeshStandardMaterial;
  jinjaHighway: THREE.MeshStandardMaterial;
  paverWalkway: THREE.MeshStandardMaterial;
  concreteCurb: THREE.MeshStandardMaterial;
  drainBed: THREE.MeshStandardMaterial;
  drainWater: THREE.MeshStandardMaterial;
  ballastStone: THREE.MeshStandardMaterial;
  railwaySleeper: THREE.MeshStandardMaterial;
  railwaySteel: THREE.MeshStandardMaterial;
  mabatiSilver: THREE.MeshStandardMaterial;
  mabatiRust: THREE.MeshStandardMaterial;
  mabatiBlue: THREE.MeshStandardMaterial;
  plasterOchre: THREE.MeshStandardMaterial;
  plasterCream: THREE.MeshStandardMaterial;
  plasterTerracotta: THREE.MeshStandardMaterial;
  plasterMint: THREE.MeshStandardMaterial;
  plasterConcrete: THREE.MeshStandardMaterial;
  darkSteel: THREE.MeshStandardMaterial;
  shutterGrey: THREE.MeshStandardMaterial;
  windowGlass: THREE.MeshStandardMaterial;
  warmInteriorEmissive: THREE.MeshStandardMaterial;
  timberPole: THREE.MeshStandardMaterial;
  timberMarket: THREE.MeshStandardMaterial;
  treeBark: THREE.MeshStandardMaterial;
  foliageGreen: THREE.MeshStandardMaterial;
  foliageDark: THREE.MeshStandardMaterial;
  tarpBlue: THREE.MeshStandardMaterial;
  tarpOrange: THREE.MeshStandardMaterial;
  waterTankBlack: THREE.MeshStandardMaterial;
  kioskYellow: THREE.MeshStandardMaterial;
  crateRed: THREE.MeshStandardMaterial;
  crateBlue: THREE.MeshStandardMaterial;
  crateYellow: THREE.MeshStandardMaterial;
  tireRubber: THREE.MeshStandardMaterial;
  chromeTrim: THREE.MeshStandardMaterial;
  matatuWhite: THREE.MeshStandardMaterial;
  matatuBlueBand: THREE.MeshStandardMaterial;
  headlightGlow: THREE.MeshBasicMaterial;
  taillightGlow: THREE.MeshBasicMaterial;
  dispose: () => void;
}

export function createEnvironmentMaterials(
  textures: ProceduralTextureSet,
): EnvironmentMaterialSet {
  const lateriteSoil = new THREE.MeshStandardMaterial({
    map: textures.lateriteSoil,
    roughness: 0.96,
    metalness: 0.0,
  });

  const hillGrass = new THREE.MeshStandardMaterial({
    color: 0x4d6b2a,
    roughness: 0.94,
    metalness: 0.0,
  });

  const jinjaHighway = new THREE.MeshStandardMaterial({
    map: textures.jinjaHighwayTarmac,
    roughness: 0.86,
    metalness: 0.04,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  });

  const paverWalkway = new THREE.MeshStandardMaterial({
    map: textures.paverTiles,
    roughness: 0.88,
    metalness: 0.0,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  });

  const concreteCurb = new THREE.MeshStandardMaterial({
    color: 0x9ca3af,
    roughness: 0.91,
    metalness: 0.02,
  });

  const drainBed = new THREE.MeshStandardMaterial({
    color: 0x57534e,
    roughness: 0.95,
    metalness: 0.0,
  });

  const drainWater = new THREE.MeshStandardMaterial({
    color: 0x2c3329,
    roughness: 0.24,
    metalness: 0.14,
  });

  const ballastStone = new THREE.MeshStandardMaterial({
    color: 0x6b7280,
    roughness: 0.96,
    metalness: 0.02,
  });

  const railwaySleeper = new THREE.MeshStandardMaterial({
    color: 0x3b2a1e,
    roughness: 0.92,
    metalness: 0.02,
  });

  const railwaySteel = new THREE.MeshStandardMaterial({
    color: 0x64748b,
    roughness: 0.36,
    metalness: 0.86,
  });

  const mabatiSilver = new THREE.MeshStandardMaterial({
    map: textures.mabatiRoof,
    roughness: 0.48,
    metalness: 0.55,
  });

  const mabatiRust = new THREE.MeshStandardMaterial({
    map: textures.mabatiRoof,
    color: 0xa66346,
    roughness: 0.62,
    metalness: 0.35,
  });

  const mabatiBlue = new THREE.MeshStandardMaterial({
    map: textures.mabatiRoof,
    color: 0x3b6998,
    roughness: 0.52,
    metalness: 0.45,
  });

  const plasterOchre = new THREE.MeshStandardMaterial({
    color: 0xd9a066,
    roughness: 0.88,
    metalness: 0.0,
  });

  const plasterCream = new THREE.MeshStandardMaterial({
    color: 0xe7d7be,
    roughness: 0.87,
    metalness: 0.0,
  });

  const plasterTerracotta = new THREE.MeshStandardMaterial({
    color: 0xc2785c,
    roughness: 0.89,
    metalness: 0.0,
  });

  const plasterMint = new THREE.MeshStandardMaterial({
    color: 0xb7cfc2,
    roughness: 0.87,
    metalness: 0.0,
  });

  const plasterConcrete = new THREE.MeshStandardMaterial({
    color: 0xcbd5e1,
    roughness: 0.89,
    metalness: 0.02,
  });

  const darkSteel = new THREE.MeshStandardMaterial({
    color: 0x27272a,
    roughness: 0.48,
    metalness: 0.72,
  });

  const shutterGrey = new THREE.MeshStandardMaterial({
    color: 0x475569,
    roughness: 0.5,
    metalness: 0.52,
  });

  const windowGlass = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.14,
    metalness: 0.25,
  });

  const warmInteriorEmissive = new THREE.MeshStandardMaterial({
    color: 0xfef3c7,
    emissive: 0xffb347,
    emissiveIntensity: 0.45,
    roughness: 0.35,
  });

  const timberPole = new THREE.MeshStandardMaterial({
    color: 0x4f3828,
    roughness: 0.92,
    metalness: 0.0,
  });

  const timberMarket = new THREE.MeshStandardMaterial({
    map: textures.woodCounter,
    roughness: 0.86,
    metalness: 0.02,
  });

  const treeBark = new THREE.MeshStandardMaterial({
    color: 0x5c4033,
    roughness: 0.94,
    metalness: 0.0,
  });

  const foliageGreen = new THREE.MeshStandardMaterial({
    color: 0x3f6212,
    roughness: 0.88,
    metalness: 0.0,
  });

  const foliageDark = new THREE.MeshStandardMaterial({
    color: 0x2e4c14,
    roughness: 0.9,
    metalness: 0.0,
  });

  const tarpBlue = new THREE.MeshStandardMaterial({
    color: 0x1d4ed8,
    roughness: 0.76,
    metalness: 0.04,
  });

  const tarpOrange = new THREE.MeshStandardMaterial({
    color: 0xd97706,
    roughness: 0.78,
    metalness: 0.04,
  });

  const waterTankBlack = new THREE.MeshStandardMaterial({
    color: 0x18181b,
    roughness: 0.42,
    metalness: 0.08,
  });

  const kioskYellow = new THREE.MeshStandardMaterial({
    color: 0xfacc15,
    roughness: 0.42,
    metalness: 0.25,
  });

  const crateRed = new THREE.MeshStandardMaterial({
    color: 0xb91c1c,
    roughness: 0.52,
    metalness: 0.05,
  });

  const crateBlue = new THREE.MeshStandardMaterial({
    color: 0x1d4ed8,
    roughness: 0.52,
    metalness: 0.05,
  });

  const crateYellow = new THREE.MeshStandardMaterial({
    color: 0xeab308,
    roughness: 0.5,
    metalness: 0.05,
  });

  const tireRubber = new THREE.MeshStandardMaterial({
    color: 0x18181b,
    roughness: 0.85,
    metalness: 0.04,
  });

  const chromeTrim = new THREE.MeshStandardMaterial({
    color: 0x9ca3af,
    roughness: 0.28,
    metalness: 0.85,
  });

  const matatuWhite = new THREE.MeshStandardMaterial({
    color: 0xf1f5f9,
    roughness: 0.36,
    metalness: 0.16,
  });

  const matatuBlueBand = new THREE.MeshStandardMaterial({
    color: 0x1d4ed8,
    roughness: 0.4,
    metalness: 0.15,
  });

  const headlightGlow = new THREE.MeshBasicMaterial({
    color: 0xfef9c3,
  });

  const taillightGlow = new THREE.MeshBasicMaterial({
    color: 0xef4444,
  });

  const allMats: THREE.Material[] = [
    lateriteSoil,
    hillGrass,
    jinjaHighway,
    paverWalkway,
    concreteCurb,
    drainBed,
    drainWater,
    ballastStone,
    railwaySleeper,
    railwaySteel,
    mabatiSilver,
    mabatiRust,
    mabatiBlue,
    plasterOchre,
    plasterCream,
    plasterTerracotta,
    plasterMint,
    plasterConcrete,
    darkSteel,
    shutterGrey,
    windowGlass,
    warmInteriorEmissive,
    timberPole,
    timberMarket,
    treeBark,
    foliageGreen,
    foliageDark,
    tarpBlue,
    tarpOrange,
    waterTankBlack,
    kioskYellow,
    crateRed,
    crateBlue,
    crateYellow,
    tireRubber,
    chromeTrim,
    matatuWhite,
    matatuBlueBand,
    headlightGlow,
    taillightGlow,
  ];

  return {
    lateriteSoil,
    hillGrass,
    jinjaHighway,
    paverWalkway,
    concreteCurb,
    drainBed,
    drainWater,
    ballastStone,
    railwaySleeper,
    railwaySteel,
    mabatiSilver,
    mabatiRust,
    mabatiBlue,
    plasterOchre,
    plasterCream,
    plasterTerracotta,
    plasterMint,
    plasterConcrete,
    darkSteel,
    shutterGrey,
    windowGlass,
    warmInteriorEmissive,
    timberPole,
    timberMarket,
    treeBark,
    foliageGreen,
    foliageDark,
    tarpBlue,
    tarpOrange,
    waterTankBlack,
    kioskYellow,
    crateRed,
    crateBlue,
    crateYellow,
    tireRubber,
    chromeTrim,
    matatuWhite,
    matatuBlueBand,
    headlightGlow,
    taillightGlow,
    dispose: () => {
      allMats.forEach((m) => m.dispose());
    },
  };
}
