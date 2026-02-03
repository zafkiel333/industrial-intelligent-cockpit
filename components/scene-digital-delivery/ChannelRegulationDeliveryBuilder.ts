
import * as THREE from 'three';
import { Animatables, SceneType } from '../three-types';

export const isChannelRegulationDeliveryScene = (type: SceneType): boolean => {
  return type === 'dd-channel-regulation';
};

export const setupChannelRegulationDeliveryCamera = (camera: THREE.PerspectiveCamera) => {
  camera.position.set(0, 20, 30);
  camera.lookAt(0, 0, 0);
};

export const initChannelRegulationDeliveryScene = (
  type: SceneType, 
  group: THREE.Group, 
  animatables: Animatables, 
  disposables: { dispose: () => void }[]
) => {
  if (type !== 'dd-channel-regulation') return;

  // 1. Sculpted Riverbed (Bathymetry)
  const width = 40;
  const length = 60;
  const bedGeo = new THREE.PlaneGeometry(width, length, 40, 60);
  const pos = bedGeo.attributes.position;
  
  for(let i=0; i<pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i); // Local Y is Z world after rotation
    
    // Create channel profile: Deep in center (-5m), Shallow at banks (0m)
    // S-Curve shape for river path
    const riverPathX = Math.sin(y * 0.05) * 6; 
    const distToCenter = Math.abs(x - riverPathX);
    
    let zHeight = 0;
    if (distToCenter < 6) {
        // Main Channel
        zHeight = -5 + Math.pow(distToCenter/6, 2) * 2; 
    } else if (distToCenter < 12) {
        // Slope
        zHeight = -3 + (distToCenter - 6) * 0.5;
    } else {
        // Banks
        zHeight = 0 + Math.random() * 0.2;
    }
    
    // Scour holes / Sand waves texture
    zHeight += Math.sin(x*2) * Math.cos(y*2) * 0.1;

    pos.setZ(i, zHeight);
  }
  bedGeo.computeVertexNormals();
  bedGeo.rotateX(-Math.PI / 2);

  const bedMat = new THREE.MeshStandardMaterial({ 
    color: 0x1e293b, 
    roughness: 0.8,
    metalness: 0.2,
    wireframe: false,
    flatShading: true
  });
  
  // Wireframe Overlay to simulate "Digital Survey"
  const wireMat = new THREE.MeshBasicMaterial({
      color: 0x0ea5e9,
      wireframe: true,
      transparent: true,
      opacity: 0.15
  });

  disposables.push(bedGeo, bedMat, wireMat);
  const riverbed = new THREE.Mesh(bedGeo, bedMat);
  const riverbedWire = new THREE.Mesh(bedGeo, wireMat);
  riverbedWire.position.y = 0.02;

  group.add(riverbed);
  group.add(riverbedWire);
  animatables.crdRiverbed = riverbed;

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
  water.position.y = -0.5; // Water level
  group.add(water);
  animatables.crdWater = water;

  // 3. Spur Dikes (Groynes) - Regulating Structures
  animatables.crdSpurDikes = [];
  const dikeGeo = new THREE.BoxGeometry(8, 2, 1);
  const dikeMat = new THREE.MeshStandardMaterial({ color: 0x64748b });
  const dikeWireMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b, wireframe: true });
  disposables.push(dikeGeo, dikeMat, dikeWireMat);

  // Place dikes along the banks to narrow flow
  const dikePositions = [
      { z: -15, side: -1 }, { z: -5, side: -1 }, { z: 5, side: -1 }, { z: 15, side: -1 }, // Left bank
      { z: -10, side: 1 }, { z: 0, side: 1 }, { z: 10, side: 1 } // Right bank (staggered)
  ];

  dikePositions.forEach(p => {
      const dikeGroup = new THREE.Group();
      // Calculate position based on river path at that Z
      const riverPathX = Math.sin(p.z * 0.05) * 6;
      const x = riverPathX + (p.side * 14); // Offset from center
      
      dikeGroup.position.set(x, -1, p.z);
      // Point towards river
      dikeGroup.lookAt(riverPathX, -1, p.z);
      
      const mesh = new THREE.Mesh(dikeGeo, dikeMat);
      const wire = new THREE.Mesh(dikeGeo, dikeWireMat);
      wire.scale.multiplyScalar(1.02);
      
      dikeGroup.add(mesh);
      dikeGroup.add(wire);
      group.add(dikeGroup);
      animatables.crdSpurDikes?.push(dikeGroup);
  });

  // 4. Survey Boat (The Scanner)
  const boatGroup = new THREE.Group();
  
  const hullGeo = new THREE.BoxGeometry(2, 0.8, 5);
  // Pointy front by scaling (simple hack)
  const hullMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
  disposables.push(hullGeo, hullMat);
  const hull = new THREE.Mesh(hullGeo, hullMat);
  boatGroup.add(hull);

  const cabinGeo = new THREE.BoxGeometry(1.5, 1, 2);
  const cabinMat = new THREE.MeshStandardMaterial({ color: 0xf97316 });
  disposables.push(cabinGeo, cabinMat);
  const cabin = new THREE.Mesh(cabinGeo, cabinMat);
  cabin.position.set(0, 0.8, -0.5);
  boatGroup.add(cabin);

  group.add(boatGroup);
  animatables.crdSurveyBoat = boatGroup;

  // 5. Sonar Cone (Scanning Beam)
  // Fan shape downwards
  const sonarGeo = new THREE.ConeGeometry(4, 8, 32, 1, true);
  // Flatten to be a fan
  sonarGeo.scale(2, 1, 0.1); 
  sonarGeo.rotateX(-Math.PI); // Point down
  sonarGeo.translate(0, -4, 0); // Pivot at top

  const sonarMat = new THREE.MeshBasicMaterial({ 
      color: 0x10b981, 
      transparent: true, 
      opacity: 0.3,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
  });
  disposables.push(sonarGeo, sonarMat);
  const sonar = new THREE.Mesh(sonarGeo, sonarMat);
  boatGroup.add(sonar);
  animatables.crdSonarCone = sonar;

  // 6. Sediment / Flow Particles
  const pCount = 300;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(pCount * 3);
  for(let i=0; i<pCount; i++) {
     pPos[i*3] = (Math.random()-0.5) * 20;
     pPos[i*3+1] = -1.5 - Math.random() * 2; // Underwater
     pPos[i*3+2] = (Math.random()-0.5) * 50;
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const pMat = new THREE.PointsMaterial({ color: 0x94a3b8, size: 0.1, transparent: true, opacity: 0.6 });
  disposables.push(pGeo, pMat);
  const particles = new THREE.Points(pGeo, pMat);
  group.add(particles);
  animatables.crdSedimentParticles = particles;
};

export const animateChannelRegulationDeliveryScene = (type: SceneType, animatables: Animatables, time: number) => {
  if (type !== 'dd-channel-regulation') return;

  // 1. Move Boat along river path
  if (animatables.crdSurveyBoat) {
      // Path logic: Sine wave z -30 to 30
      // Normalize time to Z position
      const t = (time * 4) % 60; 
      const z = 30 - t; 
      
      const riverPathX = Math.sin(z * 0.05) * 6;
      
      animatables.crdSurveyBoat.position.set(riverPathX, -0.5, z);
      
      // Calculate tangent for rotation
      const nextZ = z - 0.5;
      const nextX = Math.sin(nextZ * 0.05) * 6;
      animatables.crdSurveyBoat.lookAt(nextX, -0.5, nextZ);

      // Pulse Sonar
      if (animatables.crdSonarCone) {
          (animatables.crdSonarCone.material as THREE.Material).opacity = 0.2 + Math.sin(time * 10) * 0.1;
      }
  }

  // 2. Flow Particles
  if (animatables.crdSedimentParticles) {
      const positions = animatables.crdSedimentParticles.geometry.attributes.position.array as Float32Array;
      for(let i=0; i<positions.length; i+=3) {
          // Flow downstream (-Z)
          positions[i+2] -= 0.1;
          
          // Meander X roughly
          const x = positions[i];
          const z = positions[i+2];
          // Simple correction to stay somewhat in channel
          const targetX = Math.sin(z * 0.05) * 6;
          positions[i] += (targetX - x) * 0.01;

          // Reset
          if (positions[i+2] < -30) {
              positions[i+2] = 30;
              positions[i] = (Math.random()-0.5) * 20;
          }
      }
      animatables.crdSedimentParticles.geometry.attributes.position.needsUpdate = true;
  }
};
