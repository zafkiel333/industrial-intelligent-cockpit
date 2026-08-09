
import * as THREE from 'three';
import { SimAnimatables } from './three-types';

export const initMineWaterScene = (
  group: THREE.Group,
  animatables: SimAnimatables,
  disposables: { dispose: () => void }[]
) => {
  // 1. Environment & Lighting
  const ambient = new THREE.AmbientLight(0xffffff, 0.4);
  group.add(ambient);
  
  const spotLight = new THREE.SpotLight(0x06b6d4, 2, 50, 0.5, 0.5, 1);
  spotLight.position.set(10, 20, 10);
  spotLight.lookAt(0, 0, 0);
  group.add(spotLight);
  
  const alarmLight = new THREE.PointLight(0xff0000, 0, 30);
  alarmLight.position.set(0, 10, 0);
  group.add(alarmLight);
  (group as any).userData.alarmLight = alarmLight;

  // 2. Sump & Pump Room Structure
  const roomGeo = new THREE.BoxGeometry(30, 15, 20);
  // Cutout inside? Just use planes for floor/walls
  
  // Floor (Pump Room Level)
  const floorGeo = new THREE.PlaneGeometry(30, 20);
  floorGeo.rotateX(-Math.PI / 2);
  const floorMat = new THREE.MeshStandardMaterial({ 
      color: 0x1e293b, 
      roughness: 0.8,
      metalness: 0.2
  });
  disposables.push(floorGeo, floorMat);
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.position.y = 0;
  group.add(floor);
  animatables.pumpRoomFloor = floor;

  // Sump Pit (Lower level)
  const pitGeo = new THREE.BoxGeometry(28, 8, 18);
  pitGeo.translate(0, 4, 0); // Origin at bottom
  const pitMat = new THREE.MeshBasicMaterial({ color: 0x0f172a, wireframe: true, transparent: true, opacity: 0.2 });
  disposables.push(pitGeo, pitMat);
  const pit = new THREE.Mesh(pitGeo, pitMat);
  pit.position.y = -8;
  group.add(pit);

  // 3. Water Body (Dynamic Volume)
  const waterGeo = new THREE.BoxGeometry(28, 1, 18);
  waterGeo.translate(0, 0.5, 0); // Pivot at bottom
  const waterMat = new THREE.MeshPhysicalMaterial({ 
      color: 0x06b6d4, 
      transparent: true, 
      opacity: 0.6,
      roughness: 0.1,
      metalness: 0.1,
      transmission: 0.5,
      thickness: 1.0
  });
  disposables.push(waterGeo, waterMat);
  const water = new THREE.Mesh(waterGeo, waterMat);
  water.position.y = -8; // Bottom of pit
  group.add(water);
  animatables.sumpWater = water;

  // 4. Pumps (Vertical Turbine Pumps)
  animatables.waterPumps = [];
  const pumpPositions = [-8, -3, 3, 8];
  
  const motorGeo = new THREE.CylinderGeometry(0.8, 0.8, 2, 32);
  const shaftGeo = new THREE.CylinderGeometry(0.3, 0.3, 8, 16);
  const bellGeo = new THREE.ConeGeometry(1, 1, 32, 1, true);
  
  const pumpMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.6, roughness: 0.4 });
  const activeMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, emissive: 0x00ff00, emissiveIntensity: 0.2 });
  
  disposables.push(motorGeo, shaftGeo, bellGeo, pumpMat, activeMat);

  pumpPositions.forEach((x, i) => {
      const pGroup = new THREE.Group();
      pGroup.position.set(x, 0, -5); // Along back wall

      // Motor (Above floor)
      const motor = new THREE.Mesh(motorGeo, pumpMat);
      motor.position.y = 1;
      pGroup.add(motor);

      // Shaft (Extending down)
      const shaft = new THREE.Mesh(shaftGeo, pumpMat);
      shaft.position.y = -4; 
      pGroup.add(shaft);

      // Suction Bell
      const bell = new THREE.Mesh(bellGeo, pumpMat);
      bell.position.y = -8;
      pGroup.add(bell);

      group.add(pGroup);
      
      // Store reference
      pGroup.userData = { id: i, active: false };
      animatables.waterPumps?.push(pGroup);
  });

  // 5. Pipeline System (Transparent tubes with particles)
  const pipeGroup = new THREE.Group();
  animatables.waterPipes = pipeGroup;
  
  const pipeMat = new THREE.MeshPhysicalMaterial({ 
      color: 0x64748b, 
      transparent: true, 
      opacity: 0.3, 
      side: THREE.DoubleSide,
      metalness: 0.8,
      roughness: 0.2
  });
  disposables.push(pipeMat);

  // Main Header
  const headerGeo = new THREE.CylinderGeometry(1, 1, 20, 32);
  headerGeo.rotateZ(Math.PI / 2);
  disposables.push(headerGeo);
  const header = new THREE.Mesh(headerGeo, pipeMat);
  header.position.set(0, 2, -5);
  pipeGroup.add(header);

  // Risers from pumps
  const riserGeo = new THREE.CylinderGeometry(0.4, 0.4, 2);
  disposables.push(riserGeo);
  pumpPositions.forEach(x => {
      const riser = new THREE.Mesh(riserGeo, pipeMat);
      riser.position.set(x, 1, -5);
      pipeGroup.add(riser);
  });

  // Vertical Discharge to Surface
  const dischargeGeo = new THREE.CylinderGeometry(1.2, 1.2, 15);
  disposables.push(dischargeGeo);
  const discharge = new THREE.Mesh(dischargeGeo, pipeMat);
  discharge.position.set(10, 9.5, -5); // Going up
  pipeGroup.add(discharge);

  group.add(pipeGroup);

  // 6. Flow Particles
  const pCount = 500;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(pCount * 3);
  const pData = new Float32Array(pCount); // phase
  
  for(let i=0; i<pCount; i++) {
      pPos[i*3] = (Math.random()-0.5) * 20; // Inside header
      pPos[i*3+1] = 2;
      pPos[i*3+2] = -5;
      pData[i] = Math.random();
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  pGeo.setAttribute('phase', new THREE.BufferAttribute(pData, 1));
  
  const pMat = new THREE.PointsMaterial({ color: 0x06b6d4, size: 0.15, transparent: true, opacity: 0 });
  disposables.push(pGeo, pMat);
  const particles = new THREE.Points(pGeo, pMat);
  group.add(particles);
  animatables.waterParticles = particles;
};

export const animateMineWaterScene = (animatables: SimAnimatables, time: number, simData: any) => {
    // simData: { waterLevel: 0-8 (m), pumpsActive: [bool, bool, bool, bool], inflowRate: number }
    const level = simData?.waterLevel || 2;
    const pumps = simData?.pumpsActive || [false, false, false, false];
    
    // 1. Water Level
    if (animatables.sumpWater) {
        // Lerp scale/pos
        const currentScale = animatables.sumpWater.scale.y;
        const targetScale = Math.max(0.1, level); // Height in meters
        
        animatables.sumpWater.scale.y = THREE.MathUtils.lerp(currentScale, targetScale, 0.05);
        // Base is at -8. Center is at -8 + scale/2
        animatables.sumpWater.position.y = -8 + (animatables.sumpWater.scale.y / 2);
        
        // Color Change on High Level
        const mat = animatables.sumpWater.material as THREE.MeshPhysicalMaterial;
        if (level > 6) {
            mat.color.setHex(0xef4444); // Red Alarm
            mat.emissive.setHex(0x550000);
        } else {
            mat.color.setHex(0x06b6d4); // Blue
            mat.emissive.setHex(0x000000);
        }
    }

    // 2. Pump Animation
    if (animatables.waterPumps) {
        animatables.waterPumps.forEach((grp, i) => {
            const isActive = pumps[i];
            const motor = grp.children[0] as THREE.Mesh;
            const shaft = grp.children[1] as THREE.Mesh;
            
            // Visual Active State
            const mat = motor.material as THREE.MeshStandardMaterial;
            if (isActive) {
                mat.emissive.setHex(0x00ff00);
                // Vibrate/Rotate shaft illusion
                shaft.rotation.y += 0.5;
            } else {
                mat.emissive.setHex(0x000000);
            }
        });
    }

    // 3. Flow Particles
    if (animatables.waterParticles) {
        const positions = animatables.waterParticles.geometry.attributes.position.array as Float32Array;
        const phases = animatables.waterParticles.geometry.attributes.phase.array as Float32Array;
        const anyPumpActive = pumps.some((p: boolean) => p);
        
        const mat = animatables.waterParticles.material as THREE.PointsMaterial;
        mat.opacity = anyPumpActive ? 0.8 : 0;

        if (anyPumpActive) {
            for(let i=0; i<phases.length; i++) {
                phases[i] += 0.02;
                if(phases[i] > 1) phases[i] = 0;
                
                // Path: Pumps -> Header -> Discharge
                const t = phases[i];
                if (t < 0.7) {
                    // Header Flow (Left to Right towards discharge)
                    positions[i*3] = -10 + (t/0.7) * 20; 
                    positions[i*3+1] = 2 + Math.sin(time*20 + i)*0.1;
                    positions[i*3+2] = -5;
                } else {
                    // Discharge Up
                    const subT = (t - 0.7) / 0.3;
                    positions[i*3] = 10;
                    positions[i*3+1] = 2 + subT * 15;
                    positions[i*3+2] = -5;
                }
            }
            animatables.waterParticles.geometry.attributes.position.needsUpdate = true;
        }
    }
};
