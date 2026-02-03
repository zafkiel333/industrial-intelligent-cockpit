
import * as THREE from 'three';
import { Animatables, SceneType } from '../three-types';

export const isPortBimDeliveryScene = (type: SceneType): boolean => {
  return type === 'dd-port-bim';
};

export const setupPortBimDeliveryCamera = (camera: THREE.PerspectiveCamera) => {
  camera.position.set(15, 12, 18);
  camera.lookAt(0, -2, 0);
};

export const initPortBimDeliveryScene = (
  type: SceneType, 
  group: THREE.Group, 
  animatables: Animatables, 
  disposables: { dispose: () => void }[]
) => {
  if (type !== 'dd-port-bim') return;

  // 1. High-Pile Wharf Structure
  const deckGeo = new THREE.BoxGeometry(20, 1.5, 10);
  const concreteMat = new THREE.MeshStandardMaterial({ 
    color: 0x64748b, 
    roughness: 0.8,
    metalness: 0.1
  });
  const wireMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.3
  });
  disposables.push(deckGeo, concreteMat, wireMat);

  const deckGroup = new THREE.Group();
  const deckSolid = new THREE.Mesh(deckGeo, concreteMat);
  const deckWire = new THREE.Mesh(deckGeo, wireMat);
  deckGroup.add(deckSolid);
  deckGroup.add(deckWire);
  deckGroup.position.y = 2;
  group.add(deckGroup);
  animatables.pbdDeck = deckSolid;

  // Piles (Array)
  animatables.pbdPiles = [];
  const pileGeo = new THREE.CylinderGeometry(0.4, 0.4, 10, 16);
  disposables.push(pileGeo);

  const pilePositions: THREE.Vector3[] = [];
  for(let x = -9; x <= 9; x += 3) {
      for(let z = -4; z <= 4; z += 4) {
          pilePositions.push(new THREE.Vector3(x, -3, z)); // Center of pile
      }
  }

  pilePositions.forEach(pos => {
      const pileGroup = new THREE.Group();
      pileGroup.position.copy(pos);
      
      const pSolid = new THREE.Mesh(pileGeo, concreteMat);
      const pWire = new THREE.Mesh(pileGeo, wireMat);
      
      pileGroup.add(pSolid);
      pileGroup.add(pWire);
      group.add(pileGroup);
      
      // Store reference to group (and optionally original pos in userdata for animation)
      pileGroup.userData = { originalY: pos.y };
      animatables.pbdPiles?.push(pileGroup);
  });

  // 2. Seabed / Channel Profile (Grid)
  const seaGeo = new THREE.PlaneGeometry(30, 30, 32, 32);
  const pos = seaGeo.attributes.position;
  for(let i=0; i<pos.count; i++) {
      const x = pos.getX(i);
      // Slope under wharf (x < -5), Channel deep (x > -5)
      let z = 0;
      if (x < -5) {
          z = -2 + (x + 5) * 0.5; // Slope up
      } else {
          z = -8; // Deep channel
      }
      z += Math.random() * 0.2; // Noise
      pos.setZ(i, z);
  }
  seaGeo.computeVertexNormals();
  seaGeo.rotateX(-Math.PI / 2);
  
  const seaMat = new THREE.MeshBasicMaterial({ 
      color: 0x0ea5e9, 
      wireframe: true,
      transparent: true,
      opacity: 0.15
  });
  disposables.push(seaGeo, seaMat);
  const seabed = new THREE.Mesh(seaGeo, seaMat);
  seabed.position.y = -2;
  group.add(seabed);
  animatables.pbdSeabed = seabed;

  // 3. Scanner (Verification Plane)
  const scanGeo = new THREE.PlaneGeometry(25, 20);
  scanGeo.rotateY(Math.PI / 2);
  const scanMat = new THREE.MeshBasicMaterial({
      color: 0x22c55e,
      transparent: true,
      opacity: 0.1,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
  });
  disposables.push(scanGeo, scanMat);
  const scanner = new THREE.Mesh(scanGeo, scanMat);
  group.add(scanner);
  animatables.pbdScanner = scanner;

  // Scan line
  const lineGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, -10, 0), new THREE.Vector3(0, 10, 0)
  ]);
  const lineMat = new THREE.LineBasicMaterial({ color: 0x4ade80, linewidth: 2 });
  disposables.push(lineGeo, lineMat);
  const sLine = new THREE.Line(lineGeo, lineMat);
  scanner.add(sLine);

  // 4. Data Tags (Floating)
  animatables.pbdTags = [];
  const tagGeo = new THREE.OctahedronGeometry(0.3);
  const tagMat = new THREE.MeshBasicMaterial({ color: 0xfacc15, wireframe: true });
  disposables.push(tagGeo, tagMat);

  const tagPos = [
      {x: -5, y: 3.5, z: 0}, 
      {x: 5, y: 3.5, z: 2}, 
      {x: 0, y: -2, z: 4} // Pile tag
  ];

  tagPos.forEach(p => {
      const tag = new THREE.Mesh(tagGeo, tagMat);
      tag.position.set(p.x, p.y, p.z);
      group.add(tag);
      animatables.pbdTags?.push(tag as unknown as THREE.Group);
  });
};

export const animatePortBimDeliveryScene = (type: SceneType, animatables: Animatables, time: number) => {
  if (type !== 'dd-port-bim') return;

  // 1. Explode Animation (Breathing)
  const explodeFactor = (Math.sin(time * 0.5) + 1) * 0.5; // 0 to 1
  
  if (animatables.pbdDeck) {
      animatables.pbdDeck.parent!.position.y = 2 + explodeFactor * 3; // Lift deck
  }
  
  if (animatables.pbdPiles) {
      animatables.pbdPiles.forEach(pile => {
          // Piles stay roughly put but maybe scale or slight move
          // Let's move them slightly down to emphasize separation
          // pile.position.y = pile.userData.originalY - explodeFactor * 0.5;
      });
  }

  // 2. Scanner Sweep
  if (animatables.pbdScanner) {
      animatables.pbdScanner.position.x = Math.sin(time * 0.3) * 12;
  }

  // 3. Tags Rotate
  if (animatables.pbdTags) {
      animatables.pbdTags.forEach((tag, i) => {
          tag.rotation.y = time + i;
          tag.rotation.x = time * 0.5;
      });
  }
};
