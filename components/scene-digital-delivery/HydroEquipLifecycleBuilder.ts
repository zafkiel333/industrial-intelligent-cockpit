
import * as THREE from 'three';
import { Animatables, SceneType } from '../three-types';

export const isHydroEquipLifecycleScene = (type: SceneType): boolean => {
  return type === 'dd-hydro-equip-lifecycle';
};

export const setupHydroEquipLifecycleCamera = (camera: THREE.PerspectiveCamera) => {
  camera.position.set(10, 8, 12);
  camera.lookAt(0, 0, 0);
};

export const initHydroEquipLifecycleScene = (
  type: SceneType, 
  group: THREE.Group, 
  animatables: Animatables, 
  disposables: { dispose: () => void }[]
) => {
  if (type !== 'dd-hydro-equip-lifecycle') return;

  const modelGroup = new THREE.Group();
  group.add(modelGroup);
  animatables.helModelGroup = modelGroup;
  animatables.helParts = [];

  // Materials
  const solidMat = new THREE.MeshStandardMaterial({ 
    color: 0x14b8a6, // Teal
    roughness: 0.2, 
    metalness: 0.8 
  });
  const wireMat = new THREE.LineBasicMaterial({ color: 0x2dd4bf, transparent: true, opacity: 0.2 });
  const maintMat = new THREE.MeshStandardMaterial({ 
    color: 0xef4444, // Red for maintenance
    roughness: 0.5,
    metalness: 0.2,
    emissive: 0x7f1d1d,
    emissiveIntensity: 0.5
  });

  disposables.push(solidMat, wireMat, maintMat);

  // Helper to create parts
  const createPart = (name: string, geo: THREE.BufferGeometry, pos: THREE.Vector3, expOffset: THREE.Vector3) => {
    const mesh = new THREE.Mesh(geo, solidMat);
    mesh.position.copy(pos);
    modelGroup.add(mesh);

    const edges = new THREE.EdgesGeometry(geo);
    const wire = new THREE.LineSegments(edges, wireMat);
    wire.position.copy(pos); // Initially same pos
    modelGroup.add(wire); // Add wire separately to control visibility
    disposables.push(edges);

    animatables.helParts?.push({
      name,
      mesh,
      wire,
      origin: pos,
      explodedPos: pos.clone().add(expOffset)
    });
    
    disposables.push(geo);
  };

  // 1. Scroll Case (Base)
  const scrollGeo = new THREE.TorusGeometry(3, 1, 16, 50);
  scrollGeo.rotateX(Math.PI / 2);
  createPart('ScrollCase', scrollGeo, new THREE.Vector3(0, -1, 0), new THREE.Vector3(0, -3, 0));

  // 2. Stay Ring (Middle)
  const ringGeo = new THREE.CylinderGeometry(3, 3, 1, 32, 1, true);
  createPart('StayRing', ringGeo, new THREE.Vector3(0, 0.5, 0), new THREE.Vector3(0, 0, 0));

  // 3. Head Cover (Top)
  const headGeo = new THREE.CylinderGeometry(2.5, 3, 0.5, 32);
  createPart('HeadCover', headGeo, new THREE.Vector3(0, 1.5, 0), new THREE.Vector3(0, 2, 0));

  // 4. Rotor (Inside/Top)
  const rotorGeo = new THREE.CylinderGeometry(1.8, 1.8, 2, 32);
  createPart('Rotor', rotorGeo, new THREE.Vector3(0, 3, 0), new THREE.Vector3(0, 5, 0));

  // 5. Shaft (Central)
  const shaftGeo = new THREE.CylinderGeometry(0.5, 0.5, 8, 16);
  createPart('Shaft', shaftGeo, new THREE.Vector3(0, 3, 0), new THREE.Vector3(0, 6, 0));

  // 6. Particles (Operation Flow)
  const pCount = 500;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(pCount * 3);
  for(let i=0; i<pCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const r = 4 + Math.random() * 2;
    pPos[i*3] = Math.cos(angle) * r;
    pPos[i*3+1] = (Math.random() - 0.5) * 4;
    pPos[i*3+2] = Math.sin(angle) * r;
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const pMat = new THREE.PointsMaterial({ color: 0xccfbf1, size: 0.1, transparent: true, opacity: 0 });
  disposables.push(pGeo, pMat);
  const particles = new THREE.Points(pGeo, pMat);
  group.add(particles);
  animatables.helFlowParticles = particles;
  
  // 7. Grid
  const grid = new THREE.GridHelper(30, 30, 0x115e59, 0x022c22);
  grid.position.y = -4;
  group.add(grid);
};

export const animateHydroEquipLifecycleScene = (type: SceneType, animatables: Animatables, time: number) => {
  if (type !== 'dd-hydro-equip-lifecycle') return;

  // Retrieve state from group userData (passed from React props ideally, or use global time cycle for demo)
  // We assume the View component updates the group.userData.stage
  const stage = (animatables.helModelGroup?.parent as any)?.userData?.stage || 'DESIGN'; 
  
  const parts = animatables.helParts;
  if (!parts) return;

  // State Logic
  let targetExplosion = 0; // 0 = assembled, 1 = exploded
  let wireframeOpacity = 0;
  let solidOpacity = 1;
  let rotationSpeed = 0;
  let particleOpacity = 0;
  let maintHighlight = false;

  switch (stage) {
    case 'DESIGN':
      wireframeOpacity = 0.8;
      solidOpacity = 0.1;
      targetExplosion = 0.2; // Slight separation to see lines
      break;
    case 'MANUFACTURE':
      wireframeOpacity = 0.1;
      solidOpacity = 1.0;
      targetExplosion = 1.0; // Fully exploded
      break;
    case 'INSTALL':
      wireframeOpacity = 0.1;
      solidOpacity = 1.0;
      targetExplosion = 0; // Assembling...
      // Could animate assembly based on time, but keep static assembled for simplicity
      break;
    case 'OPERATION':
      wireframeOpacity = 0;
      solidOpacity = 1.0;
      targetExplosion = 0;
      rotationSpeed = 0.1;
      particleOpacity = 0.6;
      break;
    case 'MAINTENANCE':
      wireframeOpacity = 0.3;
      solidOpacity = 0.4;
      targetExplosion = 0.5; // Open up for inspection
      maintHighlight = true;
      break;
  }

  // Animation Update
  
  // 1. Parts Transform
  parts.forEach(part => {
    // Lerp Position
    const targetPos = new THREE.Vector3().lerpVectors(part.origin, part.explodedPos, targetExplosion);
    part.mesh.position.lerp(targetPos, 0.1);
    part.wire.position.lerp(targetPos, 0.1);

    // Opacity
    (part.mesh.material as THREE.MeshStandardMaterial).opacity = THREE.MathUtils.lerp((part.mesh.material as THREE.MeshStandardMaterial).opacity, solidOpacity, 0.1);
    (part.wire.material as THREE.LineBasicMaterial).opacity = THREE.MathUtils.lerp((part.wire.material as THREE.LineBasicMaterial).opacity, wireframeOpacity, 0.1);

    // Highlight for Maintenance
    if (maintHighlight && (part.name === 'Rotor' || part.name === 'Shaft')) {
       (part.mesh.material as THREE.MeshStandardMaterial).color.setHex(0xef4444);
       (part.mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.5 + Math.sin(time * 5) * 0.2;
    } else {
       (part.mesh.material as THREE.MeshStandardMaterial).color.setHex(0x14b8a6);
       (part.mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 0;
    }
  });

  // 2. Rotation (Rotor & Shaft only)
  if (rotationSpeed > 0) {
     parts.forEach(part => {
       if (part.name === 'Rotor' || part.name === 'Shaft') {
         part.mesh.rotation.y -= rotationSpeed;
         part.wire.rotation.y -= rotationSpeed;
       }
     });
  }

  // 3. Particles
  if (animatables.helFlowParticles) {
    const mat = animatables.helFlowParticles.material as THREE.PointsMaterial;
    mat.opacity = THREE.MathUtils.lerp(mat.opacity, particleOpacity, 0.05);
    
    if (particleOpacity > 0.01) {
       animatables.helFlowParticles.rotation.y -= 0.02;
       const positions = animatables.helFlowParticles.geometry.attributes.position.array as Float32Array;
       for(let i=0; i<positions.length; i+=3) {
         positions[i+1] -= 0.1;
         if(positions[i+1] < -4) positions[i+1] = 4;
       }
       animatables.helFlowParticles.geometry.attributes.position.needsUpdate = true;
    }
  }

  // 4. Whole Group rotation (Camera orbit effect proxy)
  if (animatables.helModelGroup) {
      animatables.helModelGroup.rotation.y = Math.sin(time * 0.05) * 0.2;
  }
};
