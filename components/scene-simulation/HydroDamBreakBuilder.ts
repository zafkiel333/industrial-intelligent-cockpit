
import * as THREE from 'three';
import { SimAnimatables } from './three-types';

export const initHydroDamBreakScene = (
  group: THREE.Group,
  animatables: SimAnimatables,
  disposables: { dispose: () => void }[]
) => {
  // 1. Lighting (Dramatic, Stormy)
  const ambient = new THREE.AmbientLight(0x444444, 0.5);
  group.add(ambient);
  const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
  dirLight.position.set(-50, 50, 50);
  group.add(dirLight);
  const redAlertLight = new THREE.PointLight(0xff0000, 0, 100);
  redAlertLight.position.set(0, 30, 0);
  group.add(redAlertLight);
  (group as any).userData.alertLight = redAlertLight;

  // 2. Terrain (Deep Valley)
  const terrainGeo = new THREE.PlaneGeometry(100, 100, 64, 64);
  const pos = terrainGeo.attributes.position;
  
  for(let i=0; i<pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i); // World Z
      
      // River channel along Z
      let h = Math.abs(x) * 1.5; // V-shape valley
      // Add noise
      h += Math.random() * 2;
      
      // Flatten river bed
      if (Math.abs(x) < 10) h = -5 + Math.random();
      
      // Slope down downstream (Z > 0)
      h -= y * 0.2;

      pos.setZ(i, h);
  }
  terrainGeo.computeVertexNormals();
  terrainGeo.rotateX(-Math.PI / 2);
  
  const terrainMat = new THREE.MeshStandardMaterial({ 
      color: 0x27272a, // Dark rock
      roughness: 1.0,
      metalness: 0.1,
      flatShading: true
  });
  disposables.push(terrainGeo, terrainMat);
  const terrain = new THREE.Mesh(terrainGeo, terrainMat);
  group.add(terrain);

  // 3. High Dam (Arch Dam)
  const damGroup = new THREE.Group();
  damGroup.position.set(0, 0, -10); // Dam location
  group.add(damGroup);
  animatables.hdbDamBody = damGroup;

  const archShape = new THREE.Shape();
  archShape.absarc(0, 0, 30, Math.PI * 0.2, Math.PI * 0.8, false);
  const holePath = new THREE.Path();
  holePath.absarc(0, 0, 25, Math.PI * 0.2, Math.PI * 0.8, false);
  archShape.holes.push(holePath);

  const extrudeSettings = { depth: 30, bevelEnabled: false, curveSegments: 32 };
  const damGeo = new THREE.ExtrudeGeometry(archShape, extrudeSettings);
  damGeo.rotateX(-Math.PI / 2);
  damGeo.translate(0, 30, 0); // Lift up
  // The shape creates a flat arc on XZ plane. We need it vertical.
  // Actually simpler to use Cylinder segment
  
  // Re-do Dam as Cylinder segments
  const damMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.6 });
  disposables.push(damMat);
  
  // Left Wing
  const leftWing = new THREE.Mesh(new THREE.CylinderGeometry(30, 30, 30, 32, 1, true, Math.PI*1.2, 0.5), damMat);
  leftWing.position.set(0, 10, 0);
  damGroup.add(leftWing);
  disposables.push(leftWing.geometry);

  // Right Wing
  const rightWing = new THREE.Mesh(new THREE.CylinderGeometry(30, 30, 30, 32, 1, true, Math.PI*1.7, 0.5), damMat);
  rightWing.position.set(0, 10, 0);
  damGroup.add(rightWing);
  disposables.push(rightWing.geometry);

  // Breach Part (Center - Dynamic)
  const breachPart = new THREE.Mesh(new THREE.CylinderGeometry(30, 30, 30, 32, 1, true, Math.PI*1.45, 0.25), damMat);
  breachPart.position.set(0, 10, 0);
  damGroup.add(breachPart);
  disposables.push(breachPart.geometry);
  animatables.hdbBreachPart = breachPart as unknown as THREE.Group; // Treating mesh as group for transform

  // 4. Upstream Water
  const upWaterGeo = new THREE.PlaneGeometry(60, 40);
  upWaterGeo.rotateX(-Math.PI/2);
  const waterMat = new THREE.MeshPhysicalMaterial({ 
      color: 0x1e3a8a, 
      transparent: true, 
      opacity: 0.9, 
      roughness: 0.1, 
      metalness: 0.1 
  });
  disposables.push(upWaterGeo, waterMat);
  const upWater = new THREE.Mesh(upWaterGeo, waterMat);
  upWater.position.set(0, 20, -35);
  group.add(upWater);
  animatables.hdbUpWater = upWater;

  // 5. Flood Wave (Downstream - Initially Hidden/Small)
  const waveGeo = new THREE.PlaneGeometry(20, 60, 32, 64);
  waveGeo.rotateX(-Math.PI / 2);
  // Deform to look turbulent
  const wPos = waveGeo.attributes.position;
  for(let i=0; i<wPos.count; i++) {
     wPos.setZ(i, Math.random() * 2);
  }
  waveGeo.computeVertexNormals();
  
  const waveMat = new THREE.MeshStandardMaterial({ 
      color: 0x7f4f2f, // Muddy
      roughness: 0.4,
      metalness: 0.3,
      transparent: true,
      opacity: 0
  });
  disposables.push(waveGeo, waveMat);
  const floodWave = new THREE.Mesh(waveGeo, waveMat);
  floodWave.position.set(0, -5, 20); // Downstream
  group.add(floodWave);
  animatables.hdbFloodWave = floodWave;

  // 6. Debris (Particles)
  const pCount = 1000;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(pCount * 3);
  const pVel = new Float32Array(pCount * 3);
  const pLife = new Float32Array(pCount);
  
  for(let i=0; i<pCount; i++) {
     pPos[i*3] = 0; pPos[i*3+1] = -100; pPos[i*3+2] = 0; 
     pLife[i] = 0;
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  pGeo.setAttribute('velocity', new THREE.BufferAttribute(pVel, 3));
  pGeo.setAttribute('life', new THREE.BufferAttribute(pLife, 1));
  
  const pMat = new THREE.PointsMaterial({ color: 0x9ca3af, size: 0.5 });
  disposables.push(pGeo, pMat);
  const debris = new THREE.Points(pGeo, pMat);
  group.add(debris);
  animatables.hdbDebris = debris;

  // 7. Houses / Towns
  animatables.hdbHouses = [];
  animatables.hdbWarningZones = [];
  const houseGeo = new THREE.BoxGeometry(2, 2, 2);
  const houseMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
  disposables.push(houseGeo, houseMat);
  
  const zoneGeo = new THREE.RingGeometry(3, 3.5, 32);
  zoneGeo.rotateX(-Math.PI/2);
  const zoneMat = new THREE.MeshBasicMaterial({ color: 0x22c55e, transparent: true, opacity: 0.5, side: THREE.DoubleSide });
  disposables.push(zoneGeo, zoneMat);

  const locations = [
      {x: -12, z: 15}, {x: 12, z: 25}, {x: 0, z: 40}
  ];

  locations.forEach(loc => {
      const houseGroup = new THREE.Group();
      houseGroup.position.set(loc.x, 0, loc.z); // Adjust Y based on terrain visual
      // Terrain roughly y = |x|*1.5 - 5 - z*0.2
      const groundY = Math.abs(loc.x)*1.5 - 5 - loc.z*0.2 + 2; 
      houseGroup.position.y = groundY;
      
      const h = new THREE.Mesh(houseGeo, houseMat);
      h.position.y = 1;
      houseGroup.add(h);
      
      group.add(houseGroup);
      animatables.hdbHouses?.push(houseGroup);

      // Warning Zone Ring
      const ring = new THREE.Mesh(zoneGeo, zoneMat.clone());
      ring.position.set(loc.x, groundY + 0.1, loc.z);
      group.add(ring);
      animatables.hdbWarningZones?.push(ring as unknown as THREE.Group);
  });
};

export const animateHydroDamBreakScene = (animatables: SimAnimatables, time: number, simData: any) => {
    // simData: { progress: 0-100 (Timeline), breached: boolean }
    const progress = simData?.progress || 0;
    const breached = simData?.breached || false;
    
    // 1. Alert Light
    if (breached) {
        // Flash red
        const alert = (animatables.hdbDamBody?.parent as any)?.userData.alertLight;
        if (alert) alert.intensity = 2 + Math.sin(time * 10) * 2;
    }

    // 2. Dam Failure
    if (animatables.hdbBreachPart) {
        if (breached) {
            // Crumble down
            const fall = Math.min(15, (progress) * 0.5); // Fast drop
            animatables.hdbBreachPart.position.y = 10 - fall;
            animatables.hdbBreachPart.rotation.x = Math.random() * 0.05;
            animatables.hdbBreachPart.rotation.z = Math.random() * 0.05;
            (animatables.hdbBreachPart as any).material.opacity = Math.max(0, 1 - progress/50);
        } else {
            animatables.hdbBreachPart.position.y = 10;
            animatables.hdbBreachPart.rotation.set(0,0,0);
        }
    }

    // 3. Flood Wave
    if (animatables.hdbFloodWave) {
        const mat = animatables.hdbFloodWave.material as THREE.MeshStandardMaterial;
        
        if (breached) {
            mat.opacity = 0.9;
            // Wave travels down Z
            // Scale Z and move Z
            const waveFront = progress * 1.5; // Speed
            animatables.hdbFloodWave.position.z = -10 + waveFront / 2;
            animatables.hdbFloodWave.scale.y = Math.max(0.1, waveFront / 60); // Lengthen
            // Height increases then decreases
            const h = Math.max(0, 10 * Math.exp(-0.001 * Math.pow(progress - 20, 2))); 
            animatables.hdbFloodWave.position.y = -5 + h; 
            
            // Turbulence
            animatables.hdbFloodWave.scale.x = 1 + Math.sin(time * 10) * 0.1;
        } else {
            mat.opacity = 0;
        }
    }

    // 4. Upstream Drawdown
    if (animatables.hdbUpWater) {
        if (breached) {
            // Level drops
            const drop = Math.min(15, progress * 0.2);
            animatables.hdbUpWater.position.y = 20 - drop;
        } else {
            animatables.hdbUpWater.position.y = 20;
        }
    }

    // 5. Debris Explosion
    if (animatables.hdbDebris && breached && progress < 20) {
        const pos = animatables.hdbDebris.geometry.attributes.position.array as Float32Array;
        const vel = animatables.hdbDebris.geometry.attributes.velocity.array as Float32Array;
        const life = animatables.hdbDebris.geometry.attributes.life.array as Float32Array;
        
        // Spawn burst at T=0 of breach
        if (progress < 2) {
             for(let i=0; i<life.length; i++) {
                 if (life[i] <= 0) {
                     life[i] = 1.0;
                     pos[i*3] = (Math.random()-0.5) * 10;
                     pos[i*3+1] = 15;
                     pos[i*3+2] = -10;
                     
                     vel[i*3] = (Math.random()-0.5) * 2;
                     vel[i*3+1] = Math.random() * 2;
                     vel[i*3+2] = 2 + Math.random() * 5; // Downstream
                 }
             }
        }
        
        for(let i=0; i<life.length; i++) {
            if (life[i] > 0) {
                life[i] -= 0.01;
                vel[i*3+1] -= 0.1; // Gravity
                
                pos[i*3] += vel[i*3];
                pos[i*3+1] += vel[i*3+1];
                pos[i*3+2] += vel[i*3+2];
                
                if (pos[i*3+1] < -10) {
                    vel[i*3+1] *= -0.5; // Bounce
                    vel[i*3+2] *= 0.8;
                }
            } else {
                pos[i*3+1] = -100;
            }
        }
        animatables.hdbDebris.geometry.attributes.position.needsUpdate = true;
    }

    // 6. House/Zone Impact
    if (animatables.hdbWarningZones && animatables.hdbHouses) {
        // Flood front Z position
        const floodZ = -10 + (progress * 1.5);
        
        animatables.hdbWarningZones.forEach((zone, i) => {
            const zPos = zone.position.z;
            // zone is the Ring Mesh itself
            const mat = (zone as unknown as THREE.Mesh).material as THREE.MeshBasicMaterial;
            
            if (breached && floodZ > zPos) {
                // Impacted
                mat.color.setHex(0xff0000);
                mat.opacity = 0.8 + Math.sin(time * 20) * 0.2; // Panic flash
                
                // Float house?
                const house = animatables.hdbHouses![i];
                if (house) {
                    house.rotation.z = Math.sin(time + i) * 0.2;
                    house.position.y += Math.sin(time*2)*0.02; // Bobbing
                }
            } else {
                mat.color.setHex(0x22c55e);
                mat.opacity = 0.3;
            }
        });
    }
};
