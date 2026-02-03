
import * as THREE from 'three';
import { Animatables, SceneType } from '../three-types';

export const isHydroTwinDeliveryScene = (type: SceneType): boolean => {
  return type === 'hydro-twin-delivery';
};

export const setupHydroTwinDeliveryCamera = (camera: THREE.PerspectiveCamera) => {
  camera.position.set(0, 12, 20);
  camera.lookAt(0, 2, 0);
};

export const initHydroTwinDeliveryScene = (
  type: SceneType, 
  group: THREE.Group, 
  animatables: Animatables, 
  disposables: { dispose: () => void }[]
) => {
  if (type !== 'hydro-twin-delivery') return;

  // 1. Digital Grid Floor
  const gridHelper = new THREE.GridHelper(60, 60, 0x06b6d4, 0x0f172a);
  gridHelper.position.y = -4;
  group.add(gridHelper);

  // 2. The Hydro Station Model (Abstract Representation)
  // We'll create a Powerhouse structure that transitions from wireframe to solid
  const phGroup = new THREE.Group();
  group.add(phGroup);
  animatables.htTwinModel = phGroup;

  // Geometry for the main powerhouse block
  const mainGeo = new THREE.BoxGeometry(16, 6, 8);
  const generatorGeo = new THREE.CylinderGeometry(2, 2, 2, 32);
  const pipeGeo = new THREE.CylinderGeometry(0.8, 0.8, 10, 16);
  
  disposables.push(mainGeo, generatorGeo, pipeGeo);

  // Solid Material (Glassy/Holographic)
  const solidMat = new THREE.MeshPhysicalMaterial({
    color: 0x0ea5e9, // Sky Blue
    metalness: 0.9,
    roughness: 0.1,
    transparent: true,
    opacity: 0.2,
    side: THREE.DoubleSide
  });
  disposables.push(solidMat);

  // Wireframe Material
  const wireMat = new THREE.MeshBasicMaterial({
    color: 0x22d3ee, // Cyan
    wireframe: true,
    transparent: true,
    opacity: 0.3
  });
  disposables.push(wireMat);

  // Construct the "Station"
  const createStationPart = (geo: THREE.BufferGeometry, x: number, y: number, z: number, rotX: number = 0, rotZ: number = 0) => {
    const meshSolid = new THREE.Mesh(geo, solidMat);
    meshSolid.position.set(x, y, z);
    meshSolid.rotation.x = rotX;
    meshSolid.rotation.z = rotZ;
    phGroup.add(meshSolid);

    const meshWire = new THREE.Mesh(geo, wireMat);
    meshWire.position.set(x, y, z);
    meshWire.rotation.x = rotX;
    meshWire.rotation.z = rotZ;
    // Scale wire slightly up to prevent z-fighting
    meshWire.scale.multiplyScalar(1.01);
    phGroup.add(meshWire);
  };

  // Main Hall
  createStationPart(mainGeo, 0, 0, 0);
  // Generators (on top)
  createStationPart(generatorGeo, -4, 4, 0);
  createStationPart(generatorGeo, 4, 4, 0);
  // Penstocks (entering back)
  createStationPart(pipeGeo, -4, -2, -6, Math.PI/2, 0);
  createStationPart(pipeGeo, 4, -2, -6, Math.PI/2, 0);

  // 3. Data Synchronization Particles (Flowing from top "Cloud" into the model)
  const pCount = 500;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(pCount * 3);
  const pSpeed = new Float32Array(pCount);
  
  for(let i=0; i<pCount; i++) {
    pPos[i*3] = (Math.random() - 0.5) * 20; // Spread X
    pPos[i*3+1] = 10 + Math.random() * 10; // Start high Y
    pPos[i*3+2] = (Math.random() - 0.5) * 10; // Spread Z
    pSpeed[i] = 0.1 + Math.random() * 0.2;
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  pGeo.setAttribute('speed', new THREE.BufferAttribute(pSpeed, 1));
  
  const pMat = new THREE.PointsMaterial({
    color: 0x4ade80, // Green data
    size: 0.15,
    transparent: true,
    opacity: 0.8
  });
  disposables.push(pMat, pGeo);
  
  const particles = new THREE.Points(pGeo, pMat);
  group.add(particles);
  animatables.htSyncParticles = particles;

  // 4. Data Nodes (Floating interactive points)
  animatables.htDataNodes = [];
  const nodeGeo = new THREE.OctahedronGeometry(0.5);
  const nodeMat = new THREE.MeshBasicMaterial({ color: 0xfacc15, wireframe: true });
  disposables.push(nodeGeo, nodeMat);

  const nodePositions = [
    {x: -4, y: 5.5, z: 0, label: 'Gen 1'},
    {x: 4, y: 5.5, z: 0, label: 'Gen 2'},
    {x: 0, y: 1, z: 4, label: 'Control'},
    {x: -6, y: -2, z: -5, label: 'Valve'},
  ];

  nodePositions.forEach(pos => {
    const nodeGroup = new THREE.Group();
    nodeGroup.position.set(pos.x, pos.y, pos.z);
    
    const mesh = new THREE.Mesh(nodeGeo, nodeMat);
    nodeGroup.add(mesh);
    
    // Pulse ring
    const ringGeo = new THREE.RingGeometry(0.6, 0.7, 32);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xfacc15, side: THREE.DoubleSide, transparent: true });
    disposables.push(ringGeo, ringMat);
    const ring = new THREE.Mesh(ringGeo, ringMat);
    nodeGroup.add(ring);
    
    group.add(nodeGroup);
    animatables.htDataNodes?.push(nodeGroup);
  });

  // 5. Scanning Effect (Horizontal Plane sweeping up/down)
  const scanGeo = new THREE.PlaneGeometry(25, 25);
  scanGeo.rotateX(-Math.PI / 2);
  const scanMat = new THREE.MeshBasicMaterial({ 
    color: 0x06b6d4, 
    transparent: true, 
    opacity: 0.1,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending
  });
  disposables.push(scanGeo, scanMat);
  const scanPlane = new THREE.Mesh(scanGeo, scanMat);
  group.add(scanPlane);
  animatables.htScanEffect = scanPlane;
};

export const animateHydroTwinDeliveryScene = (type: SceneType, animatables: Animatables, time: number) => {
  if (type !== 'hydro-twin-delivery') return;

  // 1. Rotate Model Group slowly
  if (animatables.htTwinModel) {
    animatables.htTwinModel.rotation.y = Math.sin(time * 0.1) * 0.1;
  }

  // 2. Animate Data Particles (Falling/Syncing)
  if (animatables.htSyncParticles) {
    const positions = animatables.htSyncParticles.geometry.attributes.position.array as Float32Array;
    const speeds = animatables.htSyncParticles.geometry.attributes.speed.array as Float32Array;
    
    for(let i=0; i<positions.length/3; i++) {
      positions[i*3+1] -= speeds[i]; // Move down
      
      // If below ground or inside model, reset to top
      if (positions[i*3+1] < -2) {
        positions[i*3+1] = 15;
        positions[i*3] = (Math.random() - 0.5) * 20;
        positions[i*3+2] = (Math.random() - 0.5) * 10;
      }
    }
    animatables.htSyncParticles.geometry.attributes.position.needsUpdate = true;
  }

  // 3. Animate Data Nodes (Spin & Bob)
  if (animatables.htDataNodes) {
    animatables.htDataNodes.forEach((node, i) => {
      node.children[0].rotation.y += 0.02;
      node.children[0].rotation.x += 0.01;
      // Pulse Ring
      const scale = 1 + Math.sin(time * 3 + i) * 0.2;
      node.children[1].scale.setScalar(scale);
      ((node.children[1] as THREE.Mesh).material as THREE.Material).opacity = 1 - (scale - 0.8);
    });
  }

  // 4. Animate Scanner
  if (animatables.htScanEffect) {
    animatables.htScanEffect.position.y = Math.sin(time * 0.5) * 6;
  }
};
