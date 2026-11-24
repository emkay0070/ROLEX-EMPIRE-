import * as THREE from 'three';

export interface ProceduralTextureSet {
  lateriteSoil: THREE.CanvasTexture;
  kampalaTarmac: THREE.CanvasTexture;
  jinjaHighwayTarmac: THREE.CanvasTexture;
  paverTiles: THREE.CanvasTexture;
  mabatiRoof: THREE.CanvasTexture;
  woodCounter: THREE.CanvasTexture;
  castIronTava: THREE.CanvasTexture;
  menuBoard: THREE.CanvasTexture;
  kitengePattern: THREE.CanvasTexture;
  chapatiSurface: THREE.CanvasTexture;
  omeletteSurface: THREE.CanvasTexture;
  contactShadow: THREE.CanvasTexture;
  ugandaSignBanner: THREE.CanvasTexture;
  signHardware: THREE.CanvasTexture;
  signWholesaleDuka: THREE.CanvasTexture;
  signElectronicsSalon: THREE.CanvasTexture;
  signMobileMoney: THREE.CanvasTexture;
  signKirekaMarket: THREE.CanvasTexture;
  smokeSprite: THREE.CanvasTexture;
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

function makeSignTexture(
  maxAnisotropy: number,
  bgHex: string,
  stripeHex: string,
  accentHex: string,
  title: string,
  subtitle: string,
  titleColor = '#ffffff',
): THREE.CanvasTexture {
  const [c, ctx] = makeCanvas(512, 160);
  ctx.fillStyle = bgHex;
  ctx.fillRect(0, 0, 512, 160);

  ctx.fillStyle = stripeHex;
  ctx.fillRect(0, 0, 512, 20);
  ctx.fillStyle = accentHex;
  ctx.fillRect(0, 138, 512, 22);

  ctx.strokeStyle = 'rgba(255,255,255,0.22)';
  ctx.lineWidth = 4;
  ctx.strokeRect(8, 24, 496, 110);

  ctx.fillStyle = titleColor;
  ctx.font = '800 34px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(title, 256, 78);

  ctx.fillStyle = accentHex;
  ctx.font = '700 18px sans-serif';
  ctx.fillText(subtitle, 256, 114);

  return finalizeTexture(c, maxAnisotropy, 1, 1);
}

export function createProceduralTextures(maxAnisotropy: number): ProceduralTextureSet {
  // 1. Kampala red-brown laterite soil (murram)
  const [soilC, soilCtx] = makeCanvas(512, 512);
  soilCtx.fillStyle = '#8b4a2b';
  soilCtx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 6500; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const r = 1 + Math.random() * 4;
    soilCtx.fillStyle =
      Math.random() > 0.5 ? 'rgba(116, 57, 30, 0.35)' : 'rgba(168, 96, 58, 0.25)';
    soilCtx.beginPath();
    soilCtx.arc(x, y, r, 0, Math.PI * 2);
    soilCtx.fill();
  }
  const lateriteSoil = finalizeTexture(soilC, maxAnisotropy, 10, 10);

  // 2. Kampala weathered tarmac road (single strip fallback)
  const [roadC, roadCtx] = makeCanvas(512, 512);
  roadCtx.fillStyle = '#383a3d';
  roadCtx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 7000; i++) {
    const v = 42 + Math.floor(Math.random() * 34);
    roadCtx.fillStyle = `rgb(${v},${v},${v + 2})`;
    roadCtx.fillRect(Math.random() * 512, Math.random() * 512, 2, 2);
  }
  roadCtx.fillStyle = 'rgba(145, 86, 52, 0.24)';
  roadCtx.fillRect(0, 0, 512, 28);
  roadCtx.fillRect(0, 484, 512, 28);
  roadCtx.fillStyle = 'rgba(235, 200, 95, 0.72)';
  roadCtx.fillRect(40, 248, 170, 16);
  roadCtx.fillRect(295, 248, 170, 16);
  const kampalaTarmac = finalizeTexture(roadC, maxAnisotropy, 4, 1);

  // 2b. Kampala-Jinja Highway weathered 2-lane tarmac with tire wear, patches & faded markings
  const [hwC, hwCtx] = makeCanvas(1024, 512);
  hwCtx.fillStyle = '#313438';
  hwCtx.fillRect(0, 0, 1024, 512);

  // Darker worn wheel tracks in both carriageways
  hwCtx.fillStyle = 'rgba(22, 24, 27, 0.38)';
  hwCtx.fillRect(0, 82, 1024, 48);
  hwCtx.fillRect(0, 158, 1024, 48);
  hwCtx.fillRect(0, 306, 1024, 48);
  hwCtx.fillRect(0, 382, 1024, 48);

  // Aggregate speckle
  for (let i = 0; i < 12000; i++) {
    const v = 36 + Math.floor(Math.random() * 38);
    hwCtx.fillStyle = `rgb(${v},${v},${v + 2})`;
    hwCtx.fillRect(Math.random() * 1024, Math.random() * 512, 2, 2);
  }

  // Realistic bitumen patch repairs
  const patches = [
    [120, 96, 84, 40],
    [470, 340, 110, 48],
    [760, 140, 92, 36],
    [290, 405, 68, 32],
  ];
  for (const [px, py, pw, ph] of patches) {
    hwCtx.fillStyle = 'rgba(20, 22, 25, 0.55)';
    hwCtx.fillRect(px, py, pw, ph);
  }

  // Red murram shoulder dust blown onto road margins
  const edgeTop = hwCtx.createLinearGradient(0, 0, 0, 52);
  edgeTop.addColorStop(0, 'rgba(139, 74, 43, 0.72)');
  edgeTop.addColorStop(1, 'rgba(139, 74, 43, 0)');
  hwCtx.fillStyle = edgeTop;
  hwCtx.fillRect(0, 0, 1024, 52);

  const edgeBot = hwCtx.createLinearGradient(0, 460, 0, 512);
  edgeBot.addColorStop(0, 'rgba(139, 74, 43, 0)');
  edgeBot.addColorStop(1, 'rgba(139, 74, 43, 0.72)');
  hwCtx.fillStyle = edgeBot;
  hwCtx.fillRect(0, 460, 1024, 52);

  // Faded edge white lines + dashed center yellow line
  hwCtx.fillStyle = 'rgba(235, 238, 240, 0.58)';
  hwCtx.fillRect(0, 36, 1024, 8);
  hwCtx.fillRect(0, 468, 1024, 8);

  hwCtx.fillStyle = 'rgba(240, 198, 72, 0.85)';
  for (let sx = 24; sx < 1024; sx += 160) {
    hwCtx.fillRect(sx, 250, 92, 12);
  }
  const jinjaHighwayTarmac = finalizeTexture(hwC, maxAnisotropy, 6, 1);

  // 2c. Interlocking concrete sidewalk pavers
  const [pavC, pavCtx] = makeCanvas(256, 256);
  pavCtx.fillStyle = '#8b8680';
  pavCtx.fillRect(0, 0, 256, 256);
  const tones = ['#948e87', '#867f78', '#9f968d', '#7c7670'];
  const rowH = 32;
  const colW = 64;
  for (let row = 0; row < 8; row++) {
    const offset = row % 2 === 0 ? 0 : colW / 2;
    for (let col = -1; col < 5; col++) {
      const x = col * colW + offset;
      const y = row * rowH;
      pavCtx.fillStyle = tones[(row * 3 + col + 4) % tones.length];
      pavCtx.fillRect(x + 2, y + 2, colW - 4, rowH - 4);
    }
  }
  for (let i = 0; i < 1000; i++) {
    pavCtx.fillStyle = 'rgba(139, 74, 43, 0.14)';
    pavCtx.fillRect(Math.random() * 256, Math.random() * 256, 3, 2);
  }
  const paverTiles = finalizeTexture(pavC, maxAnisotropy, 5, 2);

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
  for (let i = 0; i < 55; i++) {
    mabatiCtx.fillStyle = 'rgba(136, 67, 32, 0.24)';
    mabatiCtx.fillRect(
      Math.random() * 512,
      Math.random() * 512,
      6 + Math.random() * 24,
      30 + Math.random() * 80,
    );
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
  menuCtx.fillText('KIREKA ROLEX', 256, 114);

  menuCtx.fillStyle = '#f6efe2';
  menuCtx.font = '600 22px sans-serif';
  menuCtx.fillText('FRESH CHAPATI & EGGS · JINJA RD', 256, 148);

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

  // 7. Stall Banner Signboard
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
  banCtx.font = '800 80px sans-serif';
  banCtx.textAlign = 'center';
  banCtx.fillText('ROLEX EMPIRE · KIREKA', 512, 146);
  banCtx.fillStyle = '#fef3c7';
  banCtx.font = '600 30px sans-serif';
  banCtx.fillText('JINJA ROAD · FRESH CHAPATI & ROLLED EGGS DAILY', 512, 198);
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

  // 12. Kireka Commercial Shopfront Signboards
  const signHardware = makeSignTexture(
    maxAnisotropy,
    '#1e3a8a',
    '#172554',
    '#facc15',
    'KIREKA HARDWARE',
    'CEMENT · IRON SHEETS · PAINTS · TOOLS',
  );
  const signWholesaleDuka = makeSignTexture(
    maxAnisotropy,
    '#14532d',
    '#052e16',
    '#fde047',
    'MUKWANO SUPER DUKA',
    'WHOLESALE · COLD SODAS · SUGAR & FLOUR',
  );
  const signElectronicsSalon = makeSignTexture(
    maxAnisotropy,
    '#7f1d1d',
    '#450a0a',
    '#fef08a',
    'KAMPALA TECH & SALON',
    'PHONE REPAIR · BARBERSHOP · ACCESSORIES',
  );
  const signMobileMoney = makeSignTexture(
    maxAnisotropy,
    '#facc15',
    '#111827',
    '#b91c1c',
    'MOBILE MONEY',
    'DEPOSIT · WITHDRAW · AIRTIME AGENT',
    '#111827',
  );
  const signKirekaMarket = makeSignTexture(
    maxAnisotropy,
    '#111827',
    '#15803d',
    '#fcdc04',
    'KIREKA MAIN MARKET',
    'MATOOKE · TOMATOES · FRESH PRODUCE',
  );

  // 13. Soft radial steam/smoke sprite texture
  const [smC, smCtx] = makeCanvas(128, 128);
  const smGrad = smCtx.createRadialGradient(64, 64, 6, 64, 64, 60);
  smGrad.addColorStop(0, 'rgba(255, 250, 240, 0.9)');
  smGrad.addColorStop(0.5, 'rgba(255, 248, 235, 0.4)');
  smGrad.addColorStop(1, 'rgba(255, 248, 235, 0)');
  smCtx.fillStyle = smGrad;
  smCtx.fillRect(0, 0, 128, 128);
  const smokeSprite = finalizeTexture(smC, maxAnisotropy, 1, 1);
  smokeSprite.wrapS = THREE.ClampToEdgeWrapping;
  smokeSprite.wrapT = THREE.ClampToEdgeWrapping;

  return {
    lateriteSoil,
    kampalaTarmac,
    jinjaHighwayTarmac,
    paverTiles,
    mabatiRoof,
    woodCounter,
    castIronTava,
    menuBoard,
    kitengePattern,
    chapatiSurface,
    omeletteSurface,
    contactShadow,
    ugandaSignBanner,
    signHardware,
    signWholesaleDuka,
    signElectronicsSalon,
    signMobileMoney,
    signKirekaMarket,
    smokeSprite,
  };
}
