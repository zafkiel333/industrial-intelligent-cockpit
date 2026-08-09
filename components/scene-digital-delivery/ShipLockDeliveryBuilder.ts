
import * as THREE from 'three';
import { Animatables, SceneType } from '../three-types';

export const isShipLockDeliveryScene = (type: SceneType): boolean => {
  return type === 'dd-ship-lock';
};

export const setupShipLockDeliveryCamera = (camera: THREE.PerspectiveCamera) => {
  camera.position.set(25, 25, 25);
  camera.lookAt(0, 0, 0);
};

export const initShipLockDeliveryScene = (
  type: SceneType, 
  group: THREE.Group, 
  animatables: Animatables, 
  disposables: { dispose: () => void }[]
) => {
  if (type !== 'dd-ship-lock') return;

  const chamberLength = 40;
  const chamberWidth = 10;
  const wallHeight = 8;
  const floorY = -4;

  // 1. Lock Chamber Structure
  const chamberGroup = new THREE.Group();
  group.add(chamberGroup);
  animatables.sldChamber = chamberGroup;

  const concreteMat = new THREE.MeshStandardMaterial({ 
    color: 0x64748b, 
    roughness: 0.7,
    metalness: 0.2
  });
  const wireMat = new THREE.MeshBasicMaterial({
      color: 0x22d3ee,
      wireframe: true,
      transparent: true,
      opacity: 0.1
  });
  disposables.push(concreteMat, wireMat);

  // Walls (Left/Right)
  const wallGeo = new THREE.BoxGeometry(2, wallHeight, chamberLength + 10);
  disposables.push(wallGeo);
  
  const wallL = new THREE.Mesh(wallGeo, concreteMat);
  wallL.position.set(-chamberWidth/2 - 1, floorY + wallHeight/2, 0);
  chamberGroup.add(wallL);

  const wallR = new THREE.Mesh(wallGeo, concreteMat);
  wallR.position.set(chamberWidth/2 + 1, floorY + wallHeight/2, 0);
  chamberGroup.add(wallR);
  
  // Floor
  const floorGeo = new THREE.BoxGeometry(chamberWidth + 4, 1, chamberLength + 10);
  disposables.push(floorGeo);
  const floor = new THREE.Mesh(floorGeo, concreteMat);
  floor.position.set(0, floorY - 0.5, 0);
  chamberGroup.add(floor);

  // Wireframe Overlay
  const wallLWire = new THREE.Mesh(wallGeo, wireMat);
  wallLWire.position.copy(wallL.position);
  wallLWire.scale.multiplyScalar(1.01);
  chamberGroup.add(wallLWire);
  
  const wallRWire = new THREE.Mesh(wallGeo, wireMat);
  wallRWire.position.copy(wallR.position);
  wallRWire.scale.multiplyScalar(1.01);
  chamberGroup.add(wallRWire);

  // 2. Miter Gates
  animatables.sldGates = [];
  const gateMat = new THREE.MeshStandardMaterial({ color: 0xf97316 });
  const gateGeo = new THREE.BoxGeometry(0.5, wallHeight - 1, chamberWidth / 2 + 1);
  disposables.push(gateMat, gateGeo);

  // Upper Head (Upstream) - Z minus
  const upperGateGroup = new THREE.Group();
  upperGateGroup.position.set(0, floorY + wallHeight/2 - 0.5, -chamberLength/2);
  chamberGroup.add(upperGateGroup);
  
  const ugL = new THREE.Mesh(gateGeo, gateMat);
  ugL.position.set(-chamberWidth/4, 0, 0);
  ugL.rotation.y = -Math.PI / 6; // Miter angle
  upperGateGroup.add(ugL);
  
  const ugR = new THREE.Mesh(gateGeo, gateMat);
  ugR.position.set(chamberWidth/4, 0, 0);
  ugR.rotation.y = Math.PI / 6;
  upperGateGroup.add(ugR);
  animatables.sldGates.push(upperGateGroup);

  // Lower Head (Downstream) - Z plus
  const lowerGateGroup = new THREE.Group();
  lowerGateGroup.position.set(0, floorY + wallHeight/2 - 0.5, chamberLength/2);
  chamberGroup.add(lowerGateGroup);
  
  const lgL = new THREE.Mesh(gateGeo, gateMat);
  lgL.position.set(-chamberWidth/4, 0, 0);
  lgL.rotation.y = -Math.PI / 6;
  lowerGateGroup.add(lgL);
  
  const lgR = new THREE.Mesh(gateGeo, gateMat);
  lgR.position.set(chamberWidth/4, 0, 0);
  lgR.rotation.y = Math.PI / 6;
  lowerGateGroup.add(lgR);
  animatables.sldGates.push(lowerGateGroup);

  // 3. Water Levels
  const waterGeo = new THREE.PlaneGeometry(chamberWidth, chamberLength);
  waterGeo.rotateX(-Math.PI / 2);
  const waterMat = new THREE.MeshBasicMaterial({ 
    color: 0x0ea5e9, 
    transparent: true, 
    opacity: 0.5,
    side: THREE.DoubleSide
  });
  disposables.push(waterGeo, waterMat);

  const waterChamber = new THREE.Mesh(waterGeo, waterMat);
  waterChamber.position.set(0, floorY + 2, 0); // Initial level
  group.add(waterChamber);
  animatables.sldWater = waterChamber;

  // Up/Downstream water
  const extWaterGeo = new THREE.PlaneGeometry(chamberWidth + 10, 20);
  extWaterGeo.rotateX(-Math.PI / 2);
  disposables.push(extWaterGeo);
  
  const upWater = new THREE.Mesh(extWaterGeo, waterMat);
  upWater.position.set(0, floorY + 6, -chamberLength/2 - 10);
  group.add(upWater);

  const downWater = new THREE.Mesh(extWaterGeo, waterMat);
  downWater.position.set(0, floorY + 1, chamberLength/2 + 10);
  group.add(downWater);

  // 4. Ship
  const shipGroup = new THREE.Group();
  const hullGeo = new THREE.BoxGeometry(4, 3, 12);
  const hullMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6 });
  disposables.push(hullGeo, hullMat);
  const hull = new THREE.Mesh(hullGeo, hullMat);
  hull.position.y = 1.5;
  shipGroup.add(hull);
  
  const deckGeo = new THREE.BoxGeometry(3, 1, 3);
  const deckMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
  disposables.push(deckGeo, deckMat);
  const deck = new THREE.Mesh(deckGeo, deckMat);
  deck.position.set(0, 3.5, 3);
  shipGroup.add(deck);

  shipGroup.position.set(0, floorY + 1, 0); // Floating at low level initially
  group.add(shipGroup);
  animatables.sldShip = shipGroup;

  // 5. Scanner
  const scanGeo = new THREE.PlaneGeometry(30, 20);
  // scanGeo.rotateY(Math.PI / 2);
  const scanMat = new THREE.MeshBasicMaterial({ 
    color: 0x00ff9d, 
    transparent: true, 
    opacity: 0.1, 
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending
  });
  disposables.push(scanGeo, scanMat);
  const scanner = new THREE.Mesh(scanGeo, scanMat);
  group.add(scanner);
  animatables.sldScanner = scanner;

  const scanLineGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-15, 0, 0), new THREE.Vector3(15, 0, 0)
  ]);
  const scanLineMat = new THREE.LineBasicMaterial({ color: 0x00ff9d, linewidth: 2 });
  disposables.push(scanLineGeo, scanLineMat);
  const scanLine = new THREE.Line(scanLineGeo, scanLineMat);
  scanner.add(scanLine);

  // 6. Valve Indicators (Culvert Valves)
  animatables.sldValves = [];
  const valveGeo = new THREE.CylinderGeometry(0.5, 0.5, 1, 16);
  valveGeo.rotateX(Math.PI / 2);
  const valveMat = new THREE.MeshBasicMaterial({ color: 0xffff00 });
  disposables.push(valveGeo, valveMat);

  // Place in walls
  const valvePositions = [
      {x: -chamberWidth/2 - 1, z: -chamberLength/3},
      {x: chamberWidth/2 + 1, z: -chamberLength/3},
      {x: -chamberWidth/2 - 1, z: chamberLength/3},
      {x: chamberWidth/2 + 1, z: chamberLength/3},
  ];
  
  valvePositions.forEach(p => {
      const vGroup = new THREE.Group();
      vGroup.position.set(p.x, floorY + 1, p.z);
      const mesh = new THREE.Mesh(valveGeo, valveMat);
      vGroup.add(mesh);
      group.add(vGroup);
      animatables.sldValves?.push(vGroup);
  });
};

export const animateShipLockDeliveryScene = (type: SceneType, animatables: Animatables, time: number) => {
  if (type !== 'dd-ship-lock') return;

  // 1. Water Level Cycle (Fill -> Empty)
  const cycle = (time * 0.5) % 10; // 10s cycle
  let waterLevel = 0;
  
  // -4 is floor. +6 is high. +1 is low.
  const lowLevel = -3;
  const highLevel = 2;
  
  if (cycle < 5) {
      // Filling
      const t = cycle / 5;
      waterLevel = lowLevel + t * (highLevel - lowLevel);
  } else {
      // Emptying
      const t = (cycle - 5) / 5;
      waterLevel = highLevel - t * (highLevel - lowLevel);
  }

  if (animatables.sldWater) {
      animatables.sldWater.position.y = waterLevel;
  }

  if (animatables.sldShip) {
      // Ship floats on water
      animatables.sldShip.position.y = waterLevel + 1; // +1 for draft offset
      // Gentle Bobbing
      animatables.sldShip.rotation.x = Math.sin(time) * 0.02;
      animatables.sldShip.rotation.z = Math.cos(time * 0.8) * 0.02;
  }

  // 2. Scanner Sweep (Lengthwise)
  if (animatables.sldScanner) {
      animatables.sldScanner.position.z = Math.sin(time * 0.3) * 20;
  }

  // 3. Valve Spin
  if (animatables.sldValves) {
      animatables.sldValves.forEach((v, i) => {
          v.rotation.x += 0.05 * (i % 2 === 0 ? 1 : -1);
      });
  }
};
