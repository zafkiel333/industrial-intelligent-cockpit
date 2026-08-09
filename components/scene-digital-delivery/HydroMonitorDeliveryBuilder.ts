
import * as THREE from 'three';
import { Animatables, SceneType } from '../three-types';

export const isHydroMonitorDeliveryScene = (type: SceneType): boolean => {
  return type === 'dd-hydro-monitor-delivery';
};

export const setupHydroMonitorDeliveryCamera = (camera: THREE.PerspectiveCamera) => {
  camera.position.set(0, 20, 20);
  camera.lookAt(0, 0, 0);
};

export const initHydroMonitorDeliveryScene = (
  type: SceneType, 
  group: THREE.Group, 
  animatables: Animatables, 
  disposables: { dispose: () => void }[]
) => {
  if (type !== 'dd-hydro-monitor-delivery') return;

  // 1. Digital Watershed Terrain
  // Create a mesh with elevation data (simulated with noise)
  const width = 40;
  const depth = 40;
  const segments = 64;
  const geometry = new THREE.PlaneGeometry(width, depth, segments, segments);
  const pos = geometry.attributes.position;
  
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i); // Local Y is Z after rotation
    // Create a valley shape with some mountains
    let z = Math.sin(x * 0.1) * Math.cos(y * 0.1) * 2;
    z += Math.random() * 0.2; // Noise
    // Central valley
    if (Math.abs(x) < 5) z -= 2 - Math.abs(x) * 0.4;
    pos.setZ(i, z);
  }
  geometry.computeVertexNormals();
  geometry.rotateX(-Math.PI / 2);

  const material = new THREE.MeshBasicMaterial({ 
    color: 0x06b6d4, 
    wireframe: true, 
    transparent: true, 
    opacity: 0.2 
  });
  disposables.push(geometry, material);
  
  const terrain = new THREE.Mesh(geometry, material);
  group.add(terrain);
  animatables.hmdTerrain = terrain;

  // 2. River Network (Glowing lines in the valley)
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, -2, -18),
    new THREE.Vector3(2, -2.5, -10),
    new THREE.Vector3(-1, -3, 0),
    new THREE.Vector3(3, -3.5, 10),
    new THREE.Vector3(0, -4, 18),
  ]);
  
  const tubeGeo = new THREE.TubeGeometry(curve, 64, 0.4, 8, false);
  const tubeMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.6 });
  disposables.push(tubeGeo, tubeMat);
  const river = new THREE.Mesh(tubeGeo, tubeMat);
  group.add(river);

  // River Pulse Particles
  const pCount = 200;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(pCount * 3);
  const pProgress = new Float32Array(pCount);
  
  for(let i=0; i<pCount; i++) {
    pProgress[i] = Math.random();
    pPos[i*3] = 0; pPos[i*3+1] = 0; pPos[i*3+2] = 0;
  }
  
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  pGeo.setAttribute('progress', new THREE.BufferAttribute(pProgress, 1));
  
  const pMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.3, transparent: true });
  disposables.push(pGeo, pMat);
  const pulses = new THREE.Points(pGeo, pMat);
  group.add(pulses);
  animatables.hmdRiverPulse = pulses;
  (pulses as any).userData = { curve };

  // 3. Digital Rain (Data Input)
  const rCount = 1000;
  const rGeo = new THREE.BufferGeometry();
  const rPos = new Float32Array(rCount * 3);
  
  for(let i=0; i<rCount; i++) {
    rPos[i*3] = (Math.random() - 0.5) * 30;
    rPos[i*3+1] = 5 + Math.random() * 10;
    rPos[i*3+2] = (Math.random() - 0.5) * 30;
  }
  
  rGeo.setAttribute('position', new THREE.BufferAttribute(rPos, 3));
  const rMat = new THREE.PointsMaterial({ color: 0x93c5fd, size: 0.1, transparent: true, opacity: 0.6 });
  disposables.push(rGeo, rMat);
  const rain = new THREE.Points(rGeo, rMat);
  group.add(rain);
  animatables.hmdRain = rain;

  // 4. Stations (Telemetry Nodes)
  animatables.hmdStations = [];
  const stations = [
    { x: -8, z: -10, type: 'Rain' },
    { x: 10, z: -5, type: 'Rain' },
    { x: -5, z: 5, type: 'Hydro' },
    { x: 8, z: 12, type: 'Hydro' },
  ];

  const nodeGeo = new THREE.ConeGeometry(0.5, 2, 4);
  const nodeMat = new THREE.MeshBasicMaterial({ color: 0xfacc15, wireframe: true });
  disposables.push(nodeGeo, nodeMat);

  stations.forEach(s => {
    const nodeGroup = new THREE.Group();
    // Rough y position based on our terrain logic (simplified)
    const y = Math.sin(s.x * 0.1) * Math.cos(s.z * 0.1) * 2;
    nodeGroup.position.set(s.x, y + 1, s.z);
    
    const mesh = new THREE.Mesh(nodeGeo, nodeMat);
    mesh.rotation.x = Math.PI; // Point down
    nodeGroup.add(mesh);
    
    // Pulse Ring
    const ringGeo = new THREE.RingGeometry(0.5, 0.6, 16);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xfacc15, side: THREE.DoubleSide });
    ringGeo.rotateX(-Math.PI / 2);
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.y = -1;
    nodeGroup.add(ring);
    
    group.add(nodeGroup);
    animatables.hmdStations?.push(nodeGroup);
  });
};

export const animateHydroMonitorDeliveryScene = (type: SceneType, animatables: Animatables, time: number) => {
  if (type !== 'dd-hydro-monitor-delivery') return;

  // Rain
  if (animatables.hmdRain) {
    const positions = animatables.hmdRain.geometry.attributes.position.array as Float32Array;
    for(let i=0; i<positions.length/3; i++) {
      positions[i*3+1] -= 0.2;
      if (positions[i*3+1] < -2) {
        positions[i*3+1] = 10 + Math.random() * 5;
      }
    }
    animatables.hmdRain.geometry.attributes.position.needsUpdate = true;
  }

  // River Pulse
  if (animatables.hmdRiverPulse) {
    const pulses = animatables.hmdRiverPulse;
    const curve = (pulses as any).userData.curve as THREE.CatmullRomCurve3;
    const progress = pulses.geometry.attributes.progress.array as Float32Array;
    const positions = pulses.geometry.attributes.position.array as Float32Array;
    
    for(let i=0; i<progress.length; i++) {
      progress[i] += 0.01;
      if (progress[i] > 1) progress[i] = 0;
      
      const point = curve.getPoint(progress[i]);
      positions[i*3] = point.x + (Math.random()-0.5)*0.5;
      positions[i*3+1] = point.y + (Math.random()-0.5)*0.5;
      positions[i*3+2] = point.z + (Math.random()-0.5)*0.5;
    }
    pulses.geometry.attributes.position.needsUpdate = true;
    pulses.geometry.attributes.progress.needsUpdate = true;
  }

  // Station Pulse
  if (animatables.hmdStations) {
    animatables.hmdStations.forEach((s, i) => {
      const ring = s.children[1] as THREE.Mesh;
      const scale = 1 + Math.sin(time * 3 + i) * 0.5;
      ring.scale.setScalar(scale);
      (ring.material as THREE.Material).opacity = 1 - (scale - 0.5)*2;
    });
  }
};
