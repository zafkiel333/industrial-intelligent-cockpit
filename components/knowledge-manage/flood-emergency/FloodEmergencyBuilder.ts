
import * as THREE from 'three';
import { FloodDrillAnimatables, DrillPhase } from './three-types';

export const initFloodDrillScene = (
  group: THREE.Group, 
  animatables: FloodDrillAnimatables,
  disposables: { dispose: () => void }[]
) => {
  // --- Materials ---
  const terrainMat = new THREE.MeshStandardMaterial({ 
    color: 0x1e293b, roughness: 0.9, flatShading: true 
  });
  const waterMat = new THREE.MeshPhysicalMaterial({ 
    color: 0x3b82f6, transmission: 0.8, opacity: 0.8, transparent: true, roughness: 0.1, metalness: 0.5
  });
  const rainMat = new THREE.PointsMaterial({ 
    color: 0xa5f3fc, size: 0.2, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending 
  });
  const zoneMat = new THREE.MeshBasicMaterial({ 
    color: 0xef4444, transparent: true, opacity: 0.3, side: THREE.DoubleSide 
  });
  const routeMat = new THREE.LineBasicMaterial({ color: 0xfacc15 });

  disposables.push(terrainMat, waterMat, rainMat, zoneMat, routeMat);

  // 1. Procedural Terrain (Valley)
  const terrainGeo = new THREE.PlaneGeometry(60, 60, 64, 64);
  const pos = terrainGeo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i); // This is Z in world space
    // Create a valley along X axis
    let zHeight = Math.pow(y * 0.15, 2) * 2; 
    // Add noise
    zHeight += Math.sin(x * 0.5) * 0.5 + Math.cos(y * 0.5) * 0.5;
    
    // Create a dam blockage area
    if (x < -10 && Math.abs(y) < 15) {
       zHeight += 4; // Raised ground for dam
    }
    
    pos.setZ(i, zHeight);
  }
  terrainGeo.computeVertexNormals();
  disposables.push(terrainGeo);
  const terrain = new THREE.Mesh(terrainGeo, terrainMat);
  terrain.rotation.x = -Math.PI / 2;
  group.add(terrain);
  animatables.terrain = terrain;

  // 2. Dam Structure
  const damGeo = new THREE.BoxGeometry(2, 6, 20);
  disposables.push(damGeo);
  const dam = new THREE.Mesh(damGeo, new THREE.MeshStandardMaterial({ color: 0x64748b }));
  dam.position.set(-10, 3, 0); // Positioned in the valley neck
  group.add(dam);

  // 3. Water Plane
  const waterGeo = new THREE.PlaneGeometry(60, 60, 32, 32);
  disposables.push(waterGeo);
  const water = new THREE.Mesh(waterGeo, waterMat);
  water.rotation.x = -Math.PI / 2;
  water.position.y = 0.5; // Initial low water
  group.add(water);
  animatables.waterPlane = water;

  // 4. Rain System
  const rainCount = 3000;
  const rainGeo = new THREE.BufferGeometry();
  const rainPos = new Float32Array(rainCount * 3);
  for(let i=0; i<rainCount; i++) {
    rainPos[i*3] = (Math.random() - 0.5) * 50;
    rainPos[i*3+1] = Math.random() * 30;
    rainPos[i*3+2] = (Math.random() - 0.5) * 50;
  }
  rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));
  disposables.push(rainGeo);
  const rain = new THREE.Points(rainGeo, rainMat);
  group.add(rain);
  animatables.rainParticles = rain;

  // 5. Danger Zones (Low lying areas downstream)
  const zoneGroup = new THREE.Group();
  const zoneGeo = new THREE.CircleGeometry(5, 32);
  disposables.push(zoneGeo);
  
  // Village A
  const z1 = new THREE.Mesh(zoneGeo, zoneMat);
  z1.rotation.x = -Math.PI/2;
  z1.position.set(10, 1, 5);
  z1.visible = false;
  zoneGroup.add(z1);

  // Village B
  const z2 = new THREE.Mesh(zoneGeo, zoneMat);
  z2.rotation.x = -Math.PI/2;
  z2.position.set(20, 0.5, -5);
  z2.visible = false;
  zoneGroup.add(z2);
  
  group.add(zoneGroup);
  animatables.dangerZones = zoneGroup;

  // Grid
  const grid = new THREE.GridHelper(60, 60, 0x1e293b, 0x0f172a);
  grid.position.y = -0.5;
  group.add(grid);
};

export const animateFloodDrill = (
  animatables: FloodDrillAnimatables, 
  phase: DrillPhase,
  progress: number, // 0 to 100
  time: number
) => {
  // 1. Rain Animation
  if (animatables.rainParticles) {
      const positions = animatables.rainParticles.geometry.attributes.position.array as Float32Array;
      const speed = phase === 'CRITICAL_EVENT' ? 1.5 : (phase === 'IDLE' ? 0.2 : 0.8);
      
      for(let i=0; i<positions.length/3; i++) {
          positions[i*3+1] -= speed;
          if (positions[i*3+1] < 0) {
              positions[i*3+1] = 30;
          }
      }
      animatables.rainParticles.geometry.attributes.position.needsUpdate = true;
  }

  // 2. Water Level Rising based on Progress
  if (animatables.waterPlane) {
      // Map progress 0-100 to water height 0.5 - 8.0
      // Non-linear rise to simulate flash flood
      const targetHeight = 0.5 + Math.pow(progress / 100, 2) * 8;
      animatables.waterPlane.position.y = targetHeight;
      
      // Turbulence
      animatables.waterPlane.rotation.x = -Math.PI/2 + Math.sin(time) * 0.01;
  }

  // 3. Danger Zone Alerts
  if (animatables.dangerZones) {
      const currentLevel = animatables.waterPlane?.position.y || 0;
      
      animatables.dangerZones.children.forEach((zone: any) => {
          // If water is higher than zone, blink
          if (currentLevel > zone.position.y) {
              zone.visible = true;
              (zone.material as THREE.MeshBasicMaterial).opacity = 0.3 + Math.sin(time * 10) * 0.2;
          } else {
              zone.visible = false;
          }
      });
  }
};
