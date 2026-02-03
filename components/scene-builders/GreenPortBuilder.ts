
import * as THREE from 'three';
import { Animatables, SceneType } from '../three-types';

export const isGreenPortScene = (type: SceneType): boolean => {
  return type === 'green-port-cockpit';
};

export const setupGreenPortCamera = (camera: THREE.PerspectiveCamera) => {
  camera.position.set(15, 12, 15);
  camera.lookAt(0, 0, 0);
};

export const initGreenPortScene = (
  type: SceneType, 
  group: THREE.Group, 
  animatables: Animatables, 
  disposables: { dispose: () => void }[]
) => {
  if (type !== 'green-port-cockpit') return;

  // 1. Base Environment (Port & Water)
  const groundGeo = new THREE.PlaneGeometry(60, 60);
  groundGeo.rotateX(-Math.PI / 2);
  const groundMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 });
  disposables.push(groundGeo, groundMat);
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.position.y = -0.5;
  group.add(ground);

  const waterGeo = new THREE.PlaneGeometry(30, 60);
  waterGeo.rotateX(-Math.PI / 2);
  const waterMat = new THREE.MeshStandardMaterial({ 
      color: 0x06b6d4, 
      transparent: true, 
      opacity: 0.4, 
      roughness: 0.1,
      metalness: 0.8
  });
  disposables.push(waterGeo, waterMat);
  const water = new THREE.Mesh(waterGeo, waterMat);
  water.position.set(-15, -0.4, 0);
  group.add(water);

  // 2. Wind Turbines (Renewable Source)
  animatables.windTurbines = [];
  const turbineGeo = new THREE.CylinderGeometry(0.2, 0.5, 8);
  turbineGeo.translate(0, 4, 0);
  const bladeGeo = new THREE.BoxGeometry(0.3, 5, 0.1);
  bladeGeo.translate(0, 2.5, 0);
  const turbineMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
  disposables.push(turbineGeo, bladeGeo, turbineMat);

  for(let i=0; i<3; i++) {
      const tGroup = new THREE.Group();
      tGroup.position.set(-10, 0, -10 + i * 8);
      
      const tower = new THREE.Mesh(turbineGeo, turbineMat);
      tGroup.add(tower);

      const rotor = new THREE.Group();
      rotor.position.y = 8;
      for(let k=0; k<3; k++) {
          const blade = new THREE.Mesh(bladeGeo, turbineMat);
          blade.rotation.z = k * (Math.PI * 2 / 3);
          rotor.add(blade);
      }
      tGroup.add(rotor);
      group.add(tGroup);
      
      animatables.windTurbines.push({ group: rotor, speed: 0.05 + Math.random() * 0.05 });
  }

  // 3. Warehouses with Solar Panels
  const warehouseGeo = new THREE.BoxGeometry(6, 3, 10);
  const warehouseMat = new THREE.MeshStandardMaterial({ color: 0x334155 });
  const solarMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, metalness: 0.5, roughness: 0.2 });
  disposables.push(warehouseGeo, warehouseMat, solarMat);

  for(let i=0; i<2; i++) {
      const wh = new THREE.Mesh(warehouseGeo, warehouseMat);
      wh.position.set(10, 1.5, -5 + i * 12);
      group.add(wh);

      // Solar Grid
      const panelGeo = new THREE.PlaneGeometry(5, 9);
      panelGeo.rotateX(-Math.PI / 2);
      disposables.push(panelGeo);
      const panel = new THREE.Mesh(panelGeo, solarMat);
      panel.position.y = 1.55;
      wh.add(panel);
  }

  // 4. Shore Power Stations (Poles near water)
  const poleGeo = new THREE.CylinderGeometry(0.2, 0.2, 3);
  const poleMat = new THREE.MeshStandardMaterial({ color: 0x10b981, emissive: 0x064e3b });
  disposables.push(poleGeo, poleMat);
  
  [-5, 5].forEach(z => {
      const pole = new THREE.Mesh(poleGeo, poleMat);
      pole.position.set(0, 1.5, z);
      group.add(pole);
      
      // Cable connection visualization (bezier curve)
      const curve = new THREE.QuadraticBezierCurve3(
          new THREE.Vector3(0, 3, z),
          new THREE.Vector3(-4, 1, z),
          new THREE.Vector3(-8, 2, z) // Ship position
      );
      const points = curve.getPoints(20);
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({ color: 0x34d399 });
      disposables.push(geometry, material);
      const line = new THREE.Line(geometry, material);
      group.add(line);
  });

  // 5. Electric Ships
  const shipGeo = new THREE.BoxGeometry(4, 2, 12);
  const shipMat = new THREE.MeshStandardMaterial({ color: 0x475569 });
  disposables.push(shipGeo, shipMat);
  const ship = new THREE.Mesh(shipGeo, shipMat);
  ship.position.set(-8, 1, 0);
  group.add(ship);

  // 6. Energy Flow Particles (The "Green Energy" visual)
  const pCount = 300;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(pCount * 3);
  const pSpeeds = new Float32Array(pCount);
  
  for(let i=0; i<pCount; i++) {
      // Randomly spawn near turbines or solar
      if (Math.random() > 0.5) {
          // Turbines
          pPos[i*3] = -10 + (Math.random()-0.5)*2;
          pPos[i*3+1] = 8;
          pPos[i*3+2] = -10 + Math.random() * 16;
      } else {
          // Solar
          pPos[i*3] = 10 + (Math.random()-0.5)*4;
          pPos[i*3+1] = 3;
          pPos[i*3+2] = -5 + Math.random() * 12;
      }
      pSpeeds[i] = 0.05 + Math.random() * 0.1;
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  pGeo.setAttribute('speed', new THREE.BufferAttribute(pSpeeds, 1));
  
  const pMat = new THREE.PointsMaterial({ color: 0x4ade80, size: 0.2, transparent: true, opacity: 0.8 });
  disposables.push(pGeo, pMat);
  const particles = new THREE.Points(pGeo, pMat);
  group.add(particles);
  animatables.energyParticles = particles;

  // 7. Electric Trucks (AGVs)
  animatables.electricTrucks = [];
  const truckGeo = new THREE.BoxGeometry(1.5, 0.8, 3);
  const truckMat = new THREE.MeshStandardMaterial({ color: 0x22c55e });
  disposables.push(truckGeo, truckMat);
  
  const path = new THREE.CatmullRomCurve3([
      new THREE.Vector3(5, 0.4, -10),
      new THREE.Vector3(5, 0.4, 10),
      new THREE.Vector3(15, 0.4, 10),
      new THREE.Vector3(15, 0.4, -10)
  ], true);

  for(let i=0; i<4; i++) {
      const truck = new THREE.Mesh(truckGeo, truckMat);
      group.add(truck);
      animatables.electricTrucks.push({
          mesh: truck as any,
          path: path,
          t: i * 0.25,
          speed: 0.001
      });
  }
};

export const animateGreenPortScene = (type: SceneType, animatables: Animatables, time: number) => {
  if (type !== 'green-port-cockpit') return;

  // Animate Turbines
  if (animatables.windTurbines) {
      animatables.windTurbines.forEach(t => {
          t.group.rotation.z -= t.speed;
      });
  }

  // Animate Energy Particles (Flow towards center/grid)
  if (animatables.energyParticles) {
      const positions = animatables.energyParticles.geometry.attributes.position.array as Float32Array;
      for(let i=0; i<positions.length/3; i++) {
          // Target is roughly (0, 0, 0) - the grid substation (imaginary)
          const tx = 0, ty = 0, tz = 0;
          const x = positions[i*3];
          const y = positions[i*3+1];
          const z = positions[i*3+2];
          
          positions[i*3] += (tx - x) * 0.02;
          positions[i*3+1] += (ty - y) * 0.02;
          positions[i*3+2] += (tz - z) * 0.02;

          // Reset if close
          if (Math.abs(x) < 1 && Math.abs(z) < 1) {
              if (Math.random() > 0.5) {
                  positions[i*3] = -10 + (Math.random()-0.5)*2;
                  positions[i*3+1] = 8;
                  positions[i*3+2] = -10 + Math.random() * 16;
              } else {
                  positions[i*3] = 10 + (Math.random()-0.5)*4;
                  positions[i*3+1] = 3;
                  positions[i*3+2] = -5 + Math.random() * 12;
              }
          }
      }
      animatables.energyParticles.geometry.attributes.position.needsUpdate = true;
  }

  // Animate Trucks
  if (animatables.electricTrucks) {
      animatables.electricTrucks.forEach(truck => {
          truck.t = (truck.t + truck.speed) % 1;
          const pos = truck.path.getPoint(truck.t);
          const tangent = truck.path.getTangent(truck.t);
          truck.mesh.position.copy(pos);
          truck.mesh.lookAt(pos.clone().add(tangent));
      });
  }
};
