
import * as THREE from 'three';
import { Animatables, SceneType } from '../three-types';

export const isPowerRamScene = (type: SceneType): boolean => {
  return type === 'power-ram-analysis';
};

export const setupPowerRamCamera = (camera: THREE.PerspectiveCamera) => {
  camera.position.set(10, 8, 12);
  camera.lookAt(0, 0, 0);
};

export const initPowerRamScene = (
  type: SceneType, 
  group: THREE.Group, 
  animatables: Animatables, 
  disposables: { dispose: () => void }[]
) => {
  if (type !== 'power-ram-analysis') return;

  // Concept: Exploded view of a generator train (Exciter -> Generator -> Turbine)
  // Components are represented as abstract holographic tech blocks connected by data streams
  
  animatables.ramComponents = [];

  const createComponent = (x: number, color: number, label: string, health: number) => {
    // Core Geometry
    const geo = new THREE.CylinderGeometry(1.5, 1.5, 3, 32, 2, true);
    geo.rotateZ(Math.PI / 2);
    
    // Tech Material
    const mat = new THREE.MeshBasicMaterial({ 
      color: color, 
      wireframe: true, 
      transparent: true, 
      opacity: 0.3 
    });
    disposables.push(geo, mat);
    
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, 0, 0);
    
    // Inner Glow
    const innerGeo = new THREE.CylinderGeometry(1.2, 1.2, 2.5, 16);
    innerGeo.rotateZ(Math.PI / 2);
    const innerMat = new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.1 });
    disposables.push(innerGeo, innerMat);
    const inner = new THREE.Mesh(innerGeo, innerMat);
    mesh.add(inner);

    // Floating Rings
    const ringGeo = new THREE.TorusGeometry(1.8, 0.05, 8, 32);
    ringGeo.rotateY(Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 });
    disposables.push(ringGeo, ringMat);
    const ring = new THREE.Mesh(ringGeo, ringMat);
    mesh.add(ring);

    group.add(mesh);
    
    animatables.ramComponents?.push({ mesh, label, health });
    return mesh;
  };

  const comp1 = createComponent(-5, 0x3b82f6, 'Exciter', 0.98); // Blue
  const comp2 = createComponent(0, 0x8b5cf6, 'Generator', 0.95); // Purple
  const comp3 = createComponent(5, 0xf97316, 'Turbine', 0.88); // Orange

  // Connection Lines (Data Stream)
  const linePoints = [
    new THREE.Vector3(-8, 0, 0),
    new THREE.Vector3(-5, 0, 0),
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(5, 0, 0),
    new THREE.Vector3(8, 0, 0)
  ];
  const lineGeo = new THREE.BufferGeometry().setFromPoints(linePoints);
  const lineMat = new THREE.LineBasicMaterial({ color: 0x475569, transparent: true, opacity: 0.5 });
  disposables.push(lineGeo, lineMat);
  const line = new THREE.Line(lineGeo, lineMat);
  group.add(line);

  // Data Particles flowing along the shaft/connection
  const pCount = 200;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(pCount * 3);
  for(let i=0; i<pCount; i++) {
    pPos[i*3] = (Math.random() - 0.5) * 16;
    pPos[i*3+1] = (Math.random() - 0.5) * 0.5;
    pPos[i*3+2] = (Math.random() - 0.5) * 0.5;
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const pMat = new THREE.PointsMaterial({ color: 0x22d3ee, size: 0.1 });
  disposables.push(pGeo, pMat);
  const particles = new THREE.Points(pGeo, pMat);
  group.add(particles);
  animatables.ramParticles = particles;

  // Grid Floor
  const grid = new THREE.GridHelper(20, 20, 0x1e293b, 0x0f172a);
  grid.position.y = -3;
  group.add(grid);
};

export const animatePowerRamScene = (type: SceneType, animatables: Animatables, time: number) => {
  if (type !== 'power-ram-analysis') return;

  // Animate Components (Hover and Pulse)
  if (animatables.ramComponents) {
    animatables.ramComponents.forEach((c, i) => {
      // Bobbing
      c.mesh.position.y = Math.sin(time * 1 + i) * 0.2;
      
      // Ring rotation
      const ring = c.mesh.children[1];
      if (ring) {
        ring.rotation.z = time * 0.5 * (i % 2 === 0 ? 1 : -1);
      }
      
      // Health Pulse (Opacity)
      const mat = c.mesh.material as THREE.MeshBasicMaterial;
      const pulse = 0.3 + Math.sin(time * 3) * 0.1 * (1 - c.health); // Pulse stronger if health lower
      mat.opacity = pulse;
    });
  }

  // Animate Particles
  if (animatables.ramParticles) {
    const positions = animatables.ramParticles.geometry.attributes.position.array as Float32Array;
    for(let i=0; i<positions.length; i+=3) {
      positions[i] += 0.1; // Move right
      if (positions[i] > 8) positions[i] = -8;
    }
    animatables.ramParticles.geometry.attributes.position.needsUpdate = true;
  }
};
