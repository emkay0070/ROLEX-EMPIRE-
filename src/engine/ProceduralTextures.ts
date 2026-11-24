import * as THREE from 'three';

export interface ProceduralTextureSet {
  lateriteSoil: THREE.CanvasTexture;
  kampalaTarmac: THREE.CanvasTexture;
  mabatiRoof: THREE.CanvasTexture;
  woodCounter: THREE.CanvasTexture;
  castIronTava: THREE.CanvasTexture;
  menuBoard: THREE.CanvasTexture;
  kitengePattern: THREE.CanvasTexture;
  chapatiSurface: THREE.CanvasTexture;
  omeletteSurface: THREE.CanvasTexture;
  contactShadow: THREE.CanvasTexture;
  ugandaSignBanner: THREE.CanvasTexture;
}

function makeCanvas(width: number, height: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  return [canvas, ctx];
}

function finalizeTexture(
  canvas: HTMLCanvasElement,
  maxAnisotropy: number,
  repeatX = 1,
  repeatY = 1,
  isColor = true,
): THREE.CanvasTexture {
  const tex = new THREE.CanvasTexture(canvas);
  if (isColor) {
    tex.colorSpace = THREE.SRGBColorSpace;
  }
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeatX, repeatY);
  tex.anisotropy = maxAnisotropy;
  tex.needsUpdate = true;
  return tex;
}

export function createProceduralTextures(maxAnisotropy: number): ProceduralTextureSet {
  // 1. Kampala red-brown laterite soil (murram)
  const [soilC, soilCtx] = makeCanvas(512, 512);
  soilCtx.fillStyle = '#8b4a2b';
  soilCtx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 6000; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const r = 1 + Math.random() * 4;
    soilCtx.fillStyle =
      Math.random() > 0.5 ? 'rgba(116, 57, 30, 0.35)' : 'rgba(168, 96, 58, 0.25)';
    soilCtx.beginPath();
    soilCtx.arc(x, y, r, 0, Math.PI * 2);
    soilCtx.fill();
  }
  const lateriteSoil = finalizeTexture(soilC, maxAnisotropy, 8, 8);

  // 2. Kampala weathered tarmac road
  const [roadC, roadCtx] = makeCanvas(512, 512);
  roadCtx.fillStyle = '#383a3d';
  roadCtx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 7000; i++) {
    const v = 42 + Math.floor(Math.random() * 34);
    roadCtx.fillStyle = `rgb(${v},${v},${v + 2})`;
    roadCtx.fillRect(Math.random() * 512, Math.random() * 512, 2, 2);
  }
  // Subtle dusty edge & dashed road line
  roadCtx.fillStyle = 'rgba(145, 86, 52, 0.24)';
  roadCtx.fillRect(0, 0, 512, 28);
  roadCtx.fillRect(0, 484, 512, 28);
  roadCtx.fillStyle = 'rgba(235, 200, 95, 0.72)';
  roadCtx.fillRect(40, 248, 170, 16);
  roadCtx.fillRect(295, 248, 170, 16);
  const kampalaTarmac = finalizeTexture(roadC, maxAnisotropy, 4, 1);

  // 3. Corrugated galvanized iron sheet (Mabati)
  const [mabatiC, mabatiCtx] = makeCanvas(512, 512);
  for (let x = 0; x < 512; x += 16) {
    const grad = mabatiCtx.createLinearGradient(x, 0, x + 16, 0);
    grad.addColorStop(0, '#6a737d');
    grad.addColorStop(0.5, '#adb6bf');
    grad.addColorStop(1, '#586069');
    mabatiCtx.fillStyle = grad;
    mabatiCtx.fillRect(x, 0, 16, 512);
  }
  // Subtle rust patina streaks
  for (let i = 0; i < 45; i++) {
    mabatiCtx.fillStyle = 'rgba(136, 67, 32, 0.22)';
    mabatiCtx.fillRect(Math.random() * 512, Math.random() * 512, 6 + Math.random() * 24, 30 + Math.random() * 80);
  }
  const mabatiRoof = finalizeTexture(mabatiC, maxAnisotropy, 2, 1);

  // 4. Timber counter wood grain
  const [woodC, woodCtx] = makeCanvas(512, 512);
  woodCtx.fillStyle = '#734b2a';
  woodCtx.fillRect(0, 0, 512, 512);
  for (let y = 0; y < 512; y += 6) {
    woodCtx.fillStyle = y % 12 === 0 ? 'rgba(54, 32, 16, 0.25)' : 'rgba(138, 92, 54, 0.18)';
    woodCtx.fillRect(0, y, 512, 4);
  }
  for (let y = 0; y < 512; y += 128) {
    woodCtx.fillStyle = 'rgba(32, 18, 8, 0.55)';
    woodCtx.fillRect(0, y, 512, 3);
  }
  const woodCounter = finalizeTexture(woodC, maxAnisotropy, 2, 2);

  // 5. Seasoned Cast-Iron Tava Pan with radial oil sheen
  const [tavaC, tavaCtx] = makeCanvas(512, 512);
  const tavaGrad = tavaCtx.createRadialGradient(256, 256, 20, 256, 256, 256);
  tavaGrad.addColorStop(0, '#1e2022');
  tavaGrad.addColorStop(0.65, '#2b2d30');
  tavaGrad.addColorStop(1, '#151618');
  tavaCtx.fillStyle = tavaGrad;
  tavaCtx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 2000; i++) {
    tavaCtx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.12)';
    tavaCtx.fillRect(Math.random() * 512, Math.random() * 512, 3, 2);
  }
  const castIronTava = finalizeTexture(tavaC, maxAnisotropy, 1, 1);

  // 6. Hand-painted Kampala Roadside Menu Signboard
  const [menuC, menuCtx] = makeCanvas(512, 512);
  menuCtx.fillStyle = '#181412';
  menuCtx.fillRect(0, 0, 512, 512);
  // Ugandan Flag Accent Stripes at top
  menuCtx.fillStyle = '#111111';
  menuCtx.fillRect(16, 16, 480, 14);
  menuCtx.fillStyle = '#fcdc04';
  menuCtx.fillRect(16, 30, 480, 14);
  menuCtx.fillStyle = '#d90000';
  menuCtx.fillRect(16, 44, 480, 14);

  menuCtx.strokeStyle = '#fcdc04';
  menuCtx.lineWidth = 6;
  menuCtx.strokeRect(14, 14, 484, 484);

  menuCtx.fillStyle = '#fcdc04';
  menuCtx.font = 'bold 46px sans-serif';
  menuCtx.textAlign = 'center';
  menuCtx.fillText('KAMPALA ROLEX', 256, 114);

  menuCtx.fillStyle = '#f6efe2';
  menuCtx.font = '600 22px sans-serif';
  menuCtx.fillText('FRESH CHAPATI & EGGS · HOT OFF THE TAVA', 256, 148);

  menuCtx.textAlign = 'left';
  const menuLines = [
    ['QUICK ROLEX (1 EGG)', '2,000 UGX'],
    ['CLASSIC KAMPALA', '3,000 UGX'],
    ['WANDEGEYA SPECIAL', '4,000 UGX'],
    ['SPICED BEEF ROLEX', '5,500 UGX'],
    ['KOLOLO AVOCADO', '6,000 UGX'],
    ['EMPIRE SUPREME', '8,500 UGX'],
  ];
  let rowY = 212;
  for (const [label, price] of menuLines) {
    menuCtx.fillStyle = '#f7f1e3';
    menuCtx.font = 'bold 23px sans-serif';
    menuCtx.fillText(label, 38, rowY);
    menuCtx.fillStyle = '#fcdc04';
    menuCtx.textAlign = 'right';
    menuCtx.fillText(price, 474, rowY);
    menuCtx.textAlign = 'left';
    menuCtx.fillStyle = 'rgba(255,255,255,0.14)';
    menuCtx.fillRect(38, rowY + 11, 436, 2);
    rowY += 46;
  }
  const menuBoard = finalizeTexture(menuC, maxAnisotropy, 1, 1);

  // 7. Stall Banner Signboard ("KAMPALA'S FINEST ROLEX")
  const [banC, banCtx] = makeCanvas(1024, 256);
  banCtx.fillStyle = '#b91c1c';
  banCtx.fillRect(0, 0, 1024, 256);
  banCtx.fillStyle = '#141414';
  banCtx.fillRect(0, 0, 1024, 34);
  banCtx.fillStyle = '#fcdc04';
  banCtx.fillRect(0, 34, 1024, 24);
  banCtx.fillStyle = '#fcdc04';
  banCtx.fillRect(0, 224, 1024, 32);
  banCtx.fillStyle = '#ffffff';
  banCtx.font = '800 84px sans-serif';
  banCtx.textAlign = 'center';
  banCtx.fillText('ROLEX EMPIRE · KAMPALA', 512, 146);
  banCtx.fillStyle = '#fef3c7';
  banCtx.font = '600 32px sans-serif';
  banCtx.fillText('ROLLED EGGS & CHAPATI · SERVED HOT DAILY', 512, 198);
  const ugandaSignBanner = finalizeTexture(banC, maxAnisotropy, 1, 1);

  // 8. East African Kitenge print fabric
  const [kitC, kitCtx] = makeCanvas(256, 256);
  kitCtx.fillStyle = '#991b1b';
  kitCtx.fillRect(0, 0, 256, 256);
  for (let gx = 0; gx < 256; gx += 64) {
    for (let gy = 0; gy < 256; gy += 64) {
      kitCtx.strokeStyle = '#f59e0b';
      kitCtx.lineWidth = 4;
      kitCtx.beginPath();
      kitCtx.arc(gx + 32, gy + 32, 22, 0, Math.PI * 2);
      kitCtx.stroke();
      kitCtx.fillStyle = '#111827';
      kitCtx.beginPath();
      kitCtx.arc(gx + 32, gy + 32, 9, 0, Math.PI * 2);
      kitCtx.fill();
      kitCtx.fillStyle = '#fef08a';
      kitCtx.fillRect(gx + 2, gy + 2, 10, 10);
    }
  }
  const kitengePattern = finalizeTexture(kitC, maxAnisotropy, 3, 1);

  // 9. Chapati golden blistered flatbread
  const [chapC, chapCtx] = makeCanvas(256, 256);
  const chapGrad = chapCtx.createRadialGradient(128, 128, 16, 128, 128, 128);
  chapGrad.addColorStop(0, '#e5b869');
  chapGrad.addColorStop(0.8, '#cf9440');
  chapGrad.addColorStop(1, '#b67829');
  chapCtx.fillStyle = chapGrad;
  chapCtx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 65; i++) {
    chapCtx.fillStyle = 'rgba(105, 54, 16, 0.42)';
    chapCtx.beginPath();
    chapCtx.ellipse(
      30 + Math.random() * 196,
      30 + Math.random() * 196,
      4 + Math.random() * 11,
      3 + Math.random() * 8,
      Math.random() * Math.PI,
      0,
      Math.PI * 2,
    );
    chapCtx.fill();
  }
  const chapatiSurface = finalizeTexture(chapC, maxAnisotropy, 1, 1);

  // 10. Omelette egg + veggies texture
  const [omeC, omeCtx] = makeCanvas(256, 256);
  omeCtx.fillStyle = '#f4be37';
  omeCtx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 55; i++) {
    omeCtx.fillStyle = i % 3 === 0 ? '#d93829' : i % 3 === 1 ? '#558b2f' : '#9c27b0';
    omeCtx.fillRect(24 + Math.random() * 208, 24 + Math.random() * 208, 7, 5);
  }
  const omeletteSurface = finalizeTexture(omeC, maxAnisotropy, 1, 1);

  // 11. Radial contact shadow
  const [shC, shCtx] = makeCanvas(256, 256);
  const shGrad = shCtx.createRadialGradient(128, 128, 14, 128, 128, 128);
  shGrad.addColorStop(0, 'rgba(0, 0, 0, 0.65)');
  shGrad.addColorStop(0.55, 'rgba(0, 0, 0, 0.25)');
  shGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  shCtx.fillStyle = shGrad;
  shCtx.fillRect(0, 0, 256, 256);
  const contactShadow = finalizeTexture(shC, maxAnisotropy, 1, 1);

  return {
    lateriteSoil,
    kampalaTarmac,
    mabatiRoof,
    woodCounter,
    castIronTava,
    menuBoard,
    kitengePattern,
    chapatiSurface,
    omeletteSurface,
    contactShadow,
    ugandaSignBanner,
  };
}
