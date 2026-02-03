
import * as THREE from 'three';
import { GeoAnimatables, SceneType } from './three-types';

export const isChannelMonitorDeliveryScene = (type: SceneType): boolean => {
  return type === 'dd-channel-monitor';
};

export const setupChannelMonitorDeliveryCamera = (camera: THREE.PerspectiveCamera) => {
  camera.position.set(20, 25, 20);
  camera.lookAt(0, 0, 0);
};

export const initChannelMonitorDeliveryScene = (
  type: SceneType, 
  group: THREE.Group, 
  animatables: GeoAnimatables, 
  disposables: { dispose: () => void }[]
) => {
  if (type !== 'dd-channel-monitor') return;

  // 1. Channel Riverbed with Silt
  const width = 30;
  const length = 50;
  const segs = 64;
  const bedGeo = new THREE.PlaneGeometry(width, length, segs, segs);
  const pos = bedGeo.attributes.position;
  
  // Create bathymetry
  for(let i=0; i<pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i); // Local Y is world Z
    
    // Main channel shape
    let z = -5 + Math.pow(x / 8, 2); 
    
    // Add silt accumulation hump in the middle
    if (Math.abs(y) < 10 && Math.abs(x) < 5) {
        z += 1.5 * Math.cos(x * 0.5) * Math.cos(y * 0.2);
    }
    
    // Noise
    z += Math.random() * 0.2;
    
    pos.setZ(i, z);
  }
  bedGeo.computeVertexNormals();
  bedGeo.rotateX(-Math.PI / 2);

  const bedMat = new THREE.MeshStandardMaterial({ 
    color: 0x1e293b, 
    roughness: 0.9,
    metalness: 0.2,
    wireframe: false
  });
  
  // Wireframe Overlay
  const wireMat = new THREE.MeshBasicMaterial({ 
      color: 0x22d3ee, 
      wireframe: true, 
      transparent: true, 
      opacity: 0.1 
  });

  disposables.push(bedGeo, bedMat, wireMat);
  const bed = new THREE.Mesh(bedGeo, bedMat);
  const bedWire = new THREE.Mesh(bedGeo, wireMat);
  bedWire.position.y = 0.05;
  
  group.add(bed);
  group.add(bedWire);
  animatables.cmdRiverbed = bed;

  // 2. Water Surface
  const waterGeo = new THREE.PlaneGeometry(width, length);
  waterGeo.rotateX(-Math.PI / 2);
  const waterMat = new THREE.MeshBasicMaterial({ 
      color: 0x06b6d4, 
      transparent: true, 
      opacity: 0.2, 
      side: THREE.DoubleSide
  });
  disposables.push(waterGeo, waterMat);
  const water = new THREE.Mesh(waterGeo, waterMat);
  water.position.y = -0.5;
  group.add(water);
  animatables.cmdWater = water;

  // 3. Survey Boat (USV)
  const boatGroup = new THREE.Group();
  const hullGeo = new THREE.BoxGeometry(1.5, 0.5, 3);
  // Point front
  const hullMat = new THREE.MeshStandardMaterial({ color: 0xf97316 });
  disposables.push(hullGeo, hullMat);
  const hull = new THREE.Mesh(hullGeo, hullMat);
  boatGroup.add(hull);
  
  const antGeo = new THREE.CylinderGeometry(0.05, 0.05, 1);
  const antMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  disposables.push(antGeo, antMat);
  const ant = new THREE.Mesh(antGeo, antMat);
  ant.position.set(0, 0.5, -0.5);
  boatGroup.add(ant);

  group.add(boatGroup);
  animatables.cmdSurveyBoat = boatGroup;

  // 4. Multi-beam Sonar Fan
  const fanGeo = new THREE.BufferGeometry();
  const fanVerts = [];
  const beams = 10;
  // Origin
  for(let i=0; i<=beams; i++) {
      fanVerts.push(0, 0, 0); // Boat
      const angle = (i / beams - 0.5) * Math.PI / 2; // -45 to 45 deg
      const x = Math.sin(angle) * 8;
      const y = -Math.cos(angle) * 8;
      fanVerts.push(x, y, 0);
  }
  // Make triangle strip or lines? Lines for scanning look
  const fanPoints = [];
  for(let i=0; i<=beams; i++) {
      fanPoints.push(new THREE.Vector3(0,0,0));
      const angle = (i / beams - 0.5) * Math.PI / 1.5; 
      const x = Math.sin(angle) * 8;
      const y = -Math.cos(angle) * 8;
      fanPoints.push(new THREE.Vector3(x, y, 0));
  }
  const fanLinesGeo = new THREE.BufferGeometry().setFromPoints(fanPoints);
  const fanMat = new THREE.LineBasicMaterial({ color: 0x00ff9d, transparent: true, opacity: 0.5 });
  disposables.push(fanLinesGeo, fanMat);
  
  const fan = new THREE.LineSegments(fanLinesGeo, fanMat);
  boatGroup.add(fan);
  animatables.cmdScanFan = fan;

  // 5. Monitoring Buoys
  animatables.cmdBuoys = [];
  const buoyGeo = new THREE.CylinderGeometry(0.5, 0.5, 1, 8);
  const buoyMat = new THREE.MeshStandardMaterial({ color: 0xfacc15 });
  disposables.push(buoyGeo, buoyMat);
  
  [-10, 0, 10].forEach(z => {
      const bGroup = new THREE.Group();
      bGroup.position.set(-10, -0.5, z); // Left bank
      const mesh = new THREE.Mesh(buoyGeo, buoyMat);
      bGroup.add(mesh);
      // Light
      const light = new THREE.PointLight(0xffff00, 1, 5);
      light.position.y = 1;
      bGroup.add(light);
      
      group.add(bGroup);
      animatables.cmdBuoys?.push(bGroup);
  });

  // 6. Silt Highlight Particles
  const pCount = 200;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(pCount * 3);
  for(let i=0; i<pCount; i++) {
      // Cluster in center
      pPos[i*3] = (Math.random()-0.5) * 5;
      pPos[i*3+1] = -3 + Math.random();
      pPos[i*3+2] = (Math.random()-0.5) * 15;
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const pMat = new THREE.PointsMaterial({ color: 0xef4444, size: 0.1 });
  disposables.push(pGeo, pMat);
  const silt = new THREE.Points(pGeo, pMat);
  group.add(silt);
  animatables.cmdSilt = silt;
};

export const animateChannelMonitorDeliveryScene = (type: SceneType, animatables: GeoAnimatables, time: number) => {
  if (type !== 'dd-channel-monitor') return;

  // 1. Boat Movement
  if (animatables.cmdSurveyBoat) {
      // Path: Figure 8 or simple loop
      const t = time * 0.2;
      const x = Math.sin(t) * 5;
      const z = Math.cos(t) * 15;
      
      animatables.cmdSurveyBoat.position.set(x, -0.5, z);
      
      // Face direction
      const tx = Math.cos(t) * 5; // Derivative
      const tz = -Math.sin(t) * 15;
      const angle = Math.atan2(tx, tz);
      animatables.cmdSurveyBoat.rotation.y = angle;
  }

  // 2. Scan Fan Pulse
  if (animatables.cmdScanFan) {
      (animatables.cmdScanFan.material as THREE.LineBasicMaterial).opacity = 0.3 + Math.sin(time * 10) * 0.2;
  }

  // 3. Buoy Bobbing
  if (animatables.cmdBuoys) {
      animatables.cmdBuoys.forEach((b, i) => {
          b.position.y = -0.5 + Math.sin(time * 2 + i) * 0.1;
          b.rotation.z = Math.sin(time + i) * 0.1;
      });
  }

  // 4. Silt Pulse
  if (animatables.cmdSilt) {
      const mat = animatables.cmdSilt.material as THREE.PointsMaterial;
      const s = 0.1 + Math.sin(time) * 0.05;
      mat.size = s;
  }
};
