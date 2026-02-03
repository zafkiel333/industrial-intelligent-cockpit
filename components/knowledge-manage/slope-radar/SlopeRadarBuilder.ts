
import * as THREE from 'three';
import { RadarAnimatables, RadarState } from './three-types';

export const initSlopeRadarScene = (
  group: THREE.Group, 
  animatables: RadarAnimatables,
  disposables: { dispose: () => void }[]
) => {
  // --- 材质库 ---
  const terrainMat = new THREE.MeshStandardMaterial({ 
    color: 0x44403c, roughness: 0.9, flatShading: true, vertexColors: true 
  });
  const radarBodyMat = new THREE.MeshStandardMaterial({ 
    color: 0xf97316, roughness: 0.3, metalness: 0.6 
  });
  const radarDishMat = new THREE.MeshStandardMaterial({ 
    color: 0xffffff, roughness: 0.2, metalness: 0.1 
  });
  const scanMat = new THREE.MeshBasicMaterial({ 
    color: 0x22c55e, transparent: true, opacity: 0.1, side: THREE.DoubleSide, blending: THREE.AdditiveBlending 
  });
  const laserMat = new THREE.MeshBasicMaterial({ 
    color: 0xef4444, transparent: true, opacity: 0.8 
  });
  const vectorMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });

  disposables.push(terrainMat, radarBodyMat, radarDishMat, scanMat, laserMat, vectorMat);

  // 1. 露天矿地形 (Open Pit Terrain) - 阶梯状
  const width = 60, depth = 60;
  const segments = 64;
  const terrainGeo = new THREE.PlaneGeometry(width, depth, segments, segments);
  const pos = terrainGeo.attributes.position;
  const colors = new Float32Array(pos.count * 3);
  
  const colorSafe = new THREE.Color(0x44403c); // Grey Rock
  const colorWarn = new THREE.Color(0xfacc15); // Yellow
  const colorDanger = new THREE.Color(0xef4444); // Red

  for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i); // This is local Y, which becomes Z in world

      // Create a pit shape: Z (height) depends on distance from center
      // But let's make it a slope wall: Height decreases as Y increases
      
      // Bench profile function: Steps
      const slopeFactor = (y + 30) / 60; // 0 to 1
      let z = 20 - slopeFactor * 30; // Linear slope
      
      // Add steps (Benches)
      z += Math.sin(slopeFactor * Math.PI * 8) * 1.5;
      
      // Add noise
      z += (Math.random() - 0.5) * 0.5;

      // Add a "Slide Zone" bump
      // A bulge in the middle that will move
      const distToDanger = Math.sqrt(x*x + (y-5)*(y-5)); // Danger zone center at 0, 5
      
      pos.setZ(i, z);

      // Vertex Colors based on displacement (simulated heat map)
      let c = colorSafe;
      if (distToDanger < 10) {
          // Gradient
          c = colorSafe.clone().lerp(colorDanger, 1 - distToDanger/10);
      }
      colors[i*3] = c.r;
      colors[i*3+1] = c.g;
      colors[i*3+2] = c.b;
  }
  
  terrainGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  terrainGeo.computeVertexNormals();
  disposables.push(terrainGeo);

  const terrain = new THREE.Mesh(terrainGeo, terrainMat);
  terrain.rotation.x = -Math.PI / 2;
  group.add(terrain);
  animatables.terrainMesh = terrain;

  // 2. 边坡雷达 (Slope Radar) - 放置在对面
  const radarGroup = new THREE.Group();
  radarGroup.position.set(0, 5, 25); // Opposite the slope
  group.add(radarGroup);
  animatables.radarUnit = radarGroup;

  // Tripod/Base
  const baseGeo = new THREE.CylinderGeometry(0.5, 2, 3, 4);
  const base = new THREE.Mesh(baseGeo, new THREE.MeshStandardMaterial({color: 0x333333}));
  base.position.y = 1.5;
  radarGroup.add(base);
  disposables.push(baseGeo);

  // Main Unit
  const bodyGeo = new THREE.BoxGeometry(2, 2, 2);
  const body = new THREE.Mesh(bodyGeo, radarBodyMat);
  body.position.y = 3.5;
  radarGroup.add(body);
  disposables.push(bodyGeo);

  // Linear Rail / Dish Arm
  const railGeo = new THREE.BoxGeometry(4, 0.5, 0.5);
  const rail = new THREE.Mesh(railGeo, new THREE.MeshStandardMaterial({color: 0x666666}));
  rail.position.set(0, 3.5, -1.2);
  radarGroup.add(rail);
  disposables.push(railGeo);

  // The Scanning Dish (Moves along rail)
  const dishGeo = new THREE.CylinderGeometry(0.5, 0.2, 1, 16);
  dishGeo.rotateX(Math.PI/2);
  const dish = new THREE.Mesh(dishGeo, radarDishMat);
  dish.position.set(0, 3.5, -1.5);
  radarGroup.add(dish);
  animatables.radarDish = dish;

  // 3. Scan Frustum (Visualizing the Radar Beam)
  // A fan shape representing SAR beam
  const scanGeo = new THREE.ConeGeometry(8, 40, 4, 1, true);
  scanGeo.rotateX(-Math.PI/2);
  scanGeo.translate(0, 0, -20); // Extend forward
  // Flatten it
  scanGeo.scale(1.5, 0.1, 1);
  disposables.push(scanGeo);
  const scanMesh = new THREE.Mesh(scanGeo, scanMat);
  dish.add(scanMesh); // Attached to dish
  animatables.scanFrustum = scanMesh;

  // 4. Laser Scan Line (Sweep effect on terrain)
  const lineGeo = new THREE.PlaneGeometry(60, 0.5);
  lineGeo.rotateX(-Math.PI/2);
  disposables.push(lineGeo);
  const scanLine = new THREE.Mesh(lineGeo, laserMat);
  scanLine.position.y = 5; // Start high
  group.add(scanLine);
  animatables.scanLine = scanLine;

  // 5. Displacement Vectors (Arrows)
  const vectorGroup = new THREE.Group();
  const arrowGeo = new THREE.ConeGeometry(0.3, 1, 8);
  arrowGeo.rotateX(Math.PI/2);
  disposables.push(arrowGeo);
  
  // Place arrows in danger zone
  for(let x=-8; x<=8; x+=4) {
      for(let z=-5; z<=5; z+=4) { // Local coords of danger zone relative to terrain center
          const arrow = new THREE.Mesh(arrowGeo, vectorMat);
          // Map to world
          // Danger zone center was x=0, y=5 in plane geometry logic (which is -Z in world)
          // Terrain is rotated -90 X. 
          // Plane X -> World X. Plane Y -> World -Z. Plane Z -> World Y.
          // Danger zone center approx World X=0, World Z=-5.
          
          arrow.position.set(x, 5, -5 - z); // Approx height 5
          // Point outwards/downwards
          arrow.lookAt(x * 1.2, 0, -5 - z + 2);
          vectorGroup.add(arrow);
      }
  }
  group.add(vectorGroup);
  animatables.displacementVectors = vectorGroup;

  // 6. Rain (Weather influence)
  const rainCount = 1000;
  const rainGeo = new THREE.BufferGeometry();
  const rainPos = new Float32Array(rainCount * 3);
  for(let i=0; i<rainCount; i++) {
      rainPos[i*3] = (Math.random()-0.5) * 50;
      rainPos[i*3+1] = Math.random() * 30;
      rainPos[i*3+2] = (Math.random()-0.5) * 50;
  }
  rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));
  const rainMat = new THREE.PointsMaterial({color: 0x93c5fd, size: 0.1, transparent: true, opacity: 0});
  disposables.push(rainGeo, rainMat);
  const rain = new THREE.Points(rainGeo, rainMat);
  group.add(rain);
  animatables.rainSystem = rain;
};

export const animateSlopeRadarScene = (
  animatables: RadarAnimatables, 
  state: RadarState,
  time: number
) => {
  // 1. Radar Dish Movement
  if (animatables.radarDish) {
      // Sliding left and right on the rail
      const railRange = 1.5;
      animatables.radarDish.position.x = Math.sin(time) * railRange;
      
      // Tilting up/down slightly
      animatables.radarDish.rotation.x = Math.sin(time * 0.5) * 0.1;
  }

  // 2. Scan Beam Visibility
  if (animatables.scanFrustum) {
      animatables.scanFrustum.visible = state !== 'SLIDE_EVENT';
      if (state === 'FOCUS_TRACK' || state === 'WARNING') {
          // Narrower, faster scan
          (animatables.scanFrustum.material as THREE.Material).opacity = 0.3 + Math.sin(time * 10) * 0.2;
      } else {
          (animatables.scanFrustum.material as THREE.Material).opacity = 0.1;
      }
  }

  // 3. Scan Line on Terrain
  if (animatables.scanLine) {
      // Sweep across Z axis
      animatables.scanLine.position.z = Math.sin(time * 0.5) * 20 - 5;
      // Fade out at edges
      const op = Math.cos(time * 0.5);
      (animatables.scanLine.material as THREE.Material).opacity = Math.abs(op) * 0.5;
  }

  // 4. Vectors Growing (Deformation)
  if (animatables.displacementVectors) {
      // Use 'SCANNING' instead of 'NORMAL' as it is the default idle state in RadarState
      const scaleBase = state === 'SCANNING' ? 0 : state === 'WARNING' ? 1 : state === 'SLIDE_EVENT' ? 3 : 0.5;
      
      animatables.displacementVectors.children.forEach((arrow, i) => {
          const pulse = Math.sin(time * 5 + i) * 0.2 + 1;
          arrow.scale.setScalar(scaleBase * pulse);
          arrow.visible = scaleBase > 0;
      });
  }

  // 5. Rain System
  if (animatables.rainSystem) {
      // Weather simulation logic (could be controlled by props, here randomized or state based)
      // Let's say WARNING state implies bad weather might be a cause
      const isRaining = state === 'WARNING' || state === 'SLIDE_EVENT';
      const mat = animatables.rainSystem.material as THREE.PointsMaterial;
      mat.opacity = isRaining ? 0.6 : 0;
      
      if (isRaining) {
          const pos = animatables.rainSystem.geometry.attributes.position.array as Float32Array;
          for(let i=0; i<pos.length; i+=3) {
              pos[i+1] -= 0.5;
              if (pos[i+1] < 0) pos[i+1] = 30;
          }
          animatables.rainSystem.geometry.attributes.position.needsUpdate = true;
      }
  }

  // 6. Terrain Heatmap Pulse (Danger Zone)
  if (animatables.terrainMesh) {
     // Modulate vertex colors? A bit expensive.
     // Maybe just material emissive for the whole mesh if critical
     const mat = animatables.terrainMesh.material as THREE.MeshStandardMaterial;
     if (state === 'SLIDE_EVENT') {
         mat.emissive.setHex(0x550000);
         mat.emissiveIntensity = 0.5 + Math.sin(time * 10) * 0.5;
     } else if (state === 'WARNING') {
         mat.emissive.setHex(0x331100);
         mat.emissiveIntensity = 0.2;
     } else {
         mat.emissiveIntensity = 0;
     }
  }
};
