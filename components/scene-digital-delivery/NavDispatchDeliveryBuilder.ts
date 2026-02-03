
import * as THREE from 'three';
import { Animatables, SceneType } from '../three-types';

export const isNavDispatchDeliveryScene = (type: SceneType): boolean => {
  return type === 'dd-nav-dispatch';
};

export const setupNavDispatchDeliveryCamera = (camera: THREE.PerspectiveCamera) => {
  camera.position.set(0, 30, 30);
  camera.lookAt(0, 0, 0);
};

export const initNavDispatchDeliveryScene = (
  type: SceneType, 
  group: THREE.Group, 
  animatables: Animatables, 
  disposables: { dispose: () => void }[]
) => {
  if (type !== 'dd-nav-dispatch') return;

  // 1. Water Channel (Curved Mesh)
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-30, 0, 0),
    new THREE.Vector3(-10, 0, 5),
    new THREE.Vector3(10, 0, -5),
    new THREE.Vector3(30, 0, 0)
  ]);
  
  const waterGeo = new THREE.TubeGeometry(curve, 64, 5, 2, false);
  // Flatten tube to make surface
  waterGeo.scale(1, 0.1, 1);
  const waterMat = new THREE.MeshStandardMaterial({ 
    color: 0x0f172a, 
    transparent: true, 
    opacity: 0.8,
    roughness: 0.2
  });
  const gridMat = new THREE.MeshBasicMaterial({
      color: 0x00ff9d,
      wireframe: true,
      transparent: true,
      opacity: 0.1
  });
  
  disposables.push(waterGeo, waterMat, gridMat);
  const water = new THREE.Mesh(waterGeo, waterMat);
  const grid = new THREE.Mesh(waterGeo, gridMat);
  grid.position.y = 0.05;
  
  group.add(water);
  group.add(grid);
  animatables.nddWater = water;

  // 2. Radar/VTS Towers (On banks)
  animatables.nddTowers = [];
  animatables.nddWaves = [];
  
  const towerGeo = new THREE.CylinderGeometry(0.2, 0.5, 6, 4);
  const dishGeo = new THREE.BoxGeometry(1.5, 0.2, 0.5);
  const towerMat = new THREE.MeshStandardMaterial({ color: 0x64748b });
  const dishMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b });
  disposables.push(towerGeo, dishGeo, towerMat, dishMat);
  
  const towerPositions = [
      {x: -15, z: -8}, {x: 0, z: 8}, {x: 15, z: -8}
  ];

  towerPositions.forEach(pos => {
      const tGroup = new THREE.Group();
      tGroup.position.set(pos.x, 3, pos.z);
      
      const mast = new THREE.Mesh(towerGeo, towerMat);
      tGroup.add(mast);
      
      const dish = new THREE.Mesh(dishGeo, dishMat);
      dish.position.y = 3.2;
      tGroup.add(dish);
      
      group.add(tGroup);
      animatables.nddTowers?.push(tGroup);

      // Signal Wave (Ring)
      const waveGeo = new THREE.RingGeometry(0.5, 0.8, 32);
      waveGeo.rotateX(-Math.PI / 2);
      const waveMat = new THREE.MeshBasicMaterial({ 
          color: 0x00ff9d, 
          transparent: true, 
          opacity: 0.5, 
          side: THREE.DoubleSide 
      });
      disposables.push(waveGeo, waveMat);
      const wave = new THREE.Mesh(waveGeo, waveMat);
      wave.position.set(pos.x, 0.5, pos.z);
      group.add(wave);
      animatables.nddWaves?.push(wave);
  });

  // 3. Vessels (Digital representation)
  animatables.nddVessels = [];
  const shipGeo = new THREE.ConeGeometry(0.8, 3, 4);
  shipGeo.rotateX(Math.PI / 2);
  const shipMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0x22d3ee, emissiveIntensity: 0.2 });
  disposables.push(shipGeo, shipMat);

  for(let i=0; i<4; i++) {
      const shipGroup = new THREE.Group();
      const mesh = new THREE.Mesh(shipGeo, shipMat);
      shipGroup.add(mesh);
      
      // Data Tag
      const tagGeo = new THREE.PlaneGeometry(2, 1);
      const tagMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.6 });
      const tag = new THREE.Mesh(tagGeo, tagMat);
      tag.position.set(0, 2, 0);
      shipGroup.add(tag);
      
      group.add(shipGroup);
      
      animatables.nddVessels.push({
          mesh: shipGroup,
          speed: 0.002 + Math.random() * 0.002,
          t: Math.random(),
          offset: (Math.random() - 0.5) * 2 // Lane offset
      });
      
      // Store path for animation
      (shipGroup as any).userData = { curve };
  }

  // 4. Verification Scanner (Grid Plane)
  const scanGeo = new THREE.PlaneGeometry(60, 40);
  scanGeo.rotateX(-Math.PI / 2);
  const scanMat = new THREE.MeshBasicMaterial({ 
      color: 0x22d3ee, 
      transparent: true, 
      opacity: 0.05, 
      side: THREE.DoubleSide
  });
  disposables.push(scanGeo, scanMat);
  const scanner = new THREE.Mesh(scanGeo, scanMat);
  scanner.position.y = 5;
  group.add(scanner);
  animatables.nddScanner = scanner;

  // 5. Connection Lines (Dynamic)
  // We create a pool of lines to use in animation
  animatables.nddLinks = [];
  const lineMat = new THREE.LineBasicMaterial({ color: 0x00ff9d, transparent: true, opacity: 0.4 });
  disposables.push(lineMat);
  
  for(let i=0; i<6; i++) { // Max connections
      const geo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,0,0), new THREE.Vector3(0,0,0)]);
      const line = new THREE.Line(geo, lineMat);
      line.frustumCulled = false;
      group.add(line);
      animatables.nddLinks.push(line);
  }
};

export const animateNavDispatchDeliveryScene = (type: SceneType, animatables: Animatables, time: number) => {
  if (type !== 'dd-nav-dispatch') return;

  // 1. Radar Rotation & Pulse
  if (animatables.nddTowers) {
      animatables.nddTowers.forEach(t => {
          t.children[1].rotation.y = -time * 2; // Spin dish
      });
  }
  if (animatables.nddWaves) {
      animatables.nddWaves.forEach((w, i) => {
          const s = (time * 2 + i) % 10;
          w.scale.setScalar(s);
          (w.material as THREE.Material).opacity = 1 - (s / 10);
      });
  }

  // 2. Vessel Movement along Curve
  if (animatables.nddVessels) {
      animatables.nddVessels.forEach(v => {
          v.t += v.speed;
          if (v.t > 1) v.t = 0;
          
          const curve = (v.mesh as any).userData.curve as THREE.CatmullRomCurve3;
          const pos = curve.getPoint(v.t);
          const tangent = curve.getTangent(v.t);
          
          // Apply offset perpendicular to tangent? Simplified: just add to Z relative to path
          // Actually path varies in Z, so offset should be robust.
          // Cross product of tangent and up (0,1,0) gives side vector
          const side = new THREE.Vector3().crossVectors(tangent, new THREE.Vector3(0,1,0)).normalize();
          
          v.mesh.position.copy(pos).add(side.multiplyScalar(v.offset));
          v.mesh.lookAt(v.mesh.position.clone().add(tangent));
      });
  }

  // 3. Dynamic Links (Tower <-> Ship)
  if (animatables.nddLinks && animatables.nddTowers && animatables.nddVessels) {
      let linkIdx = 0;
      const towers = animatables.nddTowers;
      const ships = animatables.nddVessels;
      
      // Reset all lines
      animatables.nddLinks.forEach(l => l.visible = false);

      towers.forEach(tower => {
          // Find closest ship
          let closestDist = 20;
          let closestShip = null;
          
          ships.forEach(ship => {
              const dist = tower.position.distanceTo(ship.mesh.position);
              if (dist < closestDist) {
                  closestDist = dist;
                  closestShip = ship;
              }
          });

          if (closestShip && linkIdx < animatables.nddLinks!.length) {
              const line = animatables.nddLinks![linkIdx];
              const positions = line.geometry.attributes.position.array as Float32Array;
              
              // Tower top
              positions[0] = tower.position.x;
              positions[1] = tower.position.y + 3;
              positions[2] = tower.position.z;
              
              // Ship
              positions[3] = closestShip.mesh.position.x;
              positions[4] = closestShip.mesh.position.y + 1;
              positions[5] = closestShip.mesh.position.z;
              
              line.geometry.attributes.position.needsUpdate = true;
              line.visible = true;
              linkIdx++;
          }
      });
  }

  // 4. Scanner Sweep
  if (animatables.nddScanner) {
      animatables.nddScanner.position.y = Math.sin(time * 0.5) * 5 + 5;
  }
};
