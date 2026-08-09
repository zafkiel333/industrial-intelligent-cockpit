
import * as THREE from 'three';
import { Animatables, SceneType } from '../three-types';

export const isSmartWaterScene = (type: SceneType): boolean => {
  return type === 'city-smart-water';
};

export const setupSmartWaterCamera = (camera: THREE.PerspectiveCamera) => {
  camera.position.set(15, 15, 15);
  camera.lookAt(0, 0, 0);
};

export const initSmartWaterScene = (
  type: SceneType, 
  group: THREE.Group, 
  animatables: Animatables, 
  disposables: { dispose: () => void }[]
) => {
  if (type !== 'city-smart-water') return;

  // 1. City Grid Base
  const gridHelper = new THREE.GridHelper(40, 40, 0x0ea5e9, 0x1e293b);
  group.add(gridHelper);

  // 2. Holographic Buildings
  const cityGroup = new THREE.Group();
  const buildGeo = new THREE.BoxGeometry(1, 1, 1);
  disposables.push(buildGeo);
  const buildMat = new THREE.MeshStandardMaterial({ 
      color: 0x0ea5e9, 
      transparent: true, 
      opacity: 0.15, 
      roughness: 0.1,
      metalness: 0.8
  });
  disposables.push(buildMat);
  const edgeMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.3 });
  disposables.push(edgeMat);

  // Generate random blocks
  for(let i=0; i<40; i++) {
      const h = 2 + Math.random() * 6;
      const x = (Math.random() - 0.5) * 30;
      const z = (Math.random() - 0.5) * 30;
      
      const building = new THREE.Mesh(buildGeo, buildMat);
      building.position.set(x, h/2, z);
      building.scale.set(1.5 + Math.random(), h, 1.5 + Math.random());
      cityGroup.add(building);

      // Edges
      const edges = new THREE.EdgesGeometry(building.geometry);
      disposables.push(edges);
      const line = new THREE.LineSegments(edges, edgeMat);
      // Need to scale and position line manually if not adding as child
      // Here we add as child to reuse transform, but need to reset scale on child or use geometry scaling
      // Easier: create new mesh for edges with same transforms
      line.position.copy(building.position);
      line.scale.copy(building.scale);
      cityGroup.add(line);
  }
  group.add(cityGroup);

  // 3. Underground Pipe Network (Blue Lines)
  const pipeGroup = new THREE.Group();
  const pipeMat = new THREE.LineBasicMaterial({ color: 0x22d3ee, linewidth: 2, transparent: true, opacity: 0.8 });
  disposables.push(pipeMat);
  
  const pipePoints = [];
  // Main Ring
  pipePoints.push(new THREE.Vector3(-15, -1, -15));
  pipePoints.push(new THREE.Vector3(15, -1, -15));
  pipePoints.push(new THREE.Vector3(15, -1, 15));
  pipePoints.push(new THREE.Vector3(-15, -1, 15));
  pipePoints.push(new THREE.Vector3(-15, -1, -15));
  
  // Cross connections
  pipePoints.push(new THREE.Vector3(-15, -1, 0));
  pipePoints.push(new THREE.Vector3(15, -1, 0));
  
  pipePoints.push(new THREE.Vector3(0, -1, -15));
  pipePoints.push(new THREE.Vector3(0, -1, 15));

  const pipeGeo = new THREE.BufferGeometry().setFromPoints(pipePoints);
  disposables.push(pipeGeo);
  const pipes = new THREE.Line(pipeGeo, pipeMat);
  pipeGroup.add(pipes);
  group.add(pipeGroup);

  // 4. Flow Particles
  const pCount = 200;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(pCount * 3);
  for(let i=0; i<pCount; i++) {
      // Randomly place on the main square loop
      const side = Math.floor(Math.random() * 4);
      const progress = Math.random() * 30 - 15;
      if (side === 0) { pPos[i*3] = progress; pPos[i*3+1] = -1; pPos[i*3+2] = -15; } // Top
      else if (side === 1) { pPos[i*3] = 15; pPos[i*3+1] = -1; pPos[i*3+2] = progress; } // Right
      else if (side === 2) { pPos[i*3] = progress; pPos[i*3+1] = -1; pPos[i*3+2] = 15; } // Bottom
      else { pPos[i*3] = -15; pPos[i*3+1] = -1; pPos[i*3+2] = progress; } // Left
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const pMat = new THREE.PointsMaterial({ color: 0xa5f3fc, size: 0.3, transparent: true });
  disposables.push(pGeo, pMat);
  const flowParticles = new THREE.Points(pGeo, pMat);
  group.add(flowParticles);
  animatables.cityFlow = flowParticles;

  // 5. Leak Simulation (Pulsing Sphere)
  const leakGeo = new THREE.SphereGeometry(1, 16, 16);
  disposables.push(leakGeo);
  const leakMat = new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.8 });
  disposables.push(leakMat);
  const leak = new THREE.Mesh(leakGeo, leakMat);
  leak.position.set(5, -1, 5); // Arbitrary leak location
  group.add(leak);
  animatables.cityLeak = leak;

  // Leak Ripples
  const ringGeo = new THREE.RingGeometry(0.5, 1, 32);
  ringGeo.rotateX(-Math.PI/2);
  disposables.push(ringGeo);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, side: THREE.DoubleSide });
  disposables.push(ringMat);
  const ripple = new THREE.Mesh(ringGeo, ringMat);
  leak.add(ripple);
  
};

export const animateSmartWaterScene = (type: SceneType, animatables: Animatables, time: number) => {
  if (type !== 'city-smart-water') return;

  // Animate Flow Particles
  if (animatables.cityFlow) {
      const positions = animatables.cityFlow.geometry.attributes.position.array as Float32Array;
      for(let i=0; i<positions.length/3; i++) {
          // Simple movement logic along axes
          const x = positions[i*3];
          const z = positions[i*3+2];
          
          const speed = 0.1;
          
          // Move clockwise around the outer loop approx
          if (z <= -15 && x < 15) positions[i*3] += speed;
          else if (x >= 15 && z < 15) positions[i*3+2] += speed;
          else if (z >= 15 && x > -15) positions[i*3] -= speed;
          else if (x <= -15 && z > -15) positions[i*3+2] -= speed;
      }
      animatables.cityFlow.geometry.attributes.position.needsUpdate = true;
  }

  // Animate Leak Pulse
  if (animatables.cityLeak) {
      const scale = 1 + Math.sin(time * 3) * 0.3;
      animatables.cityLeak.scale.set(scale, scale, scale);
      
      const ripple = animatables.cityLeak.children[0] as THREE.Mesh;
      if (ripple) {
          ripple.scale.set(scale * 1.5, scale * 1.5, scale * 1.5);
          (ripple.material as THREE.Material).opacity = 1 - (scale - 0.7);
      }
  }
};
