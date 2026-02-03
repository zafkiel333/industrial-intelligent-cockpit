

import * as THREE from 'three';
import { Animatables, SceneType } from '../three-types';

const COCKPIT_TYPES: SceneType[] = [
  'pumped-storage', 'flood-basin', 'cascade-river', 'mining-rescue', 
  'mining-eco', 'dam', 'mine-tunnel', 'city-smart-water', 
  'irrigation-network', 'globe-fleet', 'container-terminal', 
  'bulk-terminal', 'inland-waterway', 'green-port-cockpit', 'maritime-safety-cockpit'
];

export const isCockpitScene = (type: SceneType): boolean => {
  return COCKPIT_TYPES.includes(type);
};

export const setupCockpitCamera = (camera: THREE.PerspectiveCamera, type: SceneType) => {
  if (type === 'mine-tunnel') {
    camera.position.set(0, 5, 10);
    camera.lookAt(0, -2, 0);
  } else if (type === 'dam') {
    camera.position.set(8, 5, 8);
    camera.lookAt(0, 0, 0);
  } else if (type === 'mining-eco') {
    camera.position.set(0, 8, 12);
    camera.lookAt(0, 0, 0);
  } else if (type === 'mining-rescue') {
    camera.position.set(5, 3, 8);
    camera.lookAt(0, 0, 0);
  } else if (type === 'cascade-river') {
    camera.position.set(10, 8, 10);
    camera.lookAt(0, 0, 0);
  } else if (type === 'flood-basin') {
    camera.position.set(0, 6, 12);
    camera.lookAt(0, 0, 0);
  } else if (type === 'pumped-storage') {
    camera.position.set(8, 6, 8);
    camera.lookAt(0, 0, 0);
  } else if (type === 'city-smart-water') {
    camera.position.set(8, 8, 8);
    camera.lookAt(0, 0, 0);
  } else if (type === 'irrigation-network') {
    camera.position.set(0, 10, 10);
    camera.lookAt(0, 0, 0);
  } else if (type === 'globe-fleet') {
    camera.position.set(0, 0, 14);
    camera.lookAt(0, 0, 0);
  } else if (type === 'container-terminal') {
    camera.position.set(10, 8, 10);
    camera.lookAt(0, 0, 0);
  } else if (type === 'bulk-terminal') {
    camera.position.set(10, 8, 15);
    camera.lookAt(0, 0, 0);
  } else if (type === 'inland-waterway') {
    camera.position.set(5, 5, 10);
    camera.lookAt(0, 0, 0);
  } else if (type === 'green-port-cockpit') {
    camera.position.set(8, 5, 8);
    camera.lookAt(0, 2, 0);
  } else if (type === 'maritime-safety-cockpit') {
    camera.position.set(0, 12, 0); // Top-down radar view
    camera.lookAt(0, 0, 0);
  }
};

export const getCockpitLightColor = (type: SceneType): string | undefined => {
  if (type === 'mining-rescue') return '#ef4444'; // Red for emergency
  if (type === 'flood-basin') return '#3b82f6'; // Stormy blue
  if (type === 'maritime-safety-cockpit') return '#0ea5e9'; // Radar blue
  if (type === 'city-smart-water') return '#06b6d4'; // Cyan
  if (type === 'irrigation-network') return '#10b981'; // Green
  if (type === 'bulk-terminal') return '#d97706'; // Amber
  if (type === 'container-terminal') return '#f97316'; // Orange
  return undefined;
};

export const initCockpitScene = (
  type: SceneType, 
  group: THREE.Group, 
  animatables: Animatables, 
  disposables: { dispose: () => void }[]
) => {
  
  if (type === 'pumped-storage') {
      const psGroup = new THREE.Group();
      group.add(psGroup);

      // Upper Reservoir (Top Left)
      const upperResGeo = new THREE.BoxGeometry(5, 1, 5);
      upperResGeo.translate(-4, 3, -4);
      disposables.push(upperResGeo);
      const waterMat = new THREE.MeshStandardMaterial({ 
          color: 0x38bdf8, 
          transparent: true, 
          opacity: 0.7,
          roughness: 0.1
      });
      disposables.push(waterMat);
      const upperRes = new THREE.Mesh(upperResGeo, waterMat);
      psGroup.add(upperRes);

      // Lower Reservoir (Bottom Right)
      const lowerResGeo = new THREE.BoxGeometry(6, 1, 6);
      lowerResGeo.translate(4, -3, 4);
      disposables.push(lowerResGeo);
      const lowerRes = new THREE.Mesh(lowerResGeo, waterMat);
      psGroup.add(lowerRes);

      // Penstock (Tube connecting them)
      const path = new THREE.CatmullRomCurve3([
          new THREE.Vector3(-4, 2.5, -4),
          new THREE.Vector3(0, 0, 0), // Powerhouse level
          new THREE.Vector3(4, -2.5, 4)
      ]);
      const tubeGeo = new THREE.TubeGeometry(path, 20, 0.3, 8, false);
      disposables.push(tubeGeo);
      const tubeMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.5 });
      disposables.push(tubeMat);
      const penstock = new THREE.Mesh(tubeGeo, tubeMat);
      psGroup.add(penstock);

      // Powerhouse (Underground/Center)
      const phGeo = new THREE.BoxGeometry(2, 1.5, 2);
      disposables.push(phGeo);
      const phMat = new THREE.MeshStandardMaterial({ color: 0x334155 });
      disposables.push(phMat);
      const powerhouse = new THREE.Mesh(phGeo, phMat);
      psGroup.add(powerhouse);

      // Terrain (Slope)
      const terrainGeo = new THREE.PlaneGeometry(15, 15, 10, 10);
      const pos = terrainGeo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
          const x = pos.getX(i);
          const z = pos.getY(i); // Plane is rotated x -90 later
          // Height based on distance from top-left to bottom-right
          let h = -0.5 * (x + z); 
          pos.setZ(i, h);
      }
      terrainGeo.computeVertexNormals();
      disposables.push(terrainGeo);
      const terrainMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, wireframe: true, transparent: true, opacity: 0.2 });
      disposables.push(terrainMat);
      const terrain = new THREE.Mesh(terrainGeo, terrainMat);
      terrain.rotation.x = -Math.PI / 2;
      psGroup.add(terrain);

      // Bi-directional Flow Particles
      const pCount = 300;
      const pGeo = new THREE.BufferGeometry();
      const pPos = new Float32Array(pCount * 3);
      // Store initial t (0-1) for each particle along the curve
      const pT = new Float32Array(pCount);
      for(let i=0; i<pCount; i++) {
          pT[i] = Math.random();
          const pt = path.getPoint(pT[i]);
          pPos[i*3] = pt.x + (Math.random()-0.5)*0.2;
          pPos[i*3+1] = pt.y + (Math.random()-0.5)*0.2;
          pPos[i*3+2] = pt.z + (Math.random()-0.5)*0.2;
      }
      pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
      pGeo.setAttribute('t', new THREE.BufferAttribute(pT, 1));
      
      const pMat = new THREE.PointsMaterial({ color: 0x4ade80, size: 0.15 }); // Green for energy
      disposables.push(pMat, pGeo);
      const particles = new THREE.Points(pGeo, pMat);
      psGroup.add(particles);
      animatables.pumpedFlow = particles;
      // Hacky way to store curve on the object for animation loop access
      (particles as any).userData = { curve: path, mode: 'gen' }; 

  } else if (type === 'flood-basin') {
      const basinGroup = new THREE.Group();
      group.add(basinGroup);

      // Terrain (Valley shape)
      const planeGeo = new THREE.PlaneGeometry(20, 20, 32, 32);
      const pos = planeGeo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
          const x = pos.getX(i);
          const y = pos.getY(i); // Note: plane is rotated later, so this is local Y
          // Valley curve: higher at sides (x), sloping along length (y)
          let z = Math.pow(x * 0.3, 2) + (y + 10) * 0.1; 
          // Add noise
          z += Math.random() * 0.5;
          pos.setZ(i, z);
      }
      planeGeo.computeVertexNormals();
      disposables.push(planeGeo);
      const terrainMat = new THREE.MeshStandardMaterial({ 
          color: 0x3f3f46, 
          roughness: 0.9,
          wireframe: true,
          transparent: true,
          opacity: 0.3
      });
      disposables.push(terrainMat);
      const terrain = new THREE.Mesh(planeGeo, terrainMat);
      terrain.rotation.x = -Math.PI / 2;
      basinGroup.add(terrain);

      // Rising Water Plane
      const waterGeo = new THREE.PlaneGeometry(20, 20, 16, 16);
      disposables.push(waterGeo);
      const waterMat = new THREE.MeshStandardMaterial({ 
          color: 0x3b82f6, 
          transparent: true, 
          opacity: 0.7, 
          roughness: 0.1,
          metalness: 0.5 
      });
      disposables.push(waterMat);
      const water = new THREE.Mesh(waterGeo, waterMat);
      water.rotation.x = -Math.PI / 2;
      water.position.y = -2; // Start low
      basinGroup.add(water);
      animatables.floodWater = water;

      // Heavy Rain
      const rainCount = 2000;
      const rainGeo = new THREE.BufferGeometry();
      const rainPos = new Float32Array(rainCount * 3);
      for(let i=0; i<rainCount; i++) {
          rainPos[i*3] = (Math.random() - 0.5) * 18;
          rainPos[i*3+1] = Math.random() * 10;
          rainPos[i*3+2] = (Math.random() - 0.5) * 18;
      }
      rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));
      const rainMat = new THREE.PointsMaterial({ color: 0xc7d2fe, size: 0.08, transparent: true, opacity: 0.6 });
      disposables.push(rainMat, rainGeo);
      const rain = new THREE.Points(rainGeo, rainMat);
      basinGroup.add(rain);
      animatables.rain = rain;

      // Clouds (Simple spheres)
      const cloudGroup = new THREE.Group();
      const cloudGeo = new THREE.DodecahedronGeometry(1, 0);
      disposables.push(cloudGeo);
      const cloudMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.5, transparent: true, opacity: 0.8 });
      disposables.push(cloudMat);
      for(let i=0; i<5; i++) {
          const cloud = new THREE.Mesh(cloudGeo, cloudMat);
          cloud.position.set((Math.random()-0.5)*10, 6 + Math.random(), (Math.random()-0.5)*10);
          cloud.scale.set(2, 1, 1.5);
          cloudGroup.add(cloud);
      }
      basinGroup.add(cloudGroup);

  } else if (type === 'cascade-river') {
      const cascadeGroup = new THREE.Group();
      group.add(cascadeGroup);

      // Define steps
      const steps = [
          { y: 3, x: -6, w: 4 },
          { y: 1.5, x: -2, w: 4 },
          { y: 0, x: 2, w: 4 },
          { y: -1.5, x: 6, w: 4 }
      ];

      const stepGeo = new THREE.BoxGeometry(1, 1.5, 6);
      disposables.push(stepGeo);
      const waterGeo = new THREE.BoxGeometry(4, 1, 6);
      disposables.push(waterGeo);
      const terrainGeo = new THREE.BoxGeometry(4, 4, 2);
      disposables.push(terrainGeo);
      
      const damMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.8 });
      const waterMat = new THREE.MeshStandardMaterial({ 
          color: 0x0ea5e9, 
          transparent: true, 
          opacity: 0.6,
          roughness: 0.1
      });
      const terrainMat = new THREE.MeshStandardMaterial({ color: 0x475569 });
      disposables.push(damMat, waterMat, terrainMat);

      steps.forEach((step, i) => {
          // Dam Body
          const dam = new THREE.Mesh(stepGeo, damMat);
          dam.position.set(step.x + 1.5, step.y + 0.75, 0); 
          cascadeGroup.add(dam);

          // Water Reservoir
          const water = new THREE.Mesh(waterGeo, waterMat);
          water.position.set(step.x - 0.5, step.y + 0.5, 0);
          cascadeGroup.add(water);

          // Terrain Sides
          const t1 = new THREE.Mesh(terrainGeo, terrainMat);
          t1.position.set(step.x, step.y - 1, -4);
          cascadeGroup.add(t1);
          const t2 = new THREE.Mesh(terrainGeo, terrainMat);
          t2.position.set(step.x, step.y - 1, 4);
          cascadeGroup.add(t2);
      });

      // Flow Particles
      const particleCount = 500;
      const pGeo = new THREE.BufferGeometry();
      const pPos = new Float32Array(particleCount * 3);
      
      for(let i=0; i<particleCount; i++) {
          pPos[i*3] = (Math.random() - 0.5) * 16; // x along river
          pPos[i*3+1] = 5; // y start high
          pPos[i*3+2] = (Math.random() - 0.5) * 5; // z width
      }
      
      pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
      const pMat = new THREE.PointsMaterial({ color: 0xbae6fd, size: 0.1 });
      disposables.push(pGeo, pMat);
      const flow = new THREE.Points(pGeo, pMat);
      cascadeGroup.add(flow);
      animatables.riverFlow = flow;

  } else if (type === 'mining-rescue') {
      const rescueGroup = new THREE.Group();
      group.add(rescueGroup);

      // Tunnel Structure
      const tunnelGeo = new THREE.CylinderGeometry(2, 2, 10, 16, 1, true);
      tunnelGeo.rotateZ(Math.PI / 2);
      disposables.push(tunnelGeo);
      const tunnelMat = new THREE.MeshBasicMaterial({ color: 0x334155, wireframe: true, transparent: true, opacity: 0.2 });
      disposables.push(tunnelMat);
      const tunnel = new THREE.Mesh(tunnelGeo, tunnelMat);
      rescueGroup.add(tunnel);

      // Debris / Blockage
      const debrisGroup = new THREE.Group();
      debrisGroup.position.set(0, -1, 0);
      const rockGeo = new THREE.DodecahedronGeometry(0.5, 0);
      disposables.push(rockGeo);
      const rockMat = new THREE.MeshStandardMaterial({ color: 0x44403c, roughness: 0.8 });
      disposables.push(rockMat);

      for(let i=0; i<50; i++) {
          const rock = new THREE.Mesh(rockGeo, rockMat);
          rock.position.set(
              (Math.random() - 0.5) * 3,
              (Math.random() - 0.5) * 2,
              (Math.random() - 0.5) * 3
          );
          rock.scale.setScalar(0.5 + Math.random());
          rock.rotation.set(Math.random(), Math.random(), Math.random());
          debrisGroup.add(rock);
      }
      rescueGroup.add(debrisGroup);

      // Rescue Drill (Approaching from top)
      const drillGroup = new THREE.Group();
      drillGroup.position.set(0, 4, 0); // Start high
      const drillShaftGeo = new THREE.CylinderGeometry(0.3, 0.3, 4, 16);
      const drillBitGeo = new THREE.ConeGeometry(0.4, 0.8, 16);
      drillBitGeo.translate(0, -2.4, 0);
      disposables.push(drillShaftGeo, drillBitGeo);
      const drillMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, metalness: 0.5 });
      disposables.push(drillMat);
      const drillShaft = new THREE.Mesh(drillShaftGeo, drillMat);
      const drillBit = new THREE.Mesh(drillBitGeo, drillMat);
      drillGroup.add(drillShaft);
      drillGroup.add(drillBit);
      rescueGroup.add(drillGroup);
      animatables.rescueDrill = drillGroup;

      // Trapped Personnel Zone (Under debris)
      const zoneGeo = new THREE.SphereGeometry(1.5, 32, 16);
      zoneGeo.scale(1, 0.5, 1);
      disposables.push(zoneGeo);
      const zoneMat = new THREE.MeshBasicMaterial({ color: 0xef4444, wireframe: true, transparent: true, opacity: 0.3 });
      disposables.push(zoneMat);
      const safeZone = new THREE.Mesh(zoneGeo, zoneMat);
      safeZone.position.set(0, -2, 0);
      rescueGroup.add(safeZone);

      // Pulse Light for Life Sign
      const lifeLight = new THREE.PointLight(0xff0000, 1, 5);
      lifeLight.position.set(0, -2, 0);
      rescueGroup.add(lifeLight);
      animatables.trappedPulse = lifeLight;

  } else if (type === 'mining-eco') {
      const ecoGroup = new THREE.Group();
      group.add(ecoGroup);

      // Terrain: Blend of Rock (Mined) and Grass (Restored)
      const planeGeo = new THREE.PlaneGeometry(16, 16, 32, 32);
      const pos = planeGeo.attributes.position;
      const colors = [];
      const colorRock = new THREE.Color(0x57534e);
      const colorGrass = new THREE.Color(0x4ade80);

      for (let i = 0; i < pos.count; i++) {
          const x = pos.getX(i);
          const y = pos.getY(i);
          // Height noise
          let z = Math.sin(x * 0.5) * Math.cos(y * 0.5) * 1.5;
          if (x > 0) { // Restored side (smoother)
              z = z * 0.5 + 0.5;
          } else { // Mined side (rougher)
              z += Math.random() * 0.5;
          }
          pos.setZ(i, z);

          // Vertex Colors
          if (x > -1) {
              colors.push(colorGrass.r, colorGrass.g, colorGrass.b);
          } else {
              colors.push(colorRock.r, colorRock.g, colorRock.b);
          }
      }
      planeGeo.computeVertexNormals();
      planeGeo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
      
      const terrainMat = new THREE.MeshStandardMaterial({ 
          vertexColors: true, 
          roughness: 0.8,
          metalness: 0.1,
          flatShading: true
      });
      disposables.push(planeGeo, terrainMat);
      const terrain = new THREE.Mesh(planeGeo, terrainMat);
      terrain.rotation.x = -Math.PI / 2;
      ecoGroup.add(terrain);

      // Water Lake (in the middle)
      const lakeGeo = new THREE.CircleGeometry(3, 32);
      disposables.push(lakeGeo);
      const lakeMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.1, transparent: true, opacity: 0.8 });
      disposables.push(lakeMat);
      const lake = new THREE.Mesh(lakeGeo, lakeMat);
      lake.rotation.x = -Math.PI / 2;
      lake.position.y = 0.2;
      lake.position.x = 2;
      ecoGroup.add(lake);

      // Trees (Low Poly Cones) on the green side
      const treeGroup = new THREE.Group();
      const trunkGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.5);
      const leavesGeo = new THREE.ConeGeometry(0.4, 1, 8);
      disposables.push(trunkGeo, leavesGeo);
      const trunkMat = new THREE.MeshStandardMaterial({ color: 0x78350f });
      const leavesMat = new THREE.MeshStandardMaterial({ color: 0x16a34a });
      disposables.push(trunkMat, leavesMat);
      
      for(let i=0; i<40; i++) {
          const x = Math.random() * 6 + 1;
          const z = (Math.random() - 0.5) * 14;
          const h = Math.sin(x * 0.5) * Math.cos(z * 0.5) * 0.75 + 0.5; 
          
          const tree = new THREE.Group();
          const trunk = new THREE.Mesh(trunkGeo, trunkMat);
          const leaves = new THREE.Mesh(leavesGeo, leavesMat);
          leaves.position.y = 0.75;
          tree.add(trunk);
          tree.add(leaves);
          tree.position.set(x, h, z);
          // Random scale
          const s = 0.5 + Math.random() * 0.5;
          tree.scale.set(s, s, s);
          treeGroup.add(tree);
      }
      ecoGroup.add(treeGroup);
      animatables.trees = treeGroup; 

      // Birds (Particles)
      const birdCount = 20;
      const birdGeo = new THREE.BufferGeometry();
      const birdPos = new Float32Array(birdCount * 3);
      for(let i=0; i<birdCount; i++) {
          birdPos[i*3] = (Math.random() - 0.5) * 10;
          birdPos[i*3+1] = 4 + Math.random() * 2;
          birdPos[i*3+2] = (Math.random() - 0.5) * 10;
      }
      birdGeo.setAttribute('position', new THREE.BufferAttribute(birdPos, 3));
      const birdMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.15 });
      disposables.push(birdGeo, birdMat);
      const birds = new THREE.Points(birdGeo, birdMat);
      ecoGroup.add(birds);
      animatables.birds = new THREE.Group(); // Placeholder wrapper
      animatables.particles = birds; // Reuse particle logic

      // Solar Panels
      const panelGeo = new THREE.BoxGeometry(1, 0.1, 0.6);
      disposables.push(panelGeo);
      const panelMat = new THREE.MeshStandardMaterial({ color: 0x1e40af, roughness: 0.2 });
      disposables.push(panelMat);
      for(let i=0; i<5; i++) {
          const panel = new THREE.Mesh(panelGeo, panelMat);
          panel.position.set(5, 1, -5 + i * 1.5);
          panel.rotation.x = -0.5;
          ecoGroup.add(panel);
      }

  } else if (type === 'dam') {
      const damGroup = new THREE.Group();
      group.add(damGroup);
      const damGeo = new THREE.CylinderGeometry(3, 6, 4, 4, 1, false);
      damGeo.translate(0, 2, 0); 
      damGeo.rotateY(Math.PI / 4); 
      disposables.push(damGeo);
      const damMat = new THREE.MeshStandardMaterial({ color: 0x57534e, roughness: 0.9, metalness: 0.1, flatShading: true });
      disposables.push(damMat);
      const dam = new THREE.Mesh(damGeo, damMat);
      dam.scale.set(1, 1, 2); 
      damGroup.add(dam);
      const damWire = new THREE.Mesh(damGeo, new THREE.MeshBasicMaterial({ color: 0xa8a29e, wireframe: true, transparent: true, opacity: 0.1 }));
      damWire.scale.set(1.01, 1.01, 2.01);
      damGroup.add(damWire);
      const waterGeo = new THREE.BoxGeometry(12, 3, 8);
      waterGeo.translate(0, 1.5, -4); 
      disposables.push(waterGeo);
      const waterMat = new THREE.MeshStandardMaterial({ color: 0x0ea5e9, transparent: true, opacity: 0.6, roughness: 0.1 });
      disposables.push(waterMat);
      const water = new THREE.Mesh(waterGeo, waterMat);
      damGroup.add(water);
      animatables.damWater = water;
      const rainCount = 1000;
      const rainGeo = new THREE.BufferGeometry();
      const rainPos = new Float32Array(rainCount * 3);
      for(let i=0; i<rainCount; i++) {
          rainPos[i*3] = (Math.random() - 0.5) * 15;
          rainPos[i*3+1] = Math.random() * 10 + 2;
          rainPos[i*3+2] = (Math.random() - 0.5) * 15;
      }
      rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));
      const rainMat = new THREE.PointsMaterial({ color: 0xbae6fd, size: 0.05, transparent: true, opacity: 0.6 });
      disposables.push(rainGeo, rainMat);
      const rain = new THREE.Points(rainGeo, rainMat);
      damGroup.add(rain);
      animatables.rain = rain;
      const markerGeo = new THREE.SphereGeometry(0.1, 8, 8);
      disposables.push(markerGeo);
      const markerMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 }); 
      disposables.push(markerMat);
      [{x: 1, y: 3, z: 1}, {x: -1, y: 2.5, z: 1.5}, {x: 0, y: 1.5, z: 2.5}].forEach(pos => {
          const m = new THREE.Mesh(markerGeo, markerMat);
          m.position.set(pos.x, pos.y, pos.z);
          damGroup.add(m);
      });
  } else if (type === 'mine-tunnel') {
      const tunnelGroup = new THREE.Group();
      group.add(tunnelGroup);
      const levels = [-2, 0, 2];
      const tunnelMat = new THREE.MeshBasicMaterial({ color: 0x334155, wireframe: true, transparent: true, opacity: 0.1 });
      disposables.push(tunnelMat);
      const floorMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 });
      disposables.push(floorMat);
      levels.forEach((y, idx) => {
          const mainTunnelGeo = new THREE.CylinderGeometry(1, 1, 12, 16, 1, true);
          mainTunnelGeo.rotateZ(Math.PI / 2);
          mainTunnelGeo.translate(0, y, 0);
          disposables.push(mainTunnelGeo);
          const mainTunnel = new THREE.Mesh(mainTunnelGeo, tunnelMat);
          tunnelGroup.add(mainTunnel);
          const floorGeo = new THREE.BoxGeometry(12, 0.1, 1.5);
          floorGeo.translate(0, y - 0.8, 0);
          disposables.push(floorGeo);
          const floor = new THREE.Mesh(floorGeo, floorMat);
          tunnelGroup.add(floor);
          [-3, 0, 3].forEach(x => {
              const crossGeo = new THREE.CylinderGeometry(0.8, 0.8, 6, 16, 1, true);
              crossGeo.rotateX(Math.PI / 2);
              crossGeo.translate(x, y, 0);
              disposables.push(crossGeo);
              const crossTunnel = new THREE.Mesh(crossGeo, tunnelMat);
              tunnelGroup.add(crossTunnel);
          });
      });
      const shaftGeo = new THREE.CylinderGeometry(1.5, 1.5, 8, 32, 4, true);
      disposables.push(shaftGeo);
      const shaft = new THREE.Mesh(shaftGeo, new THREE.MeshBasicMaterial({ color: 0x10b981, wireframe: true, transparent: true, opacity: 0.2 }));
      shaft.position.x = -5;
      tunnelGroup.add(shaft);
      const minerCount = 30;
      const minerGeo = new THREE.BufferGeometry();
      const minerPos = new Float32Array(minerCount * 3);
      for(let i=0; i<minerCount; i++) {
          const lvl = levels[Math.floor(Math.random() * levels.length)];
          minerPos[i*3] = (Math.random() - 0.5) * 10;
          minerPos[i*3+1] = lvl - 0.5;
          minerPos[i*3+2] = (Math.random() - 0.5) * 1; 
      }
      minerGeo.setAttribute('position', new THREE.BufferAttribute(minerPos, 3));
      const minerMat = new THREE.PointsMaterial({ color: 0xfacc15, size: 0.15 }); 
      disposables.push(minerGeo, minerMat);
      const miners = new THREE.Points(minerGeo, minerMat);
      tunnelGroup.add(miners);
      animatables.miners = miners;
      const fans: THREE.Group[] = [];
      animatables.mineFans = fans;
      const fanMat = new THREE.MeshBasicMaterial({color: 0xef4444});
      disposables.push(fanMat);
      const fanBladeGeo = new THREE.BoxGeometry(0.1, 0.8, 0.2);
      disposables.push(fanBladeGeo);
      levels.forEach(y => {
          const fanGroup = new THREE.Group();
          fanGroup.position.set(5.5, y, 0);
          const blades = new THREE.Mesh(fanBladeGeo, fanMat);
          fanGroup.add(blades);
          const blades2 = blades.clone();
          blades2.rotation.x = Math.PI / 2;
          fanGroup.add(blades2);
          tunnelGroup.add(fanGroup);
          fans.push(fanGroup);
      });
  } else if (type === 'city-smart-water') {
      const cityGroup = new THREE.Group();
      group.add(cityGroup);
      // Abstract City Grid
      const gridHelper = new THREE.GridHelper(20, 20, 0x1e293b, 0x0f172a);
      cityGroup.add(gridHelper);
      // Buildings
      const buildGeo = new THREE.BoxGeometry(1, 1, 1);
      disposables.push(buildGeo);
      const buildMat = new THREE.MeshStandardMaterial({ color: 0x1e40af, transparent: true, opacity: 0.6 });
      disposables.push(buildMat);
      for(let i=0; i<20; i++) {
          const h = 1 + Math.random() * 3;
          const b = new THREE.Mesh(buildGeo, buildMat);
          b.position.set((Math.random()-0.5)*16, h/2, (Math.random()-0.5)*16);
          b.scale.y = h;
          cityGroup.add(b);
      }
      // Pipes (Underground)
      const pipeGeo = new THREE.CylinderGeometry(0.1, 0.1, 15);
      pipeGeo.rotateZ(Math.PI/2);
      disposables.push(pipeGeo);
      const pipeMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });
      disposables.push(pipeMat);
      const pipe = new THREE.Mesh(pipeGeo, pipeMat);
      pipe.position.y = -0.5;
      cityGroup.add(pipe);
      
      const pGeo = new THREE.BufferGeometry();
      const pPos = new Float32Array(300);
      for(let i=0; i<100; i++) {
          pPos[i*3] = (Math.random()-0.5)*15;
          pPos[i*3+1] = -0.5;
          pPos[i*3+2] = (Math.random()-0.5)*0.5;
      }
      pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
      const pMat = new THREE.PointsMaterial({color: 0x06b6d4, size: 0.2});
      disposables.push(pGeo, pMat);
      const particles = new THREE.Points(pGeo, pMat);
      cityGroup.add(particles);
      animatables.particles = particles;

  } else if (type === 'inland-waterway') {
      const waterwayGroup = new THREE.Group();
      group.add(waterwayGroup);
      
      // River
      const riverGeo = new THREE.PlaneGeometry(30, 8);
      riverGeo.rotateX(-Math.PI / 2);
      disposables.push(riverGeo);
      const riverMat = new THREE.MeshStandardMaterial({ color: 0x0ea5e9, transparent: true, opacity: 0.6 });
      disposables.push(riverMat);
      const river = new THREE.Mesh(riverGeo, riverMat);
      waterwayGroup.add(river);

      // Lock
      const lockGeo = new THREE.BoxGeometry(4, 2, 6);
      disposables.push(lockGeo);
      const lockMat = new THREE.MeshStandardMaterial({ color: 0x64748b });
      disposables.push(lockMat);
      const lock = new THREE.Mesh(lockGeo, lockMat);
      lock.position.set(0, 1, 0);
      waterwayGroup.add(lock);

      // Ships
      const shipGeo = new THREE.BoxGeometry(1, 0.5, 3);
      disposables.push(shipGeo);
      const shipMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b });
      disposables.push(shipMat);
      const ship1 = new THREE.Mesh(shipGeo, shipMat);
      ship1.position.set(-8, 0.25, 0);
      waterwayGroup.add(ship1);
      const ship2 = new THREE.Mesh(shipGeo, shipMat);
      ship2.position.set(8, 0.25, 1);
      waterwayGroup.add(ship2);
      
      animatables.shipGroup = waterwayGroup; // Reuse for simple movement
  } else if (type === 'green-port-cockpit') {
      const gpGroup = new THREE.Group();
      group.add(gpGroup);
      const ground = new THREE.Mesh(new THREE.PlaneGeometry(20,20), new THREE.MeshStandardMaterial({color: 0x1e293b}));
      ground.rotation.x = -Math.PI/2;
      gpGroup.add(ground);
      // Wind Turbines
      const turbineGeo = new THREE.CylinderGeometry(0.1, 0.2, 4);
      turbineGeo.translate(0, 2, 0);
      disposables.push(turbineGeo);
      const bladeGeo = new THREE.BoxGeometry(0.1, 2, 0.1);
      bladeGeo.translate(0, 1, 0);
      disposables.push(bladeGeo);
      const whiteMat = new THREE.MeshStandardMaterial({color:0xffffff});
      disposables.push(whiteMat);

      for(let i=0; i<3; i++) {
          const t = new THREE.Mesh(turbineGeo, whiteMat);
          t.position.set(-5, 0, -5 + i*3);
          gpGroup.add(t);
          const rotor = new THREE.Group();
          rotor.position.y = 4;
          t.add(rotor);
          for(let k=0; k<3; k++) {
              const b = new THREE.Mesh(bladeGeo, whiteMat);
              b.rotation.z = k * (Math.PI*2/3);
              rotor.add(b);
          }
      }
      
  } else if (type === 'maritime-safety-cockpit') {
      const msGroup = new THREE.Group();
      group.add(msGroup);
      // Radar Sweep
      const radarGeo = new THREE.CircleGeometry(10, 64, 0, 0.5);
      disposables.push(radarGeo);
      const radarMat = new THREE.MeshBasicMaterial({ color: 0x0ea5e9, transparent: true, opacity: 0.3, side: THREE.DoubleSide });
      disposables.push(radarMat);
      const radar = new THREE.Mesh(radarGeo, radarMat);
      radar.rotation.x = -Math.PI/2;
      msGroup.add(radar);
      animatables.radarSweep = msGroup;
      // Grid
      const grid = new THREE.PolarGridHelper(10, 16, 8, 64, 0x0c4a6e, 0x0c4a6e);
      msGroup.add(grid);
  } else if (type === 'bulk-terminal') {
      const btGroup = new THREE.Group();
      group.add(btGroup);

      // Ground (Yard)
      const yardGeo = new THREE.PlaneGeometry(30, 20);
      disposables.push(yardGeo);
      const yardMat = new THREE.MeshStandardMaterial({ color: 0x292524, roughness: 0.9 });
      disposables.push(yardMat);
      const yard = new THREE.Mesh(yardGeo, yardMat);
      yard.rotation.x = -Math.PI / 2;
      btGroup.add(yard);

      // Stockpiles (Iron Ore / Coal)
      const pilesGroup = new THREE.Group();
      btGroup.add(pilesGroup);
      const pileMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 1.0 }); // Iron ore red-brown
      disposables.push(pileMat);
      const coalMat = new THREE.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.8 }); // Coal black
      disposables.push(coalMat);

      const pileGeo = new THREE.ConeGeometry(2.5, 3, 32);
      disposables.push(pileGeo);

      for (let i = 0; i < 4; i++) {
          const isCoal = i % 2 !== 0;
          const pile = new THREE.Mesh(pileGeo, isCoal ? coalMat : pileMat);
          pile.scale.set(1, 1, 3); 
          pile.position.set(-5 + i * 4, 1.5, 0);
          pilesGroup.add(pile);
      }

      // Conveyor Belt Line
      const beltGeo = new THREE.BoxGeometry(20, 0.2, 1);
      disposables.push(beltGeo);
      const beltMat = new THREE.MeshStandardMaterial({ color: 0x4b5563 });
      disposables.push(beltMat);
      const belt = new THREE.Mesh(beltGeo, beltMat);
      belt.position.set(0, 0.5, 6);
      btGroup.add(belt);

      // Stacker-Reclaimer Machine
      const machineGroup = new THREE.Group();
      machineGroup.position.set(0, 0.6, 6);
      btGroup.add(machineGroup);

      const baseGeo = new THREE.BoxGeometry(2, 2, 2);
      disposables.push(baseGeo);
      const yellowMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b });
      disposables.push(yellowMat);
      const base = new THREE.Mesh(baseGeo, yellowMat);
      base.position.y = 1;
      machineGroup.add(base);

      // Slew Bearing & Upper Structure
      const slewGroup = new THREE.Group();
      slewGroup.position.y = 2;
      machineGroup.add(slewGroup);
      animatables.stackerArm = slewGroup;

      const boomGeo = new THREE.BoxGeometry(8, 0.8, 0.8);
      disposables.push(boomGeo);
      const boom = new THREE.Mesh(boomGeo, yellowMat);
      boom.position.set(-4, 0.5, 0);
      slewGroup.add(boom);

      // Bucket Wheel
      const wheelGroup = new THREE.Group();
      wheelGroup.position.set(-8, 0.5, 0);
      slewGroup.add(wheelGroup);
      animatables.bucketWheel = wheelGroup;

      const wheelGeo = new THREE.CylinderGeometry(1.5, 1.5, 0.5, 16);
      wheelGeo.rotateX(Math.PI / 2);
      disposables.push(wheelGeo);
      const wheelMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
      disposables.push(wheelMat);
      const wheel = new THREE.Mesh(wheelGeo, wheelMat);
      wheelGroup.add(wheel);

      // Material Flow Particles
      const pCount = 300;
      const pGeo = new THREE.BufferGeometry();
      const pPos = new Float32Array(pCount * 3);
      for(let i=0; i<pCount; i++) {
          pPos[i*3] = (Math.random() - 0.5) * 20; 
          pPos[i*3+1] = 0.7; 
          pPos[i*3+2] = (Math.random() - 0.5) * 0.8; 
      }
      pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
      const pMat = new THREE.PointsMaterial({ color: 0x3f3f46, size: 0.1 });
      disposables.push(pMat, pGeo);
      const flow = new THREE.Points(pGeo, pMat);
      belt.add(flow);
      animatables.particles = flow;
  } else if (type === 'irrigation-network') {
      const irrGroup = new THREE.Group();
      group.add(irrGroup);
      const fieldGeo = new THREE.PlaneGeometry(20, 20);
      fieldGeo.rotateX(-Math.PI/2);
      disposables.push(fieldGeo);
      const fieldMat = new THREE.MeshStandardMaterial({ color: 0x3f6212 }); // Green fields
      disposables.push(fieldMat);
      const field = new THREE.Mesh(fieldGeo, fieldMat);
      irrGroup.add(field);
      // Channels
      const channelGeo = new THREE.BoxGeometry(20, 0.1, 1);
      disposables.push(channelGeo);
      const channelMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6 });
      disposables.push(channelMat);
      const c1 = new THREE.Mesh(channelGeo, channelMat);
      c1.position.y = 0.1;
      irrGroup.add(c1);
  } else if (type === 'globe-fleet') {
      const globeGroup = new THREE.Group();
      group.add(globeGroup);
      const globeGeo = new THREE.SphereGeometry(5, 32, 32);
      disposables.push(globeGeo);
      const globeMat = new THREE.MeshBasicMaterial({ color: 0x1e3a8a, wireframe: true, transparent: true, opacity: 0.3 });
      disposables.push(globeMat);
      const globe = new THREE.Mesh(globeGeo, globeMat);
      globeGroup.add(globe);
      animatables.globeRoutes = globeGroup; // Rotate entire group

      // Particles for ships
      const pGeo = new THREE.BufferGeometry();
      const pPos = new Float32Array(300);
      for(let i=0; i<100; i++) {
          const phi = Math.random() * Math.PI;
          const theta = Math.random() * Math.PI * 2;
          const r = 5.1;
          pPos[i*3] = r * Math.sin(phi) * Math.cos(theta);
          pPos[i*3+1] = r * Math.cos(phi);
          pPos[i*3+2] = r * Math.sin(phi) * Math.sin(theta);
      }
      pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
      const pMat = new THREE.PointsMaterial({ color: 0xfacc15, size: 0.1 });
      disposables.push(pGeo, pMat);
      const ships = new THREE.Points(pGeo, pMat);
      globeGroup.add(ships);
      animatables.particles = ships;
  }
};

export const animateCockpitScene = (type: SceneType, animatables: Animatables, time: number) => {
  if (type === 'bulk-terminal') {
      if (animatables.bucketWheel) {
          animatables.bucketWheel.rotation.z -= 0.05; 
      }
      if (animatables.stackerArm) {
          animatables.stackerArm.rotation.y = Math.sin(time * 0.2) * 0.5;
      }
      if (animatables.particles) {
          const pos = animatables.particles.geometry.attributes.position.array as Float32Array;
          for(let i=0; i<pos.length; i+=3) {
              pos[i] += 0.2;
              if (pos[i] > 10) pos[i] = -10;
          }
          animatables.particles.geometry.attributes.position.needsUpdate = true;
      }
  }
  else if (type === 'pumped-storage' && animatables.pumpedFlow) {
      const particles = animatables.pumpedFlow as THREE.Points;
      const pos = particles.geometry.attributes.position.array as Float32Array;
      const t = particles.geometry.attributes.t.array as Float32Array;
      const curve = (particles as any).userData.curve as THREE.CatmullRomCurve3;
      const mode = Math.sin(time * 0.2) > 0 ? 'gen' : 'pump'; 
      const speed = 0.005;

      for(let i=0; i<t.length; i++) {
          if (mode === 'gen') {
              t[i] += speed;
              if (t[i] > 1) t[i] = 0;
          } else {
              t[i] -= speed;
              if (t[i] < 0) t[i] = 1;
          }
          const pt = curve.getPoint(t[i]);
          pos[i*3] = pt.x + (Math.random()-0.5)*0.2;
          pos[i*3+1] = pt.y + (Math.random()-0.5)*0.2;
          pos[i*3+2] = pt.z + (Math.random()-0.5)*0.2;
      }
      particles.geometry.attributes.position.needsUpdate = true;
      particles.geometry.attributes.t.needsUpdate = true;
  }
  else if (type === 'flood-basin') {
      if (animatables.floodWater) {
          animatables.floodWater.position.y = -2 + Math.sin(time * 0.1) * 1.5;
      }
      if (animatables.rain) {
          const pos = animatables.rain.geometry.attributes.position.array as Float32Array;
          for(let i=0; i<pos.length; i+=3) {
              pos[i+1] -= 0.4;
              if (pos[i+1] < 0) {
                  pos[i+1] = 10 + Math.random() * 2;
                  pos[i] = (Math.random() - 0.5) * 18;
                  pos[i+2] = (Math.random() - 0.5) * 18;
              }
          }
          animatables.rain.geometry.attributes.position.needsUpdate = true;
      }
  }
  else if (type === 'mine-tunnel') {
      if (animatables.miners) {
          const pos = animatables.miners.geometry.attributes.position.array as Float32Array;
          for(let i=0; i<pos.length; i+=3) {
              pos[i] += (Math.random() - 0.5) * 0.05;
              if (pos[i] > 5) pos[i] = -5;
              if (pos[i] < -5) pos[i] = 5;
          }
          animatables.miners.geometry.attributes.position.needsUpdate = true;
      }
      if (animatables.mineFans) {
          animatables.mineFans.forEach(fan => {
              fan.rotation.x += 0.5;
          });
      }
  }
  else if (type === 'dam') {
      if (animatables.damWater) {
          animatables.damWater.position.y = 1.5 + Math.sin(time * 0.5) * 0.05;
      }
      if (animatables.rain) {
          const pos = animatables.rain.geometry.attributes.position.array as Float32Array;
          for(let i=0; i<pos.length; i+=3) {
              pos[i+1] -= 0.3; 
              if (pos[i+1] < 0) {
                  pos[i+1] = 10 + Math.random() * 2;
                  pos[i] = (Math.random() - 0.5) * 15;
                  pos[i+2] = (Math.random() - 0.5) * 15;
              }
          }
          animatables.rain.geometry.attributes.position.needsUpdate = true;
      }
  }
  else if (type === 'mining-eco') {
      if (animatables.particles) {
          const pos = animatables.particles.geometry.attributes.position.array as Float32Array;
          if(pos) {
              for(let i=0; i<pos.length; i+=3) {
                  pos[i] += Math.sin(time + i) * 0.05;
                  pos[i+2] += Math.cos(time + i) * 0.05;
                  if(Math.abs(pos[i]) > 10) pos[i] *= -0.9;
                  if(Math.abs(pos[i+2]) > 10) pos[i+2] *= -0.9;
              }
              animatables.particles.geometry.attributes.position.needsUpdate = true;
          }
      }
  }
  else if (type === 'mining-rescue') {
      if (animatables.rescueDrill) {
          animatables.rescueDrill.rotation.y += 0.2;
          if (animatables.rescueDrill.position.y > -1) {
              animatables.rescueDrill.position.y -= 0.005;
          }
      }
      if (animatables.trappedPulse) {
          animatables.trappedPulse.intensity = 1 + Math.sin(time * 5) * 0.5;
      }
  }
  else if (type === 'cascade-river' && animatables.riverFlow) {
      const pos = animatables.riverFlow.geometry.attributes.position.array as Float32Array;
      for(let i=0; i<pos.length; i+=3) {
          pos[i] += 0.1; 
          if (pos[i] > 10) {
              pos[i] = -10;
              pos[i+1] = 5; 
          }
          if (pos[i] > -6 && pos[i] < -2) pos[i+1] = 3;
          else if (pos[i] > -2 && pos[i] < 2) pos[i+1] = 1.5;
          else if (pos[i] > 2 && pos[i] < 6) pos[i+1] = 0;
          else if (pos[i] > 6) pos[i+1] = -1.5;
      }
      animatables.riverFlow.geometry.attributes.position.needsUpdate = true;
  }
  else if (type === 'city-smart-water' && animatables.particles) {
      animatables.particles.rotation.y += 0.005;
  }
  else if (type === 'globe-fleet' && animatables.globeRoutes) {
      animatables.globeRoutes.rotation.y += 0.002;
  }
  else if (type === 'inland-waterway' && animatables.shipGroup) {
      animatables.shipGroup.children.forEach((child, idx) => {
          if (child instanceof THREE.Mesh) {
              child.position.x += 0.02 * (idx === 0 ? 1 : -1);
              if (child.position.x > 15) child.position.x = -15;
              if (child.position.x < -15) child.position.x = 15;
          }
      });
  }
  else if (type === 'maritime-safety-cockpit' && animatables.radarSweep) {
      animatables.radarSweep.rotation.y -= 0.05;
  }
};
