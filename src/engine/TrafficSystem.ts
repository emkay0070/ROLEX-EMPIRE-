import * as THREE from 'three';
import { EnvironmentMaterialSet } from './EnvironmentMaterials';

interface VehicleAgent {
  group: THREE.Group;
  wheels: THREE.Object3D[];
  laneZ: number;
  dirX: 1 | -1;
  speed: number;
  baseY: number;
  phase: number;
  kind: 'boda' | 'matatu' | 'saloon';
}

interface PedAgent {
  group: THREE.Group;
  leftLeg: THREE.Mesh;
  rightLeg: THREE.Mesh;
  leftArm: THREE.Mesh;
  rightArm: THREE.Mesh;
  minX: number;
  maxX: number;
  laneZ: number;
  dirX: 1 | -1;
  speed: number;
  phase: number;
}

export class TrafficSystem {
  public readonly root = new THREE.Group();
  private readonly vehicles: VehicleAgent[] = [];
  private readonly pedestrians: PedAgent[] = [];
  private readonly ownedGeos: THREE.BufferGeometry[] = [];
  private readonly ownedMats: THREE.Material[] = [];

  constructor(private readonly mats: EnvironmentMaterialSet) {
    this.root.name = 'kireka_traffic_system';
    this.spawnVehicles();
    this.spawnBackgroundPedestrians();
  }

  private trackGeo<T extends THREE.BufferGeometry>(g: T): T {
    this.ownedGeos.push(g);
    return g;
  }

  private trackMat<T extends THREE.Material>(m: T): T {
    this.ownedMats.push(m);
    return m;
  }

  private buildMovingBoda(tankColor: number, vestColor: number): {
    group: THREE.Group;
    wheels: THREE.Object3D[];
  } {
    const g = new THREE.Group();
    const wheels: THREE.Object3D[] = [];
    const bodyMat = this.trackMat(
      new THREE.MeshStandardMaterial({ color: tankColor, roughness: 0.35, metalness: 0.3 }),
    );
    const vestMat = this.trackMat(new THREE.MeshStandardMaterial({ color: vestColor, roughness: 0.45 }));
    const skinMat = this.trackMat(new THREE.MeshStandardMaterial({ color: 0x4a2c1d, roughness: 0.65 }));

    const tireGeo = this.trackGeo(new THREE.TorusGeometry(0.25, 0.07, 8, 14));
    const hubGeo = this.trackGeo(new THREE.CylinderGeometry(0.12, 0.12, 0.07, 10));

    for (const wx of [-0.52, 0.52]) {
      const wheelPivot = new THREE.Group();
      wheelPivot.position.set(wx, 0.32, 0);
      const tire = new THREE.Mesh(tireGeo, this.mats.tireRubber);
      tire.castShadow = true;
      wheelPivot.add(tire);
      const hub = new THREE.Mesh(hubGeo, this.mats.chromeTrim);
      hub.rotation.x = Math.PI / 2;
      wheelPivot.add(hub);
      g.add(wheelPivot);
      wheels.push(wheelPivot);
    }

    const chassis = new THREE.Mesh(this.trackGeo(new THREE.BoxGeometry(0.9, 0.22, 0.22)), bodyMat);
    chassis.position.set(0, 0.57, 0);
    chassis.castShadow = true;
    g.add(chassis);

    const fork = new THREE.Mesh(
      this.trackGeo(new THREE.CylinderGeometry(0.03, 0.03, 0.62, 8)),
      this.mats.chromeTrim,
    );
    fork.position.set(0.44, 0.58, 0);
    fork.rotation.z = 0.28;
    g.add(fork);

    const headlamp = new THREE.Mesh(
      this.trackGeo(new THREE.SphereGeometry(0.06, 8, 8)),
      this.mats.headlightGlow,
    );
    headlamp.position.set(0.55, 0.76, 0);
    g.add(headlamp);

    // Boda rider
    const torso = new THREE.Mesh(
      this.trackGeo(new THREE.CylinderGeometry(0.17, 0.15, 0.52, 10)),
      vestMat,
    );
    torso.position.set(-0.08, 1.05, 0);
    torso.rotation.z = -0.18;
    torso.castShadow = true;
    g.add(torso);

    const helmet = new THREE.Mesh(
      this.trackGeo(new THREE.SphereGeometry(0.145, 10, 8)),
      this.mats.crateRed,
    );
    helmet.position.set(0.02, 1.42, 0);
    g.add(helmet);

    const riderLeg = new THREE.Mesh(
      this.trackGeo(new THREE.BoxGeometry(0.16, 0.45, 0.34)),
      this.mats.darkSteel,
    );
    riderLeg.position.set(-0.05, 0.66, 0);
    g.add(riderLeg);

    const arms = new THREE.Mesh(
      this.trackGeo(new THREE.BoxGeometry(0.38, 0.09, 0.38)),
      skinMat,
    );
    arms.position.set(0.15, 1.06, 0);
    arms.rotation.z = -0.22;
    g.add(arms);

    return { group: g, wheels };
  }

  private buildMovingMatatu(): { group: THREE.Group; wheels: THREE.Object3D[] } {
    const g = new THREE.Group();
    const wheels: THREE.Object3D[] = [];

    const lower = new THREE.Mesh(
      this.trackGeo(new THREE.BoxGeometry(4.2, 0.84, 1.68)),
      this.mats.matatuWhite,
    );
    lower.position.y = 0.7;
    lower.castShadow = true;
    g.add(lower);

    const band = new THREE.Mesh(
      this.trackGeo(new THREE.BoxGeometry(4.24, 0.22, 1.72)),
      this.mats.matatuBlueBand,
    );
    band.position.y = 0.9;
    g.add(band);

    const cabin = new THREE.Mesh(
      this.trackGeo(new THREE.BoxGeometry(3.96, 0.68, 1.62)),
      this.mats.matatuWhite,
    );
    cabin.position.set(-0.08, 1.44, 0);
    cabin.castShadow = true;
    g.add(cabin);

    const windows = new THREE.Mesh(
      this.trackGeo(new THREE.BoxGeometry(3.4, 0.42, 1.65)),
      this.mats.windowGlass,
    );
    windows.position.set(-0.1, 1.42, 0);
    g.add(windows);

    const wheelGeo = this.trackGeo(new THREE.CylinderGeometry(0.31, 0.31, 0.2, 12));
    for (const wx of [-1.25, 1.28]) {
      for (const wz of [-0.78, 0.78]) {
        const w = new THREE.Mesh(wheelGeo, this.mats.tireRubber);
        w.rotation.x = Math.PI / 2;
        w.position.set(wx, 0.31, wz);
        g.add(w);
        wheels.push(w);
      }
    }

    for (const lz of [-0.56, 0.56]) {
      const hl = new THREE.Mesh(
        this.trackGeo(new THREE.BoxGeometry(0.06, 0.14, 0.2)),
        this.mats.headlightGlow,
      );
      hl.position.set(2.11, 0.62, lz);
      g.add(hl);
      const tl = new THREE.Mesh(
        this.trackGeo(new THREE.BoxGeometry(0.06, 0.16, 0.16)),
        this.mats.taillightGlow,
      );
      tl.position.set(-2.11, 0.7, lz);
      g.add(tl);
    }

    return { group: g, wheels };
  }

  private buildMovingSaloon(bodyColor: number): {
    group: THREE.Group;
    wheels: THREE.Object3D[];
  } {
    const g = new THREE.Group();
    const wheels: THREE.Object3D[] = [];
    const paint = this.trackMat(
      new THREE.MeshStandardMaterial({ color: bodyColor, roughness: 0.32, metalness: 0.35 }),
    );

    const chassis = new THREE.Mesh(
      this.trackGeo(new THREE.BoxGeometry(3.6, 0.58, 1.54)),
      paint,
    );
    chassis.position.y = 0.54;
    chassis.castShadow = true;
    g.add(chassis);

    const cabin = new THREE.Mesh(
      this.trackGeo(new THREE.BoxGeometry(1.9, 0.48, 1.38)),
      paint,
    );
    cabin.position.set(-0.15, 1.04, 0);
    g.add(cabin);

    const glass = new THREE.Mesh(
      this.trackGeo(new THREE.BoxGeometry(1.72, 0.36, 1.42)),
      this.mats.windowGlass,
    );
    glass.position.set(-0.15, 1.03, 0);
    g.add(glass);

    const wheelGeo = this.trackGeo(new THREE.CylinderGeometry(0.28, 0.28, 0.18, 12));
    for (const wx of [-1.08, 1.08]) {
      for (const wz of [-0.74, 0.74]) {
        const w = new THREE.Mesh(wheelGeo, this.mats.tireRubber);
        w.rotation.x = Math.PI / 2;
        w.position.set(wx, 0.28, wz);
        g.add(w);
        wheels.push(w);
      }
    }

    for (const lz of [-0.52, 0.52]) {
      const hl = new THREE.Mesh(
        this.trackGeo(new THREE.BoxGeometry(0.06, 0.12, 0.18)),
        this.mats.headlightGlow,
      );
      hl.position.set(1.81, 0.56, lz);
      g.add(hl);
    }

    return { group: g, wheels };
  }

  private spawnVehicles(): void {
    // Westbound lane (Z = 4.45, dirX = -1, towards Kampala city)
    const specs: Array<{
      kind: 'boda' | 'matatu' | 'saloon';
      x: number;
      z: number;
      dirX: 1 | -1;
      speed: number;
      c1: number;
      c2: number;
    }> = [
      { kind: 'boda', x: -16, z: 4.35, dirX: -1, speed: 6.4, c1: 0xdc2626, c2: 0xa3e635 },
      { kind: 'boda', x: 14, z: 4.55, dirX: -1, speed: 7.2, c1: 0x1d4ed8, c2: 0xfacc15 },
      { kind: 'saloon', x: 34, z: 4.7, dirX: -1, speed: 5.4, c1: 0x94a3b8, c2: 0 },
      { kind: 'boda', x: 42, z: 4.35, dirX: -1, speed: 6.8, c1: 0x16a34a, c2: 0xf97316 },
      // Eastbound lane (Z = 7.45, dirX = +1, towards Jinja)
      { kind: 'matatu', x: -24, z: 7.45, dirX: 1, speed: 4.9, c1: 0, c2: 0 },
      { kind: 'boda', x: -8, z: 7.75, dirX: 1, speed: 7.5, c1: 0xb91c1c, c2: 0xa3e635 },
      { kind: 'saloon', x: 12, z: 7.45, dirX: 1, speed: 5.8, c1: 0x1e293b, c2: 0 },
      { kind: 'matatu', x: 32, z: 7.45, dirX: 1, speed: 4.6, c1: 0, c2: 0 },
    ];

    for (const s of specs) {
      const built =
        s.kind === 'boda'
          ? this.buildMovingBoda(s.c1, s.c2)
          : s.kind === 'matatu'
            ? this.buildMovingMatatu()
            : this.buildMovingSaloon(s.c1);

      built.group.position.set(s.x, 0.02, s.z);
      built.group.rotation.y = s.dirX === 1 ? 0 : Math.PI;
      this.root.add(built.group);

      this.vehicles.push({
        group: built.group,
        wheels: built.wheels,
        laneZ: s.z,
        dirX: s.dirX,
        speed: s.speed,
        baseY: 0.02,
        phase: Math.random() * Math.PI * 2,
        kind: s.kind,
      });
    }
  }

  private spawnBackgroundPedestrians(): void {
    const shirtColors = [0xd97706, 0x1d4ed8, 0x15803d, 0xb91c1c, 0x7c3aed, 0xf59e0b, 0x0f766e];
    const legGeo = this.trackGeo(new THREE.CylinderGeometry(0.075, 0.065, 0.72, 8));
    const torsoGeo = this.trackGeo(new THREE.CylinderGeometry(0.19, 0.16, 0.58, 10));
    const headGeo = this.trackGeo(new THREE.SphereGeometry(0.145, 10, 8));
    const armGeo = this.trackGeo(new THREE.CylinderGeometry(0.052, 0.045, 0.5, 8));
    const skinMat = this.trackMat(new THREE.MeshStandardMaterial({ color: 0x4a2c1d, roughness: 0.65 }));

    const pedRoutes: Array<{
      x: number;
      minX: number;
      maxX: number;
      z: number;
      dirX: 1 | -1;
      speed: number;
    }> = [
      // Shopfront veranda walkway behind stall (Z = -4.2..-5.2)
      { x: -16, minX: -22, maxX: 16, z: -4.8, dirX: 1, speed: 1.35 },
      { x: 10, minX: -18, maxX: 18, z: -5.1, dirX: -1, speed: 1.2 },
      { x: -3, minX: -16, maxX: 14, z: -4.5, dirX: 1, speed: 1.45 },
      // Far highway side pavement (Z = +9.6)
      { x: -14, minX: -24, maxX: 22, z: 9.6, dirX: 1, speed: 1.3 },
      { x: 11, minX: -22, maxX: 24, z: 9.9, dirX: -1, speed: 1.25 },
      // Kireka Market Lane shoppers (along X = -5.8, walking back & forth in Z? keep simple X/Z or veranda)
      { x: -5.6, minX: -6.4, maxX: -5.2, z: -9.8, dirX: 1, speed: 0.75 },
      { x: -6.1, minX: -6.8, maxX: -4.8, z: -16.8, dirX: -1, speed: 0.85 },
      { x: 4.5, minX: -10, maxX: 12, z: -17.2, dirX: 1, speed: 1.15 },
    ];

    pedRoutes.forEach((r, idx) => {
      const g = new THREE.Group();
      const shirtMat = this.trackMat(
        new THREE.MeshStandardMaterial({
          color: shirtColors[idx % shirtColors.length],
          roughness: 0.82,
        }),
      );

      const leftLeg = new THREE.Mesh(legGeo, this.mats.darkSteel);
      leftLeg.position.set(-0.09, 0.36, 0);
      g.add(leftLeg);

      const rightLeg = new THREE.Mesh(legGeo, this.mats.darkSteel);
      rightLeg.position.set(0.09, 0.36, 0);
      g.add(rightLeg);

      const torso = new THREE.Mesh(torsoGeo, shirtMat);
      torso.position.y = 1.0;
      torso.castShadow = true;
      g.add(torso);

      const head = new THREE.Mesh(headGeo, skinMat);
      head.position.y = 1.45;
      g.add(head);

      const leftArm = new THREE.Mesh(armGeo, skinMat);
      leftArm.position.set(-0.24, 1.0, 0);
      g.add(leftArm);

      const rightArm = new THREE.Mesh(armGeo, skinMat);
      rightArm.position.set(0.24, 1.0, 0);
      g.add(rightArm);

      g.position.set(r.x, 0, r.z);
      g.rotation.y = r.dirX === 1 ? -Math.PI / 2 : Math.PI / 2;
      this.root.add(g);

      this.pedestrians.push({
        group: g,
        leftLeg,
        rightLeg,
        leftArm,
        rightArm,
        minX: r.minX,
        maxX: r.maxX,
        laneZ: r.z,
        dirX: r.dirX,
        speed: r.speed,
        phase: idx * 1.1,
      });
    });
  }

  public update(dt: number, elapsed: number): void {
    const wrapHalfWidth = 52;
    for (const v of this.vehicles) {
      v.group.position.x += v.dirX * v.speed * dt;
      if (v.dirX === 1 && v.group.position.x > wrapHalfWidth) {
        v.group.position.x = -wrapHalfWidth;
      } else if (v.dirX === -1 && v.group.position.x < -wrapHalfWidth) {
        v.group.position.x = wrapHalfWidth;
      }

      if (v.kind === 'boda') {
        v.group.position.y = v.baseY + Math.abs(Math.sin(elapsed * 9 + v.phase)) * 0.015;
      }

      const wheelSpin = (v.speed * dt) / 0.28;
      for (const w of v.wheels) {
        w.rotation.z -= wheelSpin;
      }
    }

    for (const p of this.pedestrians) {
      p.group.position.x += p.dirX * p.speed * dt;
      if (p.dirX === 1 && p.group.position.x >= p.maxX) {
        p.dirX = -1;
        p.group.rotation.y = Math.PI / 2;
      } else if (p.dirX === -1 && p.group.position.x <= p.minX) {
        p.dirX = 1;
        p.group.rotation.y = -Math.PI / 2;
      }

      p.phase += dt * 7.5 * p.speed;
      const swing = Math.sin(p.phase) * 0.38;
      p.leftLeg.rotation.x = swing;
      p.rightLeg.rotation.x = -swing;
      p.leftArm.rotation.x = -swing * 0.65;
      p.rightArm.rotation.x = swing * 0.65;
    }
  }

  public dispose(): void {
    this.ownedGeos.forEach((g) => g.dispose());
    this.ownedMats.forEach((m) => m.dispose());
  }
}
