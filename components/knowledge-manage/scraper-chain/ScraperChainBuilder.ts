
import * as THREE from 'three';
import { ScraperAnimatables, ScraperSimState } from './three-types';

export const initScraperScene = (
  group: THREE.Group, 
  animatables: ScraperAnimatables,
  disposables: { dispose: () => void }[]
) => {
  // --- Materials ---
  const steelMat = new THREE.MeshStandardMaterial({ 
    color: 0x52525b, roughness: 0.6, metalness: 0.7 
  });
  const chainMat = new THREE.MeshStandardMaterial({ 
    color: 0x94a3b8, roughness: 0.8, metalness: 0.4 
  }); // Base chain color
  const tensionHighMat = new THREE.MeshBasicMaterial({ color: 0xff4400 }); // Visualization only
  const orangeMat = new THREE.MeshStandardMaterial({ 
    color: 0xf97316, roughness: 0.5, metalness: 0.5 
  });
  const chromeMat = new THREE.MeshStandardMaterial({ 
    color: 0xffffff, roughness: 0.2, metalness: 1.0 
  });
  const coalMat = new THREE.PointsMaterial({ 
    color: 0x111111, size: 0.15, transparent: true, opacity: 0.8 
  });

  disposables.push(steelMat, chainMat, tensionHighMat, orangeMat, chromeMat, coalMat);

  // 1. Frame / Chute (Static)
  const chuteGeo = new THREE.BoxGeometry(8, 1, 20);
  // Hollow out channel
  const chuteGroup = new THREE.Group();
  const floor = new THREE.Mesh(new THREE.BoxGeometry(8, 0.2, 20), steelMat);
  floor.position.y = -0.5;
  chuteGroup.add(floor);
  const wallL = new THREE.Mesh(new THREE.BoxGeometry(0.5, 2, 20), steelMat);
  wallL.position.set(-4, 0.5, 0);
  chuteGroup.add(wallL);
  const wallR = new THREE.Mesh(new THREE.BoxGeometry(0.5, 2, 20), steelMat);
  wallR.position.set(4, 0.5, 0);
  chuteGroup.add(wallR);
  
  group.add(chuteGroup);

  // 2. Tail Frame (Tensionable part)
  const tailGroup = new THREE.Group();
  tailGroup.position.set(0, 0, 8); // At the end
  group.add(tailGroup);
  animatables.tailFrame = tailGroup;

  // Sprocket Shaft
  const shaftGeo = new THREE.CylinderGeometry(0.4, 0.4, 7, 16);
  shaftGeo.rotateZ(Math.PI/2);
  const shaft = new THREE.Mesh(shaftGeo, steelMat);
  
  // Sprockets
  const sprocketGeo = new THREE.CylinderGeometry(1.2, 1.2, 0.5, 12); // Octagonal-ish
  sprocketGeo.rotateZ(Math.PI/2);
  const spL = new THREE.Mesh(sprocketGeo, orangeMat); spL.position.x = -2.5;
  const spR = new THREE.Mesh(sprocketGeo, orangeMat); spR.position.x = 2.5;
  
  const sprocketGroup = new THREE.Group();
  sprocketGroup.add(shaft, spL, spR);
  tailGroup.add(sprocketGroup);
  animatables.sprocketGroup = sprocketGroup;

  // 3. Hydraulic Cylinders (Tensioners)
  const cylBodyGeo = new THREE.CylinderGeometry(0.3, 0.3, 3, 16);
  cylBodyGeo.rotateX(Math.PI/2);
  const cylRodGeo = new THREE.CylinderGeometry(0.15, 0.15, 3, 16);
  cylRodGeo.rotateX(Math.PI/2);

  // Left Cylinder
  const cylLGroup = new THREE.Group();
  cylLGroup.position.set(-3, 0, 11); // Behind tail
  const bodyL = new THREE.Mesh(cylBodyGeo, orangeMat);
  const rodL = new THREE.Mesh(cylRodGeo, chromeMat);
  rodL.position.z = -1.5; // Extending towards tail
  cylLGroup.add(bodyL, rodL);
  group.add(cylLGroup);
  animatables.tensionCylLeft = cylLGroup;

  // Right Cylinder
  const cylRGroup = new THREE.Group();
  cylRGroup.position.set(3, 0, 11);
  const bodyR = new THREE.Mesh(cylBodyGeo, orangeMat);
  const rodR = new THREE.Mesh(cylRodGeo, chromeMat);
  rodR.position.z = -1.5;
  cylRGroup.add(bodyR, rodR);
  group.add(cylRGroup);
  animatables.tensionCylRight = cylRGroup;

  // 4. Chains & Scrapers
  const chainGroup = new THREE.Group();
  // We simulate chain visual by creating a long strip that moves texture or just geometry
  // Here we use geometry segments for scraper bars
  animatables.scrapers = new THREE.Group();
  
  const barGeo = new THREE.BoxGeometry(5.5, 0.2, 0.2);
  const chainLinkGeo = new THREE.BoxGeometry(0.2, 0.1, 20); // Visual strip representing chain

  // Visual Chain Lines
  const chainL = new THREE.Mesh(chainLinkGeo, chainMat.clone());
  chainL.position.set(-2.5, 0, 0);
  const chainR = new THREE.Mesh(chainLinkGeo, chainMat.clone());
  chainR.position.set(2.5, 0, 0);
  
  animatables.chainLeft = chainL;
  animatables.chainRight = chainR;
  group.add(chainL, chainR);

  // Moving Scrapers
  const scrapers = new THREE.Group();
  for(let i=0; i<10; i++) {
      const bar = new THREE.Mesh(barGeo, steelMat);
      bar.position.z = -8 + i * 2;
      scrapers.add(bar);
  }
  group.add(scrapers);
  animatables.scrapers = scrapers;

  // 5. Coal Flow
  const pCount = 800;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(pCount * 3);
  for(let i=0; i<pCount; i++) {
      pPos[i*3] = (Math.random()-0.5) * 6;
      pPos[i*3+1] = Math.random() * 0.5;
      pPos[i*3+2] = (Math.random()-0.5) * 18;
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const particles = new THREE.Points(pGeo, coalMat);
  group.add(particles);
  animatables.coalParticles = particles;

  // 6. Alarm Icon
  const map = new THREE.TextureLoader().load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/sprites/disc.png');
  const spriteMat = new THREE.SpriteMaterial({ map, color: 0xff0000, transparent: true, opacity: 0 });
  const sprite = new THREE.Sprite(spriteMat);
  sprite.scale.set(2, 2, 1);
  sprite.position.set(0, 3, 8);
  group.add(sprite);
  animatables.warningIcon = sprite;

  // Floor Grid
  const grid = new THREE.GridHelper(30, 30, 0x334155, 0x1c1917);
  grid.position.y = -2;
  group.add(grid);
};

export const animateScraperScene = (
  animatables: ScraperAnimatables, 
  state: ScraperSimState,
  tension: { left: number, right: number },
  time: number
) => {
  const isRunning = state !== 'BROKEN_CHAIN';
  const speed = isRunning ? 0.15 : 0;

  // 1. Sprocket Rotation
  if (animatables.sprocketGroup) {
      animatables.sprocketGroup.rotation.x += speed;
  }

  // 2. Scraper Movement
  if (animatables.scrapers) {
      animatables.scrapers.children.forEach(child => {
          child.position.z += speed * 2; // Moving towards tail (z+) or head (z-)? 
          // Conveyor usually pulls towards head. Let's assume head is at -Z.
          // So scrapers move -Z.
          child.position.z -= speed * 2;
          if (child.position.z < -10) child.position.z = 10;
      });
  }

  // 3. Coal Flow
  if (animatables.coalParticles) {
      const pos = animatables.coalParticles.geometry.attributes.position.array as Float32Array;
      for(let i=0; i<pos.length; i+=3) {
          pos[i+2] -= speed * 2;
          if (pos[i+2] < -10) {
              pos[i+2] = 10;
              pos[i] = (Math.random()-0.5) * 6;
          }
      }
      animatables.coalParticles.geometry.attributes.position.needsUpdate = true;
  }

  // 4. Tension Visualization (Hydraulic Cylinders & Chain Color)
  // Base Z for tail frame is 8.
  let targetZ = 8; 
  let leftExtension = 0;
  let rightExtension = 0;

  if (state === 'UNBALANCED') {
      // Skewed tail frame
      if (tension.left > tension.right) {
          // Left tight (pulled in?), Right slack (pushed out by cylinder to tighten?)
          // Cylinder extends to TIGHTEN chain. 
          // Higher pressure/tension usually means cylinder is working hard holding position.
          // Visual: if tension low, cylinder extends to compensate.
          // Simulating misalignment:
          leftExtension = 0.5; 
          rightExtension = -0.5;
      } else {
          leftExtension = -0.5;
          rightExtension = 0.5;
      }
  } else if (state === 'SLACK_CHAIN') {
      targetZ = 7; // Loose
  } else if (state === 'ADJUSTING') {
      // Pulsing cylinders
      leftExtension = Math.sin(time * 5) * 0.2;
      rightExtension = Math.sin(time * 5 + Math.PI) * 0.2;
  }

  if (animatables.tailFrame) {
      animatables.tailFrame.position.z = THREE.MathUtils.lerp(animatables.tailFrame.position.z, targetZ, 0.1);
      // Skew rotation if unbalanced
      const skew = (rightExtension - leftExtension) * 0.1;
      animatables.tailFrame.rotation.y = THREE.MathUtils.lerp(animatables.tailFrame.rotation.y, skew, 0.1);
  }

  // Cylinder Rod Movement
  // Rod is child of group at z=11. Rod default Z=-1.5 (end at 9.5). Tail frame at 8.
  // Gap is 1.5.
  if (animatables.tensionCylLeft && animatables.tensionCylLeft.children[1]) {
     // Animate rod scaling or position to connect to tail frame
     // Simplified: just move rod mesh Z
     const rod = animatables.tensionCylLeft.children[1];
     // extension moves rod towards -Z
     rod.position.z = -1.5 - leftExtension;
  }
  if (animatables.tensionCylRight && animatables.tensionCylRight.children[1]) {
     const rod = animatables.tensionCylRight.children[1];
     rod.position.z = -1.5 - rightExtension;
  }

  // Chain Color Heatmap
  if (animatables.chainLeft) {
      const mat = animatables.chainLeft.material as THREE.MeshStandardMaterial;
      const intensity = Math.min(1, tension.left / 600); // 600kN max
      mat.color.setHSL(0.3 * (1 - intensity), 1, 0.5); // Green to Red
  }
  if (animatables.chainRight) {
      const mat = animatables.chainRight.material as THREE.MeshStandardMaterial;
      const intensity = Math.min(1, tension.right / 600);
      mat.color.setHSL(0.3 * (1 - intensity), 1, 0.5);
  }

  // 5. Alarm
  if (animatables.warningIcon) {
      if (state === 'BROKEN_CHAIN' || state === 'SLACK_CHAIN') {
          animatables.warningIcon.material.opacity = 0.5 + Math.sin(time * 10) * 0.5;
      } else {
          animatables.warningIcon.material.opacity = 0;
      }
  }
};
