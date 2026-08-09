
import * as THREE from 'three';
import { SimAnimatables } from './three-types';

export const initHydroBreakScene = (
  group: THREE.Group,
  animatables: SimAnimatables,
  disposables: { dispose: () => void }[]
) => {
  // 1. Lighting (Stormy/Disaster Atmosphere)
  const ambient = new THREE.AmbientLight(0xffffff, 0.4);
  group.add(ambient);
  const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
  dirLight.position.set(-20, 30, -20);
  group.add(dirLight);
  const flashLight = new THREE.PointLight(0x3b82f6, 0, 100); // Thunder flash
  flashLight.position.set(0, 40, 0);
  group.add(flashLight);
  (group as any).userData.flash = flashLight;

  // 2. Terrain (Two levels: River Bed and Flood Plain)
  // River Bed: High elevation (Y=5)
  // Flood Plain: Low elevation (Y=0)
  // Levee separates them
  
  const terrainGeo = new THREE.PlaneGeometry(80, 80, 64, 64);
  const pos = terrainGeo.attributes.position;
  
  for(let i=0; i<pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i); // Local Y is Z world
    
    let z = 0;
    
    if (x < -5) {
        // River Bed (Elevated)
        z = 5 + Math.random() * 0.2; 
    } else if (x > 5) {
        // Flood Plain (Town)
        z = 0 + Math.random() * 0.2;
        // Slope down away from levee
        z -= (x - 5) * 0.1;
    } else {
        // Levee Base Area (underneath)
        z = 0;
    }
    
    pos.setZ(i, z);
  }
  terrainGeo.computeVertexNormals();
  terrainGeo.rotateX(-Math.PI / 2);

  const terrainMat = new THREE.MeshStandardMaterial({ 
    color: 0x1e293b, // Dark Earth
    roughness: 0.9,
    metalness: 0.1,
    flatShading: true
  });
  
  disposables.push(terrainGeo, terrainMat);
  const terrain = new THREE.Mesh(terrainGeo, terrainMat);
  group.add(terrain);
  animatables.breakTerrain = terrain;

  // 3. Levee (The Barrier)
  // Trapezoid profile along Z axis
  // Center at X=0.
  const leveeShape = new THREE.Shape();
  leveeShape.moveTo(-5, 5); // River side base
  leveeShape.lineTo(-2, 10); // Top left
  leveeShape.lineTo(2, 10);  // Top right
  leveeShape.lineTo(5, 0);   // Land side base
  leveeShape.lineTo(-5, 0);  // Close (though embedded in terrain)

  // We need to split the levee into 3 parts: Left, Breach(Middle), Right
  const extrudeSettings = { depth: 30, bevelEnabled: false };
  const leveeMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 1.0 }); // Concrete/Earth
  disposables.push(leveeMat);
  
  // Left Section
  const leveeL = new THREE.Mesh(new THREE.ExtrudeGeometry(leveeShape, extrudeSettings), leveeMat);
  leveeL.position.set(0, 0, -40); // Start far back
  group.add(leveeL);
  disposables.push(leveeL.geometry);

  // Right Section
  const leveeR = new THREE.Mesh(new THREE.ExtrudeGeometry(leveeShape, extrudeSettings), leveeMat);
  leveeR.position.set(0, 0, 10); // Start after breach zone
  group.add(leveeR);
  disposables.push(leveeR.geometry);

  // Breach Plug (Middle Section - Dynamic)
  // Variable width ~20m (Z: -10 to 10)
  const plugGeo = new THREE.ExtrudeGeometry(leveeShape, { depth: 20, bevelEnabled: false });
  // We need to be able to scale it down vertically to simulate breach
  // Center pivot at bottom
  plugGeo.translate(0, 0, 0); 
  const plug = new THREE.Mesh(plugGeo, leveeMat);
  plug.position.set(0, 0, -10);
  group.add(plug);
  animatables.breakPlug = plug;

  // 4. Water Bodies
  const waterMat = new THREE.MeshPhysicalMaterial({ 
      color: 0x3b82f6, // River Blue
      transparent: true, 
      opacity: 0.8,
      roughness: 0.1,
      metalness: 0.2,
      transmission: 0.2
  });
  disposables.push(waterMat);

  // River (Upstream/High)
  const riverGeo = new THREE.BoxGeometry(35, 8, 80);
  disposables.push(riverGeo);
  const river = new THREE.Mesh(riverGeo, waterMat);
  river.position.set(-22.5, 5, 0); // X < -5. Base at 5. Height 8 means water level up to 9?
  // Let's position it so base is at Y=5. Center Y=9.
  river.position.y = 8; 
  group.add(river);
  animatables.breakWaterRiver = river;

  // Flood Water (Downstream/Low)
  // Initially hidden or very thin
  const floodGeo = new THREE.PlaneGeometry(40, 80, 32, 32);
  floodGeo.rotateX(-Math.PI / 2);
  disposables.push(floodGeo);
  const floodMat = new THREE.MeshStandardMaterial({ 
      color: 0x78350f, // Muddy flood
      roughness: 0.3,
      metalness: 0.1,
      transparent: true,
      opacity: 0.8
  });
  disposables.push(floodMat);
  const flood = new THREE.Mesh(floodGeo, floodMat);
  flood.position.set(25, 0.1, 0); // Right side
  group.add(flood);
  animatables.breakWaterFlood = flood;

  // 5. Assets (Houses in Flood Plain)
  animatables.breakHouses = new THREE.Group();
  const houseGeo = new THREE.BoxGeometry(2, 2, 2);
  const houseMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const roofGeo = new THREE.ConeGeometry(1.5, 1, 4);
  roofGeo.rotateY(Math.PI / 4);
  const roofMat = new THREE.MeshStandardMaterial({ color: 0xef4444 });
  disposables.push(houseGeo, houseMat, roofGeo, roofMat);

  for(let i=0; i<15; i++) {
      const houseGroup = new THREE.Group();
      const h = new THREE.Mesh(houseGeo, houseMat);
      h.position.y = 1;
      houseGroup.add(h);
      const r = new THREE.Mesh(roofGeo, roofMat);
      r.position.y = 2.5;
      houseGroup.add(r);
      
      // Random pos in flood plain (x > 10)
      const x = 15 + Math.random() * 20;
      const z = (Math.random() - 0.5) * 60;
      houseGroup.position.set(x, 0, z);
      
      animatables.breakHouses.add(houseGroup);
  }
  group.add(animatables.breakHouses);

  // 6. Debris/Splash Particles (Breach location)
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
  
  const pMat = new THREE.PointsMaterial({ 
      color: 0xffffff, 
      size: 0.3, 
      transparent: true, 
      opacity: 0.6 
  });
  disposables.push(pGeo, pMat);
  const particles = new THREE.Points(pGeo, pMat);
  group.add(particles);
  animatables.breakDebris = particles;

  // 7. Markers (Warning Pins)
  animatables.breakMarkers = [];
  const pinGeo = new THREE.CylinderGeometry(0.2, 0, 4, 8);
  pinGeo.translate(0, 2, 0);
  const pinMat = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
  disposables.push(pinGeo, pinMat);

  const m1 = new THREE.Mesh(pinGeo, pinMat); m1.position.set(15, 0, 0); group.add(m1);
  const m2 = new THREE.Mesh(pinGeo, pinMat); m2.position.set(25, 0, 15); group.add(m2);
  animatables.breakMarkers.push(m1 as unknown as THREE.Group, m2 as unknown as THREE.Group);
};

export const animateHydroBreakScene = (animatables: SimAnimatables, time: number, simData: any) => {
    // simData: { waterLevel: number (River), breachProgress: 0-100, isBreached: boolean }
    const riverLevel = simData?.waterLevel || 8; // Max 10 (Levee top)
    const breachPct = simData?.breachProgress || 0;
    const isBreached = simData?.isBreached || false;

    // 1. River Level Rise
    if (animatables.breakWaterRiver) {
        // Base height is 8 (geometry height). Y pos is 5 (base of river bed).
        // Scale Y to match riverLevel.
        // Geometry is Box height 8. Position y=8. Base is 4.
        // We want base at 5. So position should be 5 + height/2.
        const h = Math.max(0.1, riverLevel - 5); 
        animatables.breakWaterRiver.scale.y = h / 8; 
        animatables.breakWaterRiver.position.y = 5 + h / 2;
    }

    // 2. Breach Evolution
    if (animatables.breakPlug) {
        // Scale Y down as breach progresses
        // 0% -> Scale 1. 100% -> Scale 0.
        const s = 1 - (breachPct / 100);
        animatables.breakPlug.scale.y = Math.max(0.01, s);
        // Position stays at 0 if pivot is correct? We didn't set pivot. 
        // Default box center is 0. Levee is 0 to 10 height.
        // Need to shift Y down? No, Scale Y from 0 center shrinks both ends.
        // Let's just move it down. Y=0 is base.
        // At scale 1, pos y = 0 (center of geometry? no Extrude geometry coords).
        // Our shape was Y 0 to 10. Extrude creates volume. 
        // We need to lower it into ground or scale from bottom.
        // Hack: move y down.
        animatables.breakPlug.position.y = -10 * (1-s); // Drop into ground
    }

    // 3. Flood Spreading
    if (animatables.breakWaterFlood) {
        if (breachPct > 5) {
            // Flood rises and spreads
            const floodH = (breachPct / 100) * 3; // Max 3m deep
            animatables.breakWaterFlood.position.y = floodH / 2;
            animatables.breakWaterFlood.visible = true;
            
            // Texture turbulence
            const mat = animatables.breakWaterFlood.material as THREE.MeshStandardMaterial;
            if (mat) mat.opacity = 0.6 + Math.sin(time) * 0.1;
            
            // Wiggle vertices if PlaneGeometry access?
            // Simplified scale X to simulate spread outward from levee
            animatables.breakWaterFlood.scale.x = 0.2 + (breachPct / 100) * 0.8;
            animatables.breakWaterFlood.position.x = 5 + (animatables.breakWaterFlood.scale.x * 20); // Move center right
        } else {
            animatables.breakWaterFlood.visible = false;
        }
    }

    // 4. Debris Particles (Explosion at breach)
    if (animatables.breakDebris) {
        const positions = animatables.breakDebris.geometry.attributes.position.array as Float32Array;
        const velocities = animatables.breakDebris.geometry.attributes.velocity.array as Float32Array;
        const lifes = animatables.breakDebris.geometry.attributes.life.array as Float32Array;
        
        // Emit if breaching
        const emit = isBreached && breachPct < 90; // Stop when fully open/settled
        
        for(let i=0; i<lifes.length; i++) {
            if (lifes[i] <= 0) {
                if (emit && Math.random() > 0.9) {
                    lifes[i] = 1.0;
                    // Spawn at breach site (0, 8, -10 to 10)
                    // Plug is at Z=-10 to +10 (depth 20)
                    positions[i*3] = 0 + (Math.random()-0.5)*2;
                    positions[i*3+1] = riverLevel - Math.random()*2; // Near water surface
                    positions[i*3+2] = (Math.random()-0.5) * 10;
                    
                    // Velocity: Out to right (+X)
                    velocities[i*3] = 0.5 + Math.random() * 0.5;
                    velocities[i*3+1] = 0.2; // Up slightly
                    velocities[i*3+2] = (Math.random()-0.5) * 0.2;
                } else {
                    positions[i*3+1] = -100;
                }
            } else {
                lifes[i] -= 0.02;
                velocities[i*3+1] -= 0.02; // Gravity
                
                positions[i*3] += velocities[i*3];
                positions[i*3+1] += velocities[i*3+1];
                positions[i*3+2] += velocities[i*3+2];
                
                if (positions[i*3+1] < 0) { // Hit ground
                    velocities[i*3+1] *= -0.5;
                    velocities[i*3] *= 0.8;
                }
            }
        }
        animatables.breakDebris.geometry.attributes.position.needsUpdate = true;
    }

    // 5. Floating Houses (Disaster effect)
    if (animatables.breakHouses && animatables.breakWaterFlood && animatables.breakWaterFlood.visible) {
        animatables.breakHouses.children.forEach((house, i) => {
             // If flood height > 0.5, houses tilt/float
             const floodY = animatables.breakWaterFlood!.position.y * 2; // actual height
             // House ground Y is 0.
             if (floodY > 0.5 && house.position.x < (5 + breachPct)) { // If reached by water
                 house.rotation.z = Math.sin(time + i) * 0.1;
                 house.rotation.x = Math.cos(time * 0.8 + i) * 0.05;
                 house.position.y = Math.max(0, floodY * 0.8);
             }
        });
    }
};
