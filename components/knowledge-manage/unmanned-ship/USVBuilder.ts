
import * as THREE from 'three';
import { USVAnimatables, TrainingPhase } from './three-types';

export const initUSVScene = (
  group: THREE.Group, 
  animatables: USVAnimatables,
  disposables: { dispose: () => void }[]
) => {
  // --- 材质库 ---
  const hullMat = new THREE.MeshStandardMaterial({ 
    color: 0x0f172a, roughness: 0.4, metalness: 0.8 
  }); // Stealth Black
  const deckMat = new THREE.MeshStandardMaterial({ 
    color: 0x334155, roughness: 0.7 
  });
  const sensorMat = new THREE.MeshBasicMaterial({ color: 0x00ffff });
  const obstacleMat = new THREE.MeshStandardMaterial({ 
    color: 0xff0055, roughness: 0.5, metalness: 0.1, emissive: 0x550011 
  });
  const pathMatValid = new THREE.LineBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.6 });
  const pathMatInvalid = new THREE.LineBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.3 });
  const waterMat = new THREE.MeshBasicMaterial({ color: 0x0ea5e9, wireframe: true, transparent: true, opacity: 0.15 });

  disposables.push(hullMat, deckMat, sensorMat, obstacleMat, pathMatValid, pathMatInvalid, waterMat);

  // 1. Digital Water Surface
  const waterGrid = new THREE.GridHelper(100, 50, 0x0ea5e9, 0x0f172a);
  group.add(waterGrid);
  animatables.waterGrid = waterGrid;
  
  // Floating particles near water
  const pGeo = new THREE.BufferGeometry();
  const pCount = 200;
  const pPos = new Float32Array(pCount * 3);
  for(let i=0; i<pCount; i++) {
      pPos[i*3] = (Math.random()-0.5) * 100;
      pPos[i*3+1] = Math.random() * 2;
      pPos[i*3+2] = (Math.random()-0.5) * 100;
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const pMat = new THREE.PointsMaterial({color: 0x0ea5e9, size: 0.2, transparent: true, opacity: 0.4});
  disposables.push(pGeo, pMat);
  const particles = new THREE.Points(pGeo, pMat);
  group.add(particles);

  // 2. USV Model (Trimaran Style)
  const shipGroup = new THREE.Group();
  group.add(shipGroup);
  animatables.shipGroup = shipGroup;

  // Main Hull
  const mainHullGeo = new THREE.ConeGeometry(0.8, 6, 4);
  mainHullGeo.rotateX(Math.PI/2);
  const mainHull = new THREE.Mesh(mainHullGeo, hullMat);
  shipGroup.add(mainHull);

  // Outriggers
  const sideHullGeo = new THREE.ConeGeometry(0.4, 4, 4);
  sideHullGeo.rotateX(Math.PI/2);
  const sideL = new THREE.Mesh(sideHullGeo, hullMat); sideL.position.set(-1.5, 0, -0.5);
  const sideR = new THREE.Mesh(sideHullGeo, hullMat); sideR.position.set(1.5, 0, -0.5);
  shipGroup.add(sideL, sideR);

  // Crossbeams
  const beamGeo = new THREE.BoxGeometry(3.5, 0.2, 0.5);
  const beamF = new THREE.Mesh(beamGeo, deckMat); beamF.position.set(0, 0.2, 0);
  const beamB = new THREE.Mesh(beamGeo, deckMat); beamB.position.set(0, 0.2, -1.5);
  shipGroup.add(beamF, beamB);

  // Sensor Tower
  const towerGeo = new THREE.CylinderGeometry(0.1, 0.2, 1);
  const tower = new THREE.Mesh(towerGeo, deckMat);
  tower.position.set(0, 0.8, -0.5);
  tower.rotation.x = -Math.PI/12;
  shipGroup.add(tower);

  // LiDAR Unit
  const lidarGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.3, 16);
  const lidar = new THREE.Mesh(lidarGeo, sensorMat);
  lidar.position.set(0, 1.4, -0.6);
  shipGroup.add(lidar);

  // 3. Obstacles (Training Dummies)
  const obsGroup = new THREE.Group();
  group.add(obsGroup);
  animatables.obstacles = obsGroup;

  const obsGeo = new THREE.OctahedronGeometry(1, 0);
  for(let i=0; i<5; i++) {
      const obs = new THREE.Mesh(obsGeo, obstacleMat);
      obs.position.set(
          (Math.random() - 0.5) * 30,
          0.5,
          (Math.random() - 0.5) * 30 + 10 // Ahead
      );
      obs.scale.y = 1.5 + Math.random();
      obs.rotation.y = Math.random();
      obsGroup.add(obs);
  }

  // 4. Algorithm Path Visualization (Projected Trajectories)
  const pathsGroup = new THREE.Group();
  shipGroup.add(pathsGroup); // Move with ship
  animatables.pathLines = pathsGroup;

  // Generate a fan of potential paths
  for(let i=-2; i<=2; i++) {
      const curve = new THREE.QuadraticBezierCurve3(
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(i * 3, 0, 8),
          new THREE.Vector3(i * 8, 0, 20)
      );
      const pts = curve.getPoints(20);
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      disposables.push(geo);
      // Center paths are green, outer/blocked are red
      const mat = Math.abs(i) <= 1 ? pathMatValid : pathMatInvalid;
      const line = new THREE.Line(geo, mat);
      pathsGroup.add(line);
  }

  // 5. LiDAR Scan Points
  const scanGeo = new THREE.BufferGeometry();
  const scanPos = new Float32Array(360 * 3); // 360 degrees
  scanGeo.setAttribute('position', new THREE.BufferAttribute(scanPos, 3));
  const scanPoints = new THREE.Points(scanGeo, new THREE.PointsMaterial({ color: 0x00ffff, size: 0.1 }));
  shipGroup.add(scanPoints);
  animatables.lidarPoints = scanPoints;

  // 6. Target Marker
  const targetGeo = new THREE.RingGeometry(1, 1.2, 32);
  targetGeo.rotateX(-Math.PI/2);
  disposables.push(targetGeo);
  const targetMark = new THREE.Mesh(targetGeo, new THREE.MeshBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.8 }));
  targetMark.position.set(0, 0.1, 40);
  group.add(targetMark);
  animatables.targetMarker = targetMark;
};

export const animateUSVScene = (
  animatables: USVAnimatables, 
  phase: TrainingPhase,
  time: number
) => {
  const speed = phase === 'MODEL_TRAINING' ? 0.4 : 0.1;

  // 1. Ship Movement (Simulate avoiding obstacles)
  if (animatables.shipGroup) {
      // Bobbing
      animatables.shipGroup.position.y = Math.sin(time * 2) * 0.1;
      animatables.shipGroup.rotation.z = Math.sin(time * 1.5) * 0.05; // Roll
      animatables.shipGroup.rotation.x = Math.sin(time * 1.2) * 0.02; // Pitch

      // Forward motion simulation (move obstacles and grid backward instead of ship forward for infinite loop)
      if (animatables.obstacles) {
          animatables.obstacles.children.forEach(obs => {
              obs.position.z -= speed;
              if (obs.position.z < -20) {
                  obs.position.z = 40 + Math.random() * 20;
                  obs.position.x = (Math.random() - 0.5) * 40;
              }
              // Pulse obstacles
              obs.rotation.y += 0.01;
          });
      }
      
      if (animatables.waterGrid) {
          animatables.waterGrid.position.z -= speed;
          if (animatables.waterGrid.position.z < -20) animatables.waterGrid.position.z = 0;
      }
  }

  // 2. LiDAR Scanning Effect
  if (animatables.lidarPoints) {
      const pos = animatables.lidarPoints.geometry.attributes.position.array as Float32Array;
      const count = pos.length / 3;
      // Spinning scan
      const offset = time * 10;
      for(let i=0; i<count; i++) {
          const angle = (i / count) * Math.PI * 2 + offset;
          const r = 15 + Math.sin(angle * 5 + time) * 2; // Noise
          pos[i*3] = Math.cos(angle) * r;
          pos[i*3+1] = 0; // Local Y
          pos[i*3+2] = Math.sin(angle) * r;
      }
      animatables.lidarPoints.geometry.attributes.position.needsUpdate = true;
  }

  // 3. Path Planning Update
  if (animatables.pathLines) {
      // Wiggle paths to show recalculation
      animatables.pathLines.rotation.y = Math.sin(time * 0.5) * 0.1;
      animatables.pathLines.children.forEach((line, i) => {
          (line as THREE.Line).material.opacity = 0.3 + Math.sin(time * 5 + i) * 0.2;
      });
  }

  // 4. Target Marker Pulse
  if (animatables.targetMarker) {
      const s = 1 + Math.sin(time * 3) * 0.2;
      animatables.targetMarker.scale.set(s, 1, s);
      animatables.targetMarker.rotation.y += 0.01;
  }
};
